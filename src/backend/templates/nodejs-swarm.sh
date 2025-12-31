#!/bin/bash
set -e

# Template: Node.js Swarm
# Parameters: IMAGE_NAME, SERVICE_NAME, DOMAIN, REPO_URL, BRANCH

echo "--- Starting Node.js Deployment [{{SERVICE_NAME}}] ---"

# 1. Update source
if [ ! -d ".git" ]; then
    git clone -b {{BRANCH}} {{REPO_URL}} .
else
    git fetch origin {{BRANCH}}
    git reset --hard origin/{{BRANCH}}
fi

# 2. Build
echo "Building image: {{IMAGE_NAME}}..."
docker build -t {{IMAGE_NAME}}:latest .

# 3. Update Service (assuming single service for Node.js)
echo "Updating service: {{SERVICE_NAME}}..."
docker service update --image {{IMAGE_NAME}}:latest --with-registry-auth {{SERVICE_NAME}}

echo "Service {{SERVICE_NAME}} updated for {{DOMAIN}}"
