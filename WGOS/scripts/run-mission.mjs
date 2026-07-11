import { runMission } from "../packages/runtime/src/index.mjs";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith("--") ? next : true;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await runMission({
    templateId: String(args.template ?? "DEMO_SYSTEM_VALIDATION"),
    companyId: typeof args.company === "string" ? args.company : undefined,
    operator: typeof args.operator === "string" ? args.operator : "Codex",
  });

  console.log(`WGOS mission complete: ${result.missionId}`);
  console.log(`Status: ${result.missionStatus}`);
  console.log(`Tasks: ${result.taskCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
