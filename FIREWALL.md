# Firewall: open the NNTP port only for your peers

> **Temporary page.** It helps partners who run a node today and have trouble with the firewall.
> It will move into the installation guide, where `ome-node` will set up this firewall for you.
>
> Tested on Ubuntu 26.04 LTS with Docker 29.10 and UFW, including a reboot. Not yet tested on
> older releases such as Ubuntu 22.04, or behind NAT.

## Why your firewall does not protect the NNTP port

INN listens on port 119 inside its container, and Docker publishes that port on the host (119 or
1119, see step 1) with DNAT. That traffic takes the *forward* path through the host, while UFW
and firewalld filter the *input* path. So `ufw deny 119` has no effect: anyone who reaches the
published port talks to INN.

The rule below looks at port 119 in the container, so it works whatever port the host publishes.

The steps below add one small nftables table, `inet ome_nntp`, that rejects every connection to
the NNTP port that does not come from one of your peers. The same table runs on our own nodes,
so every node has the same rule, whatever its distribution or firewall.

## What you need

1. Linux with nftables: Ubuntu 20.04 or later, Debian 11 or later, RHEL/Rocky 8 or later.
   Check with `sudo nft --version`. Docker Desktop and Synology have no nftables: there, allow
   the NNTP port only for your peers on your router.
2. The IPv4 address of each peer. Look it up from the `dns_name` of the peer in your
   `config.json` (replace `nntp.example.org`):

   ```shell
   dig +short nntp.example.org
   ```

   It prints the address. No output means that the name does not exist.

## 1. Publish the NNTP port on IPv4 only

If peers reach your server directly (it has its own address that they connect to), publish port
119 itself. In `docker-compose.yml`, service `nntp-server`:

```yaml
    ports:
      - "0.0.0.0:119:119"
```

Keep the quotes. `0.0.0.0` publishes the port on IPv4 only. Docker sends IPv6 connections to a published port
through a proxy instead of DNAT, so the rule below would not see them, and INN would think they
come from the Docker network.

Is your server behind a router with NAT? Then read the next section first.

### Behind a router with NAT (not tested by us yet)

Our team has not tried this setup yet; we will test it and update this section.

1. Let the router forward port 119 to port 1119 of your server (as `INSTALL.md` describes), and
   publish `"0.0.0.0:1119:119"`.
2. Find out which address your server sees. On the server run:

   ```shell
   sudo tcpdump -n -c 1 -i any 'tcp port 1119 and tcp[tcpflags] & tcp-syn != 0'
   ```

   and connect from a host **outside** your network: `nc -vz <your-public-address> 119`.
   Never test from inside your own network: then the server always sees your router.
3. Look at the source address that tcpdump prints:

   | You see | Meaning | What to do |
   | --- | --- | --- |
   | the public address of the outside host | the router passes addresses on | use the rule on this page with the addresses of your peers |
   | an address of your router or network | the router replaces the address, so the server cannot tell peers apart | allow port 119 only for your peers **on the router** itself; the rule on this page cannot help |

## 2. Write the rule

Create `/etc/nftables/ome-nntp-peers.nft` (`sudo mkdir -p /etc/nftables` first) and put the
addresses of your peers in `elements`:

```text
#!/usr/sbin/nft -f
# Only the NNTP peers may reach port 119 of the NNTP container.

# Replace the whole table in one step: create it if needed, delete it, add it again.
table inet ome_nntp
delete table inet ome_nntp

table inet ome_nntp {
    set peers {
        type ipv4_addr
        elements = { 203.0.113.10, 198.51.100.20 }
    }

    chain forward {
        # Before Docker (priority 0) and firewalld (priority +10).
        type filter hook forward priority filter - 5; policy accept;

        # Connections from a published port (DNAT) to NNTP (port 119 in the container).
        ct status dnat tcp dport 119 ip saddr != @peers reject with tcp reset
        ct status dnat tcp dport 119 meta nfproto ipv6 reject with tcp reset
    }
}
```

Check the file with `sudo nft -c -f /etc/nftables/ome-nntp-peers.nft`. No output means it is valid.

## 3. Load the rule at boot, before Docker

Create `/etc/systemd/system/ome-nntp-firewall.service`:

```ini
[Unit]
Description=OME: only the NNTP peers may reach port 119 (nftables table ome_nntp)
After=firewalld.service ufw.service
Before=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/nft -f /etc/nftables/ome-nntp-peers.nft
ExecReload=/usr/sbin/nft -f /etc/nftables/ome-nntp-peers.nft

[Install]
WantedBy=multi-user.target
```

Make Docker wait for it. Create `/etc/systemd/system/docker.service.d/ome-nntp-firewall.conf`
(`sudo mkdir -p /etc/systemd/system/docker.service.d` first):

```ini
[Unit]
Requires=ome-nntp-firewall.service
After=ome-nntp-firewall.service
```

If the rule cannot be loaded, Docker does not start either, so the port is never open without
the rule. Then load everything:

```shell
sudo systemctl daemon-reload
sudo systemctl enable --now ome-nntp-firewall
sudo systemctl restart docker
```

Restarting Docker stops your containers. Start them again from the folder with
`docker-compose.yml`:

```shell
sudo docker compose up -d
```

Do not use the `nftables` service of Ubuntu or Debian for this: its `/etc/nftables.conf` starts
with `flush ruleset`, which also removes the rules of Docker and UFW.

## 4. Check it

```shell
sudo nft list table inet ome_nntp
```

`ufw status` does not show this rule: it is in its own table.

Then test from another host outside your server, on the address and port your peers use
(port 119, also behind NAT). Test both ways:

1. **A host that is not in `elements`** must be refused. Without a peer at hand, put a wrong
   address in `elements` first.
2. **A host that is in `elements`** must get through. Add its address (see "Change the peers")
   and test again.

```shell
nc -vz <your-address> 119                       # or, without nc (RHEL, Rocky):
curl -v --max-time 5 telnet://<your-address>:119
```

| Result | Meaning |
| --- | --- |
| `Connection refused`, at once | the rule refuses this host |
| `200 ... InterNetNews ... ready` | the host gets through (stop `curl` with Ctrl+C) |
| a time-out | something else blocks it: check that the NNTP container runs (`sudo docker compose ps`) |

After a reboot, start the stack again with `sudo docker compose up -d`: `docker-compose.yml` has
no restart policy yet. If `nntp-server` stops at once, recreate it with
`sudo docker compose up -d --force-recreate nntp-server` (fixed by
[ISKME/Open-Metadata-Exchange#457](https://github.com/ISKME/Open-Metadata-Exchange/pull/457)).

## Change the peers

Edit `elements` in `/etc/nftables/ome-nntp-peers.nft`, then:

```shell
sudo systemctl reload ome-nntp-firewall
```

Do this also when the IP address of a peer changes.

## The other published ports

`docker-compose.yml` also publishes the API (`5001`) and the frontend (`4000`), and UFW does not
protect them either. If you do not need them from outside, publish them on the host only, for
example `127.0.0.1:4000:80`.
