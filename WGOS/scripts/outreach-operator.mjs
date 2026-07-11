import path from "node:path";
import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { createOutreachState, readLeadsCsv, readSentMessages, writeOutreachState } from "../packages/outreach/src/operator.mjs";

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const missionId = getArg("mission", "WGOS-20260710-LEAD_GENERATION");
  const csvPath = path.resolve(getArg("csv", path.join(WGOS_ROOT, "data", "leads", "2026-07-10-wgos-lead-generation-50.csv")));
  const sendLogPath = path.resolve(getArg("send-log", path.join(WGOS_ROOT, "reports", "runtime-bridge", "2026-07-10-wgos-outreach-send-log.md")));
  const leads = await readLeadsCsv(csvPath);
  const sentMessages = await readSentMessages(sendLogPath);
  const state = createOutreachState({ missionId, leads, sentMessages });
  const written = await writeOutreachState({ root: WGOS_ROOT, state });
  console.log("WGOS outreach operator state generated.");
  console.log(`Mission: ${missionId}`);
  console.log(`Leads: ${state.summary.total}`);
  console.log(`Sent: ${state.summary.sent}`);
  console.log(`Awaiting reply: ${state.summary.awaitingReply}`);
  console.log(`Missing email: ${state.summary.missingEmail}`);
  console.log(`State: ${written.latestPath}`);
  console.log(`Dashboard: ${path.join(WGOS_ROOT, "growth", "dashboard", "outreach-operator.html")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
