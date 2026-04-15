#!/bin/bash

set -e

FILTERS=$1
DIR=$2
CONFIG=$3

find "${DIR}" -name '*.j2' | while read -r f; do j2 --filters=${FILTERS} -o $(dirname "${f}")/$(basename "${f}" .j2) "${f}" "${CONFIG}" ; done
