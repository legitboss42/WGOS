# Integration Source

Executable integration metadata and future provider adapters should be implemented here. The first shared source is the integration catalog used by docs and runtime surfaces.

## Controlled sessions

`controlled-session.mjs` defines approval-aware session plans for browser, Search Console, GA4, Gmail, hosting, DNS, and other live-operation surfaces. It does not bypass login, 2FA, CAPTCHA, billing, verification, or human approval.

## Read-only adapters

`capability-registry.mjs`, `read-only-adapters.mjs`, `lighthouse-runner.mjs`, and `integration-logger.mjs` provide truthful capability checks, pause records, local Lighthouse execution, and JSONL logs for browser, Search Console, GA4, PageSpeed, and Lighthouse read-only work.
