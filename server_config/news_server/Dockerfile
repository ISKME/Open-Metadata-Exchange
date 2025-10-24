FROM debian:stable

RUN apt-get update && apt-get install -y --no-install-recommends openssl tini inn2

COPY ./dev/docker-entrypoint.sh /docker-entrypoint.sh

# TODO: modify the incoming.conf IP address dynamically based on the
# gateway of this instance.

COPY ./dev/etc/news/* /etc/news/
RUN chown root:root /etc/news -R

COPY ./dev/var/lib/news/newsusers /var/lib/news/newsusers
RUN chown root:root /var/lib/news/newsusers


RUN mkdir -p /var/www/inn
RUN chown news:news /var/www/inn

EXPOSE 119
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/docker-entrypoint.sh", "-d"]
