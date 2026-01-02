# HookFlux

### Orchestrate Your Infrastructure with Signal-Driven Pipelines

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/ahmedashraf093/hookflux/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedashraf093/hookflux/actions/workflows/ci.yml)

![HookFlux Dashboard](home.jpg)

HookFlux is a high-performance, self-hosted automation engine designed to transform external webhooks into complex, multi-step execution flows. Built for developers who demand the control of local bash scripts with the elegance of a modern Terminal UI (TUI), HookFlux turns simple signals into sophisticated infrastructure orchestration.

---

## 🚀 Quick Start

HookFlux is designed to run anywhere you can execute a shell.

### Method 1: Ubuntu VM (Recommended)
Our automated script sets up a production-ready environment with Nginx, SSL (Certbot), and Systemd in minutes:
```bash
git clone https://github.com/ahmedashraf093/hookflux.git
cd hookflux
sudo ./deployment/ubuntu/setup.sh your-domain.com
```
*For detailed instructions, see the [Ubuntu Deployment Guide](deployment/ubuntu/README.md).*

### Method 2: Docker Swarm
Deploy as a stack to your cluster:
```bash
docker stack deploy -c docker-stack.yml hookflux
```

---

## ✨ Key Features

- **Visual Pipeline Architect**: Construct execution chains with an intuitive drag-and-drop builder. Link modules and configure localized variables via dedicated configuration overlays.
- **Zero-Latency TTY Streaming**: Experience automation in real-time. Raw terminal output is streamed via Socket.io directly to your dashboard with sub-millisecond latency.
- **Intelligent Parameter Validation**: Proactively scan configurations for missing parameters or incomplete setups with high-visibility alerts.
- **Searchable Module Library**: Scale operations by pulling from a centralized library of execution blocks. Preview required parameters and internal logic instantly.
- **Production-Grade Reliability**: 
  - **Hybrid Log Engine**: Metadata in SQLite for fast lookups; raw logs on disk for auditing.
  - **Auto-Maintenance**: 30-day retention policies and DB compaction keep the system lean.
  - **Security**: HMAC-SHA256 signature verification, JWT authentication, and input sanitization.

---

## 🧠 The Philosophy: Fluxes and Modules

HookFlux eliminates repetitive scripting through a powerful abstraction layer:

1. **Modules (The Lego Bricks)**: Define your core logic once. Modules are reusable bash templates with dynamic placeholders (e.g., `{{BRANCH}}`). Build a "Docker Build" or "Discord Notify" module and reuse it globally.
2. **Fluxes (The Neural Paths)**: Chain your modules together to create a pipeline triggered by a unique webhook slug. 

**The Workflow:**
1. **Craft**: Write bash logic in the Module Manager.
2. **Compose**: Drag and drop modules to build a Flux.
3. **Configure**: Inject project-specific data into the chain.
4. **Link**: Connect your Flux endpoint to GitHub or any webhook provider.

---

## ⚙️ Configuration

Control HookFlux behavior via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Access key for the dashboard | (Prompted during setup) |
| `JWT_SECRET` | Secret for signing auth tokens | (Generated during setup) |
| `DOMAIN` | The public domain name | `localhost` |
| `PIPELINE_TIMEOUT`| Max execution time (minutes) | `10` |
| `DATA_DIR` | SQLite database directory | `./` |
| `LOGS_DIR` | Raw execution logs directory | `./logs` |

---

## 🏗️ Technical Architecture

- **Backend**: Node.js & Express 5 (High-concurrency, non-blocking IO).
- **Database**: SQLite (Zero-config, fast, self-contained).
- **Streaming**: Socket.io (Bi-directional real-time logs).
- **Frontend**: React 19 + Vite + Tailwind CSS (Optimized TUI Aesthetic).
- **CI/CD**: Fully tested via Jest & GitHub Actions.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

**HookFlux: Stop writing scripts. Start building flows.**