# Getting Started with HookFlux

Choose the deployment method that best suits your infrastructure.

## 🐳 Docker (Recommended)

The fastest way to get up and running is using Docker.

### Quick Start (Single Container)
Run HookFlux with persistent storage:

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name hookflux \
  ahmeda123/hookflux:latest
```

### Docker Swarm
For high availability or Swarm clusters, use the provided stack file.

1. **Download the stack file:**
   ```bash
   curl -o docker-stack.yml https://raw.githubusercontent.com/ahmedashraf093/hookflux/main/docker-stack.yml
   ```

2. **Deploy:**
   ```bash
   docker stack deploy -c docker-stack.yml hookflux
   ```

---

## 🐧 Ubuntu / Linux VM

Use our automated script to set up Node.js, Nginx, and SSL on a fresh Ubuntu server.

### Automatic Setup
```bash
git clone https://github.com/ahmedashraf093/hookflux.git
cd hookflux
sudo ./deployment/ubuntu/setup.sh your-domain.com
```

### Manual Installation
If you prefer to configure everything yourself:

1. **Install Dependencies:**
   - Node.js 20+
   - Nginx
   - PM2 (`npm install -g pm2`)

2. **Clone & Install:**
   ```bash
   git clone https://github.com/ahmedashraf093/hookflux.git
   cd hookflux
   npm install --omit=dev
   ```

3. **Build Frontend:**
   ```bash
   npm run build
   ```

4. **Start Server:**
   ```bash
   NODE_ENV=production pm2 start src/backend/index.js --name hookflux
   ```
