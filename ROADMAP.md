# HookFlux Roadmap

This document outlines the planned and proposed features for future releases of HookFlux.

## Phase 1: Core Enhancements (Short-term)
- **Advanced Parameter Handling**: Support for secret (hidden) parameters in Flux configurations.
- **Environment Variables**: Define global variables at the system level to be used in all Fluxes.
- **Notification Engine**: Built-in integration for Slack, Discord, and Telegram status updates.
- **Improved SSH**: Support for SSH key passphrases and custom identity files.

## Phase 2: Collaboration & Enterprise (Mid-term)
- **Multi-User Support**: Add support for multiple accounts with distinct roles (Admin, Operator, Viewer).
- **Audit Expansion**: Detailed logging of who triggered what Flux and when.
- **Flux Groups**: Organize Fluxes into folders or tags for better management of large scale infrastructures.
- **Manual Approvals**: Add a "Wait for Approval" step in the pipeline architect.

## Phase 3: Automation & Scaling (Long-term)
- **Scheduled Triggers**: Native cron-job support to trigger Fluxes on a schedule.
- **Pipeline Logic**: Conditional branching (If/Else) within the pipeline builder.
- **Resource Monitoring**: Basic dashboard showing server CPU/RAM usage during deployments.
- **API Access**: A public API to allow managing HookFlux via external scripts or CLI tools.

## Phase 4: Reliability
- **Clustered HookFlux**: High-availability mode for HookFlux itself.
- **External DB Support**: Option to use PostgreSQL or MySQL instead of SQLite for high-concurrency environments.
- **S3 Log Offloading**: Automatically move old execution logs to cold storage (S3/MinIO).

---

*Note: These features are subject to change based on community feedback and project priorities.*
