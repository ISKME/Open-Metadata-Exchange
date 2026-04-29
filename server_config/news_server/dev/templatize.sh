#!/bin/bash

set -e

FILTERS=$1
DIR=$2
CONFIG=$3

find "${DIR}" -name '*.j2' | while read -r f;
do
    DirName=$(dirname "${f}")
    BaseName=$(basename "${f}" .j2)
    FN="${DirName}/${BaseName}"
    j2 --filters=${FILTERS} -o "${FN}" "${f}" "${CONFIG}";
done
