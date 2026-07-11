# Security Model

Document role permissions, secret handling, approval enforcement, audit trails, and credential isolation.

## Security rules

- Credentials stay isolated by integration and company context.
- External actions remain approval-gated even when runtime execution is automated.
- Audit logs must capture actor, company, action, result, and approval state.
- Shared services may inspect only the minimum data needed to complete their function.
