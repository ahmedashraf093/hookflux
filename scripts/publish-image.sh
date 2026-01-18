#!/bin/bash

# Default configuration
IMAGE_NAME="hookflux"
VERSION=$(grep '"version":' package.json | cut -d '"' -f 4)
DOCKER_USER=${1:-ahmeda123} # Default to ahmeda123 if not provided

echo "📦 Preparing to publish $IMAGE_NAME v$VERSION to Docker Hub user: $DOCKER_USER"

# Build the image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$VERSION .

# Tag for Docker Hub
echo "🏷️ Tagging image..."
docker tag $IMAGE_NAME:latest $DOCKER_USER/$IMAGE_NAME:latest
docker tag $IMAGE_NAME:$VERSION $DOCKER_USER/$IMAGE_NAME:$VERSION

# Push to Docker Hub
echo "🚀 Pushing to Docker Hub..."
docker push $DOCKER_USER/$IMAGE_NAME:latest
docker push $DOCKER_USER/$IMAGE_NAME:$VERSION

echo "✅ Done! Image published to:"
echo "   - $DOCKER_USER/$IMAGE_NAME:latest"
echo "   - $DOCKER_USER/$IMAGE_NAME:$VERSION"
