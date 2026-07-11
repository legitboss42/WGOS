import path from "node:path";
import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { getAllCapabilityStates } from "../packages/integrations/src/capability-registry.mjs";
import { logIntegrationEvent } from "../packages/integrations/src/integration-logger.mjs";
import { writeJson, writeText } from "../packages/runtime/src/fs-utils.mjs";

function renderCapabilityReport(states) {
  return `# Integration Capability Report

## Result

This report records what read-only integration capabilities are actually configured for this WGOS process.

| Integration | Status | Source | Reason |
| --- | --- | --- | --- |
${states.map((state) => `| ${state.integrationId} | ${state.status} | ${state.source} | ${state.reason} |`).join("\n")}

## Rules

- UNAVAILABLE means WGOS must not pretend live access exists.
- Browser, Search Console, GA4, PageSpeed, and Lighthouse live actions remain read-only and approval-gated.
- Login, 2FA, CAPTCHA, billing, verification, property selection, deployment, DNS, email sending, and indexing requests require a human pause.`;
}

async function main() {
  const states = getAllCapabilityStates();
  await writeJson(path.join(WGOS_ROOT, "state", "integrations", "capabilities.json"), states);
  await writeText(path.join(WGOS_ROOT, "integrations", "CAPABILITY_REPORT.md"), renderCapabilityReport(states));

  for (const state of states) {
    await logIntegrationEvent(WGOS_ROOT, {
      integrationId: state.integrationId,
      action: "capability_check",
      result: state.status,
      approval: state.available ? "READ_ONLY_CONFIGURED" : "WAITING_CAPABILITY",
      evidencePointer: "integrations/CAPABILITY_REPORT.md",
    });
  }

  console.log("WGOS integration capability report generated.");
  console.log(`Capabilities checked: ${states.length}`);
  console.log("Report: WGOS/integrations/CAPABILITY_REPORT.md");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
