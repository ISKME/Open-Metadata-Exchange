#!/bin/sh

# if [ ! -f etc/key.pem ]; then
# 	echo "Generating SSL key"
# 	openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout etc/key.pem -out etc/cert.pem -subj "/CN=news.localhost"
# fi

. /usr/lib/news/innshellvars

# Support for implicit TLS
nnrpd -D -p 563 -S
echo "Allowing any client to connect and transfer articles. Do NOT use this in production."
exec /usr/lib/news/bin/innd "$@"
# exec /bin/bash

