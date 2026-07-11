# Outreach Operator Guide

The Outreach Operator is the live control surface for WGOS lead outreach.

## Commands

Initialize or refresh the operator state:

```powershell
npm.cmd run wgos:outreach:init
```

Watch the live terminal surface:

```powershell
npm.cmd run wgos:outreach:watch
```

Print the current state once:

```powershell
npm.cmd run wgos:outreach:watch -- --once
```

Record a reply or bounce after Gmail review:

```powershell
npm.cmd run wgos:outreach:observe -- --lead WG-20260710-006 --status REPLIED --note "Asked for audit note"
```

Supported observation statuses:

- `REPLIED`
- `BOUNCED`
- `SENT_AWAITING_REPLY`
- `DO_NOT_CONTACT`
- `FOLLOW_UP_READY`

## Dashboard

Open:

`WGOS/growth/dashboard/outreach-operator.html`

The dashboard shows sent count, awaiting replies, bounces, missing emails, and per-lead status.

## Rules

- Do not send follow-ups automatically.
- Do not send future batches without explicit approval.
- Use small batches and review bounces before increasing volume.
- Record Gmail observations before deciding follow-up timing.
- Keep all outreach state in `WGOS/state/outreach/`.
