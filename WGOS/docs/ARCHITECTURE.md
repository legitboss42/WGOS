# WGOS Architecture

WGOS started as a documentation-first operating system scaffold. After v1.0, the target architecture is software-first:

- `apps/` for user-facing and operator-facing applications
- `packages/` for reusable runtime, workflow, integration, analytics, reporting, memory, and UI modules
- `docs/` for the durable reference layer
- `templates/` for reusable mission and reporting formats
- `examples/` for runnable or inspectable sample flows
- `tests/` for platform validation beyond structural verification
- `companies/` for tenant-isolated operating data

During the transition, the current top-level WGOS knowledge folders remain the active source of truth while implementation code gradually moves into packages.
