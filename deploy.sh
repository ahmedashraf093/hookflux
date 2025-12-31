#!/bin/bash
set -e

# This script runs inside the container and triggers a redeploy of the stack
echo "--- Starting Self-Deployment ---"

echo "Building new image..."
docker build -t hookflux:latest .

echo "Updating Swarm Stack..."
docker stack deploy -c docker-stack.yml deployer

echo "--- Deployment Triggered Successfully ---"
echo "Note: The container will restart shortly."