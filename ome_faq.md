# Open Metadata Exchange (OME) FAQ

This FAQ is organized for prospective contributors and implementers.

## Goals

Further reading: [docs/overview.md](docs/overview.md), [docs/nontechnical_description.md](docs/nontechnical_description.md), [README.md](README.md)

### What is OME trying to achieve?

OME connects OER platforms so they can share metadata in a common, reusable format.

### What problem does OME solve for OER ecosystems?

OME addresses the "islands of information" problem by making metadata exchange possible across platforms.

### Who benefits most from OME?

Libraries, educational repositories, and maintainers who want to reduce duplicate metadata work and improve discoverability.

## Licensing

Further reading: [README.md](README.md), [LICENSE](LICENSE)

### What license does OME use?

OME is licensed under GNU Affero General Public License v3.0 (AGPL-3.0-only).

### What does AGPL mean for contributors?

Contributions are open-source and distributed under AGPL-3.0-only with network-use source-sharing obligations.

### Can organizations build on OME for production systems?

Yes, but they should review AGPL obligations with their legal/compliance teams.

## Governance

Further reading: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [CONTRIBUTING.md](CONTRIBUTING.md)

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

OME uses FastAPI (backend), React on Node (frontend), and INN/NNTP for metadata transport/storage.

### What Python version should contributors target?

Python 3.13+ is required.

### Is Docker required for local development?

Docker is the main local workflow for running coordinated services.

## Architecture

Further reading: [README.md](README.md), [docs/overview.md](docs/overview.md)

### What is the high-level request flow?

Browser → FE2/Node server → FastAPI backend → InterNetNews (INN) → response back to frontend.

### Is OME centralized or decentralized?

OME is decentralized and designed for metadata replication across multiple participants.

### Where is business logic implemented?

Business logic and API handling are primarily implemented in the FastAPI server (`server/`).

## OME Nodes

Further reading: [INSTALL.md](INSTALL.md), [README.md](README.md), [server/README.md](server/README.md)

### What is an OME node?

An OME node is a deployable participant that can publish, replicate, and consume metadata.

### What do I need to connect a node to peers?

A reachable host, NNTP-related ports, and peer configuration in `config.json`.

### Can I run multiple local nodes for testing?

Yes. The project supports multi-service local setups via Docker Compose.

## Plugins

Further reading: [server/plugins/README.md](server/plugins/README.md), [server/plugins/eric/README.md](server/plugins/eric/README.md)

### What is an OME plugin?

A plugin maps source-specific metadata into OME `EducationResource` records.

### What files are typical in a plugin?

Most plugins include `plugin.py`, generated/maintained model definitions, and optional import utilities.

### Which plugin is best to study first?

The ERIC plugin is the most advanced reference implementation.

## Frontend

Further reading: [README.md](README.md), [server/README.md](server/README.md)

### What frontend stack does OME use?

The user interface is FE2 (React) served by a Node server.

### How does the frontend communicate with the backend?

Frontend API requests are handled by the FastAPI service (proxied in development workflows).

### Where should frontend contributors start?

Start with the root README architecture and run instructions, then inspect FE2 sources in the repository.

## Network News

Further reading: [README.md](README.md), [server/README.md](server/README.md), [INSTALL.md](INSTALL.md)

### Why does OME use Network News / NNTP?

NNTP (via INN) provides a proven publish/subscribe model suitable for distributed metadata exchange.

### What role does InterNetNews (INN) play?

INN stores and replicates metadata articles that nodes publish and subscribe to.

### Do contributors need NNTP knowledge to help?

Not always. Frontend and API contributors can be productive quickly, while plugin/network work benefits from NNTP familiarity.
