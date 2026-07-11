# Figma Integration

Support:

- Design review
- Component inspection
- Token review
- Motion review
- Layout comparison
- Image extraction
- Design system validation


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
