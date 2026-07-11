# Controlled Browser Integration

Supports:

- Open session
- Pause for login
- Pause for 2FA
- Pause for CAPTCHA
- Resume
- Collect information
- Generate reports
- Close session

## Browser lifecycle

1. Open session
2. Navigate
3. Pause for human login or gate
4. Resume after confirmation
5. Collect information
6. Generate report
7. Close session

## Hard rules

- Never bypass authentication
- Never request passwords
- Never continue after approval gates
- Never hide a failed or unstable browser session


## Shared integration contract

Every WGOS integration must support:

- authentication handling
- approval gates
- reporting
- memory updates
- logging
- failure handling
- retry handling

## Runtime references

- `integrations/core/INTEGRATION_CONTRACT.md`
- `integrations/core/INTEGRATION_LIFECYCLE.md`
- `integrations/core/AUTHENTICATION_MODEL.md`
- `integrations/approval/INTEGRATION_APPROVAL_MODEL.md`
- `integrations/logging/LOG_SCHEMA.md`
- `integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md`
- `packages/integrations/src/integration-catalog.mjs`
- `packages/runtime/src/state-store.mjs`

## Documentation updates required

- Update mission or task reports in `reports/`
- Update memory files in `memory/`
- Update `decisions/DECISIONS.md` when behavior or policy changes
- Update `ROADMAP.md`, `CHANGELOG.md`, and `PROJECT_HANDOFF.md` when state changes matter

## Failure handling baseline

- Record timeouts, auth failures, rate limits, browser crashes, and partial success explicitly
- Retry only when a retry will not create duplicate or risky side effects
- Escalate to human approval instead of improvising around blocked authentication or protected actions
