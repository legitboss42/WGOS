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
const note = String(args.note || "Runtime bridge memory update.");
const stamp = new Date().toISOString();
const updates = [
  ["WGOS/memory/CURRENT_STATE.md", "\n## " + stamp + "\n\n- " + missionId + ": " + note + "\n"],
  ["WGOS/memory/ACTIVE_TASKS.md", "\n- " + missionId + ": Review current runtime bridge task state.\n"],
  ["WGOS/memory/NEXT_ACTIONS.md", "\n- " + missionId + ": Continue through the next approved WGOS phase.\n"],
  ["WGOS/memory/CODEX_MEMORY.md", "\n- " + stamp + ": " + note + "\n"],
];
for (const [rel, content] of updates) {
  const full = path.join(REPO_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.appendFile(full, content, "utf8");
}
console.log("WGOS runtime memory updated for " + missionId);
