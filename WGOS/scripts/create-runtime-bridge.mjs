import fs from "node:fs/promises";
import path from "node:path";
import { agents, approvalClasses, departments, skills, workflows } from "./lib/wgos-config.mjs";
import { missionTemplates } from "../packages/runtime/src/mission-catalog.mjs";

const ROOT = process.cwd();
const BRIDGE_ROOT = path.join(ROOT, "wgos-runtime");
const agentsBySlug = new Map(agents.map((agent) => [agent.slug, agent]));

const missionTypes = {
  WEBSITE_REBUILD: route({
    keywords: ["rebuild", "redesign", "homepage", "website refresh"],
    agents: ["CEO_OPERATOR_AGENT", "WORKFLOW_ORCHESTRATOR_AGENT", "PROJECT_MANAGER_AGENT", "PRODUCT_STRATEGIST_AGENT", "UI_UX_DESIGN_AGENT", "MOTION_GRAPHICS_AGENT", "FRONTEND_ENGINEER_AGENT", "SEO_AGENT", "AEO_AGENT", "GEO_AGENT", "ACCESSIBILITY_ENGINEER_AGENT", "PERFORMANCE_ENGINEER_AGENT", "QA_ENGINEER_AGENT", "KNOWLEDGE_MANAGER_AGENT", "DOCUMENTATION_AGENT"],
    workflows: ["WEBSITE_REBUILD_WORKFLOW", "QA_AND_RELEASE_WORKFLOW", "DOCUMENTATION_UPDATE_WORKFLOW"],
    skills: ["NEXTJS", "TAILWIND", "TYPESCRIPT", "SEO", "AEO", "GEO", "ACCESSIBILITY", "PERFORMANCE", "TESTING"],
    approvals: ["NORMAL: major design direction", "CRITICAL: production deployment"],
    reports: ["website-rebuild-report", "qa-report", "handoff"],
  }),
  WEBSITE_DESIGN: route({ keywords: ["design website", "ui", "ux", "motion"], agents: ["PRODUCT_STRATEGIST_AGENT", "UI_UX_DESIGN_AGENT", "BRAND_DESIGN_AGENT", "MOTION_GRAPHICS_AGENT", "DOCUMENTATION_AGENT"], workflows: ["WEBSITE_REBUILD_WORKFLOW"], skills: ["TAILWIND", "GSAP", "FRAMER_MOTION", "ACCESSIBILITY"], approvals: ["NORMAL: major design direction"], reports: ["design-direction-report"] }),
  CLIENT_WEBSITE_BUILD: route({ keywords: ["client site", "client website", "build website for"], agents: ["SALES_CONSULTANT_AGENT", "CLIENT_ONBOARDING_AGENT", "PRODUCT_STRATEGIST_AGENT", "UI_UX_DESIGN_AGENT", "FRONTEND_ENGINEER_AGENT", "BACKEND_ENGINEER_AGENT", "SEO_AGENT", "CLIENT_SUCCESS_AGENT", "DEPLOYMENT_ENGINEER_AGENT", "QA_ENGINEER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["CLIENT_PROJECT_DELIVERY_WORKFLOW", "WEBSITE_REBUILD_WORKFLOW", "QA_AND_RELEASE_WORKFLOW"], skills: ["NEXTJS", "TYPESCRIPT", "SEO", "COPYWRITING", "DEPLOYMENT"], approvals: ["CRITICAL: proposal, publishing, deployment, DNS"], reports: ["client-delivery-report", "launch-readiness-report"] }),
  SEO_AUDIT: route({ keywords: ["seo audit", "seo issues", "technical seo", "fix seo"], agents: ["SEO_AGENT", "TECHNICAL_SEO_AGENT", "SCHEMA_AGENT", "ANALYTICS_AGENT", "QA_ENGINEER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["SEO_GROWTH_WORKFLOW", "ANALYTICS_REVIEW_WORKFLOW"], skills: ["SEO", "CODEX_SEO", "SCHEMA", "SEARCH_CONSOLE", "GA4"], approvals: ["HIGH: read-only external account observation", "CRITICAL: indexing requests"], reports: ["seo-audit-report"] }),
  SEO_CONTENT_REBUILD: route({ keywords: ["content seo", "rewrite content", "content rebuild"], agents: ["SEO_AGENT", "CONTENT_STRATEGIST_AGENT", "COPYWRITER_AGENT", "PROOFREADER_AGENT", "INTERNAL_LINKING_AGENT", "SCHEMA_AGENT"], workflows: ["CONTENT_PUBLISHING_WORKFLOW", "SEO_GROWTH_WORKFLOW"], skills: ["SEO", "CONTENT_WRITING", "COPYWRITING", "SCHEMA"], approvals: ["NORMAL: large rewrite", "CRITICAL: publishing"], reports: ["content-seo-report"] }),
  AEO_GEO_OPTIMIZATION: route({ keywords: ["aeo", "geo", "answer engine", "generative engine"], agents: ["AEO_AGENT", "GEO_AGENT", "SEO_AGENT", "SCHEMA_AGENT", "CONTENT_STRATEGIST_AGENT"], workflows: ["SEO_GROWTH_WORKFLOW"], skills: ["AEO", "GEO", "SCHEMA", "SEO"], approvals: ["LOW: local recommendations", "CRITICAL: publishing"], reports: ["aeo-geo-report"] }),
  ADSENSE_READINESS: route({ keywords: ["adsense", "ad sense", "monetization approval"], agents: ["ADSENSE_AGENT", "CONTENT_STRATEGIST_AGENT", "SEO_AGENT", "QA_ENGINEER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["ADSENSE_READINESS_WORKFLOW"], skills: ["ADSENSE", "CONTENT_WRITING", "SEO"], approvals: ["CRITICAL: account changes or ad placement publishing"], reports: ["adsense-readiness-report"] }),
  LEAD_GENERATION: route({ keywords: ["find 50 leads", "qualified leads", "lead generation", "find leads"], agents: ["MARKETING_STRATEGIST_AGENT", "LEAD_RESEARCH_AGENT", "WEBSITE_AUDIT_AGENT", "BUSINESS_INTELLIGENCE_AGENT", "CRM_AGENT", "OUTREACH_DRAFTING_AGENT", "QA_ENGINEER_AGENT", "KNOWLEDGE_MANAGER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["LEAD_RESEARCH_WORKFLOW", "HUMAN_APPROVED_OUTREACH_WORKFLOW"], skills: ["CONTROLLED_BROWSER", "LEAD_RESEARCH", "OUTREACH", "CRM", "COPYWRITING"], approvals: ["HIGH: controlled browsing", "CRITICAL: sending/contacting/submitting forms"], reports: ["lead-research-report", "outreach-draft-report", "crm-report"] }),
  WEBSITE_AUDIT_FOR_LEADS: route({ keywords: ["audit prospects", "website audit for leads", "mini audits"], agents: ["WEBSITE_AUDIT_AGENT", "BUSINESS_INTELLIGENCE_AGENT", "LEAD_RESEARCH_AGENT", "DOCUMENTATION_AGENT"], workflows: ["LEAD_RESEARCH_WORKFLOW"], skills: ["CONTROLLED_BROWSER", "LEAD_RESEARCH", "SEO", "PERFORMANCE"], approvals: ["HIGH: controlled browsing"], reports: ["website-audit-report"] }),
  OUTREACH_DRAFTING: route({ keywords: ["outreach drafts", "email drafts", "draft emails"], agents: ["OUTREACH_DRAFTING_AGENT", "CRM_AGENT", "QA_ENGINEER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["HUMAN_APPROVED_OUTREACH_WORKFLOW"], skills: ["COPYWRITING", "OUTREACH", "GMAIL"], approvals: ["CRITICAL: Gmail draft creation or sending"], reports: ["outreach-draft-report"] }),
  CRM_UPDATE: route({ keywords: ["crm", "pipeline", "lead status"], agents: ["CRM_AGENT", "FOLLOW_UP_AGENT", "DOCUMENTATION_AGENT"], workflows: ["HUMAN_APPROVED_OUTREACH_WORKFLOW"], skills: ["CRM", "LEAD_RESEARCH"], approvals: ["HIGH: external CRM writes"], reports: ["crm-update-report"] }),
  ANALYTICS_REVIEW: route({ keywords: ["analytics", "traffic", "kpi", "weekly review"], agents: ["ANALYTICS_AGENT", "CRO_AGENT", "MARKETING_STRATEGIST_AGENT", "DOCUMENTATION_AGENT"], workflows: ["ANALYTICS_REVIEW_WORKFLOW"], skills: ["GA4", "CRO"], approvals: ["HIGH: read-only account access"], reports: ["analytics-review-report"] }),
  SEARCH_CONSOLE_REVIEW: route({ keywords: ["search console", "indexing", "coverage"], agents: ["SEARCH_CONSOLE_AGENT", "SEO_AGENT", "TECHNICAL_SEO_AGENT", "DOCUMENTATION_AGENT"], workflows: ["SEO_GROWTH_WORKFLOW"], skills: ["SEARCH_CONSOLE", "SEO"], approvals: ["HIGH: read-only Search Console", "CRITICAL: request indexing"], reports: ["search-console-review-report"] }),
  GA4_REVIEW: route({ keywords: ["ga4", "google analytics"], agents: ["ANALYTICS_AGENT", "CRO_AGENT", "DOCUMENTATION_AGENT"], workflows: ["ANALYTICS_REVIEW_WORKFLOW"], skills: ["GA4", "CRO"], approvals: ["HIGH: read-only GA4"], reports: ["ga4-review-report"] }),
  CONTENT_PUBLISHING: route({ keywords: ["publish article", "academy article", "blog"], agents: ["EDITORIAL_MANAGER_AGENT", "CONTENT_STRATEGIST_AGENT", "COPYWRITER_AGENT", "PROOFREADER_AGENT", "INTERNAL_LINKING_AGENT", "SCHEMA_AGENT", "QA_ENGINEER_AGENT"], workflows: ["CONTENT_PUBLISHING_WORKFLOW"], skills: ["CONTENT_WRITING", "COPYWRITING", "SEO", "SCHEMA"], approvals: ["CRITICAL: public publishing"], reports: ["content-publishing-report"] }),
  WEBSITE_SPEED_OPTIMIZATION: route({ keywords: ["speed", "performance", "core web vitals", "lcp"], agents: ["PERFORMANCE_ENGINEER_AGENT", "FRONTEND_ENGINEER_AGENT", "QA_ENGINEER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["QA_AND_RELEASE_WORKFLOW"], skills: ["PERFORMANCE", "NEXTJS", "TESTING"], approvals: ["CRITICAL: deployment"], reports: ["performance-report"] }),
  CONTROLLED_BROWSER_TASK: route({ keywords: ["browser", "login", "portal", "maps", "directory"], agents: ["WORKFLOW_ORCHESTRATOR_AGENT", "LEAD_RESEARCH_AGENT", "SEARCH_CONSOLE_AGENT", "DOCUMENTATION_AGENT"], workflows: ["CONTROLLED_BROWSER_WORKFLOW"], skills: ["CONTROLLED_BROWSER"], approvals: ["HIGH: login/read-only observation", "CRITICAL: state changes"], reports: ["controlled-browser-report"] }),
  EMAIL_SETUP: route({ keywords: ["email setup", "gmail", "admin@", "send-as"], agents: ["DEPLOYMENT_ENGINEER_AGENT", "CRM_AGENT", "DOCUMENTATION_AGENT"], workflows: ["CONTROLLED_BROWSER_WORKFLOW"], skills: ["GMAIL", "CONTROLLED_BROWSER"], approvals: ["CRITICAL: account changes, DNS, sending"], reports: ["email-setup-report"] }),
  DEPLOYMENT_PREP: route({ keywords: ["deploy", "vercel", "launch", "production"], agents: ["DEPLOYMENT_ENGINEER_AGENT", "QA_ENGINEER_AGENT", "SEO_AGENT", "DOCUMENTATION_AGENT"], workflows: ["QA_AND_RELEASE_WORKFLOW"], skills: ["DEPLOYMENT", "TESTING", "SEO"], approvals: ["CRITICAL: production deployment, DNS"], reports: ["deployment-prep-report"] }),
  DOCUMENTATION_UPDATE: route({ keywords: ["document", "docs", "memory", "handoff"], agents: ["DOCUMENTATION_AGENT", "KNOWLEDGE_MANAGER_AGENT"], workflows: ["DOCUMENTATION_UPDATE_WORKFLOW"], skills: ["OPERATIONS"], approvals: ["LOW: local documentation"], reports: ["documentation-update-report"] }),
  AGENT_SYSTEM_UPDATE: route({ keywords: ["agent", "runtime", "wgos", "system update"], agents: ["WORKFLOW_ORCHESTRATOR_AGENT", "PROJECT_MANAGER_AGENT", "KNOWLEDGE_MANAGER_AGENT", "DOCUMENTATION_AGENT", "QA_ENGINEER_AGENT"], workflows: ["WORKFLOW_ORCHESTRATION", "DOCUMENTATION_UPDATE_WORKFLOW"], skills: ["OPERATIONS", "TESTING"], approvals: ["NORMAL: system behavior changes"], reports: ["agent-system-update-report"] }),
  GENERAL_STRATEGY: route({ keywords: ["strategy", "plan", "prioritize", "roadmap"], agents: ["CEO_OPERATOR_AGENT", "WORKFLOW_ORCHESTRATOR_AGENT", "PROJECT_MANAGER_AGENT", "DOCUMENTATION_AGENT"], workflows: ["WORKFLOW_ORCHESTRATION"], skills: ["BUSINESS_MODEL", "OPERATIONS"], approvals: ["LOW: local strategy"], reports: ["strategy-report"] }),
};

const docs = {
  "README.md": `# WGOS Runtime Bridge

This bridge turns the existing Phase 1-10 WGOS knowledge base into a Codex-first execution system.

Codex remains the interface. Existing WGOS markdown remains the brain: company knowledge, SOPs, agent definitions, workflows, approvals, memory, and reporting standards.

## Use

\`\`\`powershell
npm.cmd run wgos:runtime:plan -- --objective "WGOS, find 50 qualified leads today."
npm.cmd run wgos:runtime:validate
\`\`\`

## Rule

This bridge does not send emails, deploy, contact businesses, publish content, make DNS changes, use paid APIs, or expose secrets.`,
  "WGOS_RUNTIME_SPEC.md": `# WGOS Runtime Spec

The runtime bridge converts a plain Codex instruction into a mission plan.

## Flow

1. Read runtime bridge docs.
2. Read existing WGOS memory and current state.
3. Classify the objective.
4. Select mission type, workflow, agents, skills, approval gates, reports, and memory updates.
5. Create a task board.
6. Execute phase by phase inside Codex.
7. Pause for approvals.
8. Generate reports.
9. Update memory and documentation.`,
  "MISSION_ROUTER.md": `# Mission Router

The mission router maps user objectives to mission types in \`config/mission-types.json\`.

Supported mission types:

${Object.keys(missionTypes).map((id) => `- ${id}`).join("\n")}`,
  "AGENT_REGISTRY.md": `# Agent Registry

Machine-readable agent entries live in \`config/agents.json\`.

Each entry references existing detailed source docs instead of duplicating every role document.`,
  "WORKFLOW_REGISTRY.md": `# Workflow Registry

Machine-readable workflow entries live in \`config/workflows.json\`.

The workflow registry converts existing WGOS workflow docs into Codex routing data.`,
  "SKILL_REGISTRY.md": `# Skill Registry

Machine-readable skill entries live in \`config/skills.json\`.

Skills indicate tools, approval needs, validation, agents using the skill, and source docs.`,
  "APPROVAL_GATE_ENGINE.md": `# Approval Gate Engine

Codex must pause before CRITICAL approvals:

- sending emails
- submitting contact forms
- contacting prospects
- contacting clients
- deploying production
- committing major changes without user approval
- deleting important files
- DNS changes
- payments
- enabling paid services
- external account changes
- Search Console request indexing
- publishing public content
- making client/result claims

NORMAL approvals: large rewrites, major design direction, new public pages, service positioning, migration or redirect strategy, route structure changes.

LOW approvals: local reports, memory updates, documentation updates, local runtime validation. These may proceed but must be documented.`,
  "MEMORY_UPDATE_ENGINE.md": `# Memory Update Engine

Every mission must update existing WGOS memory paths:

- \`WGOS/memory/CODEX_MEMORY.md\`
- \`WGOS/memory/CURRENT_STATE.md\`
- \`WGOS/memory/ACTIVE_TASKS.md\`
- \`WGOS/memory/NEXT_ACTIONS.md\`
- \`WGOS/reports/runtime-bridge/\`

Important decisions must update \`WGOS/decisions/DECISIONS.md\`.

Rule Zero remains non-negotiable.`,
  "REPORTING_ENGINE.md": `# Reporting Engine

Every mission report must include mission id, mission type, objective, agents, workflows, skills, work completed, files created, files modified, approvals requested, approvals granted, validations run, risks, next steps, memory updated, and documentation updated.`,
  "CODEX_INVOCATION_PROTOCOL.md": `# Codex Invocation Protocol

User says:

\`\`\`text
WGOS: Run mission - find 50 qualified leads today.
\`\`\`

Codex must:

1. Read \`wgos-runtime/prompts/MASTER_WGOS_CODEX_PROMPT.md\`.
2. Read \`wgos-runtime/WGOS_RUNTIME_SPEC.md\`.
3. Read current WGOS memory.
4. Run or mentally apply the mission router.
5. Load relevant agent docs and workflow docs.
6. Create a mission plan and task board.
7. Ask for approval when gates require it.
8. Execute phase by phase.
9. Report after each phase.
10. Update memory and reports before completion.

## Examples

- \`WGOS, rebuild WebGrowth.info.\`
- \`WGOS, run an SEO audit.\`
- \`WGOS, fix Search Console indexing.\`
- \`WGOS, check GA4 traffic.\`
- \`WGOS, find 50 qualified leads.\`
- \`WGOS, create 50 outreach drafts.\`
- \`WGOS, set up email.\`
- \`WGOS, publish an Academy article.\`
- \`WGOS, improve AdSense readiness.\`
- \`WGOS, prepare deployment.\`
- \`WGOS, update documentation.\``,
  "CONTROLLED_BROWSER_PROTOCOL.md": `# Controlled Browser Protocol

Controlled browsing is required for Google Search Console, GA4, Gmail, lead research, Google Maps, business directories, DNS/email setup, hosting dashboards, indexing review, and analytics review.

Rules:

- Use local secrets only if present and approved.
- Never print credentials.
- Pause for CAPTCHA.
- Pause for 2FA/MFA.
- Pause for payment.
- Pause for DNS changes.
- Pause for external action approval.
- Document all browser actions.
- No automatic outreach unless explicitly approved.
- No automatic sending unless explicitly approved.`,
  "LOCAL_SECRETS_STORE.md": `# Local Secrets Store

Local development credentials may live at:

\`\`\`text
wgos-runtime/secrets/credentials.local.json
\`\`\`

This file is gitignored.

Use app passwords, API tokens, OAuth credentials, service accounts, limited-permission accounts, and test accounts instead of primary account passwords.

Never expose credentials in console logs, reports, markdown docs, memory files, prompts, commits, or error messages.`,
  "RUNTIME_LIMITATIONS.md": `# Runtime Limitations

- Codex remains the primary operator interface.
- This bridge does not create full autonomy.
- Live connectors must actually exist in the session before use.
- External actions remain approval-gated.
- Local scripts do not send emails, deploy, publish, contact businesses, make DNS changes, or use paid APIs.`,
  "NEXT_STEPS.md": `# Next Steps

1. Use \`generate-mission-plan.mjs\` for real Codex mission planning.
2. Add richer mission templates where needed.
3. Connect approved read-only adapters.
4. Add resume support after approval decisions.
5. Convert high-value repeated missions into executable Codex playbooks.`,
};

const prompts = {
  "MASTER_WGOS_CODEX_PROMPT.md": `# Master WGOS Codex Prompt

You are operating under WGOS.

Codex is the input interface. WGOS is the operating system.

Before work:

- Read \`wgos-runtime/WGOS_RUNTIME_SPEC.md\`.
- Read current WGOS memory.
- Classify the user objective.
- Route the mission.
- Invoke the correct agents.
- Enforce approval gates.
- Execute phase by phase.
- Document everything.
- Update memory and reports.
- Never perform external actions without approval.
- Use local secrets only when available, approved, and safe.
- Never expose secrets.`,
  "ORCHESTRATOR_INVOCATION.md": `# Orchestrator Invocation

Classify the objective, select mission type, workflows, agents, skills, approval gates, reports, memory updates, and validation steps.`,
  "PROJECT_MANAGER_INVOCATION.md": `# Project Manager Invocation

Create the task board with owners, order, dependencies, approval gates, expected outputs, and completion criteria.`,
  "SPECIALIST_AGENT_INVOCATION.md": `# Specialist Agent Invocation

Load the agent registry entry, detailed source doc, required skills, allowed actions, forbidden actions, approval requirements, report template, and handoff target.`,
  "DOCUMENTATION_UPDATE_INVOCATION.md": `# Documentation Update Invocation

Update reports, changelog, handoff, and relevant docs after meaningful work. No silent work.`,
  "MEMORY_UPDATE_INVOCATION.md": `# Memory Update Invocation

Update CURRENT_STATE, ACTIVE_TASKS, NEXT_ACTIONS, CODEX_MEMORY, and decisions when required.`,
  "APPROVAL_REQUEST_INVOCATION.md": `# Approval Request Invocation

State the exact action, target, risk, evidence, approval class, and what will happen if approved or rejected.`,
  "CONTROLLED_BROWSER_INVOCATION.md": `# Controlled Browser Invocation

Confirm browser capability, use local secrets only when approved, pause at login/2FA/CAPTCHA/payment/DNS/state changes, and document every action.`,
};

const secretFiles = {
  "README.md": `# WGOS Runtime Secrets

This folder is for local-only credentials.

Do not commit real secrets.

Create \`credentials.local.json\` manually when needed. Codex must never print or copy its values into chat, reports, memory, or commits.`,
  ".gitignore": `*
!.gitignore
!README.md
!credentials.example.json
`,
  "credentials.example.json": JSON.stringify({
    google: {
      app_password: "placeholder-only",
      oauth_client_id: "placeholder-only",
      oauth_client_secret: "placeholder-only",
      service_account_json_path: "C:/local/path/service-account.json"
    },
    gmail: {
      send_as: "admin@example.com",
      app_password: "placeholder-only"
    },
    search_console: {
      property_url: "https://example.com/"
    },
    ga4: {
      property_id: "000000000"
    }
  }, null, 2),
};

async function main() {
  await writeDocs();
  await writeConfig();
  await writePrompts();
  await writeScripts();
  await writeSecrets();
  console.log("WGOS runtime bridge generated.");
}

async function writeDocs() {
  for (const [file, content] of Object.entries(docs)) {
    await writeRuntime(file, content);
  }
}

async function writeConfig() {
  await writeRuntimeJson("config/agents.json", agents.map(agentToRegistry));
  await writeRuntimeJson("config/workflows.json", workflows.map(workflowToRegistry));
  await writeRuntimeJson("config/skills.json", buildSkillRegistry());
  await writeRuntimeJson("config/approval-gates.json", approvalClasses.map((item) => ({ ...item, source_docs: ["WGOS/APPROVAL_GATES.md", "WGOS/runtime/approval/APPROVAL_LEVELS.md"] })));
  await writeRuntimeJson("config/mission-types.json", missionTypes);
  await writeRuntimeJson("config/secrets.example.json", JSON.parse(secretFiles["credentials.example.json"]));
}

async function writePrompts() {
  for (const [file, content] of Object.entries(prompts)) {
    await writeRuntime(path.join("prompts", file), content);
  }
}

async function writeScripts() {
  await writeRuntime("scripts/README.md", `# WGOS Runtime Scripts

- \`mission-router.mjs\`: classify a user objective.
- \`generate-mission-plan.mjs\`: create a local mission plan and task board.
- \`create-report.mjs\`: create a local report file.
- \`update-memory.mjs\`: append local memory updates.
- \`validate-runtime.mjs\`: validate bridge files and sample routing.`);
  await writeRuntime("scripts/mission-router.mjs", missionRouterScript);
  await writeRuntime("scripts/generate-mission-plan.mjs", generateMissionPlanScript);
  await writeRuntime("scripts/create-report.mjs", createReportScript);
  await writeRuntime("scripts/update-memory.mjs", updateMemoryScript);
  await writeRuntime("scripts/validate-runtime.mjs", validateRuntimeScript);
}

async function writeSecrets() {
  for (const [file, content] of Object.entries(secretFiles)) {
    await writeRuntime(path.join("secrets", file), content);
  }
}

function route({ keywords, agents, workflows, skills, approvals, reports }) {
  return {
    keywords,
    required_agents: agents,
    required_departments: [...new Set(agents.map((slug) => agentsBySlug.get(slug)?.department).filter(Boolean))],
    required_workflows: workflows,
    required_skills: skills,
    required_approval_gates: approvals,
    expected_reports: reports,
    memory_updates_required: ["WGOS/memory/CODEX_MEMORY.md", "WGOS/memory/CURRENT_STATE.md", "WGOS/memory/ACTIVE_TASKS.md", "WGOS/memory/NEXT_ACTIONS.md"],
    validation_steps: ["classification reviewed", "task board created", "approval gates listed", "report created", "memory updated"],
  };
}

function agentToRegistry(agent) {
  return {
    id: agent.slug,
    name: agent.title,
    department: agent.department,
    purpose: agent.mission,
    responsibilities: agent.capabilities,
    required_skills: agent.skills,
    allowed_actions: ["research", "draft", "recommend", "prepare", "document", "local validation"],
    forbidden_actions: ["send email without approval", "publish without approval", "deploy without approval", "change DNS without approval", "expose secrets"],
    approval_required_for: ["external account access", "external contact", "publishing", "deployment", "DNS", "billing", "state-changing actions"],
    documentation_required: ["task report", "memory update", "handoff when applicable"],
    report_template: "wgos-runtime/REPORTING_ENGINE.md",
    handoff_targets: [],
    source_docs: [`WGOS/agents/${agent.department}/${agent.slug}.md`, "WGOS/AGENTS.md"],
  };
}

function workflowToRegistry(workflow) {
  return {
    id: workflow.slug,
    name: workflow.title,
    mission_type: Object.entries(missionTypes).filter(([, item]) => item.required_workflows.includes(workflow.slug)).map(([id]) => id),
    description: workflow.trigger,
    phases: ["intake", "planning", "specialist execution", "validation", "reporting", "memory update", "handoff"],
    required_agents: [],
    approval_gates: ["See config/approval-gates.json"],
    outputs: ["mission plan", "task board", "report", "memory update"],
    reports: ["mission report"],
    memory_updates: ["CURRENT_STATE", "ACTIVE_TASKS", "NEXT_ACTIONS"],
    validation: ["workflow selected", "agents assigned", "approvals enforced", "report generated"],
    source_docs: [`WGOS/workflows/${workflow.slug}.md`, "WGOS/WORKFLOWS.md"],
  };
}

function buildSkillRegistry() {
  return skills.map((skill) => ({
    id: skill,
    name: skill.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()),
    purpose: `WGOS skill used for ${skill.toLowerCase().replace(/_/g, " ")} work.`,
    agents_that_use_it: agents.filter((agent) => agent.skills.includes(skill)).map((agent) => agent.slug),
    tools_required: inferTools(skill),
    external_access_required: ["GA4", "SEARCH_CONSOLE", "GMAIL", "CONTROLLED_BROWSER", "DEPLOYMENT"].includes(skill),
    approval_needed: ["GA4", "SEARCH_CONSOLE", "GMAIL", "CONTROLLED_BROWSER", "DEPLOYMENT"].includes(skill) ? "HIGH_OR_CRITICAL" : "LOW",
    validation_method: "Confirm output, report, approval state, and memory update.",
    source_docs: [`WGOS/skills/${skill}.md`, "WGOS/SKILLS.md"],
  }));
}

function inferTools(skill) {
  if (skill === "CONTROLLED_BROWSER") return ["browser session", "capability check"];
  if (skill === "GA4") return ["GA4 connector or browser"];
  if (skill === "SEARCH_CONSOLE") return ["Search Console connector or browser"];
  if (skill === "GMAIL") return ["Gmail connector or browser"];
  if (skill === "DEPLOYMENT") return ["hosting dashboard", "build logs"];
  return ["Codex", "local files", "WGOS docs"];
}

async function writeRuntime(relPath, content) {
  const full = path.join(BRIDGE_ROOT, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${String(content).trim()}\n`, "utf8");
}

async function writeRuntimeJson(relPath, value) {
  await writeRuntime(relPath, JSON.stringify(value, null, 2));
}

const commonScriptHeader = `import fs from "node:fs/promises";
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
  await fs.writeFile(filePath, content.trim() + "\\n", "utf8");
}
`;

const missionRouterScript = `${commonScriptHeader}
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
`;

const generateMissionPlanScript = `${commonScriptHeader}
import { classifyObjective } from "./mission-router.mjs";

const args = parseArgs(process.argv.slice(2));
const objective = String(args.objective || "");
if (!objective) throw new Error("Use --objective \\"WGOS, find 50 qualified leads today.\\"");

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
await fs.writeFile(out, JSON.stringify(plan, null, 2) + "\\n", "utf8");
await writeText(path.join(REPO_ROOT, "WGOS", "reports", "runtime-bridge", missionId + ".md"), "# Runtime Mission Plan\\n\\n" + JSON.stringify(plan, null, 2));
console.log(JSON.stringify(plan, null, 2));
`;

const createReportScript = `${commonScriptHeader}
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
await writeText(path.join(REPO_ROOT, "WGOS", "reports", "runtime-bridge", missionId + "-report.md"), "# WGOS Runtime Report\\n\\n" + JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
`;

const updateMemoryScript = `${commonScriptHeader}
const args = parseArgs(process.argv.slice(2));
const missionId = String(args.mission || "WGOS-MANUAL");
const note = String(args.note || "Runtime bridge memory update.");
const stamp = new Date().toISOString();
const updates = [
  ["WGOS/memory/CURRENT_STATE.md", "\\n## " + stamp + "\\n\\n- " + missionId + ": " + note + "\\n"],
  ["WGOS/memory/ACTIVE_TASKS.md", "\\n- " + missionId + ": Review current runtime bridge task state.\\n"],
  ["WGOS/memory/NEXT_ACTIONS.md", "\\n- " + missionId + ": Continue through the next approved WGOS phase.\\n"],
  ["WGOS/memory/CODEX_MEMORY.md", "\\n- " + stamp + ": " + note + "\\n"],
];
for (const [rel, content] of updates) {
  const full = path.join(REPO_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.appendFile(full, content, "utf8");
}
console.log("WGOS runtime memory updated for " + missionId);
`;

const validateRuntimeScript = `${commonScriptHeader}
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
`;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
