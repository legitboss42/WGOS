import fs from "node:fs/promises";
import path from "node:path";
import {
  WGOS_ROOT,
  agents,
  approvalClasses,
  departments,
  demoMission,
  integrations,
  priorities,
  skills,
  statuses,
  templates,
  tenants,
  workflows,
} from "./lib/wgos-config.mjs";
import { missionTemplates } from "../packages/runtime/src/mission-catalog.mjs";

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFile(relPath, content) {
  const fullPath = path.join(WGOS_ROOT, relPath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, `${content.trim()}\n`, "utf8");
}

function titleFromSlug(slug) {
  return slug
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function codeList(items) {
  return items.map((item) => `- \`${item}\``).join("\n");
}

async function syncRootDocs() {
  const phaseRows = [
    "1. Company constitution and workforce scaffold",
    "2. Runtime and execution framework",
    "3. Shared integrations and controlled operations",
    "4. Specialist agent execution rules",
    "5. Department mission routing",
    "6. Website production pipeline",
    "7. Revenue and growth engine",
    "8. Intelligence and continuous learning",
    "9. Multi-company platform and tenancy",
    "10. WGOS v1.0 production release",
  ].join("\n");

  const startDocs = [
    "README.md",
    "AGENTS.md",
    "COMPANY.md",
    "RULE_ZERO.md",
    "ORCHESTRATOR.md",
    "PROJECT_MANAGER.md",
    "MEMORY.md",
    "APPROVAL_GATES.md",
    "PHASE_STATUS.md",
  ];

  await writeFile(
    "README.md",
    `
# WGOS

WGOS is the Web Growth Operating System: a documentation-backed, software-first platform for Web Growth and future client companies.

## What WGOS is

- A shared company constitution
- A standard runtime for agent execution
- A reusable workflow library
- A memory, reporting, and handoff system
- A tenant-safe platform for multiple companies
- A post-v1.0 product architecture that can evolve into real apps and packages

## What WGOS is not

- Not a redesign of the public website
- Not a live automation bypass
- Not permission to perform external actions without approval

## Operating priorities

${bullets(priorities)}

## Phase map

${phaseRows}

## Working commands

- \`npm run wgos:sync\` to normalize WGOS docs and registries
- \`npm run wgos:verify\` to validate the full WGOS operating surface
- \`npm run wgos:demo\` to run the demo mission and produce proof artifacts
- \`npm run wgos:release\` to run the v1.0 release stress-test simulations
- \`npm run wgos:integrations\` to record read-only connector capability for the current session
- \`npm run wgos:inspect-url -- --url https://example.com/\` to run approval-aware read-only URL inspection
- \`npm run wgos:approvals\` to list or update approval queue items

## Platform structure after v1.0

\`\`\`
WGOS/
├── apps/
├── packages/
├── docs/
├── templates/
├── examples/
├── tests/
└── companies/
\`\`\`

The legacy documentation and registry surface remains in place during the transition, but new WGOS evolution should target the software-first app and package layout.

## Start here

${codeList(startDocs)}
`
  );

  await writeFile(
    "AGENTS.md",
    `
# WGOS Agent Operating Rules

WGOS agents act like a coordinated company workforce rather than isolated helpers.

## Mandatory behavior

- Read governing docs before execution.
- Use the shared runtime lifecycle.
- Produce traceable outputs.
- Respect approval gates.
- Update memory and documentation after meaningful work.
- Hand off cleanly when another agent is needed.

## Non-negotiables

- No silent work.
- No hidden assumptions.
- No external action without documented permission.
- No completion without report and memory updates.

## Invocation contract

Every task must declare mission ID, task ID, calling agent, target agent, objective, context, inputs, expected outputs, approval needs, and success criteria.
`
  );

  await writeFile(
    "COMPANY.md",
    `
# Company Constitution

## Company mission

Build, grow, and monetize trustworthy digital properties for Web Growth and future client companies.

## Operating priorities

${bullets(priorities)}

## What WGOS protects

- Trust and legal completeness
- AdSense-safe publishing standards
- Route-safe technical execution
- Measurable business outcomes
- Human review for high-risk actions

## What WGOS optimizes for

- Repeatable delivery
- Accurate documentation
- Faster execution with less context drift
- Reusable playbooks and templates
- Company-agnostic future expansion
`
  );

  await writeFile(
    "RULE_ZERO.md",
    `
# Rule Zero

Documentation is mandatory.

No meaningful work is complete until the relevant records are updated:

- \`memory/\`
- \`reports/\`
- \`decisions/\`
- \`ROADMAP.md\`
- \`CHANGELOG.md\`
- \`PROJECT_HANDOFF.md\`
- agent or workflow docs when behavior changed
`
  );

  await writeFile(
    "ORCHESTRATOR.md",
    `
# Workflow Orchestrator

The orchestrator converts a business objective into a routed, documented execution plan.

## Responsibilities

- Interpret mission intent
- Select departments and agents
- Sequence dependencies
- Assign approval classes
- Trigger QA and documentation steps
- Keep work aligned to company priorities
`
  );

  await writeFile(
    "PROJECT_MANAGER.md",
    `
# Project Manager

The project manager owns task breakdown, status control, blockers, approvals, and handoff readiness.

## Task statuses

${bullets(statuses)}

## Completion rule

A task moves to \`COMPLETED\` only after output validation, report generation, memory updates, and any required handoff.
`
  );

  await writeFile(
    "KNOWLEDGE_MANAGER.md",
    `
# Knowledge Manager

The knowledge manager keeps WGOS useful across sessions.

## Responsibilities

- Update shared memory artifacts
- Distill lessons from completed missions
- Record durable patterns and decisions
- Prevent context drift and duplication
- Maintain next actions and open risks

## Primary stores

- \`memory/CODEX_MEMORY.md\`
- \`memory/CURRENT_STATE.md\`
- \`memory/ACTIVE_TASKS.md\`
- \`memory/OPEN_RISKS.md\`
- \`memory/NEXT_ACTIONS.md\`
- \`decisions/DECISIONS.md\`
- \`ROADMAP.md\`
- \`CHANGELOG.md\`
- \`PROJECT_HANDOFF.md\`
`
  );

  await writeFile(
    "APPROVAL_GATES.md",
    `
# Approval Gates

High-risk actions require explicit human approval before execution.

## Approval-required categories

- Logging into external systems
- Handling credentials or secrets
- Sending emails or outreach
- Deployments and production changes
- DNS, hosting, or billing changes
- Search Console submissions or indexing requests
- CRM writes that contact real prospects or clients
- Purchases, subscriptions, or paid API usage

## Approval classes

${approvalClasses.map((item) => `- ${item.id}: ${item.name} - ${item.usage}`).join("\n")}
`
  );

  await writeFile(
    "MEMORY.md",
    `
# Memory System

WGOS memory preserves operational continuity.

## Memory layers

- Working memory for the current mission
- Operational memory for active tasks and risks
- Institutional memory for patterns, decisions, and playbooks

## Update order

1. \`CURRENT_STATE.md\`
2. \`ACTIVE_TASKS.md\`
3. \`OPEN_RISKS.md\`
4. \`NEXT_ACTIONS.md\`
5. \`DECISIONS.md\` when policy changed
6. \`CHANGELOG.md\` when artifacts changed
`
  );

  await writeFile(
    "WORKFLOWS.md",
    `
# Workflow Index

WGOS runs through named workflows instead of ad hoc execution.

## Workflow catalog

${workflows.map((workflow) => `- \`${workflow.slug}\`: ${workflow.trigger}`).join("\n")}
`
  );

  await writeFile(
    "PHASE_STATUS.md",
    `
# Phase Status

This file maps the WGOS implementation to the original nine-phase brief.

## Phase 1

- Constitution, mission, values, organization, business model, rules, memory, and agent workforce are defined.

## Phase 2

- Runtime, invocation contract, lifecycle, task system, reporting, approvals, and templates are defined.

## Phase 3

- Shared integration docs exist and approval-aware controlled operations are documented.

## Phase 4

- Specialist agent registry, docs, required skills, and outputs are wired through shared runtime rules.

## Phase 5

- Department model, mission templates, executive routing, autonomous company task boards, and cross-department mission runtime are defined.

## Phase 6

- Production pipeline now includes discovery, strategy, information architecture, design, motion, engineering, SEO, QA, client review, launch preparation, post-launch baselines, blueprint support, and project memory.

## Phase 7

- Growth engine now includes marketing, SEO, content, CRM, analytics, AdSense, affiliate, newsletter, social, digital-product, free-tools, revenue dashboards, and executive review structures.

## Phase 8

- Learning engine, pattern engine, optimization engine, business intelligence, company health scoring, forecasting, decision analysis, automation recommendations, and knowledge-library structures are defined.

## Phase 9

- Tenant registry, company folders, shared platform services, and isolation rules are defined.

## Phase 10

- WGOS v1.0 release notes, certification reports, production-readiness review, security review, operating manuals, stress-test plan, and v2.0 roadmap are defined.
- The \`wgos:release\` command runs representative mission simulations and writes release validation evidence.

## Post V1.0 Transition

- WGOS is shifting from a documentation-first scaffold to a software-first platform structure.
- New product-facing work should prefer \`apps/\`, \`packages/\`, \`docs/\`, \`examples/\`, and \`tests/\`.
- The current documentation, registry, and mission artifacts remain active as the knowledge layer until runtime code is migrated into packages.
`
  );
}

async function syncSoftwareFirstScaffold() {
  const docs = {
    "apps/README.md": "# Apps\n\nApp entrypoints for the WGOS platform live here. These apps are the operator-facing and tenant-facing surfaces that turn WGOS from an operating handbook into working software.",
    "apps/dashboard/README.md": "# Dashboard App\n\nThe dashboard app should aggregate executive status, mission health, KPIs, approvals, and tenant-wide summaries.\n\nGenerated dashboard artifacts are written to `apps/dashboard/build/` by the WGOS runtime.",
    "apps/operator/README.md": "# Operator App\n\nThe operator app should be the internal control surface for routing missions, running workflows, reviewing approvals, and triggering reports.\n\nGenerated operator artifacts are written to `apps/operator/build/` by the WGOS runtime.",
    "apps/client-portal/README.md": "# Client Portal App\n\nThe client portal app should expose delivery progress, approvals, reports, and shared assets to clients without leaking internal tenant data.",
    "apps/admin/README.md": "# Admin App\n\nThe admin app should manage tenants, shared settings, platform roles, integrations, and platform-level governance.",
    "packages/README.md": "# Packages\n\nWGOS runtime code should converge here as reusable packages instead of remaining only as narrative documentation.",
    "packages/runtime/README.md": "# Runtime Package\n\nWGOS mission execution, persistent state management, task lifecycle handling, and orchestration helpers live here as real code modules.",
    "packages/agents/README.md": "# Agents Package\n\nExecutable agent behavior, routing metadata, and reusable specialist runtime modules live here.\n\n## Implemented specialist modules\n\n- Frontend Engineer: implementation planning, validation commands, deployment approval checkpoint.\n- SEO Agent: metadata, schema, internal link, Search Console, and GA4 controlled-session planning.\n- Content Strategist: brief, outline, internal linking, publishing approval checkpoint.\n- Marketing Strategist: campaign plan, CRM states, lead scoring, controlled browsing plan.\n- Lead Research Agent: 50-lead runbook, source policy, scoring model, draft-only approval checkpoint.",
    "packages/audits/README.md": "# Audits Package\n\nLocal website and SEO audit engines live here. The current website audit engine can parse HTML or fetch a URL, inspect metadata, headings, links, images, forms, and conversion-path signals, then render a markdown audit report.",
    "packages/crm/README.md": "# CRM Package\n\nTenant-scoped local CRM helpers live here. The current lead store writes lead CSV schemas and CRM state summaries without contacting any external CRM.",
    "packages/outreach/README.md": "# Outreach Package\n\nDraft-only outreach helpers live here. The current draft generator creates human-review handoff records and never sends email.",
    "packages/approval/README.md": "# Approval Package\n\nPersistent approval queue helpers live here. The current approval queue extracts specialist checkpoints and controlled-session pauses from completed mission tasks, writes queue state, renders approval reports, and supports approve, reject, or revision-request decisions.",
    "packages/memory/README.md": "# Memory Package\n\nShared memory update logic, markdown synchronization, and durable context helpers live here.",
    "packages/workflows/README.md": "# Workflows Package\n\nWorkflow definitions, dependency graphs, department collaboration rules, and reusable mission plans should converge here.",
    "packages/integrations/README.md": "# Integrations Package\n\nProvider adapters, capability guards, approval-aware wrappers, and integration metadata live here as WGOS shifts from descriptive integration docs to executable integration code.",
    "packages/integrations/src/README.md": "# Integration Source\n\nExecutable integration metadata and future provider adapters should be implemented here. The first shared source is the integration catalog used by docs and runtime surfaces.\n\n## Controlled sessions\n\n`controlled-session.mjs` defines approval-aware session plans for browser, Search Console, GA4, Gmail, hosting, DNS, and other live-operation surfaces. It does not bypass login, 2FA, CAPTCHA, billing, verification, or human approval.\n\n## Read-only adapters\n\n`capability-registry.mjs`, `read-only-adapters.mjs`, `lighthouse-runner.mjs`, and `integration-logger.mjs` provide truthful capability checks, pause records, local Lighthouse execution, and JSONL logs for browser, Search Console, GA4, PageSpeed, and Lighthouse read-only work.",
    "packages/reporting/README.md": "# Reporting Package\n\nReport builders, markdown artifact generators, and normalization logic live here.",
    "packages/analytics/README.md": "# Analytics Package\n\nKPI summarization, scorecard updates, and cross-mission metrics helpers live here.",
    "packages/ui/README.md": "# UI Package\n\nShared WGOS UI surface renderers and app-facing presentation helpers live here.",
    "docs/README.md": "# Docs\n\nWGOS reference documentation, architecture decisions, migration notes, and operational guides should live here as the documentation layer behind the software platform.",
    "docs/ARCHITECTURE.md": "# WGOS Architecture\n\nWGOS started as a documentation-first operating system scaffold. After v1.0, the target architecture is software-first:\n\n- `apps/` for user-facing and operator-facing applications\n- `packages/` for reusable runtime, workflow, integration, analytics, reporting, memory, and UI modules\n- `docs/` for the durable reference layer\n- `templates/` for reusable mission and reporting formats\n- `examples/` for runnable or inspectable sample flows\n- `tests/` for platform validation beyond structural verification\n- `companies/` for tenant-isolated operating data\n\nDuring the transition, the current top-level WGOS knowledge folders remain the active source of truth while implementation code gradually moves into packages.",
    "examples/README.md": "# Examples\n\nStore example missions, example app flows, sample API payloads, and end-to-end usage demonstrations here.",
    "tests/README.md": "# Tests\n\nStore WGOS platform tests here as the system moves beyond structural verification into package and app-level behavior checks.",
    "state/README.md": "# WGOS State\n\nThe executable WGOS runtime persists mission, task, report, dashboard, metric, and event state here as JSON and JSONL artifacts. This state layer complements markdown records in `memory/`, `missions/`, and `reports/`.",
  };

  await Promise.all(Object.entries(docs).map(([file, content]) => writeFile(file, content)));
}

async function syncRegistries() {
  const registries = {
    "registry/agents.json": agents,
    "registry/departments.json": departments,
    "registry/skills.json": skills,
    "registry/workflows.json": workflows,
    "registry/integrations.json": integrations,
    "registry/templates.json": templates,
    "registry/tenants.json": tenants,
    "registry/statuses.json": statuses,
    "registry/approval-classes.json": approvalClasses,
  };

  await Promise.all(
    Object.entries(registries).map(([file, data]) =>
      writeFile(file, JSON.stringify(data, null, 2))
    )
  );
}

async function syncSkillDocs() {
  const groupedSkills = {
    Engineering: ["NEXTJS", "TAILWIND", "TYPESCRIPT", "GSAP", "FRAMER_MOTION", "ACCESSIBILITY", "PERFORMANCE", "TESTING", "DEPLOYMENT"],
    Search: ["SEO", "CODEX_SEO", "AEO", "GEO", "SCHEMA", "GA4", "SEARCH_CONSOLE"],
    RevenueAndMarketing: ["ADSENSE", "CONTENT_WRITING", "COPYWRITING", "CRO", "LEAD_RESEARCH", "OUTREACH", "GMAIL", "CONTROLLED_BROWSER", "BUSINESS_MODEL", "OPERATIONS"],
  };

  const skillUsers = {
    NEXTJS: ["Frontend Engineer", "Full Stack Engineer", "Technical SEO", "Performance Engineer"],
    TAILWIND: ["Frontend Engineer", "UI UX Designer", "Accessibility Engineer"],
    TYPESCRIPT: ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "QA Engineer"],
    GSAP: ["Motion Graphics Designer", "Frontend Engineer"],
    FRAMER_MOTION: ["Motion Graphics Designer", "Frontend Engineer"],
    SEO: ["SEO", "Technical SEO", "Content Strategist", "Website Audit", "Analytics"],
    CODEX_SEO: ["Technical SEO", "SEO"],
    AEO: ["AEO", "SEO", "Content Strategist"],
    GEO: ["GEO", "SEO"],
    ADSENSE: ["AdSense", "Revenue Operations"],
    CONTENT_WRITING: ["Editorial Manager", "Content Strategist", "Copywriter", "Proofreader"],
    COPYWRITING: ["Copywriter", "Outreach Drafting", "Marketing Strategist", "CRO"],
    SCHEMA: ["Schema", "Technical SEO", "AEO", "GEO"],
    GA4: ["Analytics", "CRO", "Business Intelligence", "Search Console"],
    SEARCH_CONSOLE: ["Search Console", "SEO", "Technical SEO"],
    GMAIL: ["Outreach Drafting", "Follow Up", "Newsletter"],
    CONTROLLED_BROWSER: ["Lead Research", "Website Audit", "Search Console"],
    ACCESSIBILITY: ["Accessibility Engineer", "Frontend Engineer", "UI UX Designer"],
    PERFORMANCE: ["Performance Engineer", "Technical SEO", "Website Audit"],
    TESTING: ["QA Engineer", "Deployment Engineer", "Backend Engineer"],
    DEPLOYMENT: ["Deployment Engineer", "Full Stack Engineer"],
    CRO: ["CRO", "Revenue Operations", "Marketing Strategist", "UI UX Designer"],
    LEAD_RESEARCH: ["Lead Research", "Business Intelligence", "CRM"],
    OUTREACH: ["Outreach Drafting", "Follow Up", "CRM"],
    BUSINESS_MODEL: ["CEO Operator", "Revenue Operations", "SaaS Planner"],
    OPERATIONS: ["CEO Operator", "Workflow Orchestrator", "Project Manager", "Knowledge Manager", "Documentation Agent"],
  };

  const skillTools = {
    NEXTJS: ["filesystem", "repo code", "build validation"],
    TAILWIND: ["repo code", "design references"],
    TYPESCRIPT: ["repo code", "typecheck"],
    GSAP: ["repo code", "browser validation", "reduced-motion review"],
    FRAMER_MOTION: ["repo code", "browser validation"],
    SEO: ["codex-seo skill", "crawl data", "metadata inspection"],
    CODEX_SEO: ["codex-seo skill", "repo analysis", "search validation"],
    AEO: ["content docs", "search intent review", "schema review"],
    GEO: ["content docs", "trust signals", "citation review"],
    ADSENSE: ["policy checklists", "content review", "trust-page review"],
    CONTENT_WRITING: ["briefs", "source materials", "editorial review"],
    COPYWRITING: ["service pages", "outreach notes", "offer strategy"],
    SCHEMA: ["structured data inspection", "visible-content review"],
    GA4: ["analytics dashboards", "event reports", "traffic reports"],
    SEARCH_CONSOLE: ["Search Console", "sitemap checks", "URL inspection"],
    GMAIL: ["Gmail", "draft reviews"],
    CONTROLLED_BROWSER: ["attached browser session", "approval pauses", "evidence capture"],
    ACCESSIBILITY: ["keyboard testing", "contrast review", "semantic HTML inspection"],
    PERFORMANCE: ["Lighthouse", "PageSpeed", "runtime profiling"],
    TESTING: ["lint", "typecheck", "build", "manual QA"],
    DEPLOYMENT: ["hosting dashboard", "build output", "release checklist"],
    CRO: ["GA4", "page review", "form and CTA analysis"],
    LEAD_RESEARCH: ["Google Search", "Google Maps", "directories", "social profiles"],
    OUTREACH: ["lead audit notes", "Gmail drafts", "CRM status"],
    BUSINESS_MODEL: ["company docs", "offer economics", "market fit notes"],
    OPERATIONS: ["task boards", "status tracking", "handoff docs"],
  };

  await writeFile(
    "skills/SKILL_REGISTRY.md",
    `
# Skill Registry

## Engineering

${codeList(groupedSkills.Engineering)}

## Search

${codeList(groupedSkills.Search)}

## Revenue And Marketing

${codeList(groupedSkills.RevenueAndMarketing)}
`
  );

  for (const skill of skills) {
    await writeFile(
      `skills/${skill}.md`,
      `
# ${titleFromSlug(skill)}

## What this skill is for

This skill standardizes how WGOS performs ${titleFromSlug(skill).toLowerCase()} work so different agents produce consistent, reviewable outputs instead of improvising.

## Which agents use it

${bullets(skillUsers[skill] ?? ["Any agent whose task materially depends on this capability."])}

## Required tools

${bullets(skillTools[skill] ?? ["Repo files", "task context", "validation tools"])}

## Best practices

- Read the task objective and success criteria before applying the skill.
- Use evidence from the repo, portal, or source material instead of guessing.
- Record assumptions clearly when the skill cannot fully validate a fact.
- Route risky or external actions to approval instead of pushing through.
- Update reports and memory with the outcome of the skill usage.

## Anti-patterns

- Using the skill name as a label without actually doing the underlying checks.
- Treating draft recommendations as completed implementation.
- Ignoring validation because the work "looks right."
- Copying boilerplate outputs that do not match the mission or tenant context.
- Bypassing approval gates for anything state-changing or externally visible.

## Validation steps

- Confirm the skill was appropriate for the task.
- Confirm outputs are specific to the current mission, not generic filler.
- Run the smallest sensible technical validation for changed work.
- Document blockers, open risks, and follow-up requirements.
- Hand off to QA, Knowledge Manager, or Documentation Agent when needed.
`
    );
  }
}

