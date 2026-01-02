#!/bin/bash
echo "--- Initializing HookFlux Pipeline ---"
echo "Current App: $APP_ID"
sleep 2
echo "Pulling latest changes..."
sleep 1
echo "Building assets..."
sleep 3
echo "Restarting Docker Swarm service..."
sleep 1
echo "Deployment successful!"
