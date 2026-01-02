# HookFlux

HookFlux is a self-hosted automation engine that executes multi-step bash pipelines triggered by external webhooks. It provides a real-time terminal interface for monitoring execution logs and managing deployment flows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/ahmedashraf093/hookflux/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedashraf093/hookflux/actions/workflows/ci.yml)

![HookFlux Dashboard](home.jpg)

## Installation and Deployment

### Ubuntu VM
The automated setup script configures Node.js, Nginx as a reverse proxy, and SSL via Certbot.

```bash
git clone https://github.com/ahmedashraf093/hookflux.git
cd hookflux
sudo ./deployment/ubuntu/setup.sh your-domain.com
```
Refer to the [Ubuntu Deployment Guide](deployment/ubuntu/README.md) for details on maintenance and updates.

### Docker Swarm
Deploy as a stack using the provided configuration:
```bash
docker stack deploy -c docker-stack.yml hookflux
```

---

## Core Features

- **Pipeline Builder**: Construct execution chains by linking reusable modules.
- **Real-time Logs**: Live terminal output streaming via Socket.io with full ANSI color support.
- **Webhook Integration**: Support for GitHub and generic webhooks using both JSON and URL-encoded payloads.
- **Security**: 
    - HMAC-SHA256 signature verification for incoming webhooks.
    - JWT-based authentication for dashboard access.
    - Input sanitization to prevent command injection.
- **Version Management**: Automated check for updates against the GitHub repository.
- **Configuration Validation**: Pre-execution scanning for missing parameters or incomplete setup.

---

## Components

### Modules
Modules are reusable bash templates with dynamic placeholders (e.g., `{{BRANCH}}`, `{{REPO_URL}}`). They serve as the functional building blocks for your pipelines.

### Fluxes
A Flux is a specific pipeline instance associated with a unique webhook endpoint. It consists of one or more modules executed in a defined sequence.

### Workflow
1. **Define**: Create bash modules in the Module Manager.
2. **Compose**: Select modules to build a Flux pipeline.
3. **Configure**: Assign specific values to module parameters.
4. **Trigger**: Connect the Flux endpoint to GitHub or any webhook provider.

---

## Configuration

The following environment variables control the application:

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Dashboard access password | (Prompted during setup) |
| `JWT_SECRET` | Secret for token signing | (Generated during setup) |
| `DOMAIN` | Public domain name | `localhost` |
| `PIPELINE_TIMEOUT`| Max execution time in minutes | `10` |
| `DATA_DIR` | SQLite database directory | `./` |
| `LOGS_DIR` | Execution logs directory | `./logs` |

---

## Technical Architecture

- **Backend**: Node.js and Express 5.
- **Database**: SQLite via `better-sqlite3`.
- **Streaming**: Socket.io for bi-directional log data.
- **Frontend**: React 19, Vite, and Tailwind CSS.
- **Testing**: Jest and Supertest.
- **CI**: GitHub Actions.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
