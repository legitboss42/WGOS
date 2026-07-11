# Codex Invocation Protocol

User says:

```text
WGOS: Run mission - find 50 qualified leads today.
```

Codex must:

1. Read `wgos-runtime/prompts/MASTER_WGOS_CODEX_PROMPT.md`.
2. Read `wgos-runtime/WGOS_RUNTIME_SPEC.md`.
3. Read current WGOS memory.
4. Run or mentally apply the mission router.
5. Load relevant agent docs and workflow docs.
6. Create a mission plan and task board.
7. Ask for approval when gates require it.
8. Execute phase by phase.
9. Report after each phase.
10. Update memory and reports before completion.

## Examples

- `WGOS, rebuild WebGrowth.info.`
- `WGOS, run an SEO audit.`
- `WGOS, fix Search Console indexing.`
- `WGOS, check GA4 traffic.`
- `WGOS, find 50 qualified leads.`
- `WGOS, create 50 outreach drafts.`
- `WGOS, set up email.`
- `WGOS, publish an Academy article.`
- `WGOS, improve AdSense readiness.`
- `WGOS, prepare deployment.`
- `WGOS, update documentation.`
