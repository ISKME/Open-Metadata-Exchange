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

# innfeed quietly ignores a wrong reconnect time, so check the values from config.json here.
initial=$(sed -n 's/^initial-reconnect-time:[[:space:]]*//p' /etc/news/innfeed.conf)
max=$(sed -n 's/^max-reconnect-time:[[:space:]]*//p' /etc/news/innfeed.conf)
for seconds in "${initial}" "${max}"; do
	case "${seconds}" in
	'' | *[!0-9]* | 0*)
		echo "innfeed reconnect times in config.json must be whole seconds, 1 or more: got '${initial}' and '${max}'" >&2
		exit 1
		;;
	esac
done
if [ "${initial}" -gt "${max}" ]; then
	echo "innfeed initial_reconnect_time (${initial}) in config.json is longer than max_reconnect_time (${max})" >&2
	exit 1
fi

. /usr/lib/news/innshellvars

# Support for implicit TLS
nnrpd -D -p 563 -S
exec /usr/lib/news/bin/innd "$@"
