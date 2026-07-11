# Integration Error Handling

Record and classify:

- timeouts
- rate limits
- authentication failures
- browser crashes
- network failures
- partial success
- stale session state

## Retry rules

- retry only transient failures
- do not retry state-changing actions without fresh approval
- preserve original evidence before rerunning
