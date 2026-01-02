#!/bin/bash

# HookFlux Update Script for Ubuntu
# Usage: sudo ./update.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

err() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

if [ "$EUID" -ne 0 ]; then
    err "Please run as root (sudo)"
fi

APP_DIR=$(pwd)
REAL_USER=${SUDO_USER:-$USER}

log "Updating HookFlux in $APP_DIR..."

# 1. Pull latest changes
log "Pulling latest changes from git..."
sudo -u "$REAL_USER" git pull

# 2. Install dependencies
log "Updating dependencies..."
sudo -u "$REAL_USER" npm install

# 3. Rebuild native modules
log "Rebuilding native modules (SQLite)..."
sudo -u "$REAL_USER" npm rebuild

# 4. Run tests
log "Running system tests..."
sudo -u "$REAL_USER" npm test

# 5. Build frontend
log "Building frontend..."
sudo -u "$REAL_USER" npm run build

# 6. Restart service
log "Restarting HookFlux service..."
systemctl restart hookflux

log "Update Complete!"
systemctl status hookflux --no-pager
