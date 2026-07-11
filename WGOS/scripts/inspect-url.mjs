import path from "node:path";
import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { createReadOnlyIntegrationAdapters } from "../packages/integrations/src/read-only-adapters.mjs";
import { logIntegrationEvent } from "../packages/integrations/src/integration-logger.mjs";
import { renderLighthouseMarkdown } from "../packages/integrations/src/lighthouse-runner.mjs";
import { writeJson, writeText } from "../packages/runtime/src/fs-utils.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith("--") ? next : true;
  }
  return args;
}

function renderInspectionMarkdown({ url, results }) {
  return `# Read-Only URL Inspection

- URL: ${url}
- Generated: ${new Date().toISOString()}

## Results

${results.map((result) => `- ${result.integrationId}: ${result.status}${result.pause ? ` (${result.pause.status})` : ""}`).join("\n")}

## Pauses

${results.filter((result) => result.pause).length ? results.filter((result) => result.pause).map((result) => `- ${result.integrationId}: ${result.pause.reason}`).join("\n") : "- None"}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = String(args.url ?? "");
  if (!url) {
    throw new Error("Usage: npm.cmd run wgos:inspect-url -- --url https://example.com/");
  }

  const adapters = createReadOnlyIntegrationAdapters();
  const results = [];

  results.push(await adapters.browser.inspectUrl(url, { fetchFallback: args.fetchFallback === true || args.fetchFallback === "true" }));
  results.push(await adapters.pagespeed.inspectUrl(url));
  results.push(await adapters.lighthouse.inspectUrl(url));

  const slug = new URL(url).hostname.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const reportDir = path.join(WGOS_ROOT, "reports", "integrations", slug);
  await writeJson(path.join(reportDir, "inspection.json"), { url, results });
  await writeText(path.join(reportDir, "inspection.md"), renderInspectionMarkdown({ url, results }));

  const lighthouse = results.find((result) => result.integrationId === "lighthouse" && result.status === "SUCCESS");
  if (lighthouse) {
    await writeText(path.join(reportDir, "lighthouse.md"), renderLighthouseMarkdown(lighthouse.data));
  }

  for (const result of results) {
    await logIntegrationEvent(WGOS_ROOT, {
      integrationId: result.integrationId,
      action: result.action,
      result: result.status,
      approval: result.pause ? result.pause.status : "READ_ONLY_SUCCESS",
      evidencePointer: path.relative(WGOS_ROOT, path.join(reportDir, "inspection.md")).replace(/\\/g, "/"),
    });
  }

  console.log(`WGOS read-only URL inspection complete: ${url}`);
  console.log(`Report: ${path.relative(process.cwd(), path.join(reportDir, "inspection.md"))}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
