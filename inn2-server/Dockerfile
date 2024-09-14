# docker build -t inn2-server . && docker run -it inn2-server
# /usr/lib/news/bin/innd -d

FROM debian:bookworm

# Required for package installation
COPY inn.conf /etc/news/inn.conf

RUN mkdir -p /usr/lib/news/db && \
  mkdir -p /usr/lib/news/spool/articles && \
  apt update && \
  apt install -o Dpkg::Options::='--force-confold' -y inn2 msmtp && \
  rm -rf /var/lib/apt/lists/*

# CMD ["/usr/lib/news/bin/innd", "-d"]
CMD ["/bin/bash"]
