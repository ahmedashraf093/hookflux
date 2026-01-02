#!/bin/bash

# HookFlux Release Script
# Usage: ./scripts/release.sh <version> (e.g., 1.0.1)

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    exit 1
fi

# 1. Update package.json
echo "Updating package.json to version $VERSION..."
npm version "$VERSION" --no-git-tag-version

# 2. Commit and Tag
echo "Committing and tagging..."
git add package.json package-lock.json
git commit -m "chore: release v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

# 3. Push
echo "Pushing changes and tags to origin..."
git push origin main
git push origin "v$VERSION"

echo "Successfully released v$VERSION!"
echo "If you have the GitHub CLI installed, you can create a release with:"
echo "gh release create v$VERSION --title \"v$VERSION\" --generate-notes"