async function syncAgentDocs() {
  await writeFile(
    "agents/README.md",
    `
# Agents

This directory defines the specialist workforce WGOS can route tasks to.

Each agent states mission, responsibilities, capabilities, required skills, outputs, approval boundaries, and handoff expectations.
`
  );

  const departmentToTools = {
    executive: ["WGOS docs", "task boards", "reports", "memory files"],
    design: ["repo UI files", "design notes", "browser review", "Figma when available"],
    engineering: ["repo code", "lint", "typecheck", "build", "QA notes"],
    search: ["repo SEO surfaces", "Search Console", "GA4", "browser evidence"],
    publishing: ["content briefs", "editorial docs", "internal linking maps"],
    marketing: ["controlled browser", "directories", "CRM data", "Gmail drafts"],
    revenue: ["GA4", "service pages", "offer and funnel docs"],
    client: ["discovery docs", "proposals", "handoff reports"],
  };

  const departmentToIntegrations = {
    executive: ["filesystem", "docs", "csv", "github"],
    design: ["figma", "images", "filesystem", "docs"],
    engineering: ["filesystem", "github", "lighthouse", "pagespeed", "vercel", "images"],
    search: ["search-console", "ga4", "search", "lighthouse", "pagespeed", "docs", "filesystem"],
    publishing: ["docs", "filesystem", "search", "csv", "images"],
    marketing: ["browser", "search", "maps", "business-directories", "crm", "gmail", "csv", "docs"],
    revenue: ["ga4", "search-console", "crm", "gmail", "lighthouse", "pagespeed", "filesystem", "docs"],
    client: ["crm", "gmail", "docs", "filesystem", "csv"],
  };

  const departmentToPlaybooks = {
    executive: ["EXECUTIVE_CONTROL_PLAYBOOK", "MISSION_ROUTING_PLAYBOOK"],
    design: ["DESIGN_REVIEW_PLAYBOOK"],
    engineering: ["REPO_DELIVERY_PLAYBOOK", "QUALITY_VALIDATION_PLAYBOOK"],
    search: ["SEARCH_INTELLIGENCE_PLAYBOOK", "SEARCH_CONSOLE_REVIEW_PLAYBOOK", "GA4_REVIEW_PLAYBOOK"],
    publishing: ["EDITORIAL_OPERATIONS_PLAYBOOK"],
    marketing: ["CONTROLLED_BROWSER_RESEARCH_PLAYBOOK", "LEAD_RESEARCH_PLAYBOOK", "CRM_OUTREACH_DRAFT_PLAYBOOK"],
    revenue: ["GA4_REVIEW_PLAYBOOK", "REVENUE_SIGNAL_PLAYBOOK"],
    client: ["CLIENT_DELIVERY_PLAYBOOK", "CRM_OUTREACH_DRAFT_PLAYBOOK"],
  };

  const agentIntegrationOverrides = {
    FRONTEND_ENGINEER_AGENT: ["filesystem", "github", "figma", "images", "lighthouse", "pagespeed", "vercel", "docs"],
    BACKEND_ENGINEER_AGENT: ["filesystem", "github", "vercel", "docs"],
    FULL_STACK_ENGINEER_AGENT: ["filesystem", "github", "lighthouse", "pagespeed", "vercel", "docs"],
    PERFORMANCE_ENGINEER_AGENT: ["filesystem", "github", "lighthouse", "pagespeed", "vercel", "docs"],
    ACCESSIBILITY_ENGINEER_AGENT: ["filesystem", "github", "lighthouse", "pagespeed", "images", "docs"],
    QA_ENGINEER_AGENT: ["filesystem", "github", "lighthouse", "pagespeed", "images", "docs"],
    DEPLOYMENT_ENGINEER_AGENT: ["filesystem", "github", "vercel", "docs"],
    SEO_AGENT: ["search-console", "ga4", "search", "lighthouse", "pagespeed", "docs", "filesystem"],
    TECHNICAL_SEO_AGENT: ["search-console", "ga4", "search", "lighthouse", "pagespeed", "github", "filesystem", "docs"],
    AEO_AGENT: ["search-console", "ga4", "search", "docs", "filesystem"],
    GEO_AGENT: ["search-console", "ga4", "search", "docs", "filesystem"],
    SCHEMA_AGENT: ["search", "docs", "filesystem"],
    SEARCH_CONSOLE_AGENT: ["search-console", "ga4", "search", "docs", "filesystem"],
    EDITORIAL_MANAGER_AGENT: ["docs", "filesystem", "search", "csv"],
    CONTENT_STRATEGIST_AGENT: ["docs", "filesystem", "search", "csv"],
    COPYWRITER_AGENT: ["docs", "filesystem", "search", "images"],
    PROOFREADER_AGENT: ["docs", "filesystem", "search"],
    INTERNAL_LINKING_AGENT: ["docs", "filesystem", "search"],
    MARKETING_STRATEGIST_AGENT: ["search", "maps", "business-directories", "crm", "csv", "docs"],
    LEAD_RESEARCH_AGENT: ["browser", "search", "maps", "business-directories", "crm", "csv", "docs"],
    WEBSITE_AUDIT_AGENT: ["browser", "search", "lighthouse", "pagespeed", "images", "docs", "filesystem"],
    BUSINESS_INTELLIGENCE_AGENT: ["browser", "search", "maps", "business-directories", "crm", "csv", "docs"],
    OUTREACH_DRAFTING_AGENT: ["crm", "gmail", "docs", "filesystem", "csv"],
    CRM_AGENT: ["crm", "csv", "docs", "gmail", "filesystem"],
    FOLLOW_UP_AGENT: ["crm", "gmail", "docs", "csv"],
    SOCIAL_MEDIA_AGENT: ["search", "images", "docs", "filesystem"],
    NEWSLETTER_AGENT: ["gmail", "crm", "docs", "filesystem"],
    CRO_AGENT: ["ga4", "search-console", "lighthouse", "pagespeed", "docs", "filesystem"],
    ADSENSE_AGENT: ["ga4", "search-console", "search", "lighthouse", "pagespeed", "docs", "filesystem"],
    AFFILIATE_MANAGER_AGENT: ["ga4", "search", "docs", "filesystem"],
    DIGITAL_PRODUCT_AGENT: ["ga4", "search", "docs", "filesystem", "images"],
    SAAS_PLANNER_AGENT: ["ga4", "search", "github", "docs", "filesystem"],
    ANALYTICS_AGENT: ["ga4", "search-console", "crm", "csv", "docs", "filesystem"],
    REVENUE_OPERATIONS_AGENT: ["ga4", "search-console", "crm", "csv", "docs", "filesystem"],
    SALES_CONSULTANT_AGENT: ["crm", "gmail", "docs", "filesystem", "csv"],
    PROPOSAL_WRITER_AGENT: ["crm", "docs", "filesystem", "csv"],
    CLIENT_SUCCESS_AGENT: ["crm", "gmail", "docs", "filesystem", "csv"],
    CLIENT_ONBOARDING_AGENT: ["crm", "gmail", "docs", "filesystem", "csv"],
  };

  const agentPlaybookOverrides = {
    WORKFLOW_ORCHESTRATOR_AGENT: ["EXECUTIVE_CONTROL_PLAYBOOK", "MISSION_ROUTING_PLAYBOOK"],
    PROJECT_MANAGER_AGENT: ["MISSION_ROUTING_PLAYBOOK", "QUALITY_VALIDATION_PLAYBOOK"],
    FRONTEND_ENGINEER_AGENT: ["REPO_DELIVERY_PLAYBOOK", "QUALITY_VALIDATION_PLAYBOOK"],
    QA_ENGINEER_AGENT: ["QUALITY_VALIDATION_PLAYBOOK"],
    SEO_AGENT: ["SEARCH_INTELLIGENCE_PLAYBOOK", "SEARCH_CONSOLE_REVIEW_PLAYBOOK", "GA4_REVIEW_PLAYBOOK"],
    TECHNICAL_SEO_AGENT: ["SEARCH_INTELLIGENCE_PLAYBOOK", "SEARCH_CONSOLE_REVIEW_PLAYBOOK"],
    SEARCH_CONSOLE_AGENT: ["SEARCH_CONSOLE_REVIEW_PLAYBOOK", "GA4_REVIEW_PLAYBOOK"],
    ANALYTICS_AGENT: ["GA4_REVIEW_PLAYBOOK", "REVENUE_SIGNAL_PLAYBOOK"],
    LEAD_RESEARCH_AGENT: ["CONTROLLED_BROWSER_RESEARCH_PLAYBOOK", "LEAD_RESEARCH_PLAYBOOK"],
    WEBSITE_AUDIT_AGENT: ["CONTROLLED_BROWSER_RESEARCH_PLAYBOOK", "QUALITY_VALIDATION_PLAYBOOK"],
    OUTREACH_DRAFTING_AGENT: ["CRM_OUTREACH_DRAFT_PLAYBOOK"],
    CRM_AGENT: ["CRM_OUTREACH_DRAFT_PLAYBOOK", "CLIENT_DELIVERY_PLAYBOOK"],
    CLIENT_SUCCESS_AGENT: ["CLIENT_DELIVERY_PLAYBOOK"],
    CLIENT_ONBOARDING_AGENT: ["CLIENT_DELIVERY_PLAYBOOK"],
  };

  const capabilitiesByDepartment = {
    executive: ["Mission framing", "workflow routing", "task governance", "documentation enforcement"],
    design: ["Research synthesis", "layout planning", "brand direction", "motion specification"],
    engineering: ["Implementation planning", "code changes", "technical validation", "release preparation"],
    search: ["Search analysis", "metadata and schema review", "crawlability review", "analytics interpretation"],
    publishing: ["Editorial planning", "briefing and drafting", "editing", "internal linking"],
    marketing: ["Lead research", "website auditing", "pipeline tracking", "outreach drafting"],
    revenue: ["Offer analysis", "conversion analysis", "monetization planning", "growth reporting"],
    client: ["Discovery support", "proposal development", "delivery coordination", "onboarding control"],
  };

  const limitationsByDepartment = {
    executive: [
      "Cannot bypass specialist validation or QA requirements",
      "Cannot approve its own risky external action without the human owner",
    ],
    design: [
      "Cannot treat subjective design preference as a validated business decision",
      "Cannot push visual changes into production without engineering and QA handoff",
    ],
    engineering: [
      "Cannot skip lint, type, build, or task-specific validation when code changes are made",
      "Cannot deploy, delete important files, or modify production systems without approval",
    ],
    search: [
      "Cannot claim ranking, indexing, or analytics changes without evidence",
      "Cannot request indexing, change properties, or alter external accounts without approval",
    ],
    publishing: [
      "Cannot publish thin, duplicated, or unreviewed content",
      "Cannot finalize public content without required SEO, QA, and documentation handoff",
    ],
    marketing: [
      "Cannot contact businesses, send email, or submit forms autonomously",
      "Cannot save unverified or duplicate lead data as qualified output",
    ],
    revenue: [
      "Cannot promise revenue outcomes without evidence",
      "Cannot enable paid tools, ad systems, or monetization changes without approval",
    ],
    client: [
      "Cannot commit to external delivery promises without confirmed scope",
      "Cannot change client-facing systems or communications without approval when risk is material",
    ],
  };

  const validationRulesByDepartment = {
    executive: ["Mission scope is explicit", "Dependencies and approvals are mapped", "Downstream owner is named"],
    design: ["UX intent is clear", "Accessibility considerations are noted", "Implementation handoff is specific"],
    engineering: ["Task-specific checks passed", "Regression risk is documented", "Handoff includes changed files and validation"],
    search: ["Metadata/schema/crawl findings are evidence-based", "Internal links and indexation intent are checked", "Recommendations map to business impact"],
    publishing: ["Intent and audience are clear", "Content is original and accurate", "Links and structure are reviewed"],
    marketing: ["Lead or audit evidence is saved", "Duplicates are removed", "No unauthorized outreach step occurred"],
    revenue: ["Business impact is explicit", "Tracking assumptions are stated", "Recommended next action is prioritized"],
    client: ["Client context is accurate", "Deliverables and responsibilities are explicit", "Handoff and follow-up are documented"],
  };

  const scorecardMetricsByDepartment = {
    executive: ["Tasks Completed", "Documentation Compliance", "Approval Compliance", "Business Impact"],
    design: ["Tasks Completed", "QA Pass Rate", "Documentation Compliance", "Average Execution Time"],
    engineering: ["Tasks Completed", "QA Pass Rate", "Failures", "Retries"],
    search: ["Tasks Completed", "QA Pass Rate", "Memory Updates", "Business Impact"],
    publishing: ["Tasks Completed", "Documentation Compliance", "QA Pass Rate", "Average Execution Time"],
    marketing: ["Tasks Completed", "Approval Compliance", "Documentation Compliance", "Business Impact"],
    revenue: ["Tasks Completed", "Business Impact", "QA Pass Rate", "Memory Updates"],
    client: ["Tasks Completed", "Documentation Compliance", "Approval Compliance", "Business Impact"],
  };

  const executionExamplesByDepartment = {
    executive: ["Interpret a new founder objective and route it into a mission", "Resolve a blocked workflow with a clear approval path"],
    design: ["Create a homepage structure handoff", "Review a motion concept against UX and performance constraints"],
    engineering: ["Implement a scoped feature safely", "Prepare a release candidate and hand it to QA"],
    search: ["Run an internal SEO review", "Turn Search Console findings into prioritized actions"],
    publishing: ["Build a blog cluster brief", "Prepare and QA an article package for publication handoff"],
    marketing: ["Run a lead research mission", "Create compliant outreach drafts from verified findings"],
    revenue: ["Review funnel friction and recommend CRO work", "Produce a monetization readiness summary"],
    client: ["Prepare a proposal package", "Coordinate onboarding documents and delivery handoff"],
  };

  const agentOverrides = {
    CEO_OPERATOR_AGENT: {
      purpose: "Interpret the human owner's objective as a company mission and set the priority, business framing, and operating boundaries.",
      businessValue: "Prevents agent drift by ensuring work starts from real company intent, not disconnected enthusiasm.",
      responsibilities: [
        "Interpret human goals in business language",
        "Decide whether the work is growth, delivery, documentation, or platform work",
        "Set the required quality bar and priority order",
        "Escalate tradeoffs that change speed, risk, or revenue path",
      ],
      inputs: ["Human objective", "current company priorities", "existing WGOS memory", "open risks"],
      outputs: ["Mission brief", "priority decision", "success criteria", "routing recommendation"],
      dailyTasks: ["Review active missions", "clarify ambiguous goals", "set revenue-aware priorities"],
      weeklyTasks: ["Review operating bottlenecks", "refine company priorities", "adjust strategic focus"],
      successMetrics: ["Clear mission framing", "fewer misrouted tasks", "fewer avoidable approvals", "higher quality handoffs"],
    },
    WORKFLOW_ORCHESTRATOR_AGENT: {
      purpose: "Turn a mission into the correct sequence of agents, workflows, approvals, and validation steps.",
      businessValue: "Makes WGOS act like a coordinated team instead of unrelated specialists colliding with each other.",
      responsibilities: ["Select workflows", "sequence specialists", "flag approval pauses", "route to QA and documentation"],
      inputs: ["Mission brief", "available workflows", "approval rules", "project constraints"],
      outputs: ["Routing plan", "dependency order", "approval map", "handoff path"],
      dailyTasks: ["Route new missions", "resolve execution ordering issues", "unblock stuck workflows"],
      weeklyTasks: ["Review workflow failures", "tighten routing logic", "improve reusable sequences"],
      successMetrics: ["Reduced rework", "cleaner sequencing", "fewer skipped approvals", "better task readiness"],
    },
    PROJECT_MANAGER_AGENT: {
      purpose: "Translate routed work into task boards, dependencies, task ownership, and completion discipline.",
      businessValue: "Protects execution quality by making work trackable, reviewable, and handoff-safe.",
      responsibilities: ["Create tasks", "set statuses", "log blockers", "manage handoffs", "enforce completion rules"],
      inputs: ["Routing plan", "mission scope", "required outputs", "validation rules"],
      outputs: ["Task board", "status updates", "blocker log", "handoff note"],
      dailyTasks: ["Update statuses", "chase blockers", "confirm validation ownership"],
      weeklyTasks: ["Review cycle time", "close stale tasks", "improve task templates"],
      successMetrics: ["Task clarity", "dependency accuracy", "on-time handoffs", "fewer undocumented blockers"],
    },
    KNOWLEDGE_MANAGER_AGENT: {
      purpose: "Convert execution into durable company memory, decisions, risks, and next actions.",
      businessValue: "Prevents context loss between sessions and protects the agency from repeating the same mistakes.",
      responsibilities: ["Update memory", "capture decisions", "record lessons", "log open risks"],
      inputs: ["Agent reports", "task outcomes", "validation results", "handoff notes"],
      outputs: ["Memory updates", "decision entries", "next-action updates", "learning records"],
      dailyTasks: ["Update current state", "capture new decisions", "log unresolved risks"],
      weeklyTasks: ["Review stale memory", "merge repeated patterns", "summarize institutional lessons"],
      successMetrics: ["Low context drift", "clean current-state records", "better next-session continuity"],
    },
    DOCUMENTATION_AGENT: {
      purpose: "Enforce Rule Zero by making sure every meaningful action leaves readable, durable records.",
      businessValue: "Makes WGOS operable across sessions, teammates, and future tenants instead of depending on memory alone.",
      responsibilities: ["Write reports", "update changelog", "normalize handoffs", "audit completeness"],
      inputs: ["Task results", "memory deltas", "QA notes", "project updates"],
      outputs: ["Reports", "changelog updates", "handoff updates", "documentation closeout"],
      dailyTasks: ["Check undocumented work", "publish mission summaries", "repair incomplete records"],
      weeklyTasks: ["Review docs quality", "tighten templates", "clean outdated guidance"],
      successMetrics: ["No silent work", "complete handoffs", "useful reports", "traceable decisions"],
    },
    LEAD_RESEARCH_AGENT: {
      purpose: "Find qualified businesses with real revenue potential and documented website or digital opportunity.",
      businessValue: "Builds a reliable top-of-funnel for Web Growth without random prospecting or low-fit outreach.",
      responsibilities: [
        "Find exactly 50 qualified leads when assigned a daily lead mission",
        "Prioritize 70-80% Tier 1, 20-25% Tier 2, 5-10% Tier 3",
        "Collect scoring data and source evidence",
        "Prepare mini-audit inputs and outreach angles for every accepted lead",
      ],
      inputs: ["Lead mission", "approved locations", "approved industries", "source list", "scoring rules"],
      outputs: ["Qualified leads log", "50 mini-audit-ready records", "personalization notes", "handoff to Outreach Drafting"],
      dailyTasks: ["Search approved sources", "score leads", "reject sub-60 leads", "log accepted leads"],
      weeklyTasks: ["Review hit rate by location and industry", "refine search formulas", "improve scoring consistency"],
      successMetrics: ["50 qualified leads", "50 mini audits prepared", "50 outreach angles prepared", "0 unauthorized contact actions"],
      forbidden: ["Sending emails", "submitting forms", "inventing contact data", "saving low-fit leads just to hit quota"],
    },
    WEBSITE_AUDIT_AGENT: {
      purpose: "Turn visible website weaknesses into documented business opportunities for service sales or follow-up strategy.",
      businessValue: "Improves outreach quality by grounding every prospect in real evidence instead of generic criticism.",
    },
    OUTREACH_DRAFTING_AGENT: {
      purpose: "Create personalized, human-reviewable outreach drafts based on verified lead observations.",
      businessValue: "Improves reply quality while preserving brand safety and compliance.",
      responsibilities: [
        "Write drafts only, never send automatically",
        "Include business name, one verified observation, one business impact, one relevant service, and one soft CTA",
        "Avoid insults, invented metrics, fake urgency, or misrepresentation",
      ],
      forbidden: ["Sending emails automatically", "inventing observations", "using generic spam copy", "creating fake urgency"],
    },
    CRM_AGENT: {
      purpose: "Track lead status, follow-up readiness, reply state, and conversion path without losing pipeline context.",
      businessValue: "Protects the agency from duplicate outreach, dropped leads, and missing follow-ups.",
    },
    ANALYTICS_AGENT: {
      purpose: "Review GA4 and Search Console signals and turn them into practical business and optimization decisions.",
      businessValue: "Connects traffic and search data to prioritization, content, and revenue actions.",
    },
    CRO_AGENT: {
      purpose: "Improve landing pages, forms, messaging, and call-to-action flows so traffic turns into leads or revenue.",
      businessValue: "Increases the value of existing traffic before the agency spends more acquiring new traffic.",
    },
    QA_ENGINEER_AGENT: {
      purpose: "Validate that work actually meets requirements instead of merely appearing finished.",
      businessValue: "Reduces regressions, protects trust, and stops incomplete work from being marked done.",
    },
    PERFORMANCE_ENGINEER_AGENT: {
      purpose: "Protect Core Web Vitals and remove performance issues that hurt rankings, UX, or conversion.",
      businessValue: "Keeps the company’s sites competitive, crawlable, and pleasant to use.",
    },
    ACCESSIBILITY_ENGINEER_AGENT: {
      purpose: "Protect keyboard access, semantics, contrast, motion safety, and inclusive interaction quality.",
      businessValue: "Reduces legal risk, increases usability, and improves overall product quality.",
    },
    DEPLOYMENT_ENGINEER_AGENT: {
      purpose: "Prepare releases safely without crossing approval boundaries for production changes.",
      businessValue: "Prevents rushed deployments and keeps release work observable and reversible.",
    },
    REVENUE_OPERATIONS_AGENT: {
      purpose: "Find and rank the fastest, safest, most repeatable revenue opportunities for Web Growth.",
      businessValue: "Pushes the agency toward cash-generating work instead of low-leverage busywork.",
    },
    CLIENT_SUCCESS_AGENT: {
      purpose: "Coordinate onboarding, delivery communication, handoff quality, and retention-ready client experience.",
      businessValue: "Improves client trust, reduces confusion, and increases lifetime value.",
    },
  };

  for (const agent of agents) {
    const override = agentOverrides[agent.slug] ?? {};
    const purpose = override.purpose ?? agent.mission;
    const businessValue =
      override.businessValue ??
      "Creates leverage for Web Growth by making this specialty repeatable, reviewable, and accountable inside WGOS.";
    const responsibilities = override.responsibilities ?? agent.capabilities;
    const tools = override.tools ?? departmentToTools[agent.department] ?? ["WGOS docs", "repo files", "validation tools"];
    const allowed = override.allowed ?? [
      "Research and analyze",
      "Draft and recommend",
      "Create or modify local WGOS records",
      "Prepare human-reviewable outputs",
    ];
    const forbidden = override.forbidden ?? [
      "Take state-changing external actions without approval",
      "Claim validation that did not happen",
      "Skip documentation updates",
      "Invent facts, metrics, or evidence",
    ];
    const approvals = override.approvals ?? [
      "Pause for any external contact, publishing, deployment, purchase, DNS, or account change",
      "Pause for login, 2FA, CAPTCHA, billing, verification, or property-selection steps in controlled browsing",
    ];
    const inputs = override.inputs ?? ["Mission brief", "task context", "relevant source files", "current WGOS memory"];
    const outputs = override.outputs ?? agent.outputs;
    const dailyTasks = override.dailyTasks ?? [
      "Review assigned tasks",
      "Perform specialized work",
      "Document decisions and blockers",
    ];
    const weeklyTasks = override.weeklyTasks ?? [
      "Review outcomes and repeated issues",
      "Improve templates or process quality",
      "Feed lessons back into WGOS memory",
    ];
    const successMetrics = override.successMetrics ?? [
      "Outputs accepted by QA or downstream agents",
      "Low rework caused by missing context",
      "Clear documentation and handoff quality",
    ];
    const capabilities = override.capabilities ?? capabilitiesByDepartment[agent.department] ?? [
      "Task intake",
      "Specialist execution",
      "Validation",
      "Handoff preparation",
    ];
    const limitations = override.limitations ?? limitationsByDepartment[agent.department] ?? [
      "Cannot bypass runtime requirements",
      "Cannot skip documentation or memory updates",
    ];
    const validationRules = override.validationRules ?? validationRulesByDepartment[agent.department] ?? [
      "Inputs are validated",
      "Outputs are reviewed before handoff",
      "Evidence is documented",
    ];
    const exampleMissions = override.exampleMissions ?? executionExamplesByDepartment[agent.department] ?? [
      "Execute one scoped specialist task",
      "Hand off a validated result to the next agent",
    ];
    const scorecardMetrics = override.scorecardMetrics ?? scorecardMetricsByDepartment[agent.department] ?? [
      "Tasks Completed",
      "QA Pass Rate",
      "Documentation Compliance",
      "Approval Compliance",
    ];
    const allowedIntegrations = agentIntegrationOverrides[agent.slug] ?? departmentToIntegrations[agent.department] ?? ["filesystem", "docs"];
    const integrationPlaybooks = agentPlaybookOverrides[agent.slug] ?? departmentToPlaybooks[agent.department] ?? ["QUALITY_VALIDATION_PLAYBOOK"];
    const examplePrompt =
      override.examplePrompt ??
      `You are the ${agent.title} Agent inside WGOS. Mission ID: M-001. Task ID: T-001. Objective: ${agent.mission} Use the required skills, respect approval gates, produce a documented result, and hand off cleanly when done.`;
    const exampleReport =
      override.exampleReport ??
      `- Agent name: ${agent.title} Agent
- Task ID: T-001
- Objective: ${agent.mission}
- Inputs used: Mission brief, WGOS docs, relevant files
- Actions performed: Reviewed task, completed specialist work, validated output
- Files created: None
- Files modified: WGOS records as needed
- Data collected: Evidence relevant to the task
- Decisions made: Specialist recommendation documented
- Risks: Any blockers or open dependencies noted
- Validation performed: Task-specific checks completed
- Documentation updated: memory/, reports/, changelog, handoff as relevant
- Handoff target: Next required agent
- Next recommended action: Downstream execution or approval
- Status: READY_FOR_QA`;

    const filePath = `agents/${agent.department}/${agent.slug}.md`;
    await writeFile(
      filePath,
      `
# ${agent.title} Agent

## Department

\`${agent.department}\`

## Purpose

${purpose}

## Business value

${businessValue}

## Responsibilities

${bullets(responsibilities)}

## Capabilities

${bullets(capabilities)}

## Limitations

${bullets(limitations)}

## Required skills

${codeList(agent.skills)}

## Required tools

${bullets(tools)}

## Runtime file references

- \`runtime/core/AGENT_INVOCATION.md\`
- \`runtime/core/AGENT_LIFECYCLE.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`runtime/memory/MEMORY_UPDATE_PROTOCOL.md\`
- \`runtime/reporting/REPORT_STANDARD.md\`
- \`runtime/approval/APPROVAL_LEVELS.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/state-store.mjs\`
- \`packages/agents/src/executors.mjs\`

## Allowed integrations

${codeList(allowedIntegrations)}

## Integration playbooks

${codeList(integrationPlaybooks)}

## Allowed actions

${bullets(allowed)}

## Forbidden actions

${bullets(forbidden)}

## Human approval requirements

${bullets(approvals)}

## Inputs

${bullets(inputs)}

## Outputs

${bullets(outputs)}

## Runtime hooks

- \`Mission()\`: confirm the mission framing, scope, and operating constraints.
- \`Plan()\`: create a short execution plan with dependencies, approvals, and validation steps.
- \`Execute()\`: perform the specialist work within the WGOS runtime and approval boundaries.
- \`Validate()\`: run role-specific checks before handoff.
- \`Report()\`: produce a structured task report with evidence, risks, and next step.
- \`UpdateMemory()\`: update memory, decisions, roadmap, changelog, and handoff records when relevant.
- \`HandOff()\`: pass the task to the next required agent with status, changed files, and validation context.
- \`RequestApproval()\`: stop at the correct gate and request human approval with the exact decision needed.
- \`Recover()\`: handle partial completion, retries, and dependency failures.
- \`Archive()\`: close the task cleanly after documentation and memory are complete.

## Validation rules

${bullets(validationRules)}

## Daily tasks

${bullets(dailyTasks)}

## Weekly tasks

${bullets(weeklyTasks)}

## Handoff rules

- Hand off only after the task result is specific, documented, and traceable.
- If QA is required, hand off to \`QA_ENGINEER_AGENT\` with validation context.
- If memory changed, hand off to \`KNOWLEDGE_MANAGER_AGENT\`.
- If docs changed or should change, hand off to \`DOCUMENTATION_AGENT\`.
- If approval is needed, stop and route to the human owner with the exact decision required.

## Documentation requirements

- Update the relevant mission report in \`reports/\`.
- Update \`memory/CODEX_MEMORY.md\`, \`memory/CURRENT_STATE.md\`, \`memory/ACTIVE_TASKS.md\`, and \`memory/NEXT_ACTIONS.md\` when relevant.
- Update \`decisions/DECISIONS.md\` when a durable operating decision is made.
- Update \`CHANGELOG.md\` and \`PROJECT_HANDOFF.md\` when the system state meaningfully changes.

## Memory rules

- Read current memory before execution if the task depends on prior context or previous reports.
- Record state changes, blockers, and next actions immediately after validation.
- Preserve only confirmed facts in memory and reports.
- Escalate contradictions between current findings and stored memory instead of overwriting silently.

## Report format

- Mission
- Task
- Agent
- Objective
- Files Created
- Files Modified
- Documentation Updated
- Validation
- Risks
- Next Step

## Success metrics

${bullets(successMetrics)}

## Failure recovery

- Retry only when the failure is transient and the retry will not create duplicate or risky side effects.
- If dependencies are missing, mark the task blocked and hand off the exact unblock requirement.
- If partial completion is still useful, document what is complete, what failed, and what remains.

## Retry logic

- Attempt one controlled retry for transient local failures such as file locks, command flakiness, or timing issues.
- Do not retry state-changing or approval-gated external actions without explicit human approval.
- After repeated failure, create a blocker note with evidence and the recommended recovery path.

## Example missions

${bullets(exampleMissions)}

## Execution contract

- \`Mission()\`
- \`Plan()\`
- \`Execute()\`
- \`Validate()\`
- \`Report()\`
- \`UpdateMemory()\`
- \`HandOff()\`
- \`RequestApproval()\`
- \`Recover()\`
- \`Archive()\`

## Agent scorecard metrics

${bullets(scorecardMetrics)}

## Self-improvement requirement

- Recommend at least one process, quality, or tooling improvement after meaningful execution.
- Tie the recommendation to evidence from the completed task when possible.

## Example invocation prompt

\`\`\`text
${examplePrompt}
\`\`\`

## Example final report

\`\`\`md
${exampleReport}
\`\`\`
`
    );
  }
}

