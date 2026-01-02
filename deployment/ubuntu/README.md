# Ubuntu Deployment Guide for HookFlux

This directory contains automation scripts to deploy HookFlux on an Ubuntu server (tested on 20.04/22.04/24.04).

## Prerequisites

- An Ubuntu Server/VM.
- A domain name pointing to the server's public IP.
- Root or Sudo access.
- `git` installed (to clone the repo).

## Installation

1. **Clone the Repository** to your server (e.g., in `~` or `/var/www`):
   ```bash
   git clone https://github.com/yourusername/hookflux.git
   cd hookflux
   ```

2. **Run the Setup Script**:
   Replace `example.com` with your actual domain.
   ```bash
   sudo ./deployment/ubuntu/setup.sh example.com
   ```

## Dry Run
To verify what the script will do without making any changes, use the `--dry-run` flag:
```bash
sudo ./deployment/ubuntu/setup.sh example.com --dry-run
```

## Local Testing (Docker)
You can test the deployment script locally in a safe, isolated Docker environment (simulating a fresh Ubuntu server).

1. Ensure Docker is installed.
2. Run the test script:
   ```bash
   ./scripts/test-ubuntu-deploy.sh
   ```
   This will:
   - Build a temporary Docker image.
   - Run the setup script in `--dry-run` mode.
   - Run a simulated installation (mocking Systemd/Certbot) to verify configuration file generation.

## What the script does

1. **System Updates**: Updates `apt` repositories and installs base dependencies (`curl`, `git`, `build-essential`).
2. **Nginx**: Installs and configures Nginx as a reverse proxy.
3. **Node.js**: Installs Node.js LTS (v20.x).
4. **App Setup**: Installs npm dependencies and builds the React frontend.
5. **Service**: Creates a Systemd service (`hookflux`) to keep the app running in the background and restart on boot.
   - The service runs as the user who invoked the script (or the `SUDO_USER`).
6. **SSL**: Uses Certbot to automatically obtain a Let's Encrypt SSL certificate and configures HTTPS.
7. **Firewall**: Configures `ufw` to allow SSH, HTTP, and HTTPS traffic.
8. **Log Rotation**: Configures `logrotate` for application logs.

## Updating HookFlux
To update to the latest version of HookFlux:
```bash
sudo ./deployment/ubuntu/update.sh
```
This script pulls the latest code, updates dependencies, rebuilds the frontend, and restarts the service.

## Managing the Service

- **Start**: `sudo systemctl start hookflux`
- **Stop**: `sudo systemctl stop hookflux`
- **Restart**: `sudo systemctl restart hookflux`
- **Logs**: `sudo journalctl -u hookflux -f`
