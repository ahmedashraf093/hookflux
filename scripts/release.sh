#!/bin/bash

# HookFlux Smart Release Script
# Usage: ./scripts/release.sh [patch|minor|major|<version>]

set -e

BUMP_TYPE=${1:-patch}

# 1. Safety Check: Ensure we are on main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "Error: Releases must be created from the 'main' branch."
    exit 1
fi

# 2. Safety Check: Ensure no uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# 3. Pull latest
echo "Pulling latest changes..."
git pull origin main

# 4. Run Tests
echo "Running tests to ensure quality..."
npm test

# 5. Bump Version
echo "Bumping version ($BUMP_TYPE)..."
# npm version handles package.json, package-lock.json, and the git tag
NEW_VERSION=$(npm version "$BUMP_TYPE" --no-git-tag-version)
VERSION_CLEAN=${NEW_VERSION#v}

echo "New Version: $VERSION_CLEAN"

# 6. Commit and Tag
echo "Committing and tagging v$VERSION_CLEAN..."
git add package.json package-lock.json
git commit -m "chore: release v$VERSION_CLEAN"
git tag -a "v$VERSION_CLEAN" -m "Release v$VERSION_CLEAN"

# 7. Push
echo "Pushing to origin..."
git push origin main
git push origin "v$VERSION_CLEAN"

# 8. GitHub Release
if command -v gh &> /dev/null; then
    echo "Creating GitHub Release..."
    gh release create "v$VERSION_CLEAN" --title "v$VERSION_CLEAN" --generate-notes
else
    echo "Warning: GitHub CLI (gh) not found. Skipping release creation."
    echo "You can manually create it at: https://github.com/ahmedashraf093/hookflux/releases/new?tag=v$VERSION_CLEAN"
fi

echo "---------------------------------------------------"
echo "Successfully released v$VERSION_CLEAN!"
echo "---------------------------------------------------"