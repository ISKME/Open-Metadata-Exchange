# OME FAQ

These frequently asked questions are organized to help people contribute to and implement Open Metadata Exchange (OME) nodes.

## Goals

Further reading: [docs/overview.md](docs/overview.md), [docs/nontechnical_description.md](docs/nontechnical_description.md), [README.md](README.md)

### What is OME trying to achieve?

The Open Metadata Exchange connects platforms of open educational materials so they can share metadata to facilitate discovery and sharing.  The OME network is designed to be decentralized so that it is resilient and not controlled by any single entity.  While the project is focused on the capture and exchange of metadata about resources, it is already being used to archive the resources themselves to ensure that they are backed up and remain available to the public.

### What problem does OME solve for OER ecosystems?

Open Educational Resource (OER) platforms have become "islands of information".  OME provides a decentralized and resilient network to connect these islands and allow discovery and sharing of valuable educational resources.

### Who benefits most from OME?

Libraries, teachers, and students will benefit from access to a wider range of educational resources.  The project wants to create communities of practice around metadata and OER to help improve the discoverability of educational resources worldwide.

## Licensing

Further reading: [README.md](README.md), [LICENSE](LICENSE)

### What license does OME use?

The OME software is open source and licensed under GNU Affero General Public License v3.0 (AGPL-3.0-only).

The educational resources shared through OME are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).

The OME community recognizes that attribution-only licenses are broadly being ignored by those who seek to profit from the open work of others.  This includes the training of AI models without proper permission as well as republishing of open educational resources without proper attribution.  The project will work to create community norms of acceptable behavior and look for ways to publicly shame those who engage in profiteering.

### What does AGPL mean for contributors to the source code?

All software contributions to this project are open-source and distributed under the terms of the [AGPL-3.0-only license](LICENSE).

### Can organizations build on OME for production systems?

Yes, but they should review AGPL obligations with their legal/compliance teams.

## Governance

Further reading: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [CONTRIBUTING.md](CONTRIBUTING.md)

### How is the project governed?
The project is governed by the OME Steering Committee, which is responsible for guiding the project's direction and making decisions on contributions and releases.  The committee is composed of representatives from active participants in the OME Network.

Under the guidance of the Steering Committee, the project has working groups focused on specific areas such as standards, development, documentation, and community engagement.  There is regular communication and coordination among these groups to ensure alignment with the project's goals.

Librarians and metadata specialists are encouraged to participate in the standards working group and contribute their expertise to help shape the development of OME.

Software developers and documentation writers are encouraged to participate in the development working group and contribute their skills to help build and improve the OME software and documentation.

### What community behavior is expected?

All interactions are expected to follow the project Code of Conduct.

### How are community concerns reported?

The Code of Conduct includes reporting and enforcement guidance for unacceptable behavior.

### How should decisions be discussed?

Use respectful, transparent issue and PR discussions aligned with project norms.

## Contributions

Further reading: [CONTRIBUTING.md](CONTRIBUTING.md), [README.md](README.md), [INSTALL.md](INSTALL.md)

### How do I get started as a new contributor?

Fork the repository, clone your fork, configure upstream, create a branch, and open a PR.

### What local tooling should I install first?

Install `uv`, `pre-commit`, and Docker Desktop as described in the contribution guide.

### What checks should I run before opening a PR?

Run repository checks with `pre-commit` and verify local runtime behavior where relevant.

## Technical

Further reading: [README.md](README.md), [server/README.md](server/README.md), [INSTALL.md](INSTALL.md)

### Which primary technologies are used?

OME uses React on Node.js (frontend), FastAPI (backend), and INN/NNTP for metadata transport/storage.

### What Python version should contributors target?

Python 3.13+ is required.

### Is Docker required for local development?

Docker is the main local workflow for running coordinated services.

## Architecture

Further reading: [README.md](README.md), [docs/overview.md](docs/overview.md)

### What is the high-level request flow?

Browser → FE2/Node.js server → FastAPI backend → InterNetNews (INN) → response back to the frontend.

### Is OME centralized or decentralized?

OME is decentralized and designed for metadata replication across multiple participants.

### Does the OME network use Application Programming Interface (API) for node-to-node communication?

