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

export async function classifyObjective(objective) {
  const missionTypes = await readJson("config/mission-types.json");
  const text = objective.toLowerCase();
  let best = { id: "GENERAL_STRATEGY", score: 0, config: missionTypes.GENERAL_STRATEGY };
  for (const [id, config] of Object.entries(missionTypes)) {
    const score = (config.keywords || []).filter((keyword) => text.includes(keyword.toLowerCase())).length;
    if (score > best.score) best = { id, score, config };
  }
  return { mission_type: best.id, confidence: best.score > 0 ? "keyword" : "fallback", ...best.config };
}

const args = parseArgs(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === __filename && args.objective) {
  console.log(JSON.stringify(await classifyObjective(String(args.objective)), null, 2));
}
