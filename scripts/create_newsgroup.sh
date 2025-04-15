#!/bin/bash

# To be run INSIDE an INN Docker container:
# `docker ps`  # Obtain the Docker ID of the INN server.
# `docker exec -it a408778833fa bash`  # Run bash inside the Docker container.
# run this script with a newsgroup name as the optional first argument.
# `exit`  # Repeat with the other INN server(s).

# Default newsgroup name
NEWSGROUP=${1:-OER.public}

# Wait for INN server to start
sleep 10

# Create the new newsgroup
ctlinnd newgroup $NEWSGROUP

# Verify the newsgroup creation
if grep -q "$NEWSGROUP" /var/lib/news/active; then
  echo "Newsgroup $NEWSGROUP created successfully."
else
  echo "Failed to create newsgroup $NEWSGROUP."
  exit 1
fi