Node-to-node communication is done by publishing and subscribing to network news articles over NNTP.  This is not done via API calls but is done by the exchange of NNTP articles, which contain metadata.  Instead of point-to-point API calls, the OME network uses a publish/subscribe model where nodes can publish metadata articles to the network and other nodes can subscribe to receive those articles.

### Where is business logic implemented?

Business logic and API handling are primarily implemented in the FastAPI server (`server/`).

## OME Nodes

Further reading: [INSTALL.md](INSTALL.md), [README.md](README.md), [server/README.md](server/README.md)

### What is an OME node?

An OME node is a Docker-based software bundle that enables a participant to publish, replicate, and consume metadata.  It runs an optional FE2 React/Node frontend, the FastAPI backend, and the InterNetNews (INN) server for the distribution of network news articles.

### What does an OME node need in terms of compute resources, software, and firewall (connectivity)?

OME Nodes need to run up to three different Docker containers (frontend, backend, NNTP), but they can be started and stopped together via `docker compose`.  The NNTP ports (119 and/or 563) for  transferring resources to and from other network participants will need to be opened to those partners.  It is advised to put the OME Node behind a firewall, but the software stack does not currently provide any firewall.

### What do I need to connect a node to peers?

A reachable host, NNTP-related ports, and peer configuration in `config.json`.

### Can I run multiple local nodes for testing?

Yes. The project supports multi-service local setups via Docker Compose.

## Plugins

Further reading: [server/plugins/README.md](server/plugins/README.md), [server/plugins/eric/README.md](server/plugins/eric/README.md)

### What is an OME plugin?

A plugin is both the onramp and the offramp that allows an Open Educational Resource (OER) platform to participate in the OME network.

A plugin reads in source-specific metadata from an OER platform and creates network news articles that are published to the OME network.  It also reads network news articles from the OME network and writes source-specific metadata back into the OER platform.

### What files are typical in a plugin?

Most plugins include `plugin.py`, generated/maintained model definitions, and optional import utilities.  All plugins define one or more mimetypes and corresponding newsgroups to allow publishing, searching, and subscribing in the OME network.

### Which plugin is best to study first?

While the ERIC plugin is one of the most advanced reference implementations, all plugins have to deal with very different data sources.  Lessons can be learned by studying several different plugins.  An AI skill for generating plugins can be found in the [.github/skills/plugin.md](.github/skills/plugin.md) file.

## Frontend

Further reading: [README.md](README.md), [server/README.md](server/README.md)

### What frontend stack does OME use?

The user interface is FE2 (React) served by a Node server.  It is a version of the user interface that ISKME's production partners use on a daily basis to enable the publishing and discovery, import, and export of open educational resources.  Its use is not required in the network.  It is offered as open source within the OME project to allow other OER platforms to use it as a reference implementation for their own user interfaces.

### How does the frontend communicate with the backend?

Frontend API requests are handled by the FastAPI service (proxied in development workflows).

### Where should frontend contributors start?

Start with the root README architecture and run instructions, then inspect FE2 sources in the repository.

## Network News

Further reading: [README.md](README.md), [server/README.md](server/README.md), [INSTALL.md](INSTALL.md)

### Why does OME use Network News / NNTP?

Network News Transport Protocol (NNTP) (via INN) is the network transport layer which allows network nodes to share network news articles containing metadata.  NNTP provides a proven publish/subscribe model suitable for distributed information exchange without relying on point-to-point API calls.  It is a mature protocol that has been used for decades to share information globally across the Internet.

### What is the format of an OME network news article?

An OME network news article is much like an email message with a header and body.  The header contains metadata about title, source,and newsgroup(s) of the educational resource.  The body contains a json-encoded representation of the OME metadata for the educational resource.  The body also contains two json-encoded enclosures: one is the source metadata just as the plugin captured it and one for the OME metadata for the educational resource.  This allows the article to be human-readable yet still contain a "lessless" record of the original source metadata.

### What role does InterNetNews (INN) play?

[InterNetNews (INN) software](https://github.com/InterNetNews/inn) is the proven implementation of the NNTP protocol which stores and replicates OME metadata articles that nodes publish and subscribe to.

### Do contributors need NNTP knowledge to help?

NNTP knowledge would be helpful to the project but there are lots of ways to contribute without it. Frontend, plugin, metadata, and documentation contributors can help the project enormously without familiarity with NNTP.
