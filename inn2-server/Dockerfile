# docker build -t darwin-bookworm-inn2 . && docker run -it darwin-bookworm-inn2
# /usr/lib/news/bin/innd -d

FROM debian:bookworm
# FROM ubuntu:24.04
# `hostname` at Docker built time returns 'buildkitsandbox' on both Debian and Ubuntu

ENV DEBIAN_FRONTEND=noninteractive
COPY inn.conf /etc/news/
COPY docker-entrypoint.sh /
# ENV INN_HOSTNAME=localhost.localdomain
# ENV INN_HOSTNAME=localhost.example.com
# ENV INN_HOSTNAME=example.com

# At Docker build-time, modify `hostname` output to be `localhost.localdomain` so that
# `apt-get install inn2` succeeds without an `inn.conf` file and then undo that change.
# hostname: `buildkitsandbox` -> `localhost.localdomain` -> `buildkitsandbox`
RUN apt-get update -qq && \
    apt-get install tini
RUN apt-get -o Dpkg::Options::=--force-confold install -y inn2
ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]
    # echo "N" | apt-get install --yes inn2

# CMD ["systemctl", "status", "inn2"]
CMD ["-f"]

# VOLUME /usr/local/news/db
# USER news
EXPOSE 119
