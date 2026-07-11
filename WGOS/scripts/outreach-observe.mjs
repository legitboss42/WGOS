import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { recordObservation } from "../packages/outreach/src/operator.mjs";

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const leadId = getArg("lead");
  const status = getArg("status");
  const note = getArg("note", "");
  if (!leadId || !status) {
    throw new Error("Usage: npm.cmd run wgos:outreach:observe -- --lead WG-20260710-006 --status REPLIED --note \"Interested\"");
  }
  const record = await recordObservation({ root: WGOS_ROOT, leadId, status, note });
  console.log(`Updated ${record.leadId}: ${record.status}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
