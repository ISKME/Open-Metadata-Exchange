# Installation

## Before you install

You will need the following:

1. At least one OME peer node that has agreed to allow you to peer with them.
1. Make sure that the peer can access your node
   1. IP address reachable from the outside by the peer.
   1. port 119 (and 563) unblocked for the peer.
   1. port 119 on the host forwarded to port 1119 where docker is listening.

## Peering Configuration

Edit the file `server_config/news_server/config.json`. The contents of
the file should look as follows:

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

[^1]: The IP address that is seen inside your docker container might be a NATted. e.g. 172.21.0.1, the gateway of the docker network.

## Backend

### Plugin

## Frontend

### Integration into your platform
