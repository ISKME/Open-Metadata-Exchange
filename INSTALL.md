# OME Installation

## Before you install

You will need the following:

1. At least one OME peer node that has agreed to allow you to peer with them.
1. Make sure that the peer can access your node
   1. IP address reachable from the outside by the peer.
   1. Port 119 (and 563) is unblocked for the peer.
   1. Port 119 on the host forwarded to port 1119, where Docker is listening.
   1. Only your peers can reach that port. Docker publishes it past UFW and firewalld:
      see [FIREWALL.md](FIREWALL.md).

## Peering Configuration

Copy `./config.json.example` to `./config.json` and edit it. It is not baked into the images:
Docker Compose mounts it at runtime as the `ome_config` secret, so after editing it you only need
to restart the containers, not rebuild them. The contents of the file should look as follows:

```json
{
    "organization": "ACME Org",
    "hostname": "nntp.ome.acme.org",
    "peers": [
        {
            "name": "WIDGET Org",
            "dns_name": "nntp.ome.widget.org",
            "incoming_ip": "172.21.0.1"
        }
    ],

    "nntp_user": {
        "username": "someusername",
        "password": "somepassword"
    },

    "nntp_debug_user": {
        "username": "debug_username",
        "password": "debug_password"
    },
    "cms_plugin": "server.plugins.qubes.plugin.QubesPlugin"
}
```

| **Variable**               | **Value type**                               | **Comment**                                                            |
|----------------------------|----------------------------------------------|------------------------------------------------------------------------|
| organization               | Name of your organization                    |                                                                        |
| hostname                   | publicly resolvable hostname                 |                                                                        |
| peers                      | List of peers                                | At least one, preferably two                                           |
| peers[i].name              | Org name of the peer                         |                                                                        |
| peers[i].dns\_name         | hostname of the peer                         |                                                                        |
| peers[i].incoming\_ip      | IP address.[^1]                              | The IP address of the peer you want to allow to connect.               |
| nntp\_user                 |                                              | The username/password that the FastAPI backend uses to connect to NNTP |
| nntp\_user.username        | username                                     |                                                                        |
| nntp\_user.password        | password                                     |                                                                        |
| nntp\_debug\_user          |                                              | you can use this with a NNTP reader to access the NNTP directly        |
| nntp\_debug\_user.username | debugging username                           |                                                                        |
| nntp\_debug\_user.password | debugging password                           |                                                                        |
| cms_plugin                 | python classpath for the plugin for your CMS | e.g. server.plugins.qubes.plugin.QubesPlugin                           |

[^1]: The IP address that is seen inside your Docker container might be NATted. e.g., 172.21.0.1, the gateway of the docker network.

## Start the node

[`deploy/compose.yaml`](deploy/compose.yaml) runs a node from the published images, so the server
needs no source code and builds nothing. (`docker-compose.yml` in the root is for development.)

1. Copy `deploy/compose.yaml` to a folder on the server and put your `config.json` next to it.
1. Start the node: `docker compose up -d`. The website and the API are on port 80,
   the peers connect to port 1119.
1. Update to the latest release: `docker compose pull && docker compose up -d`.

The images follow the tag `stable`, the latest release. Settings go in a `.env` file next to `compose.yaml`:

| **Variable**    | **Default**                | **Comment**                                       |
|-----------------|----------------------------|---------------------------------------------------|
| `OME_VERSION`   | `stable`                   | A release such as `2026.11.25` to stay on it       |
| `OME_REGISTRY`  | `ghcr.io/odisee-ome-2627`  | Where the images come from                        |
| `OME_CONFIG`    | `./config.json`            | Path to `config.json`                             |
| `OME_HTTP_PORT` | `80`                       | Port of the website and the API                   |
| `OME_NNTP_PORT` | `1119`                     | Port for the peers                                |

To update automatically, start the node with `docker compose --profile autoupdate up -d`.
[Watchtower](https://github.com/nicholas-fedor/watchtower) then checks every hour for a new `stable`
image. It is off by default: it needs access to the Docker socket (root on the host),
and it does not check who published an image.

## Data

INN keeps its data in two Docker volumes, so a new image or `docker compose down` keeps it:

| Volume       | Folder in the container | What is in it                                                   |
|--------------|-------------------------|-----------------------------------------------------------------|
| `nntp-db`    | `/var/lib/news`         | The newsgroups (`active`) and the history of every article      |
| `nntp-spool` | `/var/spool/news`       | The articles, their overview, and the backlog for unreachable peers |

The config is not in a volume: it is made again from `config.json` at every start.
`docker compose down --volumes` deletes all articles. To keep the data in a folder of your own
(for example on a NAS), use a host folder instead, such as `./data/nntp-db:/var/lib/news`:
an empty folder is filled at the first start.

## Backend

### Plugin

## Frontend

### Integration into your platform
