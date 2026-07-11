import path from "node:path";
import { WGOS_ROOT } from "./lib/wgos-config.mjs";
import { updateApprovalDecision } from "../packages/approval/src/approval-queue.mjs";
import { renderSurfaces } from "../packages/ui/src/render-surfaces.mjs";
import { readJson } from "../packages/runtime/src/fs-utils.mjs";

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const queuePath = path.join(WGOS_ROOT, "state", "approvals", "queue.json");

  if (args.decision) {
    const id = String(args.id ?? "");
    if (!id) throw new Error("Use --id with --decision APPROVED|REJECTED|REVISION_REQUESTED.");
    const item = await updateApprovalDecision(WGOS_ROOT, id, String(args.decision), {
      reviewer: String(args.reviewer ?? "Human owner"),
      note: String(args.note ?? ""),
    });
    await renderSurfaces(WGOS_ROOT);
    console.log(`Approval updated: ${item.id}`);
    console.log(`Status: ${item.status}`);
    console.log(`Next Action: ${item.nextAction}`);
    return;
  }

  const queue = await readJson(queuePath, []);
  const status = String(args.status ?? "PENDING");
  const filtered = status === "ALL" ? queue : queue.filter((item) => item.status === status);
  console.log(`Approval queue: ${filtered.length} item(s)`);
  for (const item of filtered.slice(0, 30)) {
    console.log(`${item.id} | ${item.status} | ${item.agentSlug} | ${item.action} | ${item.target}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