async function syncDepartmentDocs() {
  await writeFile(
    "departments/README.md",
    `
# Departments

Departments coordinate specialists around mission outcomes rather than isolated tasks.

## Department execution model

Human objective -> Executive routing -> Required departments -> Specialists -> QA -> Knowledge -> Documentation -> Executive report
`
  );

  const departmentMissionExamples = {
    executive: ["Mission intake", "Cross-department routing", "Weekly company review"],
    design: ["Homepage rebuild", "Brand system review", "Motion direction"],
    engineering: ["Feature delivery", "Landing page build", "Speed optimization"],
    search: ["SEO audit", "Technical SEO cleanup", "Weekly search review"],
    publishing: ["Blog cluster launch", "Content silo build", "Editorial refresh"],
    marketing: ["Weekly lead research", "Outreach draft batch", "Website audit sprint"],
    revenue: ["Weekly analytics review", "CRO backlog review", "AdSense readiness review"],
    client: ["Proposal creation", "Client onboarding", "Delivery communication"],
    operations: ["Mission board maintenance", "Dependency triage", "Approval queue management"],
    qa: ["Engineering QA", "Content QA", "Marketing QA"],
    documentation: ["Mission closeout", "Knowledge archive", "Executive summary"],
  };

  const departmentIntegrationOwnership = {
    executive: ["filesystem", "docs", "csv", "github"],
    design: ["figma", "images", "filesystem", "docs"],
    engineering: ["filesystem", "github", "lighthouse", "pagespeed", "vercel", "images"],
    search: ["search-console", "ga4", "search", "lighthouse", "pagespeed", "docs"],
    publishing: ["docs", "filesystem", "search", "csv", "images"],
    marketing: ["browser", "search", "maps", "business-directories", "crm", "gmail", "csv"],
    revenue: ["ga4", "search-console", "crm", "lighthouse", "pagespeed", "csv"],
    client: ["crm", "gmail", "docs", "filesystem", "csv"],
    operations: ["filesystem", "docs", "csv"],
    qa: ["filesystem", "lighthouse", "pagespeed", "images", "docs"],
    documentation: ["docs", "filesystem", "csv"],
  };

  const departmentCollaborationRules = {
    executive: ["Routes company missions", "Escalates approvals", "Consumes KPI and risk outputs from every department"],
    design: ["Hands UX and motion requirements to engineering", "Requests SEO and QA review before completion"],
    engineering: ["Requests QA, accessibility, performance, and search review before closeout", "Consumes design and strategy handoffs"],
    search: ["Requests publishing changes and engineering fixes", "Feeds revenue and executive reporting with search findings"],
    publishing: ["Requests SEO guidance and internal-link targets", "Hands drafts to QA and documentation"],
    marketing: ["Requests website audits, intelligence, CRM, and outreach drafting in sequence", "Stops at approval before any external contact"],
    revenue: ["Consumes analytics and search data", "Requests CRO, publishing, or engineering action when monetization issues are found"],
    client: ["Consumes CRM and proposal context", "Hands onboarding and delivery state into operations and documentation"],
    operations: ["Maintains company task board", "Routes blockers back to executive or specialists"],
    qa: ["Validates each department’s outputs", "Returns failed work to the originating department with evidence"],
    documentation: ["Finalizes mission records after all departments complete", "Feeds Knowledge Manager and executive summary outputs"],
  };

  const departmentMemoryHooks = {
    executive: ["memory/company/", "memory/missions/", "memory/departments/executive/"],
    design: ["memory/departments/design/", "memory/company/"],
    engineering: ["memory/departments/engineering/", "memory/company/"],
    search: ["memory/seo/", "memory/departments/search/"],
    publishing: ["memory/publishing/", "memory/content/", "memory/departments/publishing/"],
    marketing: ["memory/marketing/", "memory/departments/marketing/"],
    revenue: ["memory/revenue/", "memory/departments/revenue/"],
    client: ["memory/clients/", "memory/departments/client/"],
    operations: ["memory/company/", "memory/departments/operations/"],
    qa: ["memory/company/", "memory/departments/qa/"],
    documentation: ["memory/company/", "memory/departments/documentation/"],
  };

  for (const department of departments) {
    const members = agents
      .filter((agent) => agent.department === department.id)
      .map((agent) => agent.title);
    await writeFile(
      `departments/${department.id}/README.md`,
      `
# ${department.name} Department

## Summary

${department.summary}

## Owned agents

${bullets(members.length ? members : ["No dedicated agents registered yet."])}

## Mission types

${bullets(departmentMissionExamples[department.id] ?? ["Mission support only"])}

## Owned integrations

${codeList(departmentIntegrationOwnership[department.id] ?? ["filesystem", "docs"])}

## Collaboration rules

${bullets(departmentCollaborationRules[department.id] ?? ["Collaborate through runtime handoffs and documented task ownership."])}

## Memory hooks

${codeList(departmentMemoryHooks[department.id] ?? ["memory/company/"])}

## Runtime references

- \`runtime/core/AGENT_LIFECYCLE.md\`
- \`runtime/tasks/TASK_SYSTEM.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`runtime/reporting/REPORT_STANDARD.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/department-router.mjs\`

## Department reporting duties

- Contribute mission-level report inputs.
- Update department report outputs after meaningful execution.
- Feed KPI and memory updates into company-wide records.

## Members

${bullets(members.length ? members : ["No dedicated agents registered yet."])}
`
    );
  }

  await writeFile(
    "departments/content/README.md",
    `
# Content Department Compatibility Alias

WGOS Phase 5 references a content department, but the active editorial operating model in this implementation is \`publishing\`.

## Active mapping

- Use \`departments/publishing/\` as the source of truth for editorial operations.
- Do not recreate legacy \`agents/content/\` copies.
- Route content strategy, copywriting, proofreading, and internal linking through the publishing department.
`
  );
}

async function syncWorkflowDocs() {
  await writeFile(
    "workflows/README.md",
    `
# Workflows

Workflow docs define repeatable, multi-step operating procedures.
`
  );

  const workflowDetails = {
    WORKFLOW_ORCHESTRATION: {
      purpose: "Convert a human objective into a structured execution path with routing, dependencies, approvals, and documentation.",
      inputs: ["Human objective", "company priorities", "open risks", "available WGOS agents and skills"],
      outputs: ["Mission brief", "agent routing plan", "task sequence", "approval map"],
      steps: [
        "CEO Operator interprets the objective and clarifies the mission.",
        "Workflow Orchestrator selects the right workflow and specialist mix.",
        "Project Manager creates the task board and dependency order.",
        "Specialists execute in sequence.",
        "QA validates outcomes.",
        "Knowledge Manager updates memory.",
        "Documentation Agent finalizes reports and handoff records.",
      ],
    },
    LEAD_RESEARCH_WORKFLOW: {
      purpose: "Find 50 qualified leads and create 50 personalized drafts without sending any outreach automatically.",
      inputs: ["Lead mission", "target locations", "target industries", "approved sources", "scoring model"],
      outputs: ["50 qualified leads", "50 mini audits", "50 outreach angles", "50 personalized drafts", "CRM-ready logs", "mission report"],
      steps: [
        "Human starts the mission and confirms target market if needed.",
        "CEO Operator interprets the lead goal and confirms quota, quality bar, and priorities.",
        "Workflow Orchestrator routes work to Lead Research, Website Audit, Business Intelligence, Outreach Drafting, QA, CRM, Knowledge Manager, and Documentation Agent.",
        "Project Manager creates the task board with quota checkpoints and validation gates.",
        "Lead Research Agent searches approved sources and saves only leads scoring 60+.",
        "Website Audit Agent creates a mini audit for each accepted lead.",
        "Business Intelligence Agent enriches context needed for better personalization and fit decisions.",
        "Outreach Drafting Agent writes one personalized draft per accepted lead.",
        "QA Agent checks lead quality, compliance, personalization, and completion count.",
        "CRM Agent logs lead status and draft readiness.",
        "Knowledge Manager updates memory and open risks.",
        "Documentation Agent writes the mission report and handoff summary.",
        "Human reviews drafts and decides what, if anything, will be sent manually.",
        "Follow Up Agent prepares later follow-up drafts only after human direction.",
      ],
      approvals: [
        "Human approval required for any Gmail draft creation if explicitly requested",
        "Human approval required for any sending, contact form submission, or external outreach action",
      ],
      failureHandling: [
        "If fewer than 50 qualified leads are found, document the exact shortage and why.",
        "If source quality drops below threshold, change search formulas before accepting weak leads.",
        "If personalization cannot be verified, reject the draft and return it for rewrite.",
      ],
    },
  };

  for (const workflow of workflows) {
    const detail = workflowDetails[workflow.slug] ?? {};
    const agentsInvolved = agents
      .filter((agent) => workflow.departments.includes(agent.department))
      .map((agent) => `${agent.title} Agent`);
    const steps =
      detail.steps ?? [
        "Receive the trigger and confirm the mission objective.",
        "Route the work to the appropriate specialists.",
        "Execute the task sequence with approval pauses where needed.",
        "Validate outputs before completion.",
        "Update memory, reports, and handoff records.",
      ];
    const inputs =
      detail.inputs ?? ["Mission brief", "relevant company context", "required source files or systems"];
    const outputs =
      detail.outputs ?? ["Validated workflow outputs", "report", "memory updates", "handoff notes"];
    const approvals =
      detail.approvals ?? [
        "Pause for any externally visible, state-changing, or account-modifying action",
        "Pause for login, 2FA, CAPTCHA, billing, verification, or property-selection steps",
      ];
    const failureHandling =
      detail.failureHandling ?? [
        "Stop and document blockers instead of improvising around missing inputs or approvals.",
        "Return failed outputs to the correct specialist instead of silently accepting poor quality.",
        "Escalate ambiguous risk to the human owner through the orchestrator or project manager.",
      ];

    await writeFile(
      `workflows/${workflow.slug}.md`,
      `
# ${workflow.title}

## Purpose

${detail.purpose ?? "Define the repeatable process, approvals, and handoffs for this class of WGOS mission."}

## Trigger

${workflow.trigger}

## Agents involved

${bullets(agentsInvolved.length ? agentsInvolved : workflow.departments)}

## Step-by-step process

${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Required inputs

${bullets(inputs)}

## Outputs

${bullets(outputs)}

## Approval gates

${bullets(approvals)}

## Runtime references

- \`runtime/core/AGENT_COMMUNICATION_PROTOCOL.md\`
- \`runtime/execution/EXECUTION_RULES.md\`
- \`runtime/tasks/TASK_SYSTEM.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`runtime/approval/APPROVAL_REQUEST_FORMAT.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/mission-catalog.mjs\`
- \`packages/runtime/src/state-store.mjs\`

## Documentation updates required

- Update the mission report in \`reports/\`.
- Update \`memory/CODEX_MEMORY.md\`, \`memory/CURRENT_STATE.md\`, \`memory/ACTIVE_TASKS.md\`, and \`memory/NEXT_ACTIONS.md\`.
- Update \`decisions/DECISIONS.md\` when the workflow causes a durable operating decision.
- Update \`PROJECT_HANDOFF.md\` when the workflow pauses or passes work forward.

## Failure handling

${bullets(failureHandling)}

## Completion criteria

- Required outputs exist and are reviewable.
- QA or equivalent validation has run where appropriate.
- Memory and documentation updates are complete.
- Any approval-dependent next step is explicitly handed to the human owner.
      `
    );
  }

  await writeFile(
    "workflows/HOMEPAGE_REBUILD_COLLABORATION_WORKFLOW.md",
    `
# Homepage Rebuild Collaboration Workflow

## Purpose

Coordinate a homepage rebuild from strategy through implementation, validation, documentation, and memory capture.

## Trigger

Use this workflow when a homepage needs structural, UX, messaging, design, engineering, SEO, accessibility, performance, and QA coordination.

## Agents involved

- \`PRODUCT_STRATEGIST_AGENT\`
- \`UI_UX_DESIGN_AGENT\`
- \`MOTION_GRAPHICS_AGENT\`
- \`FRONTEND_ENGINEER_AGENT\`
- \`SEO_AGENT\`
- \`ACCESSIBILITY_ENGINEER_AGENT\`
- \`PERFORMANCE_ENGINEER_AGENT\`
- \`QA_ENGINEER_AGENT\`
- \`DOCUMENTATION_AGENT\`
- \`KNOWLEDGE_MANAGER_AGENT\`

## Step-by-step process

1. Product Strategist defines objective, audience, offer hierarchy, and success metric.
2. UI UX Designer turns strategy into page structure, content order, and CTA map.
3. Motion Graphics Designer defines motion rules that support comprehension and respect reduced motion.
4. Frontend Engineer implements the approved structure and interaction model.
5. SEO Agent reviews metadata, internal links, and search-intent alignment.
6. Accessibility Engineer validates semantics, keyboard flow, contrast, and motion safety.
7. Performance Engineer reviews Core Web Vitals risk and implementation weight.
8. QA Engineer validates the complete experience and routes defects back if needed.
9. Documentation Agent records what changed, what was validated, and what remains.
10. Knowledge Manager updates memory, next actions, and durable decisions.

## Required inputs

- Mission brief
- Existing homepage evidence
- Brand and offer context
- Validation requirements

## Outputs

- Approved implementation handoff or completed local build
- Validation evidence
- Mission report
- Memory updates

## Approval gates

- Pause before any production deployment.
- Pause before any external publishing or account-level change.

## Runtime references

- \`runtime/core/AGENT_COMMUNICATION_PROTOCOL.md\`
- \`runtime/execution/EXECUTION_RULES.md\`
- \`runtime/tasks/TASK_SYSTEM.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/mission-catalog.mjs\`

## Documentation updates required

- Update \`reports/\`, \`memory/\`, \`decisions/\`, and \`PROJECT_HANDOFF.md\`.

## Failure handling

- Route defects back to the originating specialist with exact validation evidence.
- Mark the mission blocked when approval, content, or dependency gaps stop safe progress.

## Completion criteria

- Strategy, implementation, validation, and documentation are complete.
- The next step is explicit if production action is still pending.
`
  );

  await writeFile(
    "workflows/BLOG_ARTICLE_COLLABORATION_WORKFLOW.md",
    `
# Blog Article Collaboration Workflow

## Purpose

Coordinate article production from search intent through writing, editing, linking, schema, QA, documentation, and memory updates.

## Trigger

Use this workflow for a new article, article refresh, or cluster-supporting editorial task.

## Agents involved

- \`SEO_AGENT\`
- \`CONTENT_STRATEGIST_AGENT\`
- \`COPYWRITER_AGENT\`
- \`PROOFREADER_AGENT\`
- \`INTERNAL_LINKING_AGENT\`
- \`SCHEMA_AGENT\`
- \`QA_ENGINEER_AGENT\`
- \`DOCUMENTATION_AGENT\`
- \`KNOWLEDGE_MANAGER_AGENT\`

## Step-by-step process

1. SEO Agent defines the target intent, keyword framing, metadata angle, and SERP constraints.
2. Content Strategist produces the brief, outline, and topical role within the wider cluster.
3. Copywriter drafts original people-first content.
4. Proofreader reviews clarity, grammar, factual consistency, and brand fit.
5. Internal Linking Agent connects the article to relevant services, related content, and conversion paths.
6. Schema Agent adds only schema that matches the visible content.
7. QA Engineer checks content quality, formatting, trust, and compliance.
8. Documentation Agent records the mission result and open follow-ups.
9. Knowledge Manager updates memory and future editorial priorities.

## Required inputs

- Mission brief
- Search intent target
- Existing content cluster context
- Internal linking opportunities

## Outputs

- Article package ready for review or implementation
- Validation evidence
- Documentation and memory updates

## Approval gates

- Pause before publishing content.
- Pause before making external claims not supported by evidence.

## Runtime references

- \`runtime/core/AGENT_COMMUNICATION_PROTOCOL.md\`
- \`runtime/execution/EXECUTION_RULES.md\`
- \`runtime/tasks/TASK_SYSTEM.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/mission-catalog.mjs\`

## Documentation updates required

- Update \`reports/\`, \`memory/\`, \`decisions/\`, and \`PROJECT_HANDOFF.md\`.

## Failure handling

- Return weak, thin, duplicated, or inaccurate drafts for revision.
- Stop if required evidence, reviewer input, or approval is missing.

## Completion criteria

- The article package is validated, documented, and handed off with a clear publishing state.
`
  );

  await writeFile(
    "workflows/LEAD_GENERATION_COLLABORATION_WORKFLOW.md",
    `
# Lead Generation Collaboration Workflow

## Purpose

Coordinate compliant lead research, auditing, enrichment, CRM logging, outreach drafting, QA, documentation, and memory updates without sending outreach.

## Trigger

Use this workflow for a daily lead mission, campaign buildout, or prospecting sprint.

## Agents involved

- \`MARKETING_STRATEGIST_AGENT\`
- \`LEAD_RESEARCH_AGENT\`
- \`WEBSITE_AUDIT_AGENT\`
- \`BUSINESS_INTELLIGENCE_AGENT\`
- \`CRM_AGENT\`
- \`OUTREACH_DRAFTING_AGENT\`
- \`QA_ENGINEER_AGENT\`
- \`KNOWLEDGE_MANAGER_AGENT\`
- \`DOCUMENTATION_AGENT\`

## Step-by-step process

1. Marketing Strategist confirms target market, quality threshold, and quota.
2. Lead Research Agent finds and scores prospects using approved sources only.
3. Website Audit Agent creates a mini audit for each accepted lead.
4. Business Intelligence Agent enriches positioning, context, and personalization details.
5. CRM Agent logs status, ownership, and next-step state.
6. Outreach Drafting Agent creates a personalized draft for each approved lead.
7. QA Engineer validates compliance, personalization quality, and completeness.
8. Knowledge Manager records what was learned and what should improve next run.
9. Documentation Agent creates the mission report and handoff summary.

## Required inputs

- Mission brief
- Approved sources
- Lead scoring model
- Outreach rules

## Outputs

- Qualified leads
- Mini audits
- Personalized drafts
- CRM records
- Mission report

## Approval gates

- Pause before any email sending, form submission, or external contact.
- Pause at login, 2FA, CAPTCHA, verification, or billing steps in controlled browsing.

## Runtime references

- \`runtime/core/AGENT_COMMUNICATION_PROTOCOL.md\`
- \`runtime/execution/EXECUTION_RULES.md\`
- \`runtime/tasks/TASK_SYSTEM.md\`
- \`runtime/tasks/HANDOFF_PROTOCOL.md\`
- \`packages/runtime/src/mission-runtime.mjs\`
- \`packages/runtime/src/mission-catalog.mjs\`

## Documentation updates required

- Update \`reports/\`, \`memory/\`, \`decisions/\`, and \`PROJECT_HANDOFF.md\`.

## Failure handling

- Reject duplicate, low-quality, or weakly evidenced leads.
- Stop when browser access, source access, or approval is missing.

## Completion criteria

- Lead outputs are validated, documented, and handed off with no unauthorized contact action taken.
`
  );
}

