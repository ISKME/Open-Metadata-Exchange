#!/bin/sh

set -e

# Render .env from the runtime config so credentials never end up in the image.
OME_CONFIG="${OME_CONFIG:-/run/secrets/ome_config}"
if [ ! -f "${OME_CONFIG}" ]; then
	echo "Config not found at ${OME_CONFIG}; mount config.json there." >&2
	exit 1
fi
j2 --filters=/tmp/j2_filters.py --format=json -o /app/.env /app/.env.j2 "${OME_CONFIG}"

exec "$@"
