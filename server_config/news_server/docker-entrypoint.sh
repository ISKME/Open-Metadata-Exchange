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

# Support for implicit TLS
nnrpd -D -p 563 -S
exec /usr/lib/news/bin/innd "$@"