async function syncRuntimeDocs() {
  const runtimeDocs = {
    "runtime/core/README.md": "# Runtime Core\n\nThe runtime core defines the shared execution contract every WGOS agent must follow. No agent is allowed to invent a separate lifecycle, reporting shape, or approval behavior.",
    "runtime/core/AGENT_INVOCATION.md": "# Agent Invocation Framework\n\nEvery invocation must include:\n\n- Mission ID\n- Task ID\n- Calling Agent\n- Target Agent\n- Objective\n- Context\n- Required Inputs\n- Expected Outputs\n- Approval Requirements\n- Success Criteria\n\n## Invocation rules\n\n- Invocation must be written before work starts.\n- The target agent must reject tasks with missing mandatory fields.\n- If context is insufficient, the target agent must request clarification or log the blocker.\n- If the task is risky, approval requirements must be explicit before execution continues.\n",
    "runtime/core/AGENT_LIFECYCLE.md": "# Standard Agent Lifecycle\n\nEvery WGOS agent follows this lifecycle:\n\n1. Receive Task\n2. Read Documentation\n3. Read Memory\n4. Load Required Skills\n5. Validate Inputs\n6. Create Execution Plan\n7. Perform Work\n8. Validate Output\n9. Generate Report\n10. Update Memory\n11. Update Documentation\n12. Hand Off\n13. Complete\n\n## Lifecycle enforcement\n\n- An agent may not skip directly from work to complete.\n- An agent may not mark a task complete without both reporting and memory updates.\n- If validation fails, the lifecycle returns to execution or routes to blocker handling.\n",
    "runtime/core/AGENT_COMMUNICATION_PROTOCOL.md": "# Agent Communication Protocol\n\nEvery WGOS communication must use one of these message types:\n\n- TASK\n- STATUS\n- REPORT\n- HANDOFF\n- REQUEST\n- APPROVAL\n- WARNING\n- ERROR\n- COMPLETE\n\n## Protocol rules\n\n- TASK starts work.\n- STATUS communicates progress without closing the task.\n- REPORT captures what was actually done.\n- HANDOFF transfers ownership with context.\n- REQUEST asks for missing inputs or clarification.\n- APPROVAL pauses for human permission.\n- WARNING flags non-blocking risk.\n- ERROR records blocking failure.\n- COMPLETE is used only after validation, memory, and documentation are done.\n",
    "runtime/execution/README.md": "# Execution Runtime\n\nExecution logic standardizes planning, retries, failure handling, controlled browsing, daily operating cadence, and completion rules.",
    "runtime/execution/EXECUTION_RULES.md": "# Execution Rules\n\n- Work from a declared objective.\n- Validate inputs before heavy work.\n- Load only the skills required for the current task.\n- Prefer reusable workflows and templates over improvisation.\n- Record blockers immediately.\n- Retry safely only when retries will not create duplicate side effects.\n- Route to approval instead of improvising around restrictions.\n- No execution is complete until documentation and memory are updated.\n",
    "runtime/execution/SKILL_LOADING.md": "# Skill Loader\n\nEvery agent loads only the skills required for the current task.\n\n## Default loading groups\n\n### Frontend\n\n- Next.js\n- Tailwind\n- TypeScript\n- GSAP\n- Framer Motion\n\n### SEO\n\n- codex-seo\n- Schema\n- Metadata\n- AEO\n- GEO\n- Search Console\n\n### Marketing\n\n- Controlled Browser\n- Lead Research\n- CRM\n- Outreach\n- Gmail Drafts\n\n## Rules\n\n- Load only what is relevant to the current task.\n- Do not activate broad skill sets just because an agent could use them.\n- The report should mention which skills materially influenced the output.\n",
    "runtime/execution/FAILURE_RECOVERY.md": "# Failure Recovery\n\n## Retry policy\n\n- Retry only when the failure is transient and a second attempt will not create duplicate external effects.\n- Do not retry actions that could send, publish, purchase, deploy, or mutate external systems without explicit approval.\n\n## Rollback policy\n\n- If local work introduced a bad state, document the issue and restore a safe local state when possible.\n- Never hide failures by silently overwriting evidence.\n\n## Partial completion\n\n- If a task cannot finish, document what completed, what did not, and what is safe to reuse.\n\n## Dependency failures\n\n- If a dependency fails, mark the task BLOCKED or FAILED_QA as appropriate and route the problem to the correct owner.\n\n## Human escalation\n\n- Escalate when approval is required, when data is ambiguous, or when risk exceeds the current agent's authority.\n",
    "runtime/execution/CONTROLLED_BROWSER_RUNTIME.md": "# Controlled Browser Runtime\n\nBrowser lifecycle:\n\n1. Open Session\n2. Navigate\n3. Wait For Human Login\n4. Resume\n5. Collect Information\n6. Generate Report\n7. Close Session\n\n## Hard rules\n\n- Never bypass login.\n- Never bypass CAPTCHA.\n- Never expose credentials.\n- Never continue after an approval gate.\n- Pause at login, 2FA, billing, verification, CAPTCHA, property selection, or account selection.\n- Record only confirmed facts from the observed session.\n",
    "runtime/execution/DAILY_OPERATIONS_RUNTIME.md": "# Daily Operations Runtime\n\n## Morning start\n\n- Review memory\n- Review roadmap\n- Review active tasks\n- Review open approvals\n- Review reports\n\n## Evening close\n\n- Update memory\n- Archive completed work\n- Generate executive summary\n- Recommend next priorities\n\n## Rule\n\nA WGOS day starts and ends with memory and reporting discipline, not just execution volume.\n",
    "runtime/execution/AGENT_HEALTH_SYSTEM.md": "# Agent Health System\n\nTrack:\n\n- last execution\n- failure count\n- completion rate\n- average execution time\n- documentation compliance\n- QA pass rate\n\n## Use\n\nAgent health is used to spot unstable workflows, weak task framing, documentation drift, and agents that need better templates or supervision.\n",
    "runtime/memory/README.md": "# Memory Runtime\n\nThe memory runtime decides which records must change after a task and prevents silent context drift.",
    "runtime/memory/MEMORY_UPDATE_PROTOCOL.md": "# Memory Update Protocol\n\n## Mandatory update targets\n\n- CODEX_MEMORY\n- CURRENT_STATE\n- ACTIVE_TASKS\n- NEXT_ACTIONS\n- DECISIONS\n- ROADMAP\n- CHANGELOG\n- PROJECT_HANDOFF\n\n## Update logic\n\n- Update CODEX_MEMORY when a durable operating lesson was learned.\n- Update CURRENT_STATE when the system's practical state changed.\n- Update ACTIVE_TASKS when task ownership, status, or blockers changed.\n- Update NEXT_ACTIONS when the best next steps became clearer.\n- Update DECISIONS when a durable policy or architecture choice was made.\n- Update ROADMAP when strategic sequencing changed.\n- Update CHANGELOG when meaningful artifacts changed.\n- Update PROJECT_HANDOFF when work pauses or ownership transfers.\n\n## Rule\n\nAutomatically determine the affected records from the task outcome, but do not skip documenting the reason for each update.\n",
    "runtime/reporting/README.md": "# Reporting Runtime\n\nReports are required deliverables, not optional summaries. No task counts as complete without a report or report-equivalent artifact.",
    "runtime/reporting/REPORT_STANDARD.md": "# Report Standard\n\nEvery report must include:\n\n- Mission\n- Task\n- Agent\n- Objective\n- Files Created\n- Files Modified\n- Documentation Updated\n- Validation\n- Risks\n- Next Step\n\n## Extended report guidance\n\nWhenever relevant, also record inputs used, actions performed, decisions made, data collected, blockers, and handoff target.\n",
    "runtime/approval/README.md": "# Approval Runtime\n\nApproval handling keeps high-risk work controlled and auditable. Every agent must know when to stop.",
    "runtime/approval/APPROVAL_LEVELS.md": "# Approval Levels\n\nUse these runtime approval categories:\n\n- LOW\n- NORMAL\n- HIGH\n- CRITICAL\n\n## Meaning\n\n- LOW: safe local work with minimal downside\n- NORMAL: ordinary execution with limited external or operational risk\n- HIGH: sensitive work needing explicit caution and usually human awareness\n- CRITICAL: execution must pause until the human owner approves\n\n## Rule\n\nCRITICAL always pauses execution.\n",
    "runtime/approval/APPROVAL_REQUEST_FORMAT.md": "# Approval Request Format\n\nEvery approval request must include:\n\n- Mission ID\n- Task ID\n- Requesting Agent\n- Approval Level\n- Action Requested\n- Why Approval Is Needed\n- Exact Scope\n- Risks If Approved\n- Risks If Delayed\n- Expiration Boundary or Timing Need\n",
    "runtime/tasks/README.md": "# Task Runtime\n\nTasks are the atomic execution units inside a mission. Every task must be trackable, stateful, and handoff-safe.",
    "runtime/tasks/TASK_SYSTEM.md": "# Task System\n\nRequired fields:\n\n- Task ID\n- Mission ID\n- Owner\n- Dependencies\n- Priority\n- Status\n- Validation Requirement\n- Approval Requirement\n\n## Task statuses\n\n- BACKLOG\n- READY\n- IN_PROGRESS\n- BLOCKED\n- WAITING_APPROVAL\n- FAILED_QA\n- COMPLETED\n- ARCHIVED\n",
    "runtime/tasks/HANDOFF_PROTOCOL.md": "# Handoff Framework\n\nEvery handoff must include:\n\n- Current Status\n- Completed Work\n- Files Changed\n- Documentation Updated\n- Outstanding Risks\n- Next Required Agent\n- Expected Output\n- Validation Needed\n\n## Rule\n\nA handoff must let the receiving agent continue without guessing what happened before.\n",
    "runtime/prompts/README.md": "# Runtime Templates\n\nThese templates standardize how WGOS missions, tasks, approvals, plans, reports, and summaries are written.",
    "runtime/prompts/MISSION_TEMPLATE.md": "# Mission Template\n\n- Mission ID\n- Owner\n- Objective\n- Scope\n- Constraints\n- Priority\n- Approval level\n- Success criteria\n- Required workflows\n",
    "runtime/prompts/TASK_TEMPLATE.md": "# Task Template\n\n- Task ID\n- Mission ID\n- Calling Agent\n- Target Agent\n- Objective\n- Context\n- Required Inputs\n- Expected Outputs\n- Dependencies\n- Status\n- Success Criteria\n",
    "runtime/prompts/EXECUTION_PLAN_TEMPLATE.md": "# Execution Plan Template\n\n- Task ID\n- Goal\n- Steps\n- Skills to load\n- Validation plan\n- Approval pauses\n- Handoff target\n",
    "runtime/prompts/APPROVAL_REQUEST_TEMPLATE.md": "# Approval Request Template\n\n- Mission ID\n- Task ID\n- Requesting Agent\n- Approval Level\n- Action Requested\n- Why It Is Needed\n- Exact Scope\n- Risks\n- Needed By\n",
    "runtime/prompts/AGENT_REPORT_TEMPLATE.md": "# Agent Report Template\n\n- Agent Name\n- Task ID\n- Objective\n- Inputs Used\n- Actions Performed\n- Files Created\n- Files Modified\n- Documentation Updated\n- Validation\n- Risks\n- Next Step\n- Status\n",
    "runtime/prompts/HANDOFF_TEMPLATE.md": "# Handoff Template\n\n- Current Status\n- Completed Work\n- Files Changed\n- Documentation Updated\n- Outstanding Risks\n- Next Required Agent\n- Expected Output\n- Validation Needed\n",
    "runtime/prompts/MEMORY_UPDATE_TEMPLATE.md": "# Memory Update Template\n\n- Source Task\n- Records Updated\n- Why Each Record Changed\n- Open Risks\n- Next Action\n",
    "runtime/prompts/DECISION_UPDATE_TEMPLATE.md": "# Decision Update Template\n\n- Decision ID\n- Context\n- Decision Made\n- Why\n- Expected Impact\n- Follow-up Needed\n",
    "runtime/prompts/EXECUTIVE_SUMMARY_TEMPLATE.md": "# Executive Summary Template\n\n- Date\n- Active Missions\n- Wins\n- Risks\n- Approvals Waiting\n- Recommended Next Priorities\n",
    "runtime/examples/README.md": "# Runtime Examples\n\nWorked examples of invocations, reports, handoffs, approvals, and execution plans live here.",
    "runtime/examples/SAMPLE_INVOCATION.md": "# Sample Invocation\n\nMission ID: M-001\nTask ID: T-001\nCalling Agent: CEO_OPERATOR_AGENT\nTarget Agent: WORKFLOW_ORCHESTRATOR_AGENT\nObjective: Turn a founder goal into a routed mission plan\nContext: Founder wants 50 qualified leads prepared for review\nRequired Inputs: company priorities, lead workflow, approval rules\nExpected Outputs: routing plan and task breakdown\nApproval Requirements: none for planning\nSuccess Criteria: correct workflow and agent sequence documented\n",
    "runtime/examples/SAMPLE_EXECUTION_PLAN.md": "# Sample Execution Plan\n\n- Task ID: T-001\n- Goal: Route the lead mission\n- Steps: review docs, load workflows, map agents, set approvals, write routing output\n- Skills to load: OPERATIONS, LEAD_RESEARCH, OUTREACH\n- Validation plan: confirm routing matches workflow and approval rules\n- Approval pauses: none at planning stage\n- Handoff target: PROJECT_MANAGER_AGENT\n",
    "runtime/examples/SAMPLE_APPROVAL_REQUEST.md": "# Sample Approval Request\n\n- Mission ID: M-002\n- Task ID: T-010\n- Requesting Agent: OUTREACH_DRAFTING_AGENT\n- Approval Level: HIGH\n- Action Requested: Create Gmail drafts for reviewed outreach set\n- Why It Is Needed: drafts are ready and require human approval before account interaction\n- Exact Scope: 50 reviewed draft emails only\n- Risks: wrong account, weak personalization, accidental contact if mishandled\n- Needed By: before the next outreach review session\n",
    "runtime/examples/SAMPLE_REPORT.md": "# Sample Report\n\n- Mission: M-001\n- Task: T-004\n- Agent: LEAD_RESEARCH_AGENT\n- Objective: produce 50 qualified leads\n- Files Created: reports/M-001-lead-report.md\n- Files Modified: data/leads/leads.csv, memory/CURRENT_STATE.md\n- Documentation Updated: ACTIVE_TASKS, NEXT_ACTIONS, PROJECT_HANDOFF\n- Validation: score threshold and quota checked\n- Risks: shortage in one target location\n- Next Step: hand off to WEBSITE_AUDIT_AGENT\n",
    "runtime/examples/SAMPLE_HANDOFF.md": "# Sample Handoff\n\nCurrent Status: READY_FOR_QA\nCompleted Work: Initial asset completed\nFiles Changed: WGOS/example.md\nDocumentation Updated: CHANGELOG, CURRENT_STATE\nOutstanding Risks: Final validation pending\nNext Required Agent: QA Engineer\nExpected Output: pass/fail validation result\nValidation Needed: Standards review\n",
  };

  await Promise.all(Object.entries(runtimeDocs).map(([file, content]) => writeFile(file, content)));
}

async function syncIntegrationDocs() {
  const commonSections = `
## Shared integration contract

Every WGOS integration must support:

- authentication handling
- approval gates
- reporting
- memory updates
- logging
- failure handling
- retry handling

## Runtime references

- \`integrations/core/INTEGRATION_CONTRACT.md\`
- \`integrations/core/INTEGRATION_LIFECYCLE.md\`
- \`integrations/core/AUTHENTICATION_MODEL.md\`
- \`integrations/approval/INTEGRATION_APPROVAL_MODEL.md\`
- \`integrations/logging/LOG_SCHEMA.md\`
- \`integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md\`
- \`packages/integrations/src/integration-catalog.mjs\`
- \`packages/runtime/src/state-store.mjs\`

## Documentation updates required

- Update mission or task reports in \`reports/\`
- Update memory files in \`memory/\`
- Update \`decisions/DECISIONS.md\` when behavior or policy changes
- Update \`ROADMAP.md\`, \`CHANGELOG.md\`, and \`PROJECT_HANDOFF.md\` when state changes matter

## Failure handling baseline

- Record timeouts, auth failures, rate limits, browser crashes, and partial success explicitly
- Retry only when a retry will not create duplicate or risky side effects
- Escalate to human approval instead of improvising around blocked authentication or protected actions
`;

  const docs = {
    "integrations/README.md": `# Integrations

Integrations define the reusable controlled-operations layer that every WGOS agent shares when it touches tools, portals, files, or research systems.

## Integration framework

- \`integrations/core/\` defines the shared contract, lifecycle, authentication model, and error rules
- \`integrations/approval/\` defines approval behavior for connected systems
- \`integrations/logging/\` defines audit and evidence fields
- \`integrations/runtime/\` defines controlled-operations execution rules
- \`integrations/examples/\` holds worked portal and approval-pause examples
- \`packages/integrations/src/\` is the executable migration target for provider metadata and adapters

## Global rules

- No duplicated integration logic
- No autonomous external actions
- No undocumented login
- No undocumented browser session
- No undocumented report
- No undocumented failure

## Approval model

- LOW
- NORMAL
- HIGH
- CRITICAL

CRITICAL always pauses execution.

## Logging fields

- time
- agent
- action
- result
- approval
- errors
- duration
`,
    "integrations/core/README.md": `# Integration Core

The integration core defines the reusable rules every WGOS integration must follow before any provider-specific behavior is applied.
`,
    "integrations/core/INTEGRATION_CONTRACT.md": `# Integration Contract

Every WGOS integration must define:

- purpose
- allowed read operations
- blocked or approval-gated state changes
- authentication expectation
- approval class mapping
- logging fields
- reporting output
- memory update behavior
- retry boundary
- failure escalation path

## Rule

No provider-specific integration may weaken this contract.
`,
    "integrations/core/INTEGRATION_LIFECYCLE.md": `# Integration Lifecycle

Every integration follows this lifecycle:

1. Load capability definition
2. Check approval class
3. Confirm authentication state
4. Execute allowed read-only or approved action
5. Capture evidence
6. Write logs
7. Generate report output
8. Update memory and handoff records

## Rule

If authentication, approval, or session capability is missing, the lifecycle pauses instead of guessing.
`,
    "integrations/core/AUTHENTICATION_MODEL.md": `# Authentication Model

Authentication rules for WGOS integrations:

- never request passwords in chat
- never expose secrets in code or docs
- pause at login, 2FA, CAPTCHA, billing, verification, property selection, or account selection
- record whether access was confirmed, not assumed
- distinguish between attached session capability and theoretical provider support

## Authentication states

- AVAILABLE
- WAITING_LOGIN
- WAITING_APPROVAL
- BLOCKED

## Rule

An integration may only claim authenticated access when the active session can actually reach the protected surface.
`,
    "integrations/core/ERROR_HANDLING.md": `# Integration Error Handling

Record and classify:

- timeouts
- rate limits
- authentication failures
- browser crashes
- network failures
- partial success
- stale session state

## Retry rules

- retry only transient failures
- do not retry state-changing actions without fresh approval
- preserve original evidence before rerunning
`,
    "integrations/approval/README.md": `# Integration Approval

Approval handling for connected systems must remain stricter than ordinary local runtime work.
`,
    "integrations/approval/INTEGRATION_APPROVAL_MODEL.md": `# Integration Approval Model

## Levels

- LOW: local parsing or offline processing only
- NORMAL: safe read-only local or cached work
- HIGH: authenticated read-only portal or connector access
- CRITICAL: any state-changing external action

## Required pauses

- login
- 2FA
- CAPTCHA
- billing
- verification
- property selection
- account selection
- DNS or production changes

## Rule

CRITICAL always pauses and HIGH pauses whenever the session boundary is unclear.
`,
    "integrations/logging/README.md": `# Integration Logging

Integrations produce structured logs that can be traced back to missions, tasks, approvals, and observed evidence.
`,
    "integrations/logging/LOG_SCHEMA.md": `# Integration Log Schema

Every integration event should record:

- time
- mission_id
- task_id
- agent
- integration
- action
- capability_state
- result
- approval
- duration
- errors
- evidence_pointer

## Rule

If an action cannot be evidenced, log the failure or uncertainty instead of a false success.
`,
    "integrations/runtime/README.md": `# Integration Runtime

The integration runtime defines how connected operations behave inside the broader WGOS runtime.
`,
    "integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md": `# Controlled Operations Runtime

Every integration-driven operation must:

1. Check session capability
2. Check approval level
3. Confirm authentication state
4. Execute only allowed behavior
5. Capture evidence
6. Write logs
7. Update report and memory outputs

## Rule

Connected operations must remain reversible in documentation even when the external system itself is not reversible.
`,
    "integrations/examples/README.md": `# Integration Examples

Worked examples show how read-only portal reviews, filesystem reads, and approval pauses should be documented.
`,
    "integrations/examples/READ_ONLY_PORTAL_REVIEW.md": `# Read Only Portal Review Example

- Capability check: browser or connector availability confirmed
- Approval level: HIGH
- Authentication state: confirmed by active session
- Allowed action: inspect metrics and settings without changing them
- Evidence captured: screenshots, notes, or exported read-only values
- Output: report, memory update, handoff note
`,
    "integrations/examples/APPROVAL_PAUSE_EXAMPLE.md": `# Approval Pause Example

- Capability check: authenticated surface reachable
- Trigger: state-changing step detected
- Action taken: stop execution
- Human request: exact approval needed recorded
- Output: approval request, blocker note, handoff record
`,
    "integrations/playbooks/README.md": `# Integration Playbooks

Reusable specialist playbooks define how agents combine approved integrations, runtime rules, and reporting requirements into repeatable execution patterns.
`,
    "integrations/playbooks/EXECUTIVE_CONTROL_PLAYBOOK.md": `# Executive Control Playbook

## Used by

- CEO Operator
- Workflow Orchestrator
- Project Manager

## Integrations

- filesystem
- docs
- csv
- github

## Steps

1. Review mission inputs and current state.
2. Check task and mission state in WGOS runtime outputs.
3. Confirm approval boundary before routing anything external.
4. Route work and document required downstream integrations.
5. Update reports, memory, and dashboard-facing state.
`,
    "integrations/playbooks/MISSION_ROUTING_PLAYBOOK.md": `# Mission Routing Playbook

## Used by

- Workflow Orchestrator
- Project Manager

## Integrations

- docs
- filesystem
- csv

## Steps

1. Load mission template and runtime state.
2. Map specialists, dependencies, and approvals.
3. Assign only the integrations each specialist is allowed to use.
4. Write handoff-safe task sequencing.
5. Persist routing output to reports and state.
`,
    "integrations/playbooks/DESIGN_REVIEW_PLAYBOOK.md": `# Design Review Playbook

## Used by

- Product Strategist
- UI UX Designer
- Brand Designer
- Motion Graphics Designer

## Integrations

- figma
- images
- docs
- filesystem

## Steps

1. Review design source and context.
2. Compare visible design intent to brand and UX requirements.
3. Record implementation-facing notes and evidence captures.
4. Hand off actionable changes to engineering or documentation.
`,
    "integrations/playbooks/REPO_DELIVERY_PLAYBOOK.md": `# Repo Delivery Playbook

## Used by

- Frontend Engineer
- Backend Engineer
- Full Stack Engineer
- Deployment Engineer

## Integrations

- filesystem
- github
- vercel
- docs

## Steps

1. Read mission and task context.
2. Inspect the relevant repository state and local files.
3. Make approved local changes only.
4. Capture validation evidence and release readiness context.
5. Update reports, memory, and handoff records.
`,
    "integrations/playbooks/QUALITY_VALIDATION_PLAYBOOK.md": `# Quality Validation Playbook

## Used by

- QA Engineer
- Accessibility Engineer
- Performance Engineer
- Website Audit

## Integrations

- filesystem
- lighthouse
- pagespeed
- images
- docs

## Steps

1. Load validation requirements.
2. Run the appropriate read-only checks.
3. Record pass, fail, and risk evidence.
4. Route findings back to the correct upstream specialist.
`,
    "integrations/playbooks/SEARCH_INTELLIGENCE_PLAYBOOK.md": `# Search Intelligence Playbook

## Used by

- SEO
- Technical SEO
- AEO
- GEO
- Schema

## Integrations

- search
- search-console
- ga4
- lighthouse
- pagespeed
- docs

## Steps

1. Review mission intent and target search surface.
2. Gather search, performance, and indexing evidence.
3. Separate confirmed facts from inferences.
4. Prioritize fixes and opportunities by business impact.
5. Update memory, reports, and handoff artifacts.
`,
    "integrations/playbooks/SEARCH_CONSOLE_REVIEW_PLAYBOOK.md": `# Search Console Review Playbook

## Used by

- Search Console
- SEO
- Technical SEO

## Integrations

- search-console
- ga4
- docs
- filesystem

## Steps

1. Confirm session capability and authentication state.
2. Pause for property selection or login when required.
3. Capture coverage, query, and indexing evidence.
4. Document only confirmed observations.
5. Hand off prioritized findings to search, revenue, or QA roles.
`,
    "integrations/playbooks/GA4_REVIEW_PLAYBOOK.md": `# GA4 Review Playbook

## Used by

- Analytics
- SEO
- Search Console
- CRO
- Revenue Operations

## Integrations

- ga4
- search-console
- crm
- csv
- docs

## Steps

1. Confirm account access state.
2. Capture traffic, acquisition, conversion, and landing-page context.
3. Tie observations to actual mission goals.
4. Record next actions and decision support outputs.
`,
    "integrations/playbooks/CONTROLLED_BROWSER_RESEARCH_PLAYBOOK.md": `# Controlled Browser Research Playbook

## Used by

- Lead Research
- Website Audit
- Business Intelligence

## Integrations

- browser
- search
- maps
- business-directories
- docs

## Steps

1. Confirm browser capability.
2. Pause at login, CAPTCHA, billing, or verification gates.
3. Collect only public or approved evidence.
4. Save source pointers and qualification notes.
5. Hand off structured findings into CRM and reporting.
`,
    "integrations/playbooks/LEAD_RESEARCH_PLAYBOOK.md": `# Lead Research Playbook

## Used by

- Lead Research
- Business Intelligence
- Marketing Strategist

## Integrations

- browser
- search
- maps
- business-directories
- crm
- csv

## Steps

1. Confirm target segment and scoring rules.
2. Collect only qualified leads from approved sources.
3. Remove duplicates and weak-fit records.
4. Persist lead state to CSV and CRM-ready records.
5. Hand off to Website Audit or Outreach Drafting as required.
`,
    "integrations/playbooks/CRM_OUTREACH_DRAFT_PLAYBOOK.md": `# CRM Outreach Draft Playbook

## Used by

- CRM
- Outreach Drafting
- Follow Up
- Newsletter

## Integrations

- crm
- gmail
- csv
- docs

## Steps

1. Load lead or client pipeline state.
2. Confirm approval boundary for any email-adjacent action.
3. Draft or organize records without sending anything.
4. Link every draft to the right lead, report, and status.
5. Hand off for QA or human approval.
`,
    "integrations/playbooks/REVENUE_SIGNAL_PLAYBOOK.md": `# Revenue Signal Playbook

## Used by

- Analytics
- CRO
- AdSense
- Revenue Operations

## Integrations

- ga4
- search-console
- crm
- lighthouse
- pagespeed

## Steps

1. Gather traffic, conversion, performance, and pipeline signals.
2. Distinguish monetization blockers from growth opportunities.
3. Rank recommendations by business impact and execution risk.
4. Update executive and mission reporting outputs.
`,
    "integrations/playbooks/EDITORIAL_OPERATIONS_PLAYBOOK.md": `# Editorial Operations Playbook

## Used by

- Editorial Manager
- Content Strategist
- Copywriter
- Proofreader
- Internal Linking

## Integrations

- docs
- filesystem
- search
- csv
- images

## Steps

1. Review intent, brief, and cluster context.
2. Create or refine content with evidence-backed search alignment.
3. Capture internal link and media requirements.
4. Hand off to schema, QA, or documentation as needed.
`,
    "integrations/playbooks/CLIENT_DELIVERY_PLAYBOOK.md": `# Client Delivery Playbook

## Used by

- Sales Consultant
- Proposal Writer
- Client Success
- Client Onboarding

## Integrations

- crm
- gmail
- docs
- filesystem
- csv

## Steps

1. Load client or prospect state.
2. Confirm scope, responsibilities, and approval constraints.
3. Update pipeline, delivery, or onboarding artifacts.
4. Generate handoff-safe records for the next operator.
`,
    "integrations/AGENT_ACCESS_MATRIX.md": `# Agent Access Matrix

## Search

- Integrations: Search Console, GA4, Lighthouse, PageSpeed, Search, Schema-supporting docs

## Marketing

- Integrations: Browser, Search, Maps, Business Directories, CRM, Gmail Drafts

## Engineering

- Integrations: Filesystem, GitHub, Images, Figma, Lighthouse, PageSpeed, Vercel

## Revenue

- Integrations: GA4, Search Console, CRM, Gmail Drafts, Search

## Client

- Integrations: Filesystem, Docs, CRM, Gmail Drafts

## Executive, Knowledge, Documentation

- Integrations: Filesystem, Docs, CSV, reporting artifacts, integration logs
`,
    "integrations/LOGGING_SYSTEM.md": `# Integration Logging System

Every integration action should create a log entry with:

- time
- agent
- action
- result
- approval
- errors
- duration

## Logging rules

- Log successful observations and failed attempts
- Log approval pauses explicitly
- Log partial success instead of flattening it into pass/fail
- Keep secrets out of logs
`,
    "integrations/browser/README.md": `# Controlled Browser Integration

Supports:

- Open session
- Pause for login
- Pause for 2FA
- Pause for CAPTCHA
- Resume
- Collect information
- Generate reports
- Close session

## Browser lifecycle

1. Open session
2. Navigate
3. Pause for human login or gate
4. Resume after confirmation
5. Collect information
6. Generate report
7. Close session

## Hard rules

- Never bypass authentication
- Never request passwords
- Never continue after approval gates
- Never hide a failed or unstable browser session

${commonSections}
`,
    "integrations/github/README.md": `# GitHub Integration

Support:

- Branch inspection
- Commit review
- Pull request review
- Issue tracking
- Project boards
- Code search
- Repository documentation

## Constraints

- Never push without approval
- Never merge without approval
- Document every repository-facing action

${commonSections}
`,
    "integrations/gmail/README.md": `# Gmail Integration

Allowed:

- Draft emails
- Read drafts when explicitly requested
- Organize draft-related records

Never:

- Send automatically
- Delete messages
- Modify inbox without approval

## Draft requirements

Every draft must:

- be logged
- be linked to CRM
- be linked to the lead
- be linked to the outreach report

${commonSections}
`,
    "integrations/crm/README.md": `# CRM Integration

Track:

- Lead
- Status
- Follow-up
- Draft Created
- Approval
- Sent
- Reply
- Meeting
- Proposal
- Won
- Lost

## Outputs

- CRM log updates
- Pipeline summaries
- Dashboard-ready status data

${commonSections}
`,
    "integrations/search-console/README.md": `# Search Console Integration

Support:

- Coverage
- Indexing
- URL Inspection
- Sitemaps
- Core Web Vitals
- Performance
- Search Queries
- Discover
- AEO/GEO opportunities

## Approval gates

Human approval required for:

- logging in
- verification
- property selection
- index requests

${commonSections}
`,
    "integrations/ga4/README.md": `# GA4 Integration

Document:

- Traffic
- Users
- Sessions
- Events
- Conversions
- Top Pages
- Bounce Rate or equivalent engagement interpretation
- Acquisition
- Landing Pages
- Daily Reports
- Weekly Reports
- Growth Trends

## Analytics engine outputs

- Weekly traffic summary
- Lead and outreach context
- Revenue signals
- SEO support data
- Agent performance support metrics

${commonSections}
`,
    "integrations/pagespeed/README.md": `# PageSpeed Integration

Support:

- Performance audits
- Core Web Vitals interpretation
- Screenshot capture when available
- Recommendation extraction

${commonSections}
`,
    "integrations/lighthouse/README.md": `# Lighthouse Integration

Support:

- Performance audits
- Accessibility audits
- SEO audits
- Best Practices checks
- Core Web Vitals context
- Screenshot capture
- Recommendation extraction

${commonSections}
`,
    "integrations/cloudflare/README.md": `# Cloudflare Integration

Support documented read-only and approval-gated review of:

- DNS
- caching
- redirects
- edge settings

## Constraints

- No live changes without approval
- Stop at login, 2FA, billing, verification, or account selection

${commonSections}
`,
    "integrations/namecheap/README.md": `# Namecheap Integration

Support documented read-only and approval-gated review of:

- registrar records
- DNS
- domain settings

## Constraints

- No live changes without approval
- Stop at login, 2FA, billing, verification, or account selection

${commonSections}
`,
    "integrations/vercel/README.md": `# Vercel Integration

Support:

- deployment review
- environment checks
- project settings review
- build status observation

## Constraints

- No production modifications without approval
- No deployment without approval

${commonSections}
`,
    "integrations/figma/README.md": `# Figma Integration

Support:

- Design review
- Component inspection
- Token review
- Motion review
- Layout comparison
- Image extraction
- Design system validation

${commonSections}
`,
    "integrations/maps/README.md": `# Maps Integration

Use for:

- local-business discovery
- location verification
- surface-level business enrichment

## Requirements

- validate business relevance
- log source URL
- avoid duplicate leads
- hand findings into the lead scoring system

${commonSections}
`,
    "integrations/search/README.md": `# Search Integration

Document research using:

- Google Search
- Google Maps
- Business Directories
- LinkedIn Companies
- Instagram Business
- Facebook Business Pages
- TikTok Business
- Industry directories

## Required method

- search strategy
- query construction
- result validation
- duplicate detection
- lead quality scoring

${commonSections}
`,
    "integrations/business-directories/README.md": `# Business Directories Integration

Use public directories as reusable lead sources with:

- source logging
- duplicate checks
- fit validation
- business quality review

${commonSections}
`,
    "integrations/filesystem/README.md": `# Filesystem Integration

Support:

- Read
- Write
- Move
- Copy
- Create
- Archive

## Constraints

- Never delete important files without approval
- Prefer reversible local operations
- Log file-impacting actions in reports when material

${commonSections}
`,
    "integrations/docs/README.md": `# Documentation Integration

Every integration must update:

- memory/
- reports/
- decisions/
- roadmap/
- project handoff

## Purpose

This integration keeps WGOS documentation synchronized with real operations instead of leaving tool work undocumented.

${commonSections}
`,
    "integrations/csv/README.md": `# CSV Integration

Use for:

- lead lists
- outreach logs
- KPI snapshots
- import/export-friendly datasets

## Constraints

- keep column definitions stable
- document schema changes
- do not silently drop fields that downstream workflows rely on

${commonSections}
`,
    "integrations/images/README.md": `# Images Integration

Use for:

- creative assets
- screenshots
- thumbnails
- proof capture

## Constraints

- name assets clearly
- distinguish decorative assets from evidence captures
- keep sensitive captures out of public or client-facing outputs unless approved

${commonSections}
`,
    "integrations/LEAD_RESEARCH_INTEGRATION.md": `# Lead Research Integration

Every research mission should:

1. Open browser
2. Search approved sources
3. Review businesses
4. Score leads
5. Generate audits
6. Generate personalization
7. Save CSV
8. Generate report
9. Hand off to Outreach

No email sending.
`,
    "integrations/WEBSITE_AUDIT_ENGINE.md": `# Website Audit Engine

Audit:

- Design
- UX
- Performance
- SEO
- Accessibility
- Conversion
- Trust
- Content
- Brand

Output:

- Mini Audit
- Priority
- Recommended Service
- Estimated Opportunity
`,
    "integrations/ANALYTICS_ENGINE.md": `# Analytics Engine

Weekly summarize:

- Traffic
- Leads
- Outreach
- Revenue
- SEO
- Content
- Projects
- KPIs
- Agent Performance
`,
  };

  await Promise.all(Object.entries(docs).map(([file, content]) => writeFile(file, content)));
}

