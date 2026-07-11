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

import { classifyObjective } from "./mission-router.mjs";

const args = parseArgs(process.argv.slice(2));
const objective = String(args.objective || "");
if (!objective) throw new Error("Use --objective \"WGOS, find 50 qualified leads today.\"");

const route = await classifyObjective(objective);
const missionId = "WGOS-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + route.mission_type;
const taskBoard = route.required_agents.map((agent, index) => ({
  sequence: index + 1,
  agent,
  status: "READY",
  expected_output: route.expected_reports[index] || "agent output and handoff",
}));
const plan = {
  mission_id: missionId,
  objective,
  mission_type: route.mission_type,
  workflows: route.required_workflows,
  agents: route.required_agents,
  departments: route.required_departments,
  skills: route.required_skills,
  approval_gates: route.required_approval_gates,
  expected_reports: route.expected_reports,
  memory_updates_required: route.memory_updates_required,
  validation_steps: route.validation_steps,
  task_board: taskBoard,
  next_step: "Review approval gates, then execute the first task phase in Codex.",
};
const out = path.join(RUNTIME_ROOT, "state", "mission-plans", missionId + ".json");
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify(plan, null, 2) + "\n", "utf8");
await writeText(path.join(REPO_ROOT, "WGOS", "reports", "runtime-bridge", missionId + ".md"), "# Runtime Mission Plan\n\n" + JSON.stringify(plan, null, 2));
console.log(JSON.stringify(plan, null, 2));
