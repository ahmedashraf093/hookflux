# Configuration Guide

HookFlux is configured primarily through environment variables and persistent volumes.

## Environment Variables

Create a `.env` file in the root directory or pass these variables to your Docker container.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | The port the backend server listens on. | `3000` | No |
| `JWT_SECRET` | Secret key used to sign authentication tokens. **Change this in production.** | *(Generated)* | **Yes** |
| `ADMIN_PASSWORD` | The password for the dashboard login. | *(Prompted)* | **Yes** |
| `DOMAIN` | The public domain name of your server (used for Nginx config). | `localhost` | No |
| `PIPELINE_TIMEOUT`| Maximum time (in minutes) a deployment script can run before being killed. | `10` | No |
| `DATA_DIR` | Directory to store the SQLite database. | `./` | No |
| `LOGS_DIR` | Directory to store execution logs. | `./logs` | No |
| `SSH_DIR` | Directory for SSH keys (useful if scripts need to SSH elsewhere). | `/root/.ssh` | No |

## Persistence

To ensure your data survives container restarts, you must persist the following directories:

| Path inside Container | Description |
|-----------------------|-------------|
| `/app/data` | Stores `data.db` (Projects, Fluxes, Settings). |
| `/app/logs` | Stores raw text logs of every execution. |
| `/root/.ssh` | (Optional) Stores SSH keys if your scripts use git or ssh. |

## Nginx Configuration (Non-Docker)

If running on bare metal/VM, the setup script generates an Nginx config at `/etc/nginx/sites-available/hookflux`.

Key features configured:
- **WebSocket Upgrade**: Required for real-time log streaming.
- **Proxy Pass**: Forwards traffic to `localhost:3000`.
- **SSL**: Managed by Certbot (Let's Encrypt).
