# Swarm Webhook Deployer Documentation

This project provides a robust solution for automating deployments via GitHub webhooks, featuring a real-time dashboard for monitoring logs.

## Project Structure

- `src/backend/`: Node.js Express server, Socket.io, and SQLite logic.
- `src/frontend/`: React + Vite frontend application.
- `scripts/`: Directory for local deployment shell scripts.
- `logs/`: Storage for historical deployment logs.
- `data.db`: SQLite database containing application configurations.

## Setup Instructions

### 1. Installation
Clone the project and install dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory (refer to the template):
```env
PORT=3000
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
```

### 3. Running the Application
To start both the backend and frontend in development mode:
```bash
npm run dev
```
- **Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

## Application Management

### Adding a New App
1. Login to the dashboard.
2. Navigate to **Settings** via the sidebar icon.
3. Click **New App**.
4. Fill in the repository details, branch, and path to your local deployment script.
5. Set a unique **Webhook Secret**.

### Configuring GitHub Webhooks
1. In your GitHub repository, go to **Settings > Webhooks**.
2. Click **Add webhook**.
3. **Payload URL**: `http://your-server-ip:3000/webhook`
4. **Content type**: `application/json`
5. **Secret**: Enter the secret you configured in the Dashboard settings.
6. Select the events you'd like to trigger the deployment (usually just `push`).

## Deployment Pipeline
The system executes the configured shell script using `bash`. It sets the following environment variables for the script:
- `APP_ID`: The unique slug of the application.
- All variables from your local `.env` file.

Real-time logs are captured from `stdout` and `stderr` and streamed to any active dashboard sessions.

## Deployment to Production

For deploying HookFlux to a live Ubuntu server with Nginx, SSL, and Systemd, please refer to the [Ubuntu Deployment Guide](../deployment/ubuntu/README.md).
