# Developer Playbook

## Architecture

Use packages for executable behavior, apps for operator surfaces, docs for operating guidance, and companies for tenant-scoped state.

## Coding standards

Prefer existing runtime modules, keep behavior deterministic, avoid external side effects without approval gates, and write structured state before markdown summaries.

## Folder conventions

Runtime code lives in packages. Generated operator surfaces live in apps. Tenant files live in companies. Release artifacts live in release.

## Testing

Run `npm.cmd run wgos:test`, `npm.cmd run wgos:release`, `npm.cmd run wgos:dashboard`, and `npm.cmd run wgos:verify` for release-level changes.

## Contribution guidelines

Update docs, memory, reports, validation, and handoff artifacts in the same change that modifies behavior.