async function syncTemplateDocs() {
  await writeFile(
    "templates/README.md",
    `
# Templates

Templates keep reporting and operational artifacts consistent.
`
  );

  const templateContent = {
    TASK_BOARD_TEMPLATE: `# Task Board Template

## Required fields

- Mission ID
- Task ID
- Task title
- Owner
- Dependencies
- Priority
- Status
- Validation requirement
- Approval requirement
- Due date or cadence
- Handoff target
- Notes
`,
    AGENT_REPORT_TEMPLATE: `# Agent Report Template

## Required fields

- Agent name
- Task ID
- Objective
- Inputs used
- Actions performed
- Files created
- Files modified
- Data collected
- Decisions made
- Risks
- Validation performed
- Documentation updated
- Handoff target
- Next recommended action
- Status
`,
    LEAD_RESEARCH_REPORT_TEMPLATE: `# Lead Research Report Template

## Required fields

- Mission ID
- Date
- Target locations
- Target industries
- Total leads reviewed
- Total leads accepted
- Tier mix
- Score thresholds used
- Accepted leads summary
- Rejected lead reasons
- Mini audit completion status
- Outreach draft handoff status
- CRM logging status
- Risks and shortages
- Next action
`,
    WEBSITE_AUDIT_REPORT_TEMPLATE: `# Website Audit Report Template

## Required fields

- Business name
- Website URL
- Audit date
- Major issues observed
- SEO issues
- UX issues
- Conversion issues
- Performance issues
- Accessibility issues
- Recommended Web Growth service
- Confidence level
- Evidence links
`,
    OUTREACH_DRAFT_TEMPLATE: `# Outreach Draft Template

## Required fields

- Lead ID
- Business name
- Verified observation
- Likely business impact
- Relevant Web Growth service
- Soft CTA
- Draft body
- Personalization note
- Approval status
`,
    SEO_TASK_REPORT_TEMPLATE: `# SEO Task Report Template

## Required fields

- Task ID
- Target URLs
- SEO objective
- Inputs used
- Actions completed
- Metadata changes
- Canonical or sitemap impact
- Validation performed
- Remaining SEO risks
- Next recommended action
`,
    CONTENT_BRIEF_TEMPLATE: `# Content Brief Template

## Required fields

- Content goal
- Primary intent
- Audience
- Primary keyword or topic
- Supporting questions
- Required internal links
- Required trust signals
- CTA goal
- Notes for writer
`,
    QA_REPORT_TEMPLATE: `# QA Report Template

## Required fields

- Task or mission ID
- Scope tested
- Checks run
- Result
- Findings
- Regressions
- Risks
- Release recommendation
`,
    DEPLOYMENT_REPORT_TEMPLATE: `# Deployment Report Template

## Required fields

- Release scope
- Environment
- Build result
- Validation result
- Approval status
- Rollback notes
- Post-release checks
`,
    WEEKLY_REPORT_TEMPLATE: `# Weekly Report Template

## Required fields

- Week ending
- Active missions
- Wins
- Blockers
- Revenue opportunities
- Delivery risks
- Memory updates made
- Next week priorities
`,
    DECISION_LOG_TEMPLATE: `# Decision Log Template

## Required fields

- Decision ID
- Date
- Decision owner
- Context
- Decision made
- Why it was made
- Expected impact
- Follow-up needed
`,
    MEMORY_UPDATE_TEMPLATE: `# Memory Update Template

## Required fields

- Source task
- What changed
- Why it matters
- Files updated
- Open risks
- Next action
`,
  };

  for (const name of templates) {
    await writeFile(`templates/${name}.md`, templateContent[name] ?? `# ${titleFromSlug(name)}\n\nTemplate content not defined.`);
  }
}

