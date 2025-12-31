#!/bin/bash
set -e

# This script runs inside the container and triggers a redeploy of the stack
echo "--- Starting Self-Deployment ---"

# 1. Update source code (assuming we are in the repo root or sources are managed)
# If running in production container, we might need to pull changes if sources are mounted
# For simplicity, if we have the sources, we build. 
# If you use a registry, you'd pull the image instead.

echo "Ensuring persistent files exist..."
touch data.db
mkdir -p logs
chmod 777 logs

echo "Building new image..."
docker build -t swarm-deployer:latest .

echo "Updating Swarm Stack..."
docker stack deploy -c docker-stack.yml deployer

echo "--- Deployment Triggered Successfully ---"
echo "Note: The container will restart shortly."
