# Decision Log

## 2026-07-08

- WGOS lives in a separate top-level `WGOS/` directory to avoid modifying the production site architecture.
- WGOS uses generated registries and scripts to keep docs, entities, and validation in sync.
- External actions remain approval-gated and documentation-first.

## 2026-07-10

- WGOS v1.0 documentation was deepened so agents, workflows, skills, templates, and memory records are immediately usable instead of placeholder-only.
- WGOS post-v1.0 architecture is software-first, but the current documentation and registry layer remains the active source of truth during migration.
- Editorial agent routing uses the `publishing` department and folder structure.
- WGOS runtime execution now persists JSON state under `WGOS/state/` and generates operator/dashboard surfaces from that state.
- WGOS Phase 10 release artifacts define v1.0 release notes, certification, validation, security review, operating manuals, and release stress-test expectations.
