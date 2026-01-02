#!/bin/bash

# HookFlux Module: Git Force Sync
# Purpose: Discards all local changes and synchronizes with the remote branch.

set -e

echo "--- Synchronizing Source Code [{{BRANCH}}] ---"

# 1. Check if we are in a git repository
if [ ! -d ".git" ]; then
    echo "Directory is not a git repository. Cloning..."
    git clone -b {{BRANCH}} {{REPO_URL}} .
else
    echo "Git repository detected. Cleaning and pulling..."
    
    # 2. Fetch latest from origin
    git fetch origin {{BRANCH}}

    # 3. Discard all local changes (tracked files)
    git reset --hard origin/{{BRANCH}}

    # 4. Remove untracked files and directories
    git clean -fd

    # 5. Final pull to ensure we are up to date
    git pull origin {{BRANCH}}
fi

echo "Source code is now synchronized with origin/{{BRANCH}}"