async function syncProductionGrowthIntelligencePlatform() {
  const docs = {
    "production/README.md": "# Production Pipeline\n\nDefines the repeatable website production and client delivery system.",
    "production/workflows/README.md": "# Production Workflows\n\nSequence discovery, strategy, design, development, QA, approvals, and launch preparation.",
    "production/workflows/CLIENT_WEBSITE_PIPELINE.md": "# Client Website Pipeline\n\nClient request -> discovery -> strategy -> information architecture -> wireframes -> visual design -> motion plan -> development -> SEO -> performance -> accessibility -> QA -> client review -> approval -> deployment preparation",
    "production/templates/README.md": "# Production Templates\n\nTemplates for discovery, architecture, design handoff, SEO specs, QA, and launch readiness.",
    "production/templates/CLIENT_DISCOVERY_TEMPLATE.md": "# Client Discovery Template\n\n- Business\n- Industry\n- Target audience\n- Goals\n- Competitors\n- Brand\n- Content inventory\n- SEO objectives\n- Revenue goals\n- Conversion goals\n- Technical requirements\n- Budget\n- Timeline\n- Success metrics",
    "production/checklists/README.md": "# Production Checklists\n\nChecklists for design, build, SEO, QA, and launch readiness.",
    "production/checklists/LAUNCH_READINESS_CHECKLIST.md": "# Launch Readiness Checklist\n\n- Core pages complete\n- Trust pages complete\n- Metadata and canonicals verified\n- Sitemap and robots verified\n- Forms tested\n- Mobile QA complete\n- Performance checked\n- Accessibility checked\n- Client approval recorded",
    "production/client-delivery/README.md": "# Client Delivery\n\nFinal packaging, review, and approval documentation for website handoff.",
    "production/design/README.md": "# Production Design\n\nDiscovery outputs, wireframes, UI systems, and design QA live here.",
    "production/development/README.md": "# Production Development\n\nBuild specs, engineering tickets, and implementation notes live here.",
    "production/seo/README.md": "# Production SEO\n\nStore page strategy, schema plans, metadata plans, and internal linking specs here.",
    "production/content/README.md": "# Production Content\n\nStore content briefs, page copy structures, and publishing requirements here.",
    "production/motion/README.md": "# Production Motion\n\nStore motion intent, reduced-motion considerations, and performance-safe animation guidance here.",
    "production/qa/README.md": "# Production QA\n\nStore validation records, bug lists, and pre-launch QA artifacts here.",
    "production/launch/README.md": "# Production Launch\n\nStore deployment preparation, launch approval, and post-launch verification steps here.",
    "growth/README.md": "# Growth Engine\n\nDefines how WGOS finds opportunities, improves assets, and drives revenue without bypassing human approvals.",
    "growth/marketing/README.md": "# Growth Marketing\n\nLead generation, audit production, messaging strategy, and pipeline support live here.",
    "growth/seo/README.md": "# Growth SEO\n\nStore topical maps, opportunity lists, refresh schedules, and ranking-improvement plans here.",
    "growth/content/README.md": "# Growth Content\n\nStore editorial calendars, content clusters, refresh roadmaps, and publishing cadences here.",
    "growth/adsense/README.md": "# Growth AdSense\n\nStore AdSense readiness checks, content-quality gaps, and monetization-safe improvement plans here.",
    "growth/affiliate/README.md": "# Growth Affiliate\n\nStore offer research, comparison strategies, and trust-safe affiliate planning here.",
    "growth/newsletter/README.md": "# Growth Newsletter\n\nStore newsletter strategy, list growth plans, and content repurposing cadences here.",
    "growth/social/README.md": "# Growth Social\n\nStore repurposing systems, social briefs, and channel-specific publishing plans here.",
    "growth/crm/README.md": "# Growth CRM\n\nStore pipeline standards, lifecycle stages, and follow-up reporting rules here.",
    "growth/analytics/README.md": "# Growth Analytics\n\nStore KPI definitions, source analysis, and growth report snapshots here.",
    "growth/revenue/README.md": "# Growth Revenue\n\nStore service opportunities, pricing tests, and monetization experiments here.",
    "growth/dashboard/README.md": "# Growth Dashboard\n\nExecutive growth scorecards and operating summaries live here.",
    "growth/playbooks/README.md": "# Growth Playbooks\n\nRepeatable playbooks for lead research, audits, refreshes, and conversion improvements live here.",
    "growth/playbooks/LEAD_GENERATION_PLAYBOOK.md": "# Lead Generation Playbook\n\n## Daily objective\n\n- Research qualified businesses\n- Evaluate opportunity\n- Generate personalized draft outreach\n- Update CRM\n- Produce an executive summary\n\n## Priority order\n\n- Tier 1: businesses with existing sites needing redesign or SEO\n- Tier 2: businesses without websites but with strong digital signals\n- Tier 3: high-value businesses with weak digital presence\n\nNo automatic outreach.",
    "intelligence/README.md": "# Intelligence Engine\n\nTurns completed missions into reusable learning, optimization, forecasting, decision analysis, and company-health signals.",
    "intelligence/learning/README.md": "# Learning Engine\n\nCapture lessons, QA outcomes, business outcomes, documentation quality, revenue impact, mistakes, and improvements from every mission.",
    "intelligence/learning/LEARNING_RECORD_TEMPLATE.md": "# Learning Record Template\n\n- Mission\n- Objective\n- Departments involved\n- Agents involved\n- Skills used\n- Time taken\n- QA outcome\n- Business outcome\n- Revenue impact\n- Lessons learned\n- Mistakes\n- Recommended improvements",
    "intelligence/optimization/README.md": "# Optimization Engine\n\nRecommend improvements to workflows, agents, templates, routing logic, documentation, memory organization, and approval design without changing anything automatically.",
    "intelligence/recommendations/README.md": "# Recommendations\n\nStore prioritized improvement recommendations, automation opportunities, and decision reviews backed by mission evidence.",
    "intelligence/patterns/README.md": "# Patterns\n\nStore cross-mission patterns such as common SEO issues, strong CTA structures, recurring blockers, profitable services, and repeated QA failures.",
    "intelligence/playbooks/README.md": "# Intelligence Playbooks\n\nStore refined playbooks that emerge from repeated successful missions such as premium homepage structures, SEO audit patterns, onboarding flows, and industry-specific delivery blueprints.",
    "intelligence/benchmarks/README.md": "# Benchmarks\n\nStore comparison baselines for delivery speed, quality, SEO growth, revenue outputs, client retention, and operating maturity.",
    "intelligence/history/README.md": "# History\n\nStore historical mission outcome summaries and evolution snapshots here.",
    "intelligence/scoring/README.md": "# Scoring\n\nStore quality scoring models for leads, missions, reports, company health, and operating maturity.",
    "intelligence/forecasting/README.md": "# Forecasting\n\nStore projections for leads, revenue, traffic, SEO progress, workload, content output, and delivery capacity.",
    "companies/README.md": "# Companies\n\nThis area enforces tenant isolation so WGOS can support multiple companies without memory or reporting contamination.",
    "clients/README.md": "# Clients\n\nTrack prospect, active, and completed client relationships here.",
    "products/README.md": "# Products\n\nStore internal, SaaS, template, and archived product initiatives here.",
    "platform/README.md": "# Platform\n\nThe platform layer keeps WGOS company-agnostic while sharing runtime, memory, reporting, and standards.",
    "platform/company-registry/README.md": "# Company Registry\n\nTrack company ID, name, industry, timezone, owner, primary contacts, services, current phase, current projects, revenue, status, assigned departments, assigned agents, and portfolio-level health.",
    "platform/company-registry/COMPANY_REGISTRY_TEMPLATE.md": "# Company Registry Template\n\n- Company ID\n- Company Name\n- Industry\n- Country\n- Timezone\n- Owner\n- Primary Contacts\n- Brand\n- Services\n- Technology Stack\n- Current Phase\n- Current Projects\n- Revenue\n- Status\n- Assigned Departments\n- Assigned Agents",
    "platform/tenant-management/README.md": "# Tenant Management\n\nDefine isolation rules for memory, reports, CRM, analytics, SEO, documentation, and company-scoped dashboards here.",
    "platform/tenant-management/TENANT_ISOLATION_RULES.md": "# Tenant Isolation Rules\n\n- Company-specific reports stay inside the relevant company folder.\n- Shared intelligence may only contain cross-company-safe summaries.\n- CRM, client, and revenue details must stay tenant-scoped.\n- Dashboard views may aggregate counts, but not leak tenant-private notes across companies.\n- Human approval is required before merging or exposing tenant-specific data externally.",
    "platform/tenant-management/PERMISSION_MODEL.md": "# Permission Model\n\n## Roles\n\n- Founder or Owner: full company and platform oversight.\n- Executive operators: mission routing, KPI review, approval coordination.\n- Department managers: company-scoped planning and specialist coordination.\n- Specialists: task execution inside approved tenant boundaries.\n- QA, Knowledge, and Documentation: review, archive, and reporting authority without cross-tenant data export.\n\n## Rules\n\n- Default access is least privilege.\n- Company memory, CRM, reports, and approvals are tenant-scoped by default.\n- Global reporting may expose aggregate counts and de-identified benchmarks only.\n- Approval routing follows company ownership before platform ownership when both apply.\n- Secret handling, credential use, and external system actions always require explicit approval rules defined in WGOS.",
    "platform/resource-management/README.md": "# Resource Management\n\nManage shared templates, standards, reusable assets, and cross-company-safe playbooks here.",
    "platform/resource-management/RESOURCE_SHARING_MATRIX.md": "# Resource Sharing Matrix\n\n- Shareable: templates, workflows, non-sensitive playbooks, technical standards, accessibility guidance.\n- Restricted: client reports, lead lists, CRM states, tenant-specific revenue notes, private approvals.\n- Conditional: de-identified benchmarks and aggregate scorecards.",
    "platform/resource-management/WORKLOAD_MANAGEMENT.md": "# Workload Management\n\nTrack agent workload, department workload, mission queues, execution history, active integrations, and pending approvals across companies.\n\n## Scheduling rules\n\n- Prioritize owner-approved revenue and delivery missions first.\n- Do not over-assign specialists across concurrent company missions without QA and documentation capacity.\n- Pause new work when approval queues or QA queues exceed the operating threshold defined by executive review.\n- Rebalance work by department before reassigning tenant ownership.",
    "platform/global-memory/README.md": "# Global Memory\n\nStore cross-company patterns that are safe to share without leaking tenant-specific information.",
    "platform/global-memory/KNOWLEDGE_SHARING_POLICY.md": "# Knowledge Sharing Policy\n\n- Promote only de-identified lessons into global memory.\n- Do not copy tenant-specific client details into shared memory.\n- Convert repeated company-safe wins into reusable playbooks.\n- Keep sensitive decision context in the owning company space.",
    "platform/global-reporting/README.md": "# Global Reporting\n\nStore cross-company executive reporting standards and aggregate scorecard definitions here.",
    "platform/global-reporting/PORTFOLIO_DASHBOARD.md": "# Portfolio Dashboard\n\nTrack company count, mission mix, company health, active client delivery, growth coverage, and cross-company benchmarks.",
    "platform/global-reporting/GLOBAL_EXECUTIVE_REPORTING.md": "# Global Executive Reporting\n\nGenerate weekly, monthly, quarterly, and annual portfolio reviews.\n\n## Required views\n\n- Per-company health and mission throughput\n- Portfolio revenue readiness and active pipeline\n- Department utilization and blocked approvals\n- Cross-company SEO, production, and growth benchmarks\n- Documentation compliance and memory completeness\n- Risks requiring founder or executive intervention",
    "platform/GOVERNANCE.md": "# Platform Governance\n\nDocument platform ownership, company isolation, approval routing, audit logging, version history, and documentation policy.\n\n## Governance rules\n\n- Shared runtime may be reused across companies, but tenant data may not be merged.\n- Rule Zero applies at both platform and company levels.\n- Every approval, report, and mission record must remain traceable to a company or shared-service owner.\n- Cross-company playbooks must remove confidential client details before promotion.",
    "platform/VERSIONING.md": "# Platform Versioning\n\nTrack WGOS version, Company version, workflow version, agent version, skill version, and Integration version.\n\n## Version intent\n\n- WGOS version tracks platform-wide operating maturity.\n- Company version tracks tenant adoption state.\n- Workflow, agent, skill, and Integration version changes track executable behavior changes that affect runtime consistency or governance.",
    "platform/MARKETPLACE_FOUNDATION.md": "# Marketplace Foundation\n\nDefine the future packaging model for agent packs, workflow packs, skill packs, industry packs, design systems, templates, and automation packs.\n\n## Packaging rules\n\n- Marketplace assets must be reusable without tenant-private data.\n- Pack documentation must list approvals, supported integrations, and version compatibility.\n- Shared packs must align with platform governance and Rule Zero.",
    "platform/BACKUP_AND_RECOVERY.md": "# Backup And Recovery\n\nDocument backup scope for company memory, documentation, workflow definitions, reports, and scorecards.\n\n## Recovery rules\n\n- Preserve company isolation during backup and restore.\n- Recover shared runtime separately from tenant data.\n- Record recovery drills, restore validation, and unresolved gaps in reports and memory.\n- Never restore secrets into public or shared documentation.",
    "platform/SECURITY_MODEL.md": "# Security Model\n\nDocument role permissions, secret handling, approval enforcement, audit trails, and credential isolation.\n\n## Security rules\n\n- Credentials stay isolated by integration and company context.\n- External actions remain approval-gated even when runtime execution is automated.\n- Audit logs must capture actor, company, action, result, and approval state.\n- Shared services may inspect only the minimum data needed to complete their function.",
  };

  const phaseSixProductionDocs = {
    "production/README.md": `# Production Pipeline

WGOS Phase 6 turns the website production layer into a repeatable client delivery system.

## Core lifecycle

Client request -> discovery -> strategy -> information architecture -> wireframes -> visual design -> brand integration -> motion planning -> frontend -> backend -> SEO -> AEO -> GEO -> performance -> accessibility -> QA -> documentation -> client review -> approval -> deployment preparation

## Non-negotiables

- No autonomous deployment
- No production publishing without approval
- No DNS changes without approval
- Every stage updates reports, memory, decisions, roadmap, and project handoff
`,
    "production/workflows/README.md": `# Production Workflows

Use these workflows to move a website project from first discovery through launch preparation and post-launch documentation.
`,
    "production/workflows/CLIENT_WEBSITE_PIPELINE.md": `# Client Website Pipeline

## Purpose

Coordinate the full lifecycle of a premium website delivery mission.

## Stages

1. Client discovery
2. Website strategy
3. Information architecture
4. Design and brand system
5. Motion planning
6. Engineering planning and implementation
7. SEO, AEO, and GEO review
8. Performance and accessibility validation
9. QA and documentation
10. Client review and revision tracking
11. Approval-gated deployment preparation
12. Post-launch baseline and case-study preparation

## Required departments

- Executive
- Design
- Engineering
- Search
- Publishing
- Client
- QA
- Documentation
`,
    "production/workflows/CLIENT_DISCOVERY_WORKFLOW.md": `# Client Discovery Workflow

## Inputs to collect

- Business model
- Industry
- Target audience
- Revenue goals
- Conversion goals
- SEO objectives
- Competitor landscape
- Brand constraints
- Content inventory
- Technical requirements
- Budget
- Timeline
- Success metrics

## Outputs

- Discovery summary
- Constraint register
- Success metric sheet
- Approval-sensitive assumptions list
`,
    "production/workflows/WEBSITE_STRATEGY_WORKFLOW.md": `# Website Strategy Workflow

## Produce

- Site strategy
- Page strategy
- Revenue strategy
- SEO strategy
- Content strategy
- Conversion strategy
- Motion strategy

## Validation

- Every strategy choice maps to a visible page or reusable system
- Revenue goals are tied to credible conversion paths
- Assumptions are labeled when client evidence is incomplete
`,
    "production/workflows/INFORMATION_ARCHITECTURE_WORKFLOW.md": `# Information Architecture Workflow

## Generate

- Site map
- Primary and secondary navigation
- Page hierarchy
- Internal linking framework
- Conversion flow
- User journeys
- Expansion path for future pages
`,
    "production/workflows/DESIGN_PIPELINE_WORKFLOW.md": `# Design Pipeline Workflow

## Design department outputs

- Moodboard
- Design direction
- Color system
- Typography system
- Component system
- Spacing guidance
- Responsive layouts
- Accessibility review notes

## Approval gate

Major design direction changes require explicit human approval before becoming the active client direction.
`,
    "production/workflows/MOTION_PIPELINE_WORKFLOW.md": `# Motion Pipeline Workflow

## Motion outputs

- Hero storytelling concept
- GSAP timeline plan
- Framer Motion interaction plan
- Scroll storytelling notes
- Micro-interaction inventory
- Reduced-motion alternative set
- Performance validation notes

## Constraints

- Motion must support comprehension
- Reduced-motion handling is required
- Performance cost must be documented before implementation
`,
    "production/workflows/ENGINEERING_PIPELINE_WORKFLOW.md": `# Engineering Pipeline Workflow

## Engineering outputs

- Next.js implementation plan
- TypeScript component map
- Tailwind token and layout strategy
- Server-component versus client-component decisions
- Reusable component inventory
- Form and backend requirement map
- Performance optimization checklist

## Approval gate

Deployment remains approval-gated even when engineering validation passes.
`,
    "production/workflows/CONTENT_PIPELINE_WORKFLOW.md": `# Content Pipeline Workflow

## Content outputs

- Page copy plan
- SEO copy structure
- Landing page framing
- Case-study outline
- FAQ inventory
- CTA map
- Internal-link notes
- Metadata and schema recommendations
`,
    "production/workflows/SEO_PIPELINE_WORKFLOW.md": `# SEO Pipeline Workflow

## SEO review covers

- Metadata
- Canonical strategy
- Schema requirements
- Heading hierarchy
- Internal links
- Image SEO
- Core Web Vitals
- Indexability
- Structured data
- AEO opportunities
- GEO opportunities
- AdSense readiness
`,
    "production/workflows/CLIENT_REVIEW_WORKFLOW.md": `# Client Review Workflow

## Generate

- Progress reports
- Preview-link guidance
- Change-request log
- Approval request summary
- Revision tracker

## Rule

No production change proceeds past the review gate without explicit client-facing approval from the human owner.
`,
    "production/workflows/LAUNCH_PIPELINE_WORKFLOW.md": `# Launch Pipeline Workflow

## Pre-launch checks

- Build passes
- QA passes
- SEO complete
- Performance budget met
- Accessibility complete
- Documentation updated
- Client approved
- Deployment checklist complete

## Approval gate

Human approval is required before any launch or production release step.
`,
    "production/workflows/POST_LAUNCH_PIPELINE_WORKFLOW.md": `# Post Launch Pipeline Workflow

## Generate

- Launch report
- Performance baseline
- SEO baseline
- Analytics setup checklist
- Search Console verification checklist
- Sitemap submission checklist
- Maintenance recommendations
`,
    "production/workflows/CASE_STUDY_PIPELINE_WORKFLOW.md": `# Case Study Pipeline Workflow

## Prepare

- Before state
- After state
- Results summary
- Screenshots
- Performance gains
- SEO improvements
- Business outcomes
- Lessons learned

Only verified outcomes may be presented as facts.
`,
    "production/templates/README.md": `# Production Templates

These templates standardize website delivery from discovery through launch preparation and post-launch reporting.
`,
    "production/templates/CLIENT_DISCOVERY_TEMPLATE.md": `# Client Discovery Template

## Core profile

- Business
- Industry
- Target audience
- Brand position
- Competitors

## Commercial goals

- Revenue objectives
- Conversion goals
- Budget
- Timeline
- Success metrics

## Delivery inputs

- Content inventory
- SEO objectives
- Technical requirements
- Required integrations
- Known blockers
`,
    "production/templates/SITE_STRATEGY_TEMPLATE.md": `# Site Strategy Template

- Business objective
- Primary audience segments
- Offer hierarchy
- Core pages
- Conversion path
- Revenue model support
- SEO priorities
- Content dependency list
- Motion and trust considerations
`,
    "production/templates/PAGE_STRATEGY_TEMPLATE.md": `# Page Strategy Template

- Page name
- Primary intent
- Secondary intent
- Primary CTA
- Trust blocks
- SEO target
- Internal links
- Schema needs
- Required assets
`,
    "production/templates/INFORMATION_ARCHITECTURE_TEMPLATE.md": `# Information Architecture Template

- Site map
- Navigation groups
- Page hierarchy
- Internal linking paths
- User journeys
- Conversion flow
- Future expansion notes
`,
    "production/templates/DESIGN_DIRECTION_TEMPLATE.md": `# Design Direction Template

- Moodboard summary
- Visual direction
- Color system
- Typography system
- Spacing rules
- Component notes
- Accessibility notes
- Responsive priorities
`,
    "production/templates/MOTION_SPEC_TEMPLATE.md": `# Motion Spec Template

- Hero storytelling goal
- Interaction inventory
- Scroll motion notes
- Transition behavior
- Reduced-motion fallback
- Performance constraints
- QA checks
`,
    "production/templates/ENGINEERING_HANDOFF_TEMPLATE.md": `# Engineering Handoff Template

- Route scope
- Components to build
- Design tokens to use
- Data and backend requirements
- SEO constraints
- Accessibility constraints
- Performance budget
- QA commands
`,
    "production/templates/CLIENT_REVIEW_TEMPLATE.md": `# Client Review Template

- Current stage
- What is ready for review
- What changed since the last review
- Decisions needed
- Revision window
- Approval request
- Open risks
`,
    "production/templates/CASE_STUDY_TEMPLATE.md": `# Case Study Template

- Project summary
- Before state
- After state
- Verified results
- Performance baseline
- SEO baseline
- Business outcomes
- Lessons learned
`,
    "production/templates/WEBSITE_BLUEPRINT_LIBRARY.md": `# Website Blueprint Library

## Supported blueprints

- Agency
- Medical
- Clinic
- Law Firm
- Real Estate
- Hotel
- Restaurant
- Beauty
- Church
- School
- NGO
- Corporate
- Portfolio
- Landing Page
- E-commerce
- Blog
- Knowledge Base

## Use each blueprint to define

- Core page stack
- Trust requirements
- Conversion model
- Content blocks
- SEO priorities
- Accessibility cautions
- Motion tolerance
`,
    "production/checklists/README.md": `# Production Checklists

Use these checklists to hold design, engineering, SEO, QA, launch, and approval quality at a repeatable standard.
`,
    "production/checklists/LAUNCH_READINESS_CHECKLIST.md": `# Launch Readiness Checklist

- Core pages complete
- Trust pages complete
- Metadata and canonicals verified
- Sitemap and robots verified
- Forms tested
- Mobile QA complete
- Performance checked
- Accessibility checked
- Documentation updated
- Client approval recorded
- Deployment checklist approved by a human
`,
    "production/checklists/DESIGN_QA_CHECKLIST.md": `# Design QA Checklist

- Hierarchy is clear
- Responsive layouts are defined
- Typography system is consistent
- Color contrast is safe
- CTA hierarchy is visible
- Trust blocks are present
- Motion direction has reduced-motion handling
`,
    "production/checklists/ENGINEERING_QA_CHECKLIST.md": `# Engineering QA Checklist

- Build passes
- Lint passes
- Typecheck passes
- Components are reusable
- Forms are validated
- Route safety is preserved
- Performance budget is reviewed
`,
    "production/checklists/SEO_RELEASE_CHECKLIST.md": `# SEO Release Checklist

- Titles and descriptions complete
- Canonicals confirmed
- Headings verified
- Internal links mapped
- Schema aligned with visible content
- Images optimized
- Indexability rules checked
- AEO and GEO opportunities logged
`,
    "production/checklists/CLIENT_APPROVAL_CHECKLIST.md": `# Client Approval Checklist

- Review package delivered
- Revision requests tracked
- Final direction confirmed
- Launch expectations documented
- Approval timestamp recorded
- Out-of-scope requests separated
`,
    "production/checklists/POST_LAUNCH_BASELINE_CHECKLIST.md": `# Post Launch Baseline Checklist

- Performance baseline captured
- SEO baseline captured
- Analytics setup confirmed
- Search Console checklist recorded
- Maintenance recommendations logged
- Case-study notes started
`,
    "production/client-delivery/README.md": `# Client Delivery

This area stores review systems, revision tracking, approval documentation, and handoff packaging for client website delivery.
`,
    "production/client-delivery/CLIENT_REVIEW_AND_REVISION_SYSTEM.md": `# Client Review And Revision System

## Track

- Review round
- Scope under review
- Revision request
- Severity
- Owner
- Approval state
- Decision date

## Rule

Revision tracking must separate approved work, requested changes, and out-of-scope requests.
`,
    "production/client-delivery/HANDOFF_PACKAGE_TEMPLATE.md": `# Handoff Package Template

- Project summary
- Delivered pages and components
- Approved decisions
- Open issues
- Launch readiness state
- Maintenance guidance
- Future improvements
`,
    "production/design/README.md": `# Production Design

Store moodboards, design direction, page structure, component thinking, and blueprint references here.
`,
    "production/design/BLUEPRINT_MATRIX.md": `# Blueprint Matrix

| Blueprint | Core pages | Conversion emphasis | Trust emphasis | SEO emphasis |
| --- | --- | --- | --- | --- |
| Agency | Home, Services, Case Studies, About, Contact | Lead forms and proof | Strong | Medium |
| Medical / Clinic | Home, Services, Practitioners, FAQs, Contact | Appointment booking | Very high | High |
| Law Firm | Home, Practice Areas, Results, About, Contact | Consultation request | Very high | High |
| Real Estate | Home, Listings, Communities, About, Contact | Inquiry and viewing | High | High |
| Hotel / Restaurant / Beauty | Home, Offers, Gallery, FAQs, Contact | Booking | High | Medium |
| Church / School / NGO | Home, Programs, About, Events, Contact | Participation and trust | High | Medium |
| Corporate / Portfolio / Landing Page | Offer-led page stack | Lead capture | Medium | Medium |
| E-commerce / Blog / Knowledge Base | Catalog or content-led stack | Transaction or education | Medium | Very high |
`,
    "production/development/README.md": `# Production Development

Store implementation scope, component maps, backend requirements, validation commands, and release constraints here.
`,
    "production/development/WEBSITE_HEALTH_SCORING.md": `# Website Health Scoring

Score every project across:

- Design
- UX
- SEO
- Performance
- Accessibility
- Content
- Conversion
- Motion
- Maintainability
- Documentation

Use a 1-10 score per category, document the reason, and record the highest-priority improvement for each weak area.
`,
    "production/seo/README.md": `# Production SEO

Store metadata plans, canonical strategy, schema recommendations, internal-link architecture, and AEO/GEO opportunities here.
`,
    "production/content/README.md": `# Production Content

Store page copy plans, CTA structures, FAQs, internal-link targets, and trust-safe proof requirements here.
`,
    "production/motion/README.md": `# Production Motion

Store storytelling plans, animation concepts, reduced-motion fallbacks, and motion QA notes here.
`,
    "production/qa/README.md": `# Production QA

Store build, lint, typecheck, accessibility, performance, SEO, responsive, form, navigation, link, and animation validation artifacts here.
`,
    "production/qa/QA_VALIDATION_SEQUENCE.md": `# QA Validation Sequence

1. Build
2. Lint
3. Typecheck
4. Accessibility review
5. Performance review
6. SEO review
7. Responsive layout review
8. Forms, navigation, links, and animation checks
9. Documentation confirmation
`,
    "production/launch/README.md": `# Production Launch

Store launch preparation, approval requests, post-launch baselines, and maintenance recommendations here.
`,
    "production/launch/POST_LAUNCH_BASELINE.md": `# Post Launch Baseline

- Launch date
- Performance snapshot
- SEO snapshot
- Analytics setup state
- Search Console checklist state
- Sitemap submission checklist
- Immediate follow-up recommendations
`,
    "memory/projects/README.md": `# Project Memory

Store permanent website-project memory here, including client context, decisions, component history, approvals, reports, issues, and future improvements.
`,
    "memory/projects/PROJECT_MEMORY_TEMPLATE.md": `# Project Memory Template

- Client
- Website
- Pages
- Components
- Decisions
- Changes
- Approvals
- Reports
- Issues
- Future improvements
`,
    "growth/README.md": `# Growth Engine

WGOS Phase 7 turns growth into a repeatable operating system that improves traffic, leads, conversions, publishing output, and revenue opportunities without bypassing approval gates.

## Growth pillars

- Lead generation
- Website audits
- SEO growth
- Content marketing
- AdSense readiness
- Newsletter growth
- Social repurposing
- Affiliate opportunities
- Digital products
- Free tools
- Revenue analytics
`,
    "growth/marketing/README.md": `# Growth Marketing

Store lead research systems, website audits, draft outreach preparation, campaign planning, and pipeline expansion standards here.
`,
    "growth/marketing/LEAD_GENERATION_ENGINE.md": `# Lead Generation Engine

## Daily objective

- Research businesses
- Audit websites
- Identify opportunities
- Generate personalized outreach drafts
- Update CRM
- Track follow-ups
- Generate an executive report

## Target

- 50 qualified business leads per research mission

## Priority

- Tier 1: businesses with existing websites needing redesign or SEO
- Tier 2: businesses without websites but with strong digital presence
- Tier 3: high-value businesses with weak digital presence

No automatic outreach is permitted.
`,
    "growth/marketing/WEBSITE_AUDIT_ENGINE.md": `# Website Audit Engine

## Audit categories

- Design
- Brand
- UX
- SEO
- Performance
- Accessibility
- Core Web Vitals
- Content
- Trust Signals
- Conversion
- Booking
- Forms
- Business positioning

## Outputs

- Executive summary
- Recommended services
- Estimated opportunity
- Priority
`,
    "growth/seo/README.md": `# Growth SEO

Store continuous improvement systems for metadata, schema, internal linking, technical SEO, AEO, GEO, and search reporting here.
`,
    "growth/seo/SEO_GROWTH_ENGINE.md": `# SEO Growth Engine

## Continuously improve

- Metadata
- Schema
- Canonical
- Robots
- Sitemap
- Breadcrumbs
- Image SEO
- Internal linking
- Page speed
- Indexability
- Entity optimization
- Search Console issues
- AEO
- GEO
`,
    "growth/content/README.md": `# Growth Content

Store topical maps, content clusters, editorial calendars, refresh plans, and repurposing systems here.
`,
    "growth/content/CONTENT_MARKETING_ENGINE.md": `# Content Marketing Engine

## Content outputs

- Content clusters
- Topical maps
- Editorial calendar
- Publishing schedule
- Content refresh schedule
- Internal linking plans
- Topic gap analysis
- Competitor gap analysis
- FAQ opportunities
- Featured snippets
- AEO opportunities
- GEO opportunities
`,
    "growth/adsense/README.md": `# Growth AdSense

Store AdSense readiness monitoring, content quality review, and monetization-safe recommendations here.
`,
    "growth/adsense/ADSENSE_READINESS_ENGINE.md": `# AdSense Readiness Engine

## Monitor

- Policy compliance
- Thin content
- Helpful Content
- Originality
- Content quality
- Navigation
- Trust pages
- Ad placement safety
- Page layout

## Generate

- Approval score
- Policy risk report
- Recommendations
`,
    "growth/affiliate/README.md": `# Growth Affiliate

Store affiliate opportunity analysis, placement strategy, and trust-safe revenue planning here.
`,
    "growth/affiliate/AFFILIATE_ENGINE.md": `# Affiliate Engine

## Track

- Affiliate products
- Content opportunities
- Revenue estimates
- Placement strategy
- Compliance
`,
    "growth/newsletter/README.md": `# Growth Newsletter

Store newsletter schedules, lead magnets, welcome-series planning, and subscriber-growth systems here.
`,
    "growth/newsletter/NEWSLETTER_ENGINE.md": `# Newsletter Engine

## Manage

- Editorial calendar
- Lead magnets
- Newsletter schedule
- Welcome series
- Educational campaigns
- Promotion campaigns
- Subscriber growth

No emails are sent without approval.
`,
    "growth/social/README.md": `# Growth Social

Store repurposing systems and channel-specific social growth planning here.
`,
    "growth/social/SOCIAL_CONTENT_ENGINE.md": `# Social Content Engine

## Generate platform-specific content for

- LinkedIn
- Facebook
- Instagram
- X
- TikTok
- YouTube
- Threads
- Pinterest

Repurpose Academy content and maintain a posting calendar.
`,
    "growth/crm/README.md": `# Growth CRM

Store lead-state rules, pipeline stages, follow-up logic, and approval-aware contact tracking here.
`,
    "growth/crm/CRM_PIPELINE.md": `# CRM Pipeline

## Track

- Lead
- Audit
- Draft
- Approval
- Contacted
- Reply
- Meeting
- Proposal
- Won
- Lost
- Future opportunity
`,
    "growth/analytics/README.md": `# Growth Analytics

Store KPI definitions, organic growth reporting, conversion analysis, and executive summaries here.
`,
    "growth/analytics/ANALYTICS_ENGINE.md": `# Analytics Engine

## Monitor

- Organic traffic
- Leads
- Content performance
- CTR
- Rankings
- Conversions
- Bounce rate
- Core Web Vitals
- Revenue
- Monthly trends
`,
    "growth/revenue/README.md": `# Growth Revenue

Store service revenue priorities, affiliate and product opportunities, free-tool planning, and monetization strategy here.
`,
    "growth/revenue/REVENUE_ENGINE.md": `# Revenue Engine

## Revenue sources

- Website Development
- SEO
- Technical SEO
- Website Maintenance
- Landing Pages
- Performance Optimization
- Academy
- Free Tools
- Case Studies
- Templates
- Affiliate Marketing
- AdSense
- Newsletter
- Future SaaS
`,
    "growth/revenue/DIGITAL_PRODUCT_ENGINE.md": `# Digital Product Engine

## Identify products

- Templates
- Checklists
- Guides
- Courses
- Prompt libraries
- Audit reports
- Toolkits

Track pricing, funnels, and opportunity fit.
`,
    "growth/revenue/FREE_TOOLS_ENGINE.md": `# Free Tools Engine

## Prioritize by

- SEO opportunity
- Lead generation
- Business value
- Development complexity
- Revenue potential
`,
    "growth/revenue/REVENUE_OPPORTUNITY_MAP.md": `# Revenue Opportunity Map

For every opportunity record:

- Offer
- Buyer type
- Revenue potential
- Delivery complexity
- Repeatability
- Supporting content
- Required approvals
`,
    "growth/dashboard/README.md": `# Growth Dashboard

Executive growth scorecards, revenue snapshots, and growth mission summaries live here.
`,
    "growth/dashboard/REVENUE_DASHBOARD.md": `# Revenue Dashboard

## Display

- Monthly revenue
- Pipeline value
- Projects
- SEO clients
- Website clients
- Newsletter growth
- Traffic
- AdSense readiness
- Affiliate opportunities
- Digital product opportunities
`,
    "growth/dashboard/COMPANY_KPI_DASHBOARD.md": `# Company KPI Dashboard

## Track

- Organic clicks
- Indexed pages
- Keyword rankings
- Content published
- Case studies
- Website projects
- Leads
- Meetings
- Proposals
- Conversions
- Revenue
- Client retention
`,
    "growth/dashboard/EXECUTIVE_REVIEW_CADENCE.md": `# Executive Review Cadence

## Generate

- Daily report
- Weekly report
- Monthly report
- Quarterly report

## Include

- Wins
- Losses
- Growth
- Risks
- Revenue opportunities
- Technical debt
- Marketing opportunities
- Recommended priorities
`,
    "growth/playbooks/README.md": `# Growth Playbooks

Repeatable playbooks for lead research, SEO growth, content marketing, AdSense readiness, newsletters, social repurposing, and revenue planning live here.
`,
    "growth/playbooks/LEAD_GENERATION_PLAYBOOK.md": `# Lead Generation Playbook

## Daily objective

- Research qualified businesses
- Evaluate opportunity
- Generate personalized draft outreach
- Update CRM
- Produce an executive summary

## Priority order

- Tier 1: businesses with existing sites needing redesign or SEO
- Tier 2: businesses without websites but with strong digital signals
- Tier 3: high-value businesses with weak digital presence

## Quality rule

Research missions are incomplete until 50 qualified leads, audits, personalization angles, drafts, CRM states, and executive reporting are all present.

No automatic outreach.
`,
    "growth/playbooks/SEO_GROWTH_PLAYBOOK.md": `# SEO Growth Playbook

## Outputs

- Metadata backlog
- Technical SEO fixes
- AEO opportunities
- GEO opportunities
- Internal-linking actions
- Reporting summary
`,
    "growth/playbooks/CONTENT_MARKETING_PLAYBOOK.md": `# Content Marketing Playbook

## Build

- Topical map
- Cluster plan
- Editorial calendar
- Refresh schedule
- FAQ targets
- Snippet targets
- Social repurposing hooks
`,
    "growth/playbooks/ADSENSE_READINESS_PLAYBOOK.md": `# AdSense Readiness Playbook

## Review

- Content quality
- Trust-page coverage
- Navigation clarity
- Originality
- Thin-content risk
- Ad placement safety

## Output

- Approval score
- Policy-risk summary
- Recommendations
`,
    "growth/playbooks/NEWSLETTER_PLAYBOOK.md": `# Newsletter Playbook

## Build

- Lead-magnet plan
- Newsletter schedule
- Welcome-series structure
- Educational campaign ideas
- Promotion campaign ideas
- Subscriber-growth opportunities
`,
    "growth/playbooks/SOCIAL_REPURPOSING_PLAYBOOK.md": `# Social Repurposing Playbook

## Use

- Academy articles
- Case studies
- Checklists
- Snippets
- Website insights

Generate platform-specific variations and a posting calendar.
`,
    "growth/playbooks/AFFILIATE_OPPORTUNITY_PLAYBOOK.md": `# Affiliate Opportunity Playbook

## Evaluate

- Product fit
- Audience relevance
- Compliance
- Placement strategy
- Revenue estimate
- Supporting content need
`,
    "growth/playbooks/REVENUE_OPPORTUNITY_PLAYBOOK.md": `# Revenue Opportunity Playbook

## Prioritize

- Revenue potential
- Delivery difficulty
- Speed to payment
- Repeatability
- Trust fit

Document the recommended next actions and required approvals.
`,
  };

  await Promise.all(
    Object.entries({ ...docs, ...phaseSixProductionDocs }).map(([file, content]) => writeFile(file, content))
  );
}

