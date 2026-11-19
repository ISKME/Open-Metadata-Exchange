#!/bin/sh

# if [ ! -f etc/key.pem ]; then
# 	echo "Generating SSL key"
# 	openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout etc/key.pem -out etc/cert.pem -subj "/CN=news.localhost"
# fi

# Render templates from the runtime config so credentials never end up in the image.
OME_CONFIG="${OME_CONFIG:-/run/secrets/ome_config}"
if [ ! -f "${OME_CONFIG}" ]; then
	echo "Config not found at ${OME_CONFIG}; mount config.json there." >&2
	exit 1
fi
for dir in /etc/news /var/lib/news /usr/local/bin; do
	/tmp/templatize.sh /tmp/j2_filters.py "${dir}" "${OME_CONFIG}" || exit 1
done
chown root:root /etc/news -R
chown root:root /var/lib/news/newsusers
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
trap 'ctlinnd shutdown "container stop" >/dev/null 2>&1 || kill "${innd_pid}"' TERM INT
wait "${innd_pid}"  # Returns early when a stop signal arrives and the trap runs
wait "${innd_pid}"  # Then waits until innd has really shut down, and passes on its exit code
