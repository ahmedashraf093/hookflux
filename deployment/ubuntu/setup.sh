#!/bin/bash

# HookFlux Deployment Script for Ubuntu
# Usage: sudo ./setup.sh <domain_name> [--dry-run]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

DOMAIN=""
DRY_RUN=false

# Parse Arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift # Remove --dry-run from processing
            ;;
        *)
            if [ -z "$DOMAIN" ]; then
                DOMAIN=$arg
            fi
            ;;
    esac
done

log() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

dry_log() {
    echo -e "${BLUE}[DRY-RUN] $1${NC}"
}

err() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        dry_log "Would execute: $*"
    else
        eval "$@"
    fi
}

write_file() {
    local file_path=$1
    local content=$2
    
    if [ "$DRY_RUN" = true ]; then
        dry_log "Would write to file: $file_path"
        dry_log "--- Content Start ---"
        echo -e "$content"
        dry_log "--- Content End ---"
    else
        echo -e "$content" > "$file_path"
    fi
}

show_banner() {
    echo -e "${BLUE}"
    echo "  _    _  ____   ____  _  __ ______ _      _    _ __   __"
    echo " | |  | |/ __ \ / __ \| |/ /|  ____| |    | |  | |\ \ / /"
    echo " | |__| | |  | | |  | | ' / | |__  | |    | |  | | \ V / "
    echo " |  __  | |  | | |  | |  <  |  __| | |    | |  | |  > <  "
    echo " | |  | | |__| | |__| | . \ | |    | |____| |__| | / . \ "
    echo " |_|  |_|\____/ \____/|_|\_\|_|    |______|\____/ /_/ \_\\"
    echo -e "${NC}"
    echo -e "${GREEN}    >>> ORCHESTRATE YOUR INFRASTRUCTURE <<<${NC}"
    echo ""
}

# 1. Check Arguments and Permissions
show_banner

if [ -z "$DOMAIN" ]; then
    err "Usage: sudo ./setup.sh <domain_name> [--dry-run]"
fi

# Only check for root if not in dry-run, or just warn in dry-run
if [ "$EUID" -ne 0 ]; then
    if [ "$DRY_RUN" = true ]; then
        warn "Not running as root, but continuing in dry-run mode."
    else
        err "Please run as root (sudo)"
    fi
fi

# Validate Domain
if [[ ! "$DOMAIN" =~ ^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$ ]]; then
    err "Invalid domain format: $DOMAIN"
fi

# Determine Real User (for running the app)
REAL_USER=${SUDO_USER:-$USER}
if [ -z "$REAL_USER" ]; then
    REAL_USER="root"
fi
USER_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)

if [ "$REAL_USER" == "root" ] && [ "$DRY_RUN" = false ]; then
    warn "Running as root. It is recommended to run the application as a non-root user."
    # If strictly non-interactive, we might skip this or default to root.
    # We use a timeout to avoid hanging in automation if no input is provided.
    if read -t 5 -p "Enter the username to run the app (default: root): " INPUT_USER; then
        REAL_USER=${INPUT_USER:-root}
    else
        echo "" # Newline after timeout
        log "No input provided (or timeout). Defaulting to root."
        REAL_USER="root"
    fi
    USER_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)
fi

APP_DIR=$(pwd)
log "Deploying HookFlux for domain: $DOMAIN"
log "App Directory: $APP_DIR"
log "App User: $REAL_USER"
if [ "$DRY_RUN" = true ]; then
    log "Mode: DRY RUN (No changes will be made)"
fi

# 2. System Update & Prerequisites
log "Updating system packages..."
run_cmd "apt-get update"
run_cmd "apt-get install -y curl git build-essential ufw"

# 3. Install Nginx
if ! command -v nginx &> /dev/null; then
    log "Installing Nginx..."
    run_cmd "apt-get install -y nginx"
else
    log "Nginx already installed."
fi

# 4. Install Certbot
if ! command -v certbot &> /dev/null; then
    log "Installing Certbot..."
    run_cmd "apt-get install -y certbot python3-certbot-nginx"
else
    log "Certbot already installed."
fi

# 5. Install Node.js (LTS)
if ! command -v node &> /dev/null; then
    log "Installing Node.js (LTS)..."
    run_cmd "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
    run_cmd "apt-get install -y nodejs"
else
    log "Node.js already installed: $(node -v)"
fi

# ... (previous code)

# 6. Setup Application
log "Setting up application dependencies..."
# Run npm install as the real user to avoid permission issues in ~/.npm
run_cmd "sudo -u \"$REAL_USER\" npm install"

log "Rebuilding native modules (SQLite)..."
run_cmd "sudo -u \"$REAL_USER\" npm rebuild"

log "Building frontend..."
run_cmd "sudo -u \"$REAL_USER\" npm run build"

