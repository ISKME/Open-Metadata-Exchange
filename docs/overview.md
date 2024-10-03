# OME Project
OME enables open educational resources to create, publish, and update their metadata
on a peer-to-peer network.  By solving authoring, publishing, and discovery issues,
this network will provide broad visibility to current islands of OER information.

## Features
* Define a metadata model for sharing information about open educational resources.
* Define a distributed network for sharing this metadata in a non-centralized yet resilient way.
* Define a node for this network that is easy to install and use.
* Provide pedigree information for each record in the network.
* Suggest storage strategies for retaining metadata even if its original author leaves the network.

## Installation
Install Open Metadata Exchange by running:
* `apt-get install open-metadata-exchange` (Aspirational!)

## Contribute
* Issue Tracker: https://github.com/ISKME/Open-Metadata-Exchange/issues
* Source Code: https://github.com/ISKME/Open-Metadata-Exchange

## Support
Please open an issue in our [Issue Tracker](https://github.com/ISKME/Open-Metadata-Exchange/issues).

## License
The project is licensed under the __GNU Affero General Public License v3.0__.

---

# OME Overview

## Analogy
Imagine a librarian creates a catalog card for a new book. Once the card is made, the librarian makes copies and sends them to neighboring libraries. Those libraries do the same, spreading the information further. Each library may choose to add specific details relevant to its own collection, but they don't have to start from scratch. Any updates to the cards are also shared. This process ensures efficient sharing and updating of information across libraries.

## Practical Implementation
OME would create a standardized format for Open Educational Resources (OER), similar to iCal. This would operate on a peer-to-peer network using Docker-based nodes that enable store-and-forward information replication. APIs will be available to create, modify, and delete entries in the local node. Each node stores information and forwards modifications to neighboring nodes. There will be a user interface to view, import, and export data on the exchange. Nodes will automatically handle the storage and forwarding of the collaboratively created metadata.

## Problem Solved
OME addresses an "islands of information" issue. Currently, OER creators work in isolation, creating fragmented resources. OME aims to connect these "islands" so that contributors can discover and enhance each other's work.  Resources can be preserved even if the original creator is no longer active. This will simplify the discovery and tagging process, ensuring that the effort spent on these tasks benefits the entire network and is not unnecessarily duplicated across different digital libraries.
