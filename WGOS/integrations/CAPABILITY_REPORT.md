# Integration Capability Report

## Result

This report records what read-only integration capabilities are actually configured for this WGOS process.

| Integration | Status | Source | Reason |
| --- | --- | --- | --- |
| browser | UNAVAILABLE | env:WGOS_BROWSER_CONTROL | No live connector or approved session capability is configured for this process. |
| search-console | UNAVAILABLE | env:WGOS_SEARCH_CONSOLE_READONLY | No live connector or approved session capability is configured for this process. |
| ga4 | UNAVAILABLE | env:WGOS_GA4_READONLY | No live connector or approved session capability is configured for this process. |
| pagespeed | UNAVAILABLE | env:WGOS_PAGESPEED_READONLY | No live connector or approved session capability is configured for this process. |
| lighthouse | UNAVAILABLE | env:WGOS_LIGHTHOUSE_LOCAL | No live connector or approved session capability is configured for this process. |

## Rules

- UNAVAILABLE means WGOS must not pretend live access exists.
- Browser, Search Console, GA4, PageSpeed, and Lighthouse live actions remain read-only and approval-gated.
- Login, 2FA, CAPTCHA, billing, verification, property selection, deployment, DNS, email sending, and indexing requests require a human pause.
