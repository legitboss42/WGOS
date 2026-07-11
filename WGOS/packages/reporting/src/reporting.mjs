import path from "node:path";
import { WGOS_ROOT } from "../../../scripts/lib/wgos-config.mjs";
import { writeText } from "../../runtime/src/fs-utils.mjs";

export async function writeMissionArtifacts(root = WGOS_ROOT, missionRecord, tasks, reportRecord) {
  const missionDir = path.join(root, "missions", missionRecord.id);
  const reportDir = path.join(root, "reports", missionRecord.id);

  await writeText(
    path.join(missionDir, "mission.md"),
    `
# ${missionRecord.id}

## Objective

${missionRecord.objective}

## Status

${missionRecord.status}

## Template

${missionRecord.templateId}

## Company

${missionRecord.companyId}

## Approval class

${missionRecord.approvalClass}

## Workflows

${missionRecord.workflows.map((workflow) => `- ${workflow}`).join("\n")}

## Success criteria

${missionRecord.successCriteria.map((item) => `- ${item}`).join("\n")}
`
  );

  await writeText(
    path.join(missionDir, "task-board.md"),
    `
# Task Board

| Task ID | Sequence | Agent | Status | Objective | Next Agent |
| --- | --- | --- | --- | --- | --- |
${tasks
  .map(
    (task) =>
      `| ${task.id} | ${task.sequence} | ${task.agentTitle} | ${task.status} | ${task.objective} | ${task.nextAgentSlug ?? "-"} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(missionDir, "handoff.md"),
    `
# Handoff

- Mission ID: ${missionRecord.id}
- Current Status: ${missionRecord.status}
- Completed Work: ${tasks.filter((task) => task.status === "COMPLETED").length} tasks completed
- Files Changed: state, reports, missions, dashboard surfaces, memory
- Documentation Updated: reports, memory, executive dashboard, company KPIs
- Outstanding Risks: ${missionRecord.openRisks.length ? missionRecord.openRisks.join("; ") : "none"}
- Next Required Agent: ${reportRecord.nextRequiredAgent ?? "none"}
- Validation Needed: ${reportRecord.validationSummary}
`
  );

  await writeText(
    path.join(reportDir, "mission-report.md"),
    `
# Mission Report

- Mission: ${missionRecord.id}
- Template: ${missionRecord.templateId}
- Type: ${missionRecord.missionType}
- Status: ${missionRecord.status}
- Objective: ${missionRecord.objective}
- Approval Class: ${missionRecord.approvalClass}
- Required Departments: ${missionRecord.requiredDepartments.join(", ")}
- Required Integrations: ${missionRecord.requiredIntegrations.join(", ")}
- Estimated Complexity: ${missionRecord.estimatedComplexity}
- Business Value: ${missionRecord.businessValue}
- Revenue Impact: ${missionRecord.revenueImpact}
- Validation: ${reportRecord.validationSummary}
- Integration Summary: ${(reportRecord.integrationSummary ?? []).join(", ") || "local runtime only"}
- Collaboration Requests: ${reportRecord.collaborationSummary?.length ?? 0}
- Next Step: ${reportRecord.nextStep}
`
  );

  await writeText(
    path.join(reportDir, "qa-report.md"),
    `
# QA Report

- Mission: ${missionRecord.id}
- Result: ${reportRecord.qaResult}
- Completed Tasks: ${tasks.filter((task) => task.status === "COMPLETED").length}
- Waiting Approval Tasks: ${tasks.filter((task) => task.status === "WAITING_APPROVAL").length}
- Blocked Tasks: ${tasks.filter((task) => task.status === "BLOCKED").length}
- Notes: ${reportRecord.validationSummary}
`
  );

  await writeText(
    path.join(root, "executive-dashboard", "company-task-board.md"),
    `
# Company Task Board

| Mission ID | Priority | Department | Assigned Agents | Dependencies | Estimated Complexity | Business Value | Revenue Impact | Documentation Status | QA Status | Approval Status | Completion Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${missionRecord.departmentSummaries
  .map(
    (summary) =>
      `| ${missionRecord.id} | ${missionRecord.priority} | ${summary.department} | ${summary.assignedAgents.join(", ")} | runtime plan | ${missionRecord.estimatedComplexity} | ${missionRecord.businessValue} | ${missionRecord.revenueImpact} | ${missionRecord.documentationStatus} | ${missionRecord.qaStatus} | ${missionRecord.approvalStatus} | ${missionRecord.completionStatus} |`
  )
  .join("\n")}
`
  );

  for (const summary of missionRecord.departmentSummaries) {
    await writeText(
      path.join(root, "department-reports", `${missionRecord.id}-${summary.department}.md`),
      `
# Department Report

- Mission: ${missionRecord.id}
- Department: ${summary.department}
- Assigned Agents: ${summary.assignedAgents.join(", ")}
- Completed Tasks: ${summary.completedTasks}
- Blocked Tasks: ${summary.blockedTasks}
- Waiting Approval Tasks: ${summary.waitingApprovalTasks}
- Documentation Status: ${missionRecord.documentationStatus}
- QA Status: ${missionRecord.qaStatus}
- Integration Coverage: ${collectIntegrations(tasks, summary.department).join(", ") || "local runtime only"}
`
    );
  }

  if (missionRecord.templateId === "CLIENT_WEBSITE_DELIVERY") {
    await writeWebsiteProductionArtifacts(root, missionRecord, tasks, reportRecord);
  }
  if (["SEO_GROWTH_SPRINT", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW", "LEAD_RESEARCH", "WEEKLY_ANALYTICS_REVIEW"].includes(missionRecord.templateId)) {
    await writeGrowthArtifacts(root, missionRecord, tasks, reportRecord);
  }
}

async function writeWebsiteProductionArtifacts(root, missionRecord, tasks, reportRecord) {
  const productionDir = path.join(root, "production");
  const healthScore = buildWebsiteHealthScore(tasks);
  const productionTaskGroups = {
    discovery: filterTasks(tasks, ["SALES_CONSULTANT_AGENT", "CEO_OPERATOR_AGENT", "PROJECT_MANAGER_AGENT"]),
    strategy: filterTasks(tasks, ["PRODUCT_STRATEGIST_AGENT"]),
    architecture: filterTasks(tasks, ["UI_UX_DESIGN_AGENT", "SEO_AGENT"]),
    design: filterTasks(tasks, ["BRAND_DESIGN_AGENT", "UI_UX_DESIGN_AGENT"]),
    motion: filterTasks(tasks, ["MOTION_GRAPHICS_AGENT"]),
    development: filterTasks(tasks, ["FRONTEND_ENGINEER_AGENT", "BACKEND_ENGINEER_AGENT", "DEPLOYMENT_ENGINEER_AGENT"]),
    search: filterTasks(tasks, ["SEO_AGENT", "AEO_AGENT", "GEO_AGENT"]),
    content: filterTasks(tasks, ["CONTENT_STRATEGIST_AGENT"]),
    qa: filterTasks(tasks, ["PERFORMANCE_ENGINEER_AGENT", "ACCESSIBILITY_ENGINEER_AGENT", "QA_ENGINEER_AGENT"]),
    client: filterTasks(tasks, ["CLIENT_SUCCESS_AGENT", "DOCUMENTATION_AGENT", "KNOWLEDGE_MANAGER_AGENT"]),
  };

  await writeText(
    path.join(productionDir, "client-delivery", `${missionRecord.id}-client-delivery-plan.md`),
    `
# Client Delivery Plan

- Mission: ${missionRecord.id}
- Client: ${missionRecord.companyId}
- Review owner: Client Success
- Review checkpoints:
${productionTaskGroups.client.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No client review outputs recorded."}
- Revision control: use the client review and revision system plus mission handoff records.
- Approval gates: ${missionRecord.approvalGates.join("; ")}
`
  );

  await writeText(
    path.join(productionDir, "design", `${missionRecord.id}-design-direction.md`),
    `
# Design Direction Package

- Mission: ${missionRecord.id}
- Discovery-to-design transition:
${productionTaskGroups.strategy.map((task) => `  - ${task.objective}`).join("\n") || "  - Strategy notes pending."}
- IA and UX outputs:
${productionTaskGroups.architecture.map((task) => `  - ${task.expectedOutput}`).join("\n") || "  - IA outputs pending."}
- Brand and interface outputs:
${productionTaskGroups.design.map((task) => `  - ${task.expectedOutput}`).join("\n") || "  - Design outputs pending."}
`
  );

  await writeText(
    path.join(productionDir, "motion", `${missionRecord.id}-motion-spec.md`),
    `
# Motion Spec

- Mission: ${missionRecord.id}
- Motion outputs:
${productionTaskGroups.motion.map((task) => `  - ${task.expectedOutput}`).join("\n") || "  - Motion outputs pending."}
- Reduced motion requirement: mandatory before any production release.
- Performance-safe implementation note: coordinate with performance and frontend tasks before implementation.
`
  );

  await writeText(
    path.join(productionDir, "development", `${missionRecord.id}-engineering-handoff.md`),
    `
# Engineering Handoff

- Mission: ${missionRecord.id}
- Frontend and backend outputs:
${productionTaskGroups.development.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - Development outputs pending."}
- Required integrations: ${missionRecord.requiredIntegrations.join(", ")}
- Release constraint: deployment remains approval-gated.
`
  );

  await writeText(
    path.join(productionDir, "seo", `${missionRecord.id}-search-package.md`),
    `
# Search Package

- Mission: ${missionRecord.id}
- Search outputs:
${productionTaskGroups.search.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - Search outputs pending."}
- Internal linking, metadata, schema, AEO, and GEO must be validated before release.
`
  );

  await writeText(
    path.join(productionDir, "content", `${missionRecord.id}-content-package.md`),
    `
# Content Package

- Mission: ${missionRecord.id}
- Content outputs:
${productionTaskGroups.content.map((task) => `  - ${task.expectedOutput}`).join("\n") || "  - Content outputs pending."}
- Page copy, FAQs, CTA structure, and trust-safe proof blocks must stay aligned with the approved site strategy.
`
  );

  await writeText(
    path.join(productionDir, "qa", `${missionRecord.id}-qa-gate.md`),
    `
# QA Gate

- Mission: ${missionRecord.id}
- QA result: ${reportRecord.qaResult}
- Validation summary: ${reportRecord.validationSummary}
- QA-linked outputs:
${productionTaskGroups.qa.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - QA outputs pending."}
- Website health score:
${Object.entries(healthScore).map(([key, value]) => `  - ${key}: ${value}/10`).join("\n")}
`
  );

  await writeText(
    path.join(productionDir, "launch", `${missionRecord.id}-launch-preparation.md`),
    `
# Launch Preparation

- Mission: ${missionRecord.id}
- Completion status: ${missionRecord.status}
- Approval status: ${missionRecord.approvalStatus}
- Deployment-preparation outputs:
${productionTaskGroups.development.filter((task) => task.agentSlug === "DEPLOYMENT_ENGINEER_AGENT").map((task) => `  - ${task.expectedOutput}`).join("\n") || "  - Deployment-preparation outputs pending."}
- Required approvals: ${missionRecord.approvalGates.join("; ")}
- No deployment, DNS change, or production release may proceed without explicit human approval.
`
  );

  await writeText(
    path.join(root, "reports", missionRecord.id, "website-production-summary.md"),
    `
# Website Production Summary

- Mission: ${missionRecord.id}
- Client: ${missionRecord.companyId}
- Discovery tasks: ${productionTaskGroups.discovery.length}
- Strategy tasks: ${productionTaskGroups.strategy.length}
- Architecture and design tasks: ${productionTaskGroups.architecture.length + productionTaskGroups.design.length}
- Development tasks: ${productionTaskGroups.development.length}
- Search tasks: ${productionTaskGroups.search.length}
- QA tasks: ${productionTaskGroups.qa.length}
- Client delivery tasks: ${productionTaskGroups.client.length}
- Website health score:
${Object.entries(healthScore).map(([key, value]) => `  - ${key}: ${value}/10`).join("\n")}
`
  );
}

function collectIntegrations(tasks, department) {
  return tasks
    .filter((task) => task.department === department)
    .flatMap((task) => task.integrationsUsed ?? [])
    .map((item) => item.id)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function filterTasks(tasks, agentSlugs) {
  return tasks.filter((task) => agentSlugs.includes(task.agentSlug));
}

function buildWebsiteHealthScore(tasks) {
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const totalCount = Math.max(tasks.length, 1);
  const base = Math.max(6, Math.min(10, Math.round((completedCount / totalCount) * 10)));

  return {
    design: base,
    ux: base,
    seo: clampScore(base + countIfPresent(tasks, ["SEO_AGENT", "AEO_AGENT", "GEO_AGENT"]) - 1),
    performance: clampScore(base + countIfPresent(tasks, ["PERFORMANCE_ENGINEER_AGENT"]) - 1),
    accessibility: clampScore(base + countIfPresent(tasks, ["ACCESSIBILITY_ENGINEER_AGENT"]) - 1),
    content: clampScore(base + countIfPresent(tasks, ["CONTENT_STRATEGIST_AGENT"]) - 1),
    conversion: clampScore(base + countIfPresent(tasks, ["PRODUCT_STRATEGIST_AGENT", "CLIENT_SUCCESS_AGENT"]) - 1),
    motion: clampScore(base + countIfPresent(tasks, ["MOTION_GRAPHICS_AGENT"]) - 1),
    maintainability: clampScore(base + countIfPresent(tasks, ["FRONTEND_ENGINEER_AGENT", "BACKEND_ENGINEER_AGENT", "DEPLOYMENT_ENGINEER_AGENT"]) - 1),
    documentation: clampScore(base + countIfPresent(tasks, ["DOCUMENTATION_AGENT", "KNOWLEDGE_MANAGER_AGENT"]) - 1),
  };
}

function countIfPresent(tasks, agentSlugs) {
  return tasks.some((task) => agentSlugs.includes(task.agentSlug)) ? 1 : 0;
}

function clampScore(value) {
  return Math.max(1, Math.min(10, value));
}

async function writeGrowthArtifacts(root, missionRecord, tasks, reportRecord) {
  const marketingTasks = tasks.filter((task) => task.department === "marketing");
  const searchTasks = tasks.filter((task) => task.department === "search");
  const revenueTasks = tasks.filter((task) => task.department === "revenue");
  const publishingTasks = tasks.filter((task) => task.department === "publishing");

  await writeText(
    path.join(root, "growth", "dashboard", "latest-growth-summary.md"),
    `
# Latest Growth Summary

- Mission: ${missionRecord.id}
- Template: ${missionRecord.templateId}
- Status: ${missionRecord.status}
- Business value: ${missionRecord.businessValue}
- Revenue impact: ${missionRecord.revenueImpact}
- Marketing tasks: ${marketingTasks.length}
- Search tasks: ${searchTasks.length}
- Revenue tasks: ${revenueTasks.length}
- Publishing tasks: ${publishingTasks.length}
- Next step: ${reportRecord.nextStep}
`
  );

  await writeText(
    path.join(root, "growth", "analytics", `${missionRecord.id}-analytics-summary.md`),
    `
# Growth Analytics Summary

- Mission: ${missionRecord.id}
- Validation: ${reportRecord.validationSummary}
- Search-related outputs:
${searchTasks.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No search outputs recorded."}
- Revenue-related outputs:
${revenueTasks.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No revenue outputs recorded."}
`
  );

  await writeText(
    path.join(root, "growth", "crm", `${missionRecord.id}-crm-state.md`),
    `
# Growth CRM State

- Mission: ${missionRecord.id}
- CRM status model remains: Lead -> Audit -> Draft -> Approval -> Contacted -> Reply -> Meeting -> Proposal -> Won -> Lost -> Future opportunity
- Marketing outputs:
${marketingTasks.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No marketing outputs recorded."}
- Approval boundary: no automatic outreach or live contact actions.
`
  );

  await writeText(
    path.join(root, "growth", "revenue", `${missionRecord.id}-revenue-opportunities.md`),
    `
# Revenue Opportunities

- Mission: ${missionRecord.id}
- Revenue impact: ${missionRecord.revenueImpact}
- Revenue outputs:
${revenueTasks.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No revenue outputs recorded."}
- Supporting publishing outputs:
${publishingTasks.map((task) => `  - ${task.agentTitle}: ${task.expectedOutput}`).join("\n") || "  - No publishing outputs recorded."}
`
  );
}
