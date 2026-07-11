# Outreach Package

Draft-only outreach helpers live here. The draft generator creates human-review handoff records and never sends email.

## Operator Layer

`src/operator.mjs` adds persistent outreach observability:

- builds state from a lead CSV and send log
- tracks sent, awaiting reply, replied, bounced, ready-to-send, and missing-email leads
- renders `WGOS/growth/dashboard/outreach-operator.html`
- renders `WGOS/growth/dashboard/OUTREACH_OPERATOR.md`
- supports terminal watching through `npm.cmd run wgos:outreach:watch`
- supports manual reply/bounce observations through `npm.cmd run wgos:outreach:observe`

Actual email sending remains approval-gated and is not performed by local Node scripts.