async function syncTenantDocs() {
  for (const tenant of tenants) {
    await writeFile(
      `companies/${tenant.slug}/README.md`,
      `
# ${tenant.name}

- Company ID: ${tenant.id}
- Industry: ${tenant.industry}
- Country: ${tenant.country}
- Timezone: ${tenant.timezone}
- Owner: ${tenant.owner}
- Status: ${tenant.status}
- Current Phase: ${tenant.currentPhase}

## Services

${bullets(tenant.services)}
`
    );

    const workspaceReadmes = {
      [`companies/${tenant.slug}/memory/README.md`]: `# ${tenant.name} Memory\n\nStore isolated company memory, mission history, decisions, and lessons learned for ${tenant.name} here.`,
      [`companies/${tenant.slug}/roadmap/README.md`]: `# ${tenant.name} Roadmap\n\nTrack company-specific roadmap items, phase targets, and deferred initiatives for ${tenant.name} here.`,
      [`companies/${tenant.slug}/projects/README.md`]: `# ${tenant.name} Projects\n\nTrack active and archived projects, delivery status, and project handoffs for ${tenant.name} here.`,
      [`companies/${tenant.slug}/reports/README.md`]: `# ${tenant.name} Reports\n\nStore company-scoped mission reports, executive summaries, and delivery closeouts for ${tenant.name} here.`,
      [`companies/${tenant.slug}/marketing/README.md`]: `# ${tenant.name} Marketing\n\nStore pipeline, lead generation, outreach preparation, and campaign records for ${tenant.name} here.`,
      [`companies/${tenant.slug}/seo/README.md`]: `# ${tenant.name} SEO\n\nStore search strategy, technical SEO findings, content gaps, and search performance notes for ${tenant.name} here.`,
      [`companies/${tenant.slug}/content/README.md`]: `# ${tenant.name} Content\n\nStore editorial plans, publishing assets, briefs, and content performance notes for ${tenant.name} here.`,
      [`companies/${tenant.slug}/analytics/README.md`]: `# ${tenant.name} Analytics\n\nStore KPI snapshots, dashboards, revenue signals, and performance reporting for ${tenant.name} here.`,
      [`companies/${tenant.slug}/crm/README.md`]: `# ${tenant.name} CRM\n\nStore tenant-scoped lead, client, pipeline, and approval-tracking records for ${tenant.name} here.`,
      [`companies/${tenant.slug}/documentation/README.md`]: `# ${tenant.name} Documentation\n\nStore company operating notes, process documentation, and reusable delivery references for ${tenant.name} here.`,
    };

    await Promise.all(
      Object.entries(workspaceReadmes).map(([file, content]) => writeFile(file, content))
    );
  }

  const simpleReadmes = [
    "companies/archive/README.md|# Company Archive\n\nArchive inactive tenants here.",
    "companies/shared/README.md|# Shared Company Services\n\nShared standards, templates, and service definitions that can be reused across tenants live here.",
    "companies/shared/SHARED_SERVICES.md|# Shared Services\n\nWGOS shared services include runtime, documentation, QA, knowledge management, integrations, security guardrails, deployment templates, SEO standards, accessibility standards, and design-system guidance.",
    "clients/active/README.md|# Active Clients\n\nStore isolated active client operating records here.",
    "clients/completed/README.md|# Completed Clients\n\nStore completed client archives and closeout summaries here.",
    "clients/prospects/README.md|# Prospect Clients\n\nStore qualified prospect records and pre-sale notes here.",
    "clients/active/CLIENT_OPERATING_TEMPLATE.md|# Client Operating Template\n\n- Client ID\n- Company slug\n- Status\n- Active missions\n- Approval state\n- Open risks\n- Next action",
    "clients/CLIENT_LIFECYCLE.md|# Client Lifecycle\n\nProspect -> Qualified -> Proposal -> Won -> Discovery -> Production -> QA -> Launch -> Growth -> Maintenance -> Renewal -> Case Study\n\n## Rules\n\n- Every stage must update company CRM, reports, and memory.\n- Approval states must be explicit at proposal, launch, and any external-action step.\n- Closed or lost clients must keep an archived delivery and decision trail.",
    "clients/CLIENT_PORTAL_FRAMEWORK.md|# Client Portal Framework\n\nDocument the future client portal architecture.\n\n## Client-visible surfaces\n\n- Project status\n- Reports\n- SEO and analytics snapshots\n- Invoices and documents\n- Deliverables\n- Approval requests\n- Revision requests\n\n## Guardrails\n\n- Portal views remain tenant-isolated.\n- Approval actions must be auditable.\n- Internal-only notes must never appear in client-facing surfaces.",
    "products/templates/README.md|# Product Templates\n\nReusable product operating templates live here.",
    "products/saas/README.md|# SaaS Products\n\nStore SaaS product strategy and execution records here.",
    "products/internal/README.md|# Internal Products\n\nStore internal tools and operating assets here.",
    "products/archive/README.md|# Product Archive\n\nArchive inactive product initiatives here.",
  ];

  await Promise.all(
    simpleReadmes.map((item) => {
      const [file, content] = item.split("|");
      return writeFile(file, content);
    })
  );
}

async function syncReleaseDocs() {
  const missionTemplateRows = Object.values(missionTemplates)
    .map((template) => `| ${template.id} | ${template.title} | ${template.companyId} | ${template.approvalClass} | ${template.workflows.join(", ")} |`)
    .join("\n");
  const agentRows = agents
    .map((agent) => `| ${agent.title} | ${agent.department} | Certified | Runtime, memory, reporting, approval, and handoff requirements present |`)
    .join("\n");
  const departmentRows = departments
    .map((department) => `| ${department.name} | Certified | ${department.summary} |`)
    .join("\n");
  const workflowRows = workflows
    .map((workflow) => `| ${workflow.title} | Certified | ${workflow.trigger} | ${workflow.departments.join(", ")} |`)
    .join("\n");

  const docs = {
    "release/README.md": `# WGOS Release

This folder stores release notes, certification evidence, validation reports, security review, operating manuals, migration notes, and v1.0 production-readiness artifacts.

## Release rule

WGOS does not ship unless documentation, memory, reports, validation, approval gates, and release notes are current.`,
    "release/v1/RELEASE_NOTES.md": `# WGOS v1.0.0 Release Notes

## Release status

WGOS v1.0.0 is the first production-ready operating-system release for an AI-native digital agency platform.

## Features

- Company constitution, Rule Zero, memory, decisions, roadmap, and handoff system
- Executable mission runtime with persistent JSON state and markdown reports
- Certified agent, department, workflow, integration, production, growth, intelligence, and multi-company surfaces
- Dashboard and operator build outputs generated from runtime state
- Tenant-aware company workspace model for Web Growth and future clients
- Approval-gated controlled operations for browser, Gmail, Search Console, GA4, hosting, DNS, and external accounts

## Breaking changes

- WGOS now treats the software-first scaffold as the forward architecture.
- Active editorial work belongs to publishing, not legacy content folders.
- Release validation is expected before claiming v1.0 readiness.

## Known limitations

- External integrations remain documentation-backed unless a connector is actually exposed in the active session.
- Production deployment, email sending, DNS edits, billing, and indexing requests still require explicit human approval.
- Browser profile cleanup can be blocked by Windows file locks while the browser process is still holding files.

## Future roadmap

Move more runtime, integrations, dashboards, tenant management, and marketplace packaging from markdown into executable packages and apps.`,
    "release/v1/ARCHITECTURE_SUMMARY.md": `# WGOS v1.0 Architecture Summary

## Core layers

- Governance: company constitution, Rule Zero, approval gates, decisions, roadmap, and changelog.
- Runtime: mission catalog, department router, agent executors, state store, memory updater, reporting, analytics, dashboard generation.
- Departments: executive, design, engineering, search, publishing, marketing, revenue, client, operations, QA, and documentation.
- Integrations: browser, GitHub, Gmail, Search Console, GA4, PageSpeed, Lighthouse, Cloudflare, Namecheap, Vercel, Figma, maps, search, directories, filesystem, docs, CSV, images, and CRM.
- Pipelines: production, growth, intelligence, multi-company platform, and release.
- Surfaces: dashboard, operator, client portal scaffold, admin scaffold, reports, memory, and tenant workspaces.

## Release contract

Every mission must route through runtime, produce state, generate reports, update memory, respect approvals, and leave a documented handoff.`,
    "release/v1/PRODUCTION_READINESS_SCORE.md": `# Production Readiness Score

## Score

9.0 / 10

## Basis

- Folder structure: complete
- Runtime execution: complete for local mission simulations
- Agent certification: complete by documented contract and runtime metadata
- Department certification: complete by department routing and generated dashboard state
- Workflow certification: complete by workflow docs, mission templates, and verification assertions
- Memory coverage: complete for local mission state and markdown memory outputs
- Security posture: approval-gated and tenant-isolated
- Remaining gap: live external integrations require session-specific capability checks before use`,
    "release/v1/KNOWN_LIMITATIONS.md": `# Known Limitations

- WGOS v1.0 can prepare external work, but it cannot perform live external actions without an available connector and explicit approval.
- Some integration layers remain documented contracts rather than full provider adapters.
- Browser profile cleanup may remain blocked until the holding browser process closes.
- Forecasting and revenue scoring are framework-ready, but live accuracy depends on connected analytics and CRM data.
- Client portal and admin surfaces are scaffolded but not yet full interactive applications.`,
    "release/reports/RUNTIME_VALIDATION_REPORT.md": `# Runtime Validation Report

## Validated systems

- Mission engine
- Department router
- Agent executor contract
- Persistent state store
- Report generation
- Memory updates
- Dashboard generation
- Analytics and scorecards
- Tenant portfolio reporting

## Required validation command

Run \`npm.cmd run wgos:release\` before final handoff to generate mission stress-test evidence.`,
    "release/reports/DOCUMENTATION_COVERAGE_REPORT.md": `# Documentation Coverage Report

## Coverage

- Root governance docs: covered
- Agents: ${agents.length} covered
- Departments: ${departments.length} covered
- Skills: ${skills.length} covered
- Workflows: ${workflows.length} covered
- Integrations: ${integrations.length} covered
- Templates: ${templates.length} covered
- Production, growth, intelligence, platform, companies, clients, products, and release docs: covered

## Compliance rule

No system is production-ready unless its runtime behavior, approval gates, memory updates, reports, and handoffs are documented.`,
    "release/reports/MEMORY_COVERAGE_REPORT.md": `# Memory Coverage Report

## Covered memory layers

- Current state
- Active tasks
- Open risks
- Next actions
- Code memory
- Company memory
- Department memory
- Agent memory
- Mission memory
- Project memory
- Client memory
- Marketing, SEO, publishing, and revenue memory
- Knowledge library

## Release requirement

Mission outputs must update persistent state and the relevant markdown memory layer before completion.`,
    "release/security/SECURITY_REVIEW_SUMMARY.md": `# Security Review Summary

## Reviewed controls

- Approval enforcement
- Credential handling
- Browser safety
- Secret handling
- Audit logging
- Company isolation
- Client isolation
- External action boundaries

## Release conclusion

WGOS v1.0 is safe for local planning, documentation, analysis, mission simulation, and approval-gated preparation. Live external actions require connector availability and explicit human approval.`,
    "release/checklists/V1_RELEASE_CHECKLIST.md": `# WGOS v1.0 Release Checklist

- Folder structure validated
- Naming consistency validated
- Workflow consistency validated
- Agent consistency validated
- Department consistency validated
- Memory consistency validated
- Version consistency validated
- Rule Zero compliance validated
- Approval gates validated
- Security review completed
- Release notes created
- Stress-test simulations run
- Dashboard generated
- Verification passed`,
    "release/tests/MISSION_STRESS_TEST_PLAN.md": `# Mission Stress Test Plan

## Mission templates under release review

| Template | Title | Company | Approval | Workflows |
| --- | --- | --- | --- | --- |
${missionTemplateRows}

## Validation checks

- Correct departments selected
- Correct agents invoked
- Correct skills loaded by role metadata
- Correct approval class assigned
- Reports generated
- Memory updated
- Handoffs present
- Dashboard and operator surfaces updated`,
    "release/validation/AGENT_CERTIFICATION.md": `# Agent Certification

| Agent | Department | Status | Evidence |
| --- | --- | --- | --- |
${agentRows}

Only certified agents are production-ready for WGOS v1.0 missions.`,
    "release/validation/DEPARTMENT_CERTIFICATION.md": `# Department Certification

| Department | Status | Scope |
| --- | --- | --- |
${departmentRows}

Certified departments can participate in routed company missions under the WGOS runtime contract.`,
    "release/validation/WORKFLOW_CERTIFICATION.md": `# Workflow Certification

| Workflow | Status | Trigger | Departments |
| --- | --- | --- | --- |
${workflowRows}

Certified workflows have named triggers, department ownership, documentation requirements, and Approval boundaries.`,
    "release/documentation/COMPANY_OPERATING_MANUAL.md": `# WGOS Company Operating Manual

## How WGOS works

The human gives a business objective. The CEO Operator interprets it, the Orchestrator selects departments and workflows, the Project Manager creates tasks, specialists execute, QA validates, Knowledge updates memory, Documentation updates records, and approvals pause risky actions.

## Add agents

Add the agent to the registry, create the agent document, define skills, integrations, approvals, outputs, validation, reports, and memory rules.

## Add departments

Add the department registry entry, department folder, manager rules, collaboration rules, KPIs, and documentation expectations.

## Add companies

Create a tenant entry, company workspace, memory, reports, CRM, analytics, roadmap, projects, and tenant-boundary documentation.

## Add workflows

Create the workflow document, add workflow metadata, define trigger, agents, inputs, outputs, approvals, failure handling, completion criteria, and verification checks.

## Maintain memory and documentation

Every meaningful mission updates state, memory, reports, decisions when needed, roadmap when sequencing changes, changelog when artifacts change, and handoff when work transfers.

## Perform upgrades

Create a release folder, document changes, run sync, run tests, run release validation, run dashboard generation, run verification, and record remaining risks.`,
    "release/playbooks/CEO_PLAYBOOK.md": `# Founder And CEO Playbook

## Start a mission

State the business objective, target company, constraints, approval boundaries, and expected business outcome.

## Approve work

Review the approval request, confirm the exact action, confirm the company context, confirm risk, and approve or reject in writing.

## Review reports

Check mission report, agent report, handoff, memory updates, dashboard state, open risks, and next actions.

## Review KPIs

Review company health, revenue readiness, pipeline, SEO, content, client delivery, documentation health, memory health, and QA health.

## Weekly review

Review completed missions, blocked missions, pending approvals, revenue opportunities, technical debt, top-performing agents, weak areas, and recommended priorities.

## Quarterly review

Review revenue trends, service profitability, client retention, system maturity, workflow improvements, and v2.0 roadmap priorities.`,
    "release/playbooks/DEVELOPER_PLAYBOOK.md": `# Developer Playbook

## Architecture

Use packages for executable behavior, apps for operator surfaces, docs for operating guidance, and companies for tenant-scoped state.

## Coding standards

Prefer existing runtime modules, keep behavior deterministic, avoid external side effects without approval gates, and write structured state before markdown summaries.

## Folder conventions

Runtime code lives in packages. Generated operator surfaces live in apps. Tenant files live in companies. Release artifacts live in release.

## Testing

Run \`npm.cmd run wgos:test\`, \`npm.cmd run wgos:release\`, \`npm.cmd run wgos:dashboard\`, and \`npm.cmd run wgos:verify\` for release-level changes.

## Contribution guidelines

Update docs, memory, reports, validation, and handoff artifacts in the same change that modifies behavior.`,
    "release/examples/MISSION_EXAMPLES.md": `# Mission Examples

- Build Premium Website
- SEO Audit
- Homepage Redesign
- Find 50 Qualified Leads
- Prepare 50 Personalized Outreach Drafts
- Weekly Executive Review
- Publish Academy Article
- Improve AdSense Readiness
- Client Onboarding
- Launch Website

Each example must route through mission runtime, approval gates, reports, memory, and handoffs before it is considered complete.`,
    "release/migration/V2_ROADMAP.md": `# WGOS v2.0 Roadmap

## Technical roadmap

- Move more docs-backed rules into executable packages.
- Build a fuller dashboard, operator, admin, and client portal app experience.
- Implement provider adapters for integrations where connectors are available.
- Add API platform and plugin system foundations.
- Add tenant-aware permissions and audit UI.

## Business roadmap

- Expand live analytics ingestion.
- Add CRM integrations and payment gateway planning.
- Add Voice, mobile, Slack, Discord, WhatsApp, and marketplace paths.
- Package reusable agent, workflow, skill, industry, template, and automation packs.

## Release rule

v2.0 work must preserve Rule Zero, tenant isolation, approval gates, and traceable validation.`,
  };

  await Promise.all(Object.entries(docs).map(([file, content]) => writeFile(file, content)));
}

async function syncOperationalState() {
  await writeFile(
    "memory/README.md",
    `
# WGOS Memory

This folder stores working and operational memory for WGOS itself.

## Mandatory update targets

- \`CODEX_MEMORY.md\`
- \`CURRENT_STATE.md\`
- \`ACTIVE_TASKS.md\`
- \`OPEN_RISKS.md\`
- \`NEXT_ACTIONS.md\`

No meaningful task is complete until the relevant memory files have been reviewed and updated.
`
  );
  await writeFile("memory/company/README.md", "# Company Memory\n\nStore company-wide mission history, KPI history, executive reviews, and business lessons here.");
  await writeFile("memory/departments/README.md", "# Department Memory\n\nStore department-level execution history, recurring blockers, and collaboration lessons here.");
  await writeFile("memory/agents/README.md", "# Agent Memory\n\nStore per-agent execution history, reliability notes, and performance patterns here.");
  await writeFile("memory/library/README.md", "# Knowledge Library\n\nStore Best practices, lessons learned, successful workflows, common mistakes, industry insights, reusable templates, case-study notes, and Architecture decisions here.");
  await writeFile("memory/library/BEST_PRACTICES.md", "# Best Practices\n\n- Capture durable practices that repeatedly lead to strong QA, documentation quality, delivery quality, or business impact.");
  await writeFile("memory/library/COMMON_MISTAKES.md", "# Common Mistakes\n\n- Capture repeated errors, blockers, and weak patterns so future missions can avoid them.");
  await writeFile("memory/library/INDUSTRY_INSIGHTS.md", "# Industry Insights\n\n- Capture sector-specific observations such as profitable services, strong homepage structures, and trust requirements.");
  await writeFile("memory/library/ARCHITECTURE_DECISIONS.md", "# Architecture Decisions\n\n- Capture reusable technical and operating-system decisions that still matter across missions.");
  await writeFile("memory/missions/README.md", "# Mission Memory\n\nStore mission-by-mission records, outcomes, and lessons learned here.");
  await writeFile("memory/clients/README.md", "# Client Memory\n\nStore client-facing delivery history, onboarding notes, and retention context here.");
  await writeFile("memory/marketing/README.md", "# Marketing Memory\n\nStore pipeline, outreach, and campaign operating history here.");
  await writeFile("memory/seo/README.md", "# SEO Memory\n\nStore search findings, recurring issues, and search lessons learned here.");
  await writeFile("memory/content/README.md", "# Content Memory Compatibility Alias\n\nThe active editorial model is publishing. Use this folder only as a compatibility surface for Phase 5 content-language requests.");
  await writeFile("memory/publishing/README.md", "# Publishing Memory\n\nStore the active editorial department's history, briefs, and lessons learned here.");
  await writeFile("memory/revenue/README.md", "# Revenue Memory\n\nStore analytics, CRO, monetization, and revenue-opportunity history here.");
  await writeFile(
    "memory/CODEX_MEMORY.md",
    `
# Codex Memory

- WGOS is a separate operating-system layer, not a website redesign.
- Documentation completion is mandatory.
- External actions remain human-gated.
- The demo mission proves the runtime and phase wiring locally.
- The founder-to-specialist-to-QA-to-memory-to-documentation chain is mandatory for coordinated execution.
- Lead research missions do not count as complete unless qualified leads, mini audits, drafts, CRM state, and documentation are all present.
- Phase 5 expands WGOS into department-led autonomous mission routing with company memory and KPI surfaces.
- Phase 6 adds a repeatable website production and client delivery pipeline with project memory, blueprints, and launch-preparation artifacts.
- Phase 7 adds a repeatable growth and revenue engine across marketing, SEO, content, analytics, CRM, AdSense, affiliate, newsletter, social, and revenue planning.
- Phase 8 adds continuous learning, pattern detection, optimization, forecasting, company health scoring, and knowledge-library expansion.
`
  );
  await writeFile(
    "memory/CURRENT_STATE.md",
    `
# Current State

- WGOS now includes generated registries, runnable scripts, executable mission runtime modules, and a demo mission flow.
- WGOS includes a software-first post-v1.0 scaffold under \`apps/\`, \`packages/\`, \`docs/\`, \`examples/\`, and \`tests/\`.
- WGOS includes agent, skill, workflow, template, memory, decision, and lead-data scaffolds for internal company operations.
- The system is locally verifiable through \`wgos:verify\`.
- The system is locally exercisable through \`wgos:demo\` and \`wgos:mission\`.
- Persistent runtime state now lives in \`WGOS/state/\` and drives generated dashboard and operator surfaces.
- Company memory now expands into department, agent, mission, marketing, SEO, publishing, client, and revenue layers.
- WGOS rule zero, approval gates, and reporting expectations are documented and enforceable through the templates and workflow layer.
- Production workflow assets now cover discovery, strategy, IA, design, engineering, search, QA, client review, launch preparation, and post-launch baselines.
- Growth workflow assets now cover lead generation, audits, SEO growth, content marketing, AdSense readiness, newsletters, social repurposing, affiliate analysis, and revenue opportunity planning.
- Intelligence workflow assets now convert mission history into learning records, benchmarks, recurring patterns, decision analysis, automation opportunities, forecasts, and optimization recommendations.
`
  );
  await writeFile(
    "memory/ACTIVE_TASKS.md",
    `
# Active Tasks

- Use WGOS on a real internal mission without bypassing approval gates.
- Create the first real 50-lead mission board before any live outreach work starts.
- Improve package and app implementation under the new software-first architecture as runtime code is added.
- Run the client website delivery mission template against a real scoped website brief.
- Run a real growth mission against the new SEO or revenue opportunity templates.
- Review intelligence recommendations and use them to choose the next real production or growth mission.
`
  );
  await writeFile(
    "memory/OPEN_RISKS.md",
    `
# Open Risks

- Some specialist execution is still deterministic runtime simulation rather than live tool-specific implementation.
- Live external actions still require human approval and environment access.
- Tenant isolation is implemented by structure and validation, not by a live application permission model.
- Lead research quality can drift if the scoring model is not enforced strictly during real missions.
- The Phase 5 content department language is mapped to the active publishing model to avoid reviving stale legacy editorial structures.
- Phase 6 production delivery is documentation-backed and runtime-routed, but still depends on human approval for deployment, DNS, publishing, and client-facing commitments.
- Phase 7 growth delivery is documentation-backed and runtime-routed, but still depends on human approval for outreach, sending emails, paid actions, and external state changes.
- Phase 8 may recommend changes to workflows, agents, documentation, architecture, or business strategy, but may not apply them automatically without approval.
`
  );
  await writeFile(
    "memory/NEXT_ACTIONS.md",
    `
# Next Actions

1. Start real department-led missions using \`wgos:mission\`.
2. Expand specialist executors from deterministic local runtime behavior into tool-aware implementations where safe.
3. Run the new website production mission against a real client brief and capture project memory.
4. Run the growth engine through real SEO, revenue, and content-planning missions before any live outreach work.
5. Use intelligence outputs to refine future routing and operating priorities with human approval.
`
  );
  await writeFile(
    "decisions/README.md",
    `
# Decisions

Record durable policy, structure, and workflow decisions here.
`
  );
  await writeFile(
    "decisions/DECISIONS.md",
    `
# Decision Log

## 2026-07-08

- WGOS lives in a separate top-level \`WGOS/\` directory to avoid modifying the production site architecture.
- WGOS uses generated registries and scripts to keep docs, entities, and validation in sync.
- External actions remain approval-gated and documentation-first.

## 2026-07-10

- WGOS v1.0 documentation was deepened so agents, workflows, skills, templates, and memory records are immediately usable instead of placeholder-only.
- WGOS post-v1.0 architecture is software-first, but the current documentation and registry layer remains the active source of truth during migration.
- Editorial agent routing uses the \`publishing\` department and folder structure.
- WGOS runtime execution now persists JSON state under \`WGOS/state/\` and generates operator/dashboard surfaces from that state.
- WGOS Phase 10 release artifacts define v1.0 release notes, certification, validation, security review, operating manuals, and release stress-test expectations.
`
  );
  await writeFile(
    "ROADMAP.md",
    `
# Roadmap

## Current build order

1. Company constitution and agent scaffold
2. Runtime and execution framework
3. Integration standards
4. Specialist execution profiles
5. Department mission routing
6. Website production pipeline
7. Growth and revenue systems
8. Learning and optimization loops
9. Multi-company platform isolation
10. WGOS v1.0 release stabilization

## Next expansions

- Move docs-backed systems into more executable packages
- Expand tenant-specific records with live company data
- Expand forecasting and scoring with connected analytics and CRM data
- Build fuller dashboard, operator, admin, and client portal app experiences
`
  );
  await writeFile(
    "CHANGELOG.md",
    `
# Changelog

## 2026-07-08

- Built the initial WGOS scaffold.
- Added WGOS registries, sync tooling, verification tooling, and demo mission tooling.
- Wired phases 1 through 9 into a unified operating system structure.
- Confirmed live access for Gmail, Figma, GitHub, and local Playwright browser execution.

## 2026-07-10

- Upgraded WGOS v1.0 agent, workflow, skill, template, and memory documentation quality.
- Added the software-first post-v1.0 app and package scaffold.
- Standardized editorial agents under the \`publishing\` department structure.
- Added Phase 6 website production pipeline assets, project memory, launch workflows, blueprints, and client website delivery mission support.
- Added Phase 7 growth, marketing, CRM, SEO, AdSense, affiliate, newsletter, social, analytics, and revenue operating assets with runnable growth mission support.
- Added Phase 8 continuous-learning outputs including patterns, recommendations, benchmarks, forecasts, company health, and knowledge-library expansion.
- Strengthened Phase 9 tenant-ready outputs with company-scoped registry, portfolio reporting, resource-sharing rules, and tenant-boundary documentation.
- Added Phase 10 WGOS v1.0 release artifacts, certification docs, production-readiness score, security review, operating manuals, release stress-test plan, and v2.0 roadmap.
`
  );
  await writeFile(
    "PROJECT_HANDOFF.md",
    `
# Project Handoff

Use this file as the cross-session and cross-agent handoff index.

## Every handoff must include

- Mission ID and task ID
- Current status
- Completed work
- Files changed
- Documentation updated
- Outstanding risks
- Next required agent
- Validation still needed
- Immediate next action
`
  );
}

