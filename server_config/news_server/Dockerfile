FROM debian:stable

RUN apt-get update && apt-get install -y --no-install-recommends openssl tini inn2 netcat-traditional j2cli

COPY ./dev/docker-entrypoint.sh /docker-entrypoint.sh
COPY ./dev/templatize.sh /templatize.sh

COPY ./config.json /config.json

# TODO: modify the incoming.conf IP address dynamically based on the
# gateway of this instance.


COPY ./dev/etc/news/* /etc/news/
RUN /templatize.sh /etc/news /config.json


RUN chown root:root /etc/news -R

COPY ./dev/var/lib/news/newsusers /var/lib/news/newsusers
RUN chown root:root /var/lib/news/newsusers

RUN mkdir -p /var/www/inn
RUN chown news:news /var/www/inn

COPY ./wait_for_tcp.sh /usr/local/bin/
COPY ./preseed.sh /usr/local/bin/

RUN rm /config.json

EXPOSE 119
# ENTRYPOINT ["/usr/bin/tini", "--"]

ENTRYPOINT ["/docker-entrypoint.sh", "-d"]
