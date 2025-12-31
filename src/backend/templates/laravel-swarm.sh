#!/bin/bash
set -e

# Template: Laravel Swarm
# Parameters: IMAGE_NAME, STACK_NAME, DOMAIN, REPO_URL, BRANCH

echo "--- Starting Laravel Deployment [{{STACK_NAME}}] ---"

# 1. Ensure directory exists and is a git repo
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone -b {{BRANCH}} {{REPO_URL}} .
else
    echo "Updating repository..."
    git fetch origin {{BRANCH}}
    git reset --hard origin/{{BRANCH}}
fi

# 2. Build Image
echo "Building Docker image: {{IMAGE_NAME}}..."
docker build -t {{IMAGE_NAME}}:latest .

# 3. Deploy/Update Stack
echo "Deploying stack: {{STACK_NAME}}..."
# We assume a docker-compose.yml exists in the repo
# If you want to generate one, we could do that too, but usually it's in the repo
docker stack deploy -c docker-compose.yml --with-registry-auth {{STACK_NAME}}

echo "Deployment finished for {{DOMAIN}}"
