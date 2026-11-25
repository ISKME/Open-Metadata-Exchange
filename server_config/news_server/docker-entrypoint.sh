#!/bin/sh

# if [ ! -f etc/key.pem ]; then
# 	echo "Generating SSL key"
# 	openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout etc/key.pem -out etc/cert.pem -subj "/CN=news.localhost"
# fi

# INN keeps its data in two volumes (see docker-compose.yml). A host folder used as a volume starts
# empty, so add the starting files of the image that are missing. Existing data is never replaced.
cp -a --update=none /usr/local/share/ome/news-db/. /var/lib/news/
cp -a --update=none /usr/local/share/ome/news-spool/. /var/spool/news/
chown news:news /var/lib/news /var/spool/news

# Render templates from the runtime config so credentials never end up in the image.
OME_CONFIG="${OME_CONFIG:-/run/secrets/ome_config}"
if [ ! -f "${OME_CONFIG}" ]; then
	echo "Config not found at ${OME_CONFIG}; mount config.json there." >&2
	exit 1
fi
for dir in /etc/news /usr/local/bin; do
	/tmp/templatize.sh /tmp/j2_filters.py "${dir}" "${OME_CONFIG}" || exit 1
done
chown root:root /etc/news -R
chmod a+x /usr/local/bin/preseed.sh

. /usr/lib/news/innshellvars

# A container that was killed (power cut, crash, a Docker stop timeout that ran out) keeps these
# files. innd then finds its own PID in the old innd.pid, thinks it is already running and exits
# without a message, so the node stays down. Nothing of INN runs yet at this point, so they are
# safe to remove. Articles, history and the innfeed backlog (*.input, *.output) are not touched.
for stale in "${PATHRUN}"/*.pid "${PATHRUN}/control" "${PATHRUN}/nntpin" "${PATHSPOOL}"/innfeed/*.lock; do
	if [ -e "${stale}" ]; then
		echo "Removing ${stale} left by a previous run" >&2
		rm -f "${stale}"
	fi
done

# Support for implicit TLS
nnrpd -D -p 563 -S

# innd only acts on SIGTERM when it next wakes up, which can take minutes on a quiet node, so
# Docker would kill it and leave innd.pid behind. This script stays in front instead and turns
# Docker's stop signal into a clean "ctlinnd shutdown".
/usr/lib/news/bin/innd "$@" &
innd_pid=$!
stopping=
# shellcheck disable=SC2317,SC2329  # Called by the trap below (SC2317 before shellcheck 0.11)
stop_innd() {
	[ -n "${stopping}" ] && return  # A second signal: the shutdown is already running
	stopping=1
	ctlinnd shutdown "container stop" >/dev/null 2>&1 || kill "${innd_pid}"
}
trap stop_innd TERM INT

# wait returns early when a stop signal runs the trap. Only then is innd still shutting down, so
# wait until it is gone: another signal can end a wait early too, and if this script (PID 1)
# ended now, the kernel would kill innd halfway. Otherwise innd stopped by itself and rc is
# already its exit code.
wait "${innd_pid}"
rc=$?
if [ -n "${stopping}" ]; then
	while kill -0 "${innd_pid}" 2>/dev/null; do  # Signal 0 only checks that innd still runs
		wait "${innd_pid}"
		rc=$?
	done
fi

# innd tells innfeed to stop. innfeed then saves its backlog, removes innfeed.pid and exits.
# Wait for that (at most 20 s), or the kernel kills innfeed when this script ends. The pid file,
# not the process, tells when it is done: an exited innfeed stays a zombie of this script.
n=0
while [ -f "${PATHRUN}/innfeed.pid" ] && [ "${n}" -lt 40 ]; do
	sleep 0.5
	n=$((n + 1))
done

# The nnrpd for port 563 runs on its own. Stop it too, so it leaves no nnrpd-563.pid behind.
if [ -f "${PATHRUN}/nnrpd-563.pid" ]; then
	kill "$(cat "${PATHRUN}/nnrpd-563.pid")" 2>/dev/null
	rm -f "${PATHRUN}/nnrpd-563.pid"
fi
exit "${rc}"  # The exit code of innd becomes the exit code of the container
