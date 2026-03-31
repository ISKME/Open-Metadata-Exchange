#!/bin/bash

set -e

DIR=$1
CONFIG=$2

find ${DIR} -name '*.j2' | while read f; do j2 -o `dirname ${f}`/`basename ${f} .j2` ${f} ${CONFIG} ; done