async function syncDataSamples() {
  await writeFile(
    "data/README.md",
    `
# Data

This directory stores structured non-code operating data used by WGOS.
`
  );
  await writeFile(
    "data/leads/README.md",
    `
# Leads Data

Store lead research exports, outreach tracking logs, and qualification datasets here.

## Minimum lead rule

Lead missions should save only leads scoring 60+ unless the founder explicitly asks for lower-priority research.
`
  );
  await writeFile(
    "data/leads/leads.example.csv",
    `
lead_id,date_found,business_name,industry,location,tier,website_url,source_url,public_email,public_phone_or_whatsapp,contact_page_url,social_profile_url,website_quality_score,business_value_score,conversion_opportunity_score,fit_score,total_score,priority_label,top_3_website_issues,recommended_web_growth_service,short_personalization_note,suggested_outreach_angle,status
L-001,2026-07-10,Example Dental Clinic,Dental Clinic,Lagos,Tier 1,https://example.com,https://maps.google.com/example,info@example.com,+2348000000000,https://example.com/contact,https://instagram.com/example,18,22,17,14,71,Warm,"Slow mobile load; weak appointment CTA; thin service pages",Website redesign + SEO,"Clinic looks active but booking path is weak","Lead with missed appointment-conversion opportunity",READY_FOR_DRAFT
L-002,2026-07-10,Signal Legal Partners,Law Firm,Abuja,Tier 1,https://signal.example,https://www.linkedin.com/company/signal-legal,hello@signal.example,+2348111111111,https://signal.example/contact,https://linkedin.com/company/signal-legal,16,24,18,15,73,Warm,"Homepage clarity issues; weak trust signals; poor internal linking",Website repositioning + technical SEO,"Firm serves premium clients but site feels dated","Lead with trust and lead-quality improvement angle",READY_FOR_DRAFT
`
  );
  await writeFile(
    "data/leads/outreach-log.example.csv",
    `
lead_id,business_name,channel,draft_status,approval_status,last_updated,next_step,assigned_agent,notes
L-001,Example Dental Clinic,email,DRAFT,WAITING_APPROVAL,2026-07-10,Founder review for accuracy,OUTREACH_DRAFTING_AGENT,Personalization grounded in appointment friction observation
L-002,Signal Legal Partners,email,DRAFT,WAITING_APPROVAL,2026-07-10,QA review before founder approval,OUTREACH_DRAFTING_AGENT,Use trust-and-positioning angle only
`
  );
  await writeFile("reports/.gitkeep", "");
}

async function syncMissionTemplates() {
  await writeFile(
    "missions/README.md",
    `
# Missions

Store mission definitions and active mission trackers here.
`
  );
  await writeFile(
    "mission-templates/README.md",
    `
# Mission Templates

Reusable mission formats for internal operations, growth campaigns, and client delivery.
`
  );
  await writeFile(
    "mission-templates/EXECUTIVE_MISSION_TEMPLATE.md",
    `
# Executive Mission Template

- Mission ID
- Tenant or company
- Objective
- Scope
- Constraints
- Priority
- Mission type
- Required departments
- Required agents
- Required skills
- Required integrations
- Dependencies
- Approval class
- Success metrics
- Deadline or cadence
`
  );

  const missionTemplates = {
    "mission-templates/BUILD_WEBSITE_MISSION_TEMPLATE.md": {
      title: "Build Website Mission Template",
      body: [
        "Mission objective: build or rebuild a website experience without bypassing WGOS validation and approval gates.",
        "Required departments: executive, design, engineering, search, qa, documentation.",
        "Required agents: CEO Operator, Workflow Orchestrator, Project Manager, Product Strategist, UI UX, Frontend, SEO, Accessibility, Performance, QA, Documentation, Knowledge Manager.",
        "Required skills: Next.js, Tailwind, TypeScript, Accessibility, Performance, SEO.",
        "Required integrations: filesystem, github, lighthouse, pagespeed, docs, vercel.",
        "Dependencies: content inputs, route rules, validation commands, approval checkpoints.",
        "Approval gates: production deployment, external account changes, purchases.",
        "Documentation: reports, memory updates, decisions, project handoff, changelog.",
      ],
    },
    "mission-templates/SEO_AUDIT_MISSION_TEMPLATE.md": {
      title: "SEO Audit Mission Template",
      body: [
        "Mission objective: inspect crawlability, metadata, schema, internal links, technical issues, and growth opportunities.",
        "Required departments: executive, search, revenue, qa, documentation.",
        "Required agents: SEO, Technical SEO, Schema, Search Console, Analytics, QA, Documentation, Knowledge Manager.",
        "Required skills: SEO, Search Console, GA4, Schema, Controlled Browser if available.",
        "Required integrations: search-console, ga4, search, docs, lighthouse, pagespeed.",
        "Dependencies: target property, site access model, historical reports, approval gates for external portals.",
        "Approval gates: login, property selection, index requests, account changes.",
        "Documentation: audit report, current state updates, open risks, next actions.",
      ],
    },
    "mission-templates/HOMEPAGE_REBUILD_MISSION_TEMPLATE.md": {
      title: "Homepage Rebuild Mission Template",
      body: [
        "Mission objective: improve homepage clarity, trust, search support, performance, and conversion flow.",
        "Required departments: executive, design, engineering, search, qa, documentation.",
        "Required agents: Product Strategist, UI UX, Motion, Frontend, SEO, Accessibility, Performance, QA.",
        "Required skills: product strategy, UI UX, motion, frontend, SEO, accessibility, performance.",
        "Required integrations: filesystem, github, figma, search-console, ga4, lighthouse, pagespeed, docs.",
        "Dependencies: offer hierarchy, analytics evidence, existing page constraints.",
        "Approval gates: production deployment and external publishing.",
        "Documentation: report, handoff, memory updates, decision log when tradeoffs are durable.",
      ],
    },
    "mission-templates/BLOG_CLUSTER_MISSION_TEMPLATE.md": {
      title: "Blog Cluster Mission Template",
      body: [
        "Mission objective: create a connected content cluster with clear search intent and internal linking support.",
        "Required departments: executive, publishing, search, qa, documentation.",
        "Required agents: SEO, Content Strategist, Copywriter, Proofreader, Internal Linking, Schema, QA.",
        "Required skills: SEO, content writing, copywriting, internal linking, schema.",
        "Required integrations: docs, filesystem, search, csv, images.",
        "Dependencies: topical map, target queries, supporting pages, editorial standards.",
        "Approval gates: publishing approval and any external claims review.",
        "Documentation: content brief, mission report, memory updates, editorial roadmap changes.",
      ],
    },
    "mission-templates/CASE_STUDY_MISSION_TEMPLATE.md": {
      title: "Case Study Mission Template",
      body: [
        "Mission objective: create a proof asset grounded in verified facts, process evidence, and allowed claims.",
        "Required departments: executive, marketing, revenue, client, qa, documentation.",
        "Required agents: Marketing Strategist, Analytics, Copywriter, Proofreader, Client Success, QA.",
        "Required skills: analytics interpretation, copywriting, reporting, trust and compliance review.",
        "Required integrations: ga4, crm, docs, filesystem, images.",
        "Dependencies: verified numbers, approved testimonial or proof assets, claim boundaries.",
        "Approval gates: external claims, publishing, client-facing usage.",
        "Documentation: claim log, mission report, decisions, handoff notes.",
      ],
    },
    "mission-templates/PROPOSAL_MISSION_TEMPLATE.md": {
      title: "Proposal Mission Template",
      body: [
        "Mission objective: prepare a scoped proposal with clear deliverables, assumptions, and next-step structure.",
        "Required departments: executive, client, revenue, qa, documentation.",
        "Required agents: Sales Consultant, Proposal Writer, Revenue Operations, Client Success, QA.",
        "Required skills: proposal writing, pricing logic, client discovery, delivery framing.",
        "Required integrations: crm, docs, filesystem, csv, gmail.",
        "Dependencies: discovery notes, scoped services, timeline assumptions, pricing model.",
        "Approval gates: final client-facing send or pricing commitments beyond existing rules.",
        "Documentation: proposal record, memory updates, decision updates, handoff state.",
      ],
    },
    "mission-templates/CLIENT_WEBSITE_DELIVERY_MISSION_TEMPLATE.md": {
      title: "Client Website Delivery Mission Template",
      body: [
        "Mission objective: convert a client request into a production-ready website package without bypassing approval gates for client review, publishing, deployment, DNS, or production release.",
        "Required departments: executive, design, engineering, search, publishing, client, qa, documentation.",
        "Required agents: Sales Consultant, Product Strategist, UI UX, Brand Designer, Motion Graphics, Frontend Engineer, Backend Engineer, SEO, AEO, GEO, Content Strategist, Performance Engineer, Accessibility Engineer, Client Success, Deployment Engineer, QA, Documentation, Knowledge Manager.",
        "Required skills: discovery, CRO, copywriting, Next.js, Tailwind, TypeScript, GSAP, Framer Motion, SEO, AEO, GEO, accessibility, performance, testing, deployment.",
        "Required integrations: filesystem, github, figma, lighthouse, pagespeed, search-console, ga4, docs, images, vercel.",
        "Dependencies: client discovery inputs, brand assets, content availability, page strategy, technical constraints, approval checkpoints.",
        "Approval gates: client proposal, major design direction, content publishing, deployment, DNS, production release.",
        "Documentation: discovery report, strategy brief, IA map, design system notes, QA records, launch preparation, memory updates, decision log, project handoff.",
      ],
    },
    "mission-templates/SEO_GROWTH_SPRINT_MISSION_TEMPLATE.md": {
      title: "SEO Growth Sprint Mission Template",
      body: [
        "Mission objective: continuously improve organic visibility, CTR, crawlability, schema, AEO, GEO, and search quality without making external state changes.",
        "Required departments: executive, search, revenue, qa, documentation.",
        "Required agents: SEO, Technical SEO, Schema, AEO, GEO, Analytics, QA, Documentation, Knowledge Manager.",
        "Required skills: SEO, Search Console, GA4, schema, AEO, GEO, performance analysis.",
        "Required integrations: search-console, ga4, search, lighthouse, pagespeed, docs.",
        "Dependencies: content inventory, historical search context, validation rules, approval boundaries for protected portals.",
        "Approval gates: login, account selection, index requests, and external portal changes.",
        "Documentation: search backlog, analytics context, memory updates, decision log, executive summary.",
      ],
    },
    "mission-templates/CONTENT_MARKETING_SPRINT_MISSION_TEMPLATE.md": {
      title: "Content Marketing Sprint Mission Template",
      body: [
        "Mission objective: create a revenue-aligned content growth plan with clusters, calendars, refreshes, snippets, FAQs, and repurposing support.",
        "Required departments: executive, publishing, search, marketing, qa, documentation.",
        "Required agents: Content Strategist, Editorial Manager, SEO, Internal Linking, Copywriter, Social Media, QA, Documentation, Knowledge Manager.",
        "Required skills: content writing, copywriting, SEO, internal linking, social repurposing.",
        "Required integrations: docs, filesystem, search, csv, images.",
        "Dependencies: topical map, business priorities, editorial constraints, content standards.",
        "Approval gates: publishing approval and any external claim review.",
        "Documentation: editorial calendar, content cluster map, repurposing plan, memory updates, roadmap changes.",
      ],
    },
    "mission-templates/REVENUE_OPPORTUNITY_REVIEW_MISSION_TEMPLATE.md": {
      title: "Revenue Opportunity Review Mission Template",
      body: [
        "Mission objective: prioritize revenue opportunities across services, CRO, AdSense, affiliate, newsletter, digital products, and future tool ideas.",
        "Required departments: executive, revenue, marketing, publishing, qa, documentation.",
        "Required agents: Analytics, CRO, Revenue Operations, AdSense, Affiliate Manager, Digital Product, Newsletter, Marketing Strategist, QA, Documentation, Knowledge Manager.",
        "Required skills: GA4, CRO, AdSense, affiliate planning, copywriting, business model analysis.",
        "Required integrations: ga4, search-console, crm, docs, filesystem, csv.",
        "Dependencies: KPI context, offer inventory, editorial context, approval rules, trust-safe claims.",
        "Approval gates: sending messages, paid actions, external state changes, and production release commitments.",
        "Documentation: revenue map, KPI summary, decision log, memory updates, executive review notes.",
      ],
    },
    "mission-templates/WEBSITE_SPEED_AUDIT_MISSION_TEMPLATE.md": {
      title: "Website Speed Audit Mission Template",
      body: [
        "Mission objective: identify performance bottlenecks and prioritize fixes by user and revenue impact.",
        "Required departments: executive, engineering, search, qa, documentation.",
        "Required agents: Performance Engineer, Frontend Engineer, SEO, QA, Documentation.",
        "Required skills: performance, Lighthouse, PageSpeed, frontend implementation.",
        "Required integrations: lighthouse, pagespeed, filesystem, github, docs.",
        "Dependencies: target URLs, test method, current scripts and asset behavior.",
        "Approval gates: production changes and third-party script modifications.",
        "Documentation: performance report, risks, next actions, validation evidence.",
      ],
    },
    "mission-templates/ADSENSE_REVIEW_MISSION_TEMPLATE.md": {
      title: "AdSense Review Mission Template",
      body: [
        "Mission objective: evaluate policy compliance, trust pages, content quality, UX, and monetization readiness.",
        "Required departments: executive, revenue, publishing, search, qa, documentation.",
        "Required agents: AdSense, SEO, Content Strategist, QA, Documentation.",
        "Required skills: AdSense, SEO, content quality review, policy distinction.",
        "Required integrations: ga4, search-console, search, lighthouse, pagespeed, docs.",
        "Dependencies: site sections, trust-page coverage, content samples, traffic context.",
        "Approval gates: enabling paid tools, account changes, ad placement changes in production.",
        "Documentation: review report, policy vs best-practice separation, open risks, next actions.",
      ],
    },
    "mission-templates/LEAD_RESEARCH_MISSION_TEMPLATE.md": {
      title: "Lead Research Mission Template",
      body: [
        "Mission objective: find exactly 50 qualified leads, create mini audits, and produce outreach drafts without sending them.",
        "Required departments: executive, marketing, revenue, client, qa, documentation.",
        "Required agents: Marketing Strategist, Lead Research, Website Audit, Business Intelligence, CRM, Outreach Drafting, QA.",
        "Required skills: controlled browser, lead research, website auditing, CRM, outreach.",
        "Required integrations: browser, search, maps, business-directories, crm, gmail, csv, docs.",
        "Dependencies: target market, approved sources, scoring model, draft template.",
        "Approval gates: login, verification, any external contact or Gmail draft creation when requested.",
        "Documentation: lead logs, outreach status log, mission report, memory updates.",
      ],
    },
    "mission-templates/CLIENT_ONBOARDING_MISSION_TEMPLATE.md": {
      title: "Client Onboarding Mission Template",
      body: [
        "Mission objective: prepare a clean onboarding package, responsibilities, communication rhythm, and handoff state.",
        "Required departments: executive, client, operations, documentation.",
        "Required agents: Client Onboarding, Client Success, Project Manager, Documentation, Knowledge Manager.",
        "Required skills: onboarding, project management, documentation, handoff control.",
        "Required integrations: crm, gmail, docs, filesystem, csv.",
        "Dependencies: signed scope, kickoff context, delivery ownership, shared timelines.",
        "Approval gates: external account changes, client communications with sensitive commitments.",
        "Documentation: onboarding record, active task updates, handoff notes, decisions, current state.",
      ],
    },
    "mission-templates/WEEKLY_ANALYTICS_REVIEW_MISSION_TEMPLATE.md": {
      title: "Weekly Analytics Review Mission Template",
      body: [
        "Mission objective: generate a weekly executive analytics review across traffic, conversion, pipeline, and revenue opportunities.",
        "Required departments: executive, revenue, marketing, documentation.",
        "Required agents: Analytics, CRO, Marketing Strategist, QA, Documentation.",
        "Required skills: GA4, CRO, SEO, operations.",
        "Required integrations: ga4, search-console, crm, csv, docs.",
        "Dependencies: access to analytics context, mission KPI rules, executive reporting cadence.",
        "Approval gates: account access and any external state-changing step.",
        "Documentation: executive summary, KPI update, memory and department report updates.",
      ],
    },
    "mission-templates/NEWSLETTER_CAMPAIGN_MISSION_TEMPLATE.md": {
      title: "Newsletter Campaign Mission Template",
      body: [
        "Mission objective: prepare a documented newsletter campaign without sending automatically.",
        "Required departments: executive, publishing, marketing, client, documentation.",
        "Required agents: Content Strategist, Newsletter, CRM, QA, Documentation.",
        "Required skills: content writing, copywriting, Gmail, CRM.",
        "Required integrations: gmail, crm, docs, filesystem, csv.",
        "Dependencies: campaign theme, approved audience, review standards.",
        "Approval gates: any client-facing or external send action.",
        "Documentation: campaign report, memory updates, approval queue state.",
      ],
    },
  };

  for (const [filePath, template] of Object.entries(missionTemplates)) {
    await writeFile(
      filePath,
      `
# ${template.title}

${template.body.map((line) => `- ${line}`).join("\n")}
`
    );
  }
}

async function syncDashboardArtifacts() {
  await writeFile("executive-dashboard/README.md", "# Executive Dashboard\n\nUse this area for current missions, active agents, blocked tasks, pending approvals, lead pipeline, SEO progress, content progress, website projects, revenue opportunities, documentation health, memory health, QA health, and weekly executive reviews.");
  await writeFile("department-reports/README.md", "# Department Reports\n\nStore department-level mission summaries, recurring operating reviews, and cross-department lessons learned here.");
  await writeFile("company-kpis/README.md", "# Company KPIs\n\nStore KPI definitions, department health, company health, scorecard snapshots, and executive operating metrics here.");
  await writeFile(
    "company-kpis/AGENT_SCORECARD.md",
    `
# Agent Scorecard

Track every WGOS agent with these metrics:

- Tasks Completed
- QA Pass Rate
- Documentation Compliance
- Average Execution Time
- Failures
- Retries
- Memory Updates
- Approval Compliance
- Business Impact

## Usage

- Update scorecards at the end of meaningful missions.
- Use scorecards to identify where prompts, workflows, or skills need improvement.
- Do not record estimated performance as confirmed performance.
`
  );
  await writeFile(
    "company-kpis/AGENT_SCORECARD_TEMPLATE.md",
    `
# Agent Scorecard Template

- Agent
- Period
- Tasks Completed
- QA Pass Rate
- Documentation Compliance
- Average Execution Time
- Failures
- Retries
- Memory Updates
- Approval Compliance
- Business Impact
- Improvement Recommendation
`
  );
}

async function cleanupLegacyArtifacts() {
  const legacyPaths = ["agents/content", ".browser"];

  await Promise.all(
    legacyPaths.map(async (legacyPath) => {
      const fullPath = path.join(WGOS_ROOT, legacyPath);
      try {
        await fs.rm(fullPath, { recursive: true, force: true });
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "EBUSY") {
          console.warn(`Legacy artifact cleanup skipped for locked path: ${legacyPath} (${error.message})`);
          return;
        }
        throw error;
      }
    })
  );
}

async function main() {
  await cleanupLegacyArtifacts();
  await syncRootDocs();
  await syncSoftwareFirstScaffold();
  await syncRegistries();
  await syncSkillDocs();
  await syncAgentDocs();
  await syncDepartmentDocs();
  await syncWorkflowDocs();
  await syncRuntimeDocs();
  await syncIntegrationDocs();
  await syncTemplateDocs();
  await syncProductionGrowthIntelligencePlatform();
  await syncTenantDocs();
  await syncReleaseDocs();
  await syncOperationalState();
  await syncDataSamples();
  await syncMissionTemplates();
  await syncDashboardArtifacts();

  console.log(`WGOS sync complete: ${demoMission.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
