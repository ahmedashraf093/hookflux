# HookFlux: Universal Webhook Pipeline Engine

HookFlux is a self-hosted automation server that bridges external signals with local execution pipelines. It receives webhooks from platforms like GitHub and executes multi-step **Fluxes** built from reusable **Modules**.

## Core Concepts

### Fluxes (Pipelines)
A **Flux** is a top-level execution chain linked to a unique webhook endpoint. It defines the sequence of operations to perform when a signal is received.

### Modules (Building Blocks)
**Modules** are reusable bash script templates with dynamic parameters. They are the "Lego bricks" of HookFlux, allowing you to define logic once and reuse it across multiple Fluxes.

## Features

- **TUI Dashboard**: A modern terminal-inspired interface with large, readable monospaced fonts.
- **Pipeline Builder**: A visual chain constructor where you can add, configure, and reorder modules.
- **Real-time Monitoring**: Execution logs are streamed live via Socket.io to a terminal-style console.
- **Parameter Validation**: Visual indicators for incomplete configurations and missing variable values.
- **Module Library**: A searchable library of execution blocks with parameter previews.
- **Secure Webhooks**: HMAC-SHA256 signature verification and unique slug-based URLs.

## Technical Architecture

- **Engine**: Node.js & Express 5 (Modular Backend).
- **Interface**: React & Vite (Component-based Architecture).
- **Storage**: SQLite for persistent Flux configurations, Module definitions, and Task history.
- **Runtime**: multi-stage Docker image optimized for manager-node execution.

## Quick Start

1. **Deploy**: Use the provided `docker-stack.yml` to launch HookFlux.
2. **Define Modules**: Create your first script block (e.g., "Build Docker Image") in the Module Manager.
3. **Configure Flux**: Create a new Flux, add your modules as steps, and click the cog icon to fill in parameters.
4. **Link Webhook**: Copy the Flux endpoint and add it to your GitHub repository.

HookFlux: Automate everything, from local scripts to production swarm clusters.