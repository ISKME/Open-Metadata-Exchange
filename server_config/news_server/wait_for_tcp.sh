#!/bin/bash

wait_for_tcp () {
    local PORT=$1
    local COUNT=$2
    while [ $COUNT -gt 0 ]; do
	echo "" | nc -q 1 localhost $PORT
	if [ $? -eq 0 ]; then
	    echo "$PORT seems to be up and accepting connections."
	    COUNT=0
	    return 0
	else
	    COUNT=$((COUNT - 1))
	    echo "Port $PORT is not up. Going to try $COUNT more time(s)."
	    sleep 1
	fi
    done
    return 1
}

wait_for_tcp $1 $2
exit $?
