# InterNetNews v2.7 (INN2)
* https://github.com/InterNetNews/inn/issues/311
* [inn2 documentation](https://www.isc.org/othersoftware/#INN)
* [inn2 repo](https://github.com/InterNetNews/inn)
* https://defuse.ca/inn-private-newsgroup-server-setup.htm
* https://www.eyrie.org/~eagle/software/inn/docs-2.7

---

In this directory:
```zsh
% docker build --no-cache --progress plain -t inn2-server . && docker run -it inn2-server
# /usr/lib/news/bin/innd -d && ps -ef
```
