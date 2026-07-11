# WGOS Runtime Bridge

This bridge turns the existing Phase 1-10 WGOS knowledge base into a Codex-first execution system.

Codex remains the interface. Existing WGOS markdown remains the brain: company knowledge, SOPs, agent definitions, workflows, approvals, memory, and reporting standards.

## Use

```powershell
npm.cmd run wgos:runtime:plan -- --objective "WGOS, find 50 qualified leads today."
npm.cmd run wgos:runtime:validate
```

## Rule

This bridge does not send emails, deploy, contact businesses, publish content, make DNS changes, use paid APIs, or expose secrets.
