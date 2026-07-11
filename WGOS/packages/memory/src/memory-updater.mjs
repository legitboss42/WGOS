import path from "node:path";
import { WGOS_ROOT } from "../../../scripts/lib/wgos-config.mjs";
import { ensureDir, readJson, writeText } from "../../runtime/src/fs-utils.mjs";
import { getStatePaths } from "../../runtime/src/state-store.mjs";

export async function writeMemoryArtifacts(root = WGOS_ROOT, missionRecord, tasks) {
  const paths = getStatePaths(root);
  const summary = await readJson(paths.summary, {});
  const memoryDirs = [
    "company",
    "departments",
    "agents",
    "missions",
    "projects",
    "clients",
    "marketing",
    "seo",
    "content",
    "publishing",
    "revenue",
  ];

  await Promise.all(memoryDirs.map((dir) => ensureDir(path.join(root, "memory", dir))));

  await writeText(
    path.join(root, "memory", "CURRENT_STATE.md"),
    `
# Current State

- Last mission run: ${missionRecord.id}
- Mission status: ${missionRecord.status}
- Active missions: ${(summary.activeMissionIds ?? []).length}
- Waiting approval missions: ${(summary.waitingApprovalMissionIds ?? []).length}
- Completed missions: ${(summary.completedMissionIds ?? []).length}
- Last updated: ${summary.generatedAt ?? missionRecord.updatedAt}
`
  );

  await writeText(
    path.join(root, "memory", "ACTIVE_TASKS.md"),
    `
# Active Tasks

${tasks
  .filter((task) => !["COMPLETED", "ARCHIVED"].includes(task.status))
  .map((task) => `- ${task.id} | ${task.status} | ${task.agentSlug} | ${task.objective}`)
  .join("\n") || "- No active tasks."}
`
  );

  await writeText(
    path.join(root, "memory", "NEXT_ACTIONS.md"),
    `
# Next Actions

${tasks
  .filter((task) => task.status !== "ARCHIVED")
  .slice(-5)
  .map((task) => `- ${task.id}: ${task.nextAgentSlug ? `handoff to ${task.nextAgentSlug}` : "archive and monitor reporting outputs"}`)
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "memory", "CODEX_MEMORY.md"),
    `
# Codex Memory

- Latest executed mission: ${missionRecord.id}
- Latest mission template: ${missionRecord.templateId}
- Latest mission objective: ${missionRecord.objective}
- Runtime state now persists under \`WGOS/state/\` in JSON form in addition to markdown records.
- Operator and dashboard surfaces read from runtime state rather than relying on handwritten summaries.
- Department collaboration now routes through mission-level company plans rather than isolated specialist-only runs.
`
  );

  await writeText(
    path.join(root, "memory", "company", "MISSION_HISTORY.md"),
    `
# Mission History

- Latest mission: ${missionRecord.id}
- Mission type: ${missionRecord.missionType}
- Required departments: ${missionRecord.requiredDepartments.join(", ")}
- Completion status: ${missionRecord.completionStatus}
- Business value: ${missionRecord.businessValue}
- Revenue impact: ${missionRecord.revenueImpact}
`
  );

  await writeText(
    path.join(root, "memory", "missions", `${missionRecord.id}.md`),
    `
# Mission Memory

- Mission ID: ${missionRecord.id}
- Objective: ${missionRecord.objective}
- Departments: ${missionRecord.requiredDepartments.join(", ")}
- Integrations: ${missionRecord.requiredIntegrations.join(", ")}
- Approval status: ${missionRecord.approvalStatus}
- QA status: ${missionRecord.qaStatus}
- Documentation status: ${missionRecord.documentationStatus}
`
  );

  if (missionRecord.templateId === "CLIENT_WEBSITE_DELIVERY") {
    const pagePlan = tasks
      .filter((task) => ["design", "engineering", "search", "publishing", "client"].includes(task.department))
      .map((task) => `- ${task.agentTitle}: ${task.expectedOutput}`)
      .join("\n");

    await writeText(
      path.join(root, "memory", "projects", `${missionRecord.id}.md`),
      `
# Project Memory

- Client: ${missionRecord.companyId}
- Mission: ${missionRecord.id}
- Website type: ${missionRecord.missionType}
- Status: ${missionRecord.status}
- Pages and systems in scope:
${pagePlan || "- No production-stage outputs recorded."}
- Integrations: ${missionRecord.requiredIntegrations.join(", ")}
- Approvals: ${missionRecord.approvalGates.join("; ")}
- Decisions: use reports, department reports, and project handoff as the active decision trail for this mission.
- Future improvements: convert validated plans into implementation-ready tickets before any production release.
`
    );
  }

  await writeText(
    path.join(root, "memory", "departments", "LATEST.md"),
    `
# Department Memory

${missionRecord.departmentSummaries
  .map(
    (summary) =>
      `- ${summary.department}: agents=${summary.assignedAgents.join(", ")} completed=${summary.completedTasks} blocked=${summary.blockedTasks} waiting_approval=${summary.waitingApprovalTasks}`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "memory", "agents", "LATEST.md"),
    `
# Agent Memory

${tasks
  .map((task) => `- ${task.agentSlug}: ${task.status} on ${missionRecord.id} (${task.objective})`)
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "memory", "marketing", "PIPELINE_STATE.md"),
    `
# Marketing Pipeline State

- Latest mission affecting pipeline: ${missionRecord.requiredDepartments.includes("marketing") ? missionRecord.id : "No active marketing mission"}
- Lead pipeline owner: marketing department
- No automatic outreach is permitted.
- Growth mission coverage: ${["LEAD_RESEARCH", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW"].includes(missionRecord.templateId) ? missionRecord.templateId : "No new growth mission in this run"}
`
  );

  await writeText(
    path.join(root, "memory", "seo", "SEARCH_HISTORY.md"),
    `
# Search History

- Latest search-related mission: ${missionRecord.requiredDepartments.includes("search") ? missionRecord.id : "No active search mission"}
- Search work remains evidence-based and approval-aware.
- SEO growth engine active: ${["SEO_GROWTH_SPRINT", "SEO_AUDIT", "TECHNICAL_SEO_CLEANUP"].includes(missionRecord.templateId) ? "yes" : "no new sprint in this run"}
`
  );

  await writeText(
    path.join(root, "memory", "content", "EDITORIAL_HISTORY.md"),
    `
# Editorial History

- Compatibility note: the active editorial department is \`publishing\`.
- Latest publishing mission: ${missionRecord.requiredDepartments.includes("publishing") ? missionRecord.id : "No active publishing mission"}
`
  );

  await writeText(
    path.join(root, "memory", "publishing", "EDITORIAL_HISTORY.md"),
    `
# Publishing History

- Latest publishing mission: ${missionRecord.requiredDepartments.includes("publishing") ? missionRecord.id : "No active publishing mission"}
- Publishing remains the active editorial model in WGOS.
`
  );

  await writeText(
    path.join(root, "memory", "revenue", "REVENUE_HISTORY.md"),
    `
# Revenue History

- Latest revenue-related mission: ${missionRecord.requiredDepartments.includes("revenue") ? missionRecord.id : "No active revenue mission"}
- Revenue signals are tracked through KPI and mission reporting outputs.
- Revenue engine state: ${missionRecord.templateId === "REVENUE_OPPORTUNITY_REVIEW" ? "Revenue opportunity review captured." : "No new revenue review in this run."}
`
  );

  await writeText(
    path.join(root, "memory", "clients", "CLIENT_HISTORY.md"),
    `
# Client History

- Latest client-related mission: ${missionRecord.requiredDepartments.includes("client") ? missionRecord.id : "No active client mission"}
- Client operations remain approval-aware and documented.
`
  );
}
