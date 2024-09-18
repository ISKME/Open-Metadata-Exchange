# https://github.com/InterNetNews/inn/issues/311
#
# docker build -t inn2-server . && docker run -it inn2-server
# /usr/lib/news/bin/innd -d

# FROM debian:bookworm
FROM ubuntu:24.04

# Required for package installation
# COPY inn.conf /etc/news/inn.conf

# apt install -o Dpkg::Options::='--force-confold' -y inn2 msmtp && \
RUN mkdir -p /usr/lib/news/db && \
  mkdir -p /usr/lib/news/spool/articles && \
  apt update -qq && \
  echo "N" | apt install --yes inn2 && \
  rm -rf /var/lib/apt/lists/* && \
  python3 --version && \
  python3 -c "import nntplib"

# CMD ["/usr/lib/news/bin/innd", "-d"]
# CMD ["systemctl", "status", "inn2"]
CMD ["/bin/bash"]
