# Core Concepts

Understanding how HookFlux organizes automation.

## 🧩 Modules

Modules are reusable "steps" or "blocks" of code. They are essentially Bash script templates.

### Example Module: `git-pull`
```bash
#!/bin/bash
cd /var/www/{{REPO_NAME}}
git pull origin {{BRANCH}}
```
*Notice the placeholders `{{REPO_NAME}}` and `{{BRANCH}}`. These are filled in dynamically when a pipeline runs.*

## ⚡ Fluxes

A **Flux** is a pipeline. It connects a **Webhook** to a sequence of **Modules**.

When you create a Flux, you:
1. **Name it** (e.g., "Deploy Production API").
2. **Assign a Route** (e.g., `/webhook/deploy-api`).
3. **Add Modules** (e.g., Step 1: `git-pull`, Step 2: `npm-install`, Step 3: `pm2-restart`).
4. **Configure Variables**: You provide the actual values for the placeholders (e.g., `BRANCH` = `main`).

## 🚀 The Execution Pipeline

1. **Trigger**: GitHub sends a payload to your Flux URL.
2. **Validation**: HookFlux verifies the signature and checks if the branch matches (if configured).
3. **Compilation**: The system assembles all Modules in order, replacing placeholders with configured values and environment variables.
4. **Execution**: A child process spawns to run the generated script.
5. **Streaming**: `stdout` and `stderr` are streamed via WebSockets to the dashboard.
