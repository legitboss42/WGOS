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

const required = [
  "README.md",
  "WGOS_RUNTIME_SPEC.md",
  "CODEX_INVOCATION_PROTOCOL.md",
  "CONTROLLED_BROWSER_PROTOCOL.md",
  "LOCAL_SECRETS_STORE.md",
  "config/agents.json",
  "config/workflows.json",
  "config/skills.json",
  "config/approval-gates.json",
  "config/mission-types.json",
  "config/secrets.example.json",
  "prompts/MASTER_WGOS_CODEX_PROMPT.md",
  "secrets/credentials.example.json",
];
const failures = [];
for (const rel of required) {
  try {
    await fs.access(path.join(RUNTIME_ROOT, rel));
  } catch {
    failures.push("Missing " + rel);
  }
}
for (const rel of ["config/agents.json", "config/workflows.json", "config/skills.json", "config/approval-gates.json", "config/mission-types.json", "config/secrets.example.json", "secrets/credentials.example.json"]) {
  try {
    JSON.parse(await fs.readFile(path.join(RUNTIME_ROOT, rel), "utf8"));
  } catch (error) {
    failures.push("Invalid JSON " + rel + ": " + error.message);
  }
}
const missionTypesConfig = await readJson("config/mission-types.json");
for (const sample of [
  ["WGOS, rebuild WebGrowth.info", "WEBSITE_REBUILD"],
  ["WGOS, find 50 qualified leads today", "LEAD_GENERATION"],
  ["WGOS, check Search Console and GA4", "SEARCH_CONSOLE_REVIEW"],
]) {
  const text = sample[0].toLowerCase();
  let best = "GENERAL_STRATEGY";
  let score = 0;
  for (const [id, config] of Object.entries(missionTypesConfig)) {
    const nextScore = (config.keywords || []).filter((keyword) => text.includes(keyword.toLowerCase())).length;
    if (nextScore > score) {
      best = id;
      score = nextScore;
    }
  }
  if (best !== sample[1]) failures.push("Sample classification failed: " + sample[0] + " -> " + best);
}
try {
  await fs.access(path.join(RUNTIME_ROOT, "secrets", "credentials.local.json"));
  failures.push("Real local credentials file exists. It may be valid locally, but validation requires no real credentials for this bridge build.");
} catch {}
if (failures.length) {
  console.error("WGOS runtime validation failed.");
  for (const failure of failures) console.error("- " + failure);
  process.exitCode = 1;
} else {
  console.log("WGOS runtime validation passed.");
}
