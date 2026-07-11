import { setTimeout as sleep } from "node:timers/promises";
import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { loadLatestOutreachState, renderLiveSummary } from "../packages/outreach/src/operator.mjs";

function getArg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const once = process.argv.includes("--once");
  const intervalSeconds = Number(getArg("interval", "10"));
  do {
    const state = await loadLatestOutreachState(WGOS_ROOT);
    if (!state) {
      console.log("No outreach state found. Run npm.cmd run wgos:outreach:init first.");
      return;
    }
    console.clear();
    console.log(renderLiveSummary(state));
    if (once) return;
    await sleep(Math.max(2, intervalSeconds) * 1000);
  } while (true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
