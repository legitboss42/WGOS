import { runMission } from "../packages/runtime/src/index.mjs";

async function main() {
  const result = await runMission({
    templateId: "DEMO_SYSTEM_VALIDATION",
    operator: "Codex Demo",
  });

  console.log(`WGOS demo mission complete: ${result.missionId}`);
  console.log(`Status: ${result.missionStatus}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
