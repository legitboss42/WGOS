import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNTIME_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(RUNTIME_ROOT, "..");

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

async function readJson(relPath) {
  return JSON.parse(await fs.readFile(path.join(RUNTIME_ROOT, relPath), "utf8"));
}

async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content.trim() + "\n", "utf8");
}

const args = parseArgs(process.argv.slice(2));
const missionId = String(args.mission || "WGOS-MANUAL");
const missionType = String(args.type || "GENERAL_STRATEGY");
const objective = String(args.objective || "Manual WGOS runtime report");
const report = {
  mission_id: missionId,
  mission_type: missionType,
  objective,
  agents_involved: [],
  workflows_used: [],
  skills_used: [],
  work_completed: String(args.completed || "Report created locally."),
  files_created: [],
  files_modified: [],
  approvals_requested: [],
  approvals_granted: [],
  validations_run: [],
  risks: [],
  next_steps: [String(args.next || "Update memory and continue phase execution.")],
  memory_updated: [],
  documentation_updated: [],
};
await writeText(path.join(REPO_ROOT, "WGOS", "reports", "runtime-bridge", missionId + "-report.md"), "# WGOS Runtime Report\n\n" + JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
