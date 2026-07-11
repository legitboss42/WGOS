# Integration Contract

Every WGOS integration must define:

- purpose
- allowed read operations
- blocked or approval-gated state changes
- authentication expectation
- approval class mapping
- logging fields
- reporting output
- memory update behavior
- retry boundary
- failure escalation path

## Rule

No provider-specific integration may weaken this contract.
