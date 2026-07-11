# Integrations

Integrations define the reusable controlled-operations layer that every WGOS agent shares when it touches tools, portals, files, or research systems.

## Integration framework

- `integrations/core/` defines the shared contract, lifecycle, authentication model, and error rules
- `integrations/approval/` defines approval behavior for connected systems
- `integrations/logging/` defines audit and evidence fields
- `integrations/runtime/` defines controlled-operations execution rules
- `integrations/examples/` holds worked portal and approval-pause examples
- `packages/integrations/src/` is the executable migration target for provider metadata and adapters

## Global rules

- No duplicated integration logic
- No autonomous external actions
- No undocumented login
- No undocumented browser session
- No undocumented report
- No undocumented failure

## Approval model

- LOW
- NORMAL
- HIGH
- CRITICAL

CRITICAL always pauses execution.

## Logging fields

- time
- agent
- action
- result
- approval
- errors
- duration