# 6b. Configure Environment Variables
log "Configuring environment variables..."
ENV_FILE="$APP_DIR/.env"

# Prompt for secrets if not provided in environment
if [ -z "$ADMIN_PASSWORD" ]; then
    if [ "$DRY_RUN" = false ]; then
        read -s -p "Enter Admin Password (leave empty to generate random): " INPUT_PASS
        echo ""
        ADMIN_PASSWORD=${INPUT_PASS:-$(openssl rand -base64 12)}
    else
        ADMIN_PASSWORD="dry-run-password"
    fi
fi

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
fi

log "Admin Password: ${ADMIN_PASSWORD}" 
log "JWT Secret: [HIDDEN]"

ENV_CONTENT="PORT=3000
NODE_ENV=production
DOMAIN=$DOMAIN
ADMIN_PASSWORD=$ADMIN_PASSWORD
JWT_SECRET=$JWT_SECRET"

write_file "$ENV_FILE" "$ENV_CONTENT"
run_cmd "chown $REAL_USER:$(id -gn $REAL_USER) $ENV_FILE"
run_cmd "chmod 600 $ENV_FILE"

# 6c. Setup Directories
log "Ensuring data and logs directories exist..."
run_cmd "mkdir -p $APP_DIR/logs $APP_DIR/data"
run_cmd "chown -R $REAL_USER:$(id -gn $REAL_USER) $APP_DIR/logs $APP_DIR/data"

# 7. Create Systemd Service
SERVICE_FILE="/etc/systemd/system/hookflux.service"
log "Creating Systemd service at $SERVICE_FILE..."

SERVICE_CONTENT="[Unit]\nDescription=HookFlux Deployment Monitor\nAfter=network.target\n\n[Service]\nUser=$REAL_USER\nWorkingDirectory=$APP_DIR\nExecStart=/usr/bin/npm run start\nRestart=always\n# Load env vars from file\nEnvironmentFile=$ENV_FILE\n\n[Install]\nWantedBy=multi-user.target"

write_file "$SERVICE_FILE" "$SERVICE_CONTENT"

run_cmd "systemctl daemon-reload"
run_cmd "systemctl enable hookflux"
run_cmd "systemctl restart hookflux"

# ... (rest of the script)

# 11. Health Check
log "Waiting for service to start..."
if [ "$DRY_RUN" = false ]; then
    sleep 5
    if curl -s http://localhost:3000/api/health | grep -q "ok"; then
        log "Health check passed!"
    else
        warn "Health check failed. Check logs with: sudo journalctl -u hookflux"
    fi
else
    log "Skipping health check in dry-run."
fi

log "Deployment Complete! Visit https://$DOMAIN"
log "Initial Admin Password: $ADMIN_PASSWORD"

# 8. Configure Nginx
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
log "Configuring Nginx at $NGINX_CONF..."

NGINX_CONTENT="server {\n    listen 80;\n    server_name $DOMAIN;\n\n    # Security: Limit payload size\n    client_max_body_size 10M;\n\n    # Performance: Enable Gzip\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade \$http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host \$host;\n        proxy_cache_bypass \$http_upgrade;\n        proxy_set_header X-Real-IP \$remote_addr;\n        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n    }\n}"

write_file "$NGINX_CONF" "$NGINX_CONTENT"

# Enable Site
run_cmd "ln -sf \"$NGINX_CONF\" \"/etc/nginx/sites-enabled/$DOMAIN\""
run_cmd "rm -f /etc/nginx/sites-enabled/default"

# Test & Reload Nginx
run_cmd "nginx -t"
run_cmd "systemctl reload nginx"

# 9. Setup SSL (Certbot)
log "Setting up SSL with Certbot..."

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "SSL certificate already exists."
else
    log "Obtaining SSL certificate..."
    run_cmd "certbot --nginx -d \"$DOMAIN\" --non-interactive --agree-tos --register-unsafely-without-email --redirect"
fi

# 9b. Configure Log Rotation
LOGROTATE_FILE="/etc/logrotate.d/hookflux"
log "Configuring log rotation at $LOGROTATE_FILE..."

LOGROTATE_CONTENT="$APP_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $REAL_USER $REAL_USER
}"

write_file "$LOGROTATE_FILE" "$LOGROTATE_CONTENT"

# 10. Firewall
log "Configuring Firewall..."
run_cmd "ufw allow 'Nginx Full'"
run_cmd "ufw allow OpenSSH"
# ufw enable # Commented out to prevent locking out user if they haven't configured SSH keys or allowed SSH explicitly yet. 
# Better to just allow the ports.
log "Firewall rules updated. Run 'ufw enable' manually if not enabled."

# 11. Health Check

log "Deployment Complete! Visit https://$DOMAIN"