---
title: NNTP Interface
description: Direct NNTP access to an OME node
tags: [api, reference, nntp]
created: 2026-04-19
updated: 2026-04-19
---

# NNTP Interface

For integrations that want to *be a peer* rather than talk through the
FastAPI gateway, connect directly to the INN server with any NNTP
client.

## Ports

| Server (dev) | Port | Notes                               |
|--------------|------|-------------------------------------|
| Austin       | 119  | Default NNTP port                   |
| Boston       | 1119 | Second dev node                     |

Production ports should live behind TLS (`nntps`/`563`) — see
[[../06-Operations/Deployment]].

## Useful commands

```
LIST ACTIVE                       ← enumerate groups
GROUP ome.eric                    ← select a group
XOVER 1-                          ← summary headers
ARTICLE <message_id>              ← fetch one article
POST                              ← publish (auth required)
NEWGROUPS YYMMDD HHMMSS           ← groups created since a cutoff
```

## From Python

```python
from nntp import NNTPClient
with NNTPClient("localhost", 119) as c:
    for name, low, high, status in sorted(c.list_active()):
        print(name, low, high, status)
```

The project uses [`pynntp`](https://github.com/greenbender/pynntp)
throughout. Connection pooling lives at
[`server/connection_pool.py`](../../../server/connection_pool.py).

## Article shape

See [[../02-Architecture/NNTP Backbone#Article shape]] — OME articles
are MIME multipart messages with the OME JSON as body and raw source
JSON as an enclosure.

## Related

- [[REST API]]
- [[../02-Architecture/NNTP Backbone]]
- [[../06-Operations/Running INN]]
