# Approval Gates

High-risk actions require explicit human approval before execution.

## Approval-required categories

- Logging into external systems
- Handling credentials or secrets
- Sending emails or outreach
- Deployments and production changes
- DNS, hosting, or billing changes
- Search Console submissions or indexing requests
- CRM writes that contact real prospects or clients
- Purchases, subscriptions, or paid API usage

## Approval classes

- A0: Internal documentation only - No external system access and no state changes.
- A1: Local analysis and drafts - Local repo work, planning, reporting, and non-live asset creation.
- A2: Read-only external observation - Human-approved live observation after login or attachment.
- A3: State-changing external action - Any live change outside the repo with explicit approval.
- A4: Critical irreversible action - Production, financial, DNS, billing, or irreversible changes.
