#!/usr/bin/bash

/usr/lib/news/bin/actsync -v 4 -m -ox -p 20  localhost nntp.dev.ome.oercommons.org
/usr/lib/news/bin/getlist -h localhost | \
    sed -n 's/^\(ome\.[^ ]*\) .*/\t\1/pg' | \
    awk 'BEGIN{print("nntp.dev.ome.oercommons.org");}{print($0);}' > /root/pullnews.marks
/usr/lib/news/bin/pullnews

