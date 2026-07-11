import path from "node:path";
import { WGOS_ROOT, tenants } from "../../../scripts/lib/wgos-config.mjs";
import { readJson, writeJson, writeText } from "../../runtime/src/fs-utils.mjs";
import { getStatePaths } from "../../runtime/src/state-store.mjs";

export async function writeScorecardArtifacts(root = WGOS_ROOT) {
  const paths = getStatePaths(root);
  const scorecards = await readJson(paths.scorecards, []);
  const summary = await readJson(paths.summary, {});
  const missions = await readJson(paths.missionIndex, []);
  const tasks = await readJson(paths.taskIndex, []);
  const departmentMetrics = await readJson(paths.departmentMetrics, []);

  const topAgents = [...scorecards]
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.qaPasses - a.qaPasses)
    .slice(0, 10);

  const missionAnalytics = buildMissionAnalytics(missions, tasks);
  const departmentHistory = buildDepartmentHistory(missions, tasks, departmentMetrics);
  const intelligenceSummary = buildIntelligenceSummary(missions, tasks, scorecards, departmentHistory);
  const companyHealth = buildCompanyHealthSummary(missions, tasks, scorecards, intelligenceSummary);
  const companyPortfolio = buildCompanyPortfolio(missions, tasks, tenants, companyHealth);
  const analyticsPayload = {
    generatedAt: summary.generatedAt,
    missionAnalytics,
    departmentHistory,
    topAgents,
    intelligenceSummary,
    companyHealth,
    companyPortfolio,
    summary,
  };

  await writeJson(paths.analytics, analyticsPayload);

  await writeText(
    path.join(root, "company-kpis", "web-growth-scorecard.md"),
    `
# Web Growth Scorecard

| Agent | Department | Tasks Completed | QA Passes | Documentation Updates | Memory Updates | Approval Pauses |
| --- | --- | --- | --- | --- | --- | --- |
${topAgents
  .map(
    (item) =>
      `| ${item.agentTitle} | ${item.department} | ${item.tasksCompleted} | ${item.qaPasses} | ${item.documentationUpdates} | ${item.memoryUpdates} | ${item.approvalPauses} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "company-health.md"),
    `
# Company KPI Framework

- Website projects completed: ${missions.filter((mission) => ["BUILD_PREMIUM_WEBSITE", "REDESIGN_WEBSITE", "HOMEPAGE_REBUILD", "CLIENT_WEBSITE_DELIVERY"].includes(mission.templateId) && mission.status === "COMPLETED").length}
- Revenue generated: not measured live in local-only runtime
- Leads found: ${missions.filter((mission) => mission.templateId === "LEAD_RESEARCH").length > 0 ? "mission framework active" : "none yet"}
- Emails drafted: approval-gated and not auto-sent
- Meetings booked: not tracked in local-only runtime
- Content published: publishing workflow framework active
- SEO improvements: ${missions.filter((mission) => ["SEO_AUDIT", "TECHNICAL_SEO_CLEANUP", "SEO_GROWTH_SPRINT"].includes(mission.templateId)).length}
- Traffic growth: analytics review framework active
- Conversions: CRO framework active
- Core Web Vitals: tracked through engineering and search missions
- Documentation compliance: ${missionAnalytics.documentationHealth}
- QA pass rate: ${scorecards.reduce((sum, item) => sum + item.qaPasses, 0)}
- Agent utilization: ${summary.activeAgentCount ?? 0} active agents
- Average mission task count: ${missionAnalytics.averageTaskCount}
- Average department count per mission: ${missionAnalytics.averageDepartmentCount}
`
  );

  await writeText(
    path.join(root, "company-kpis", "department-health.md"),
    `
# Department Health

| Department | Missions Touched | Tasks Completed | Blocked Tasks | Waiting Approval Tasks |
| --- | --- | --- | --- | --- |
${departmentMetrics
  .map(
    (item) =>
      `| ${item.department} | ${item.missionsTouched} | ${item.tasksCompleted} | ${item.blockedTasks} | ${item.waitingApprovalTasks} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "mission-analytics.md"),
    `
# Mission Analytics

- Total missions: ${missionAnalytics.totalMissions}
- Completed missions: ${missionAnalytics.completedMissions}
- Waiting approval missions: ${missionAnalytics.waitingApprovalMissions}
- Blocked missions: ${missionAnalytics.blockedMissions}
- Average task count: ${missionAnalytics.averageTaskCount}
- Average department count: ${missionAnalytics.averageDepartmentCount}

| Template | Missions | Completed | Blocked | Waiting Approval | Avg Tasks |
| --- | --- | --- | --- | --- | --- |
${missionAnalytics.byTemplate
  .map(
    (item) =>
      `| ${item.templateId} | ${item.missions} | ${item.completed} | ${item.blocked} | ${item.waitingApproval} | ${item.averageTaskCount} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "department-history.md"),
    `
# Department History

| Department | Missions | Tasks | Completed | Blocked | Waiting Approval | Completion Rate |
| --- | --- | --- | --- | --- | --- | --- |
${departmentHistory
  .map(
    (item) =>
      `| ${item.department} | ${item.missions} | ${item.tasks} | ${item.completedTasks} | ${item.blockedTasks} | ${item.waitingApprovalTasks} | ${item.completionRate}% |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "agent-performance.md"),
    `
# Agent Performance

| Agent | Department | Tasks | QA Passes | Documentation | Approval Pauses | Last Execution |
| --- | --- | --- | --- | --- | --- | --- |
${scorecards
  .map(
    (item) =>
      `| ${item.agentTitle} | ${item.department} | ${item.tasksCompleted} | ${item.qaPasses} | ${item.documentationUpdates} | ${item.approvalPauses} | ${item.lastExecutionAt ?? "n/a"} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "department-performance.md"),
    `
# Department Performance

| Department | Productivity | Quality | Efficiency | Revenue Contribution |
| --- | --- | --- | --- | --- |
${departmentHistory
  .map(
    (item) =>
      `| ${item.department} | ${item.tasks} tasks | ${item.completionRate}% completion | ${item.missions} missions touched | ${estimateRevenueContribution(item.department)} |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "company-kpis", "company-health-score.md"),
    `
# Company Health Score

- Revenue readiness: ${companyHealth.revenueReadiness}/10
- Operational maturity: ${companyHealth.operationalMaturity}/10
- Documentation quality: ${companyHealth.documentationQuality}/10
- Memory completeness: ${companyHealth.memoryCompleteness}/10
- Workflow quality: ${companyHealth.workflowQuality}/10
- SEO readiness: ${companyHealth.seoReadiness}/10
- AdSense readiness: ${companyHealth.adsenseReadiness}/10
- Content maturity: ${companyHealth.contentMaturity}/10
- Website maturity: ${companyHealth.websiteMaturity}/10
- Technical debt: ${companyHealth.technicalDebt}/10
- Overall company health: ${companyHealth.overall}/10
`
  );

  await writeText(
    path.join(root, "platform", "company-registry", "company-status-board.md"),
    `
# Company Status Board

| Company | Slug | Missions | Completed | Active | Departments | Portfolio Health |
| --- | --- | --- | --- | --- | --- | --- |
${companyPortfolio
  .map(
    (item) =>
      `| ${item.name} | ${item.slug} | ${item.missions} | ${item.completedMissions} | ${item.activeMissions} | ${item.departments.join(", ") || "-"} | ${item.healthScore}/10 |`
  )
  .join("\n")}
`
  );

  await writeText(
    path.join(root, "platform", "global-reporting", "portfolio-dashboard.md"),
    `
# Portfolio Dashboard

- Companies tracked: ${companyPortfolio.length}
- Active companies: ${companyPortfolio.filter((item) => item.missions > 0).length}
- Average portfolio health: ${average(companyPortfolio.map((item) => item.healthScore))}
- Highest mission company: ${companyPortfolio[0]?.name ?? "none yet"}
`
  );

  await writeText(
    path.join(root, "intelligence", "history", "mission-trend-summary.md"),
    `
# Mission Trend Summary

- Total missions tracked: ${intelligenceSummary.totalMissions}
- Production missions: ${intelligenceSummary.productionMissionCount}
- Growth missions: ${intelligenceSummary.growthMissionCount}
- Most active template: ${intelligenceSummary.topTemplate ?? "none yet"}
- Most active department: ${intelligenceSummary.topDepartment ?? "none yet"}
- Average completion rate: ${intelligenceSummary.averageCompletionRate}%
`
  );

  await writeText(
    path.join(root, "intelligence", "learning", "latest-learning.md"),
    `
# Latest Learning

## What worked

${intelligenceSummary.whatWorked.map((item) => `- ${item}`).join("\n") || "- No repeated wins identified yet."}

## What is weak

${intelligenceSummary.weakAreas.map((item) => `- ${item}`).join("\n") || "- No repeated weak areas identified yet."}

## Next learning focus

${intelligenceSummary.nextLearningFocus.map((item) => `- ${item}`).join("\n") || "- Continue collecting mission evidence."}
`
  );

  await writeText(
    path.join(root, "intelligence", "patterns", "recurring-patterns.md"),
    `
# Recurring Patterns

## Template patterns

${intelligenceSummary.templatePatterns.map((item) => `- ${item}`).join("\n") || "- No recurring template pattern identified yet."}

## Department patterns

${intelligenceSummary.departmentPatterns.map((item) => `- ${item}`).join("\n") || "- No recurring department pattern identified yet."}
`
  );

  await writeText(
    path.join(root, "intelligence", "recommendations", "prioritized-recommendations.md"),
    `
# Prioritized Recommendations

${intelligenceSummary.recommendations
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n") || "1. Continue running missions to build recommendation confidence."}
`
  );

  await writeText(
    path.join(root, "intelligence", "recommendations", "automation-opportunities.md"),
    `
# Automation Opportunities

${intelligenceSummary.automationOpportunities
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n") || "1. No automation opportunity identified yet."}
`
  );

  await writeText(
    path.join(root, "intelligence", "recommendations", "decision-analysis.md"),
    `
# Decision Analysis

${intelligenceSummary.decisionAnalysis
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n") || "1. No decision-analysis recommendation identified yet."}
`
  );

  await writeText(
    path.join(root, "intelligence", "benchmarks", "operating-benchmarks.md"),
    `
# Operating Benchmarks

- Average tasks per mission: ${missionAnalytics.averageTaskCount}
- Average departments per mission: ${missionAnalytics.averageDepartmentCount}
- Top agent task count: ${topAgents[0]?.tasksCompleted ?? 0}
- Highest department completion rate: ${departmentHistory[0]?.completionRate ?? 0}%
`
  );

  await writeText(
    path.join(root, "intelligence", "forecasting", "next-quarter-forecast.md"),
    `
# Next Quarter Forecast

- Forecasted mission mix: ${intelligenceSummary.forecastedMissionMix.join(", ") || "insufficient history"}
- Expected strongest department: ${intelligenceSummary.topDepartment ?? "insufficient history"}
- Execution pressure: ${intelligenceSummary.executionPressure}
- Planning note: ${intelligenceSummary.planningNote}
`
  );

  await writeText(
    path.join(root, "intelligence", "scoring", "mission-intelligence-scorecard.md"),
    `
# Mission Intelligence Scorecard

- Learning coverage: ${intelligenceSummary.learningCoverageScore}/10
- Recommendation confidence: ${intelligenceSummary.recommendationConfidenceScore}/10
- Pattern stability: ${intelligenceSummary.patternStabilityScore}/10
- Forecast usefulness: ${intelligenceSummary.forecastUsefulnessScore}/10
`
  );

  await writeText(
    path.join(root, "intelligence", "optimization", "workflow-improvements.md"),
    `
# Workflow Improvements

${intelligenceSummary.workflowImprovements
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n") || "1. No workflow improvement recommendation identified yet."}
`
  );

  await writeText(
    path.join(root, "memory", "library", "BEST_PRACTICES.md"),
    `
# Best Practices

${intelligenceSummary.bestPractices.map((item) => `- ${item}`).join("\n") || "- No best practice captured yet."}
`
  );

  await writeText(
    path.join(root, "memory", "library", "COMMON_MISTAKES.md"),
    `
# Common Mistakes

${intelligenceSummary.commonMistakes.map((item) => `- ${item}`).join("\n") || "- No common mistake captured yet."}
`
  );

  await writeText(
    path.join(root, "memory", "library", "INDUSTRY_INSIGHTS.md"),
    `
# Industry Insights

${intelligenceSummary.industryInsights.map((item) => `- ${item}`).join("\n") || "- No industry insight captured yet."}
`
  );

  await writeText(
    path.join(root, "memory", "library", "ARCHITECTURE_DECISIONS.md"),
    `
# Architecture Decisions

${intelligenceSummary.architectureDecisions.map((item) => `- ${item}`).join("\n") || "- No architecture decision note captured yet."}
`
  );

  for (const company of companyPortfolio) {
    const companyDir = path.join(root, "companies", company.slug);
    await writeText(
      path.join(companyDir, "MISSION_SUMMARY.md"),
      `
# Mission Summary

- Company: ${company.name}
- Slug: ${company.slug}
- Missions: ${company.missions}
- Completed missions: ${company.completedMissions}
- Active missions: ${company.activeMissions}
- Departments used: ${company.departments.join(", ") || "none yet"}
- Latest mission: ${company.latestMissionId ?? "none yet"}
`
    );

    await writeText(
      path.join(companyDir, "OPERATING_SCORECARD.md"),
      `
# Operating Scorecard

- Portfolio health: ${company.healthScore}/10
- Production missions: ${company.productionMissions}
- Growth missions: ${company.growthMissions}
- Revenue-facing tasks: ${company.revenueTasks}
- Search-facing tasks: ${company.searchTasks}
- Documentation status: ${company.documentationStatus}
`
    );

    await writeText(
      path.join(companyDir, "TENANT_BOUNDARY.md"),
      `
# Tenant Boundary

- Company-specific mission notes remain inside \`companies/${company.slug}\`.
- Shared intelligence may only contain de-identified summaries.
- Client, CRM, and revenue details remain tenant-scoped and must not be copied across companies without approval.
`
    );
  }
}

function buildMissionAnalytics(missions, tasks) {
  const byTemplateMap = new Map();

  for (const mission of missions) {
    const bucket = byTemplateMap.get(mission.templateId) ?? {
      templateId: mission.templateId,
      missions: 0,
      completed: 0,
      blocked: 0,
      waitingApproval: 0,
      totalTasks: 0,
    };

    bucket.missions += 1;
    bucket.totalTasks += mission.taskCount ?? 0;

    if (mission.status === "COMPLETED") {
      bucket.completed += 1;
    }
    if (mission.status === "BLOCKED") {
      bucket.blocked += 1;
    }
    if (mission.status === "WAITING_APPROVAL") {
      bucket.waitingApproval += 1;
    }

    byTemplateMap.set(mission.templateId, bucket);
  }

  const totalDepartments = missions.reduce((sum, mission) => sum + (mission.requiredDepartments?.length ?? 0), 0);
  const documentationReadyTasks = tasks.filter((task) => task.completionStatus === "COMPLETED").length;

  return {
    totalMissions: missions.length,
    completedMissions: missions.filter((mission) => mission.status === "COMPLETED").length,
    waitingApprovalMissions: missions.filter((mission) => mission.status === "WAITING_APPROVAL").length,
    blockedMissions: missions.filter((mission) => mission.status === "BLOCKED").length,
    averageTaskCount: average(missions.map((mission) => mission.taskCount ?? 0)),
    averageDepartmentCount: average(missions.map((mission) => mission.requiredDepartments?.length ?? 0)),
    documentationHealth: tasks.length > 0 && documentationReadyTasks === tasks.length ? "healthy" : "needs review",
    departmentCoverage: totalDepartments,
    byTemplate: [...byTemplateMap.values()]
      .map((item) => ({
        ...item,
        averageTaskCount: item.missions === 0 ? 0 : round(item.totalTasks / item.missions),
      }))
      .sort((a, b) => b.missions - a.missions || a.templateId.localeCompare(b.templateId)),
  };
}

function buildDepartmentHistory(missions, tasks, departmentMetrics) {
  const history = new Map(
    departmentMetrics.map((item) => [
      item.department,
      {
        department: item.department,
        missions: 0,
        tasks: 0,
        completedTasks: 0,
        blockedTasks: 0,
        waitingApprovalTasks: 0,
      },
    ])
  );

  for (const mission of missions) {
    for (const department of mission.requiredDepartments ?? []) {
      const bucket = history.get(department) ?? {
        department,
        missions: 0,
        tasks: 0,
        completedTasks: 0,
        blockedTasks: 0,
        waitingApprovalTasks: 0,
      };
      bucket.missions += 1;
      history.set(department, bucket);
    }
  }

  for (const task of tasks) {
    const bucket = history.get(task.department) ?? {
      department: task.department,
      missions: 0,
      tasks: 0,
      completedTasks: 0,
      blockedTasks: 0,
      waitingApprovalTasks: 0,
    };

    bucket.tasks += 1;
    if (task.status === "COMPLETED") {
      bucket.completedTasks += 1;
    }
    if (task.status === "BLOCKED") {
      bucket.blockedTasks += 1;
    }
    if (task.status === "WAITING_APPROVAL") {
      bucket.waitingApprovalTasks += 1;
    }

    history.set(task.department, bucket);
  }

  return [...history.values()]
    .filter((item) => item.department)
    .map((item) => ({
      ...item,
      completionRate: item.tasks === 0 ? 0 : round((item.completedTasks / item.tasks) * 100),
    }))
    .sort((a, b) => b.missions - a.missions || String(a.department).localeCompare(String(b.department)));
}

function buildIntelligenceSummary(missions, tasks, scorecards, departmentHistory) {
  const growthTemplates = new Set(["LEAD_RESEARCH", "SEO_GROWTH_SPRINT", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW", "WEEKLY_ANALYTICS_REVIEW", "NEWSLETTER_CAMPAIGN"]);
  const productionTemplates = new Set(["BUILD_PREMIUM_WEBSITE", "REDESIGN_WEBSITE", "HOMEPAGE_REBUILD", "CLIENT_WEBSITE_DELIVERY"]);
  const sortedTemplates = [...new Map(missions.map((mission) => [mission.templateId, 0])).keys()]
    .map((templateId) => ({
      templateId,
      count: missions.filter((mission) => mission.templateId === templateId).length,
    }))
    .sort((a, b) => b.count - a.count || a.templateId.localeCompare(b.templateId));
  const topTemplate = sortedTemplates[0]?.templateId ?? null;
  const topDepartment = departmentHistory[0]?.department ?? null;
  const averageCompletionRate = average(departmentHistory.map((item) => item.completionRate));
  const weakAreas = [];

  if (departmentHistory.some((item) => item.completionRate < 100)) {
    weakAreas.push("Some departments are not closing every routed task cleanly.");
  }
  if (missions.filter((mission) => growthTemplates.has(mission.templateId)).length < 2) {
    weakAreas.push("Growth engine needs more mission volume to build stronger recommendations.");
  }
  if (!missions.some((mission) => productionTemplates.has(mission.templateId))) {
    weakAreas.push("Production pipeline has not been exercised enough to compare against growth outcomes.");
  }

  const whatWorked = [
    topDepartment ? `${titleFromSlug(topDepartment)} has been the most consistently used department.` : null,
    topTemplate ? `${topTemplate} is currently the most repeated mission template.` : null,
    scorecards[0]?.agentTitle ? `${scorecards[0].agentTitle} has the strongest scorecard throughput.` : null,
  ].filter(Boolean);

  const templatePatterns = sortedTemplates.slice(0, 4).map((item) => `${item.templateId} has run ${item.count} time(s).`);
  const departmentPatterns = departmentHistory.slice(0, 4).map((item) => `${item.department} touched ${item.missions} mission(s) with ${item.completionRate}% completion rate.`);
  const recommendations = [
    topTemplate === "DEMO_SYSTEM_VALIDATION" ? "Shift mission mix toward real production and growth missions so intelligence is based on operational work instead of demo runs." : "Keep increasing real mission volume to improve intelligence confidence.",
    missions.some((mission) => mission.templateId === "CLIENT_WEBSITE_DELIVERY") ? "Compare production mission outputs against growth missions to identify the highest-value handoff patterns." : "Run a client website delivery mission to balance the current growth-heavy intelligence set.",
    missions.some((mission) => mission.templateId === "REVENUE_OPPORTUNITY_REVIEW") ? "Use revenue-opportunity findings to prioritize the next SEO or content sprint." : "Run a revenue opportunity review to improve prioritization quality.",
  ];
  const workflowImprovements = [
    "Add mission-type trend weighting so repeated demo missions do not dominate planning signals.",
    "Link production and growth missions through a shared KPI follow-up artifact after each real run.",
    "Promote weak-area findings into route-time warnings inside the operator surface.",
  ];

  return {
    totalMissions: missions.length,
    productionMissionCount: missions.filter((mission) => productionTemplates.has(mission.templateId)).length,
    growthMissionCount: missions.filter((mission) => growthTemplates.has(mission.templateId)).length,
    topTemplate,
    topDepartment,
    averageCompletionRate,
    whatWorked,
    weakAreas,
    nextLearningFocus: [
      "Increase non-demo mission history to improve pattern quality.",
      "Track which growth recommendations lead to later production or revenue missions.",
      "Compare department load against business value more explicitly.",
    ],
    templatePatterns,
    departmentPatterns,
    recommendations,
    forecastedMissionMix: sortedTemplates.slice(0, 3).map((item) => item.templateId),
    executionPressure: averageCompletionRate >= 95 ? "stable" : "watch department completion variance",
    planningNote:
      missions.length >= 5
        ? "Current history is sufficient for lightweight planning recommendations but still shallow for high-confidence forecasting."
        : "Mission history is still shallow; treat forecasts as directional only.",
    learningCoverageScore: scoreFromCount(missions.length, 10),
    recommendationConfidenceScore: scoreFromCount(missions.filter((mission) => growthTemplates.has(mission.templateId) || productionTemplates.has(mission.templateId)).length, 8),
    patternStabilityScore: scoreFromCount(sortedTemplates.filter((item) => item.count > 1).length, 6),
    forecastUsefulnessScore: scoreFromCount(departmentHistory.filter((item) => item.missions > 0).length, 8),
    workflowImprovements,
    automationOpportunities: [
      "Automate conversion of completed mission summaries into a standardized executive digest draft.",
      "Detect repeated department patterns and prefill next-mission planning notes automatically for review.",
      "Flag repeated approval-safe tasks as candidates for future non-destructive helper tooling.",
    ],
    decisionAnalysis: [
      "WGOS would still favor mission routing through shared runtime files instead of per-mission ad hoc logic.",
      "WGOS would still separate growth and production approvals because external risk profiles are different.",
      "WGOS should periodically reevaluate whether repeated demo missions are distorting planning signals.",
    ],
    bestPractices: [
      "Run at least one real mission after structural changes so artifacts exist outside temporary test roots.",
      "Keep dashboard, memory, reporting, and verification changes in the same pass so state stays coherent.",
      "Treat approval-sensitive work as metadata and planning until a human explicitly authorizes the external action.",
    ],
    commonMistakes: weakAreas.length > 0 ? weakAreas : ["Mission history is too shallow to infer reliable mistakes yet."],
    industryInsights: [
      "Revenue and SEO missions generate the most reusable planning intelligence when followed by documentation updates.",
      "Production and growth missions together produce stronger optimization recommendations than either one alone.",
    ],
    architectureDecisions: [
      "Persistent JSON state remains the source of truth for dashboards and analytics rather than handwritten markdown.",
      "Generated markdown remains necessary for handoff readability even when analytics are derived from structured state.",
    ],
  };
}

function buildCompanyHealthSummary(missions, tasks, scorecards, intelligenceSummary) {
  const completedRate = missions.length === 0 ? 0 : missions.filter((mission) => mission.status === "COMPLETED").length / missions.length;
  const documentationRate = tasks.length === 0 ? 0 : tasks.filter((task) => task.completionStatus === "COMPLETED").length / tasks.length;
  const qaStrength = scorecards.reduce((sum, item) => sum + item.qaPasses, 0) > 0 ? 8 : 5;
  const growthCoverage = missions.some((mission) => ["LEAD_RESEARCH", "SEO_GROWTH_SPRINT", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW"].includes(mission.templateId)) ? 8 : 5;
  const websiteCoverage = missions.some((mission) => ["CLIENT_WEBSITE_DELIVERY", "BUILD_PREMIUM_WEBSITE", "REDESIGN_WEBSITE", "HOMEPAGE_REBUILD"].includes(mission.templateId)) ? 8 : 5;
  const overall = round(
    average([
      completedRate * 10,
      documentationRate * 10,
      qaStrength,
      growthCoverage,
      websiteCoverage,
      intelligenceSummary.learningCoverageScore,
    ])
  );

  return {
    revenueReadiness: growthCoverage,
    operationalMaturity: round(completedRate * 10),
    documentationQuality: round(documentationRate * 10),
    memoryCompleteness: intelligenceSummary.learningCoverageScore,
    workflowQuality: intelligenceSummary.patternStabilityScore,
    seoReadiness: missions.some((mission) => ["SEO_AUDIT", "TECHNICAL_SEO_CLEANUP", "SEO_GROWTH_SPRINT"].includes(mission.templateId)) ? 8 : 5,
    adsenseReadiness: missions.some((mission) => mission.templateId === "REVENUE_OPPORTUNITY_REVIEW") ? 7 : 5,
    contentMaturity: missions.some((mission) => ["CONTENT_MARKETING_SPRINT", "LAUNCH_BLOG_CLUSTER", "NEWSLETTER_CAMPAIGN"].includes(mission.templateId)) ? 7 : 5,
    websiteMaturity: websiteCoverage,
    technicalDebt: Math.max(1, 10 - qaStrength),
    overall,
  };
}

function buildCompanyPortfolio(missions, tasks, tenantList, companyHealth) {
  return tenantList
    .map((tenant) => {
      const companyMissionIds = new Set(
        missions
          .filter((mission) => mission.companyId === tenant.slug || mission.companyId === tenant.id)
          .map((mission) => mission.id)
      );
      const companyMissions = missions.filter((mission) => companyMissionIds.has(mission.id));
      const companyTasks = tasks.filter((task) => companyMissionIds.has(task.missionId));
      const departments = [...new Set(companyMissions.flatMap((mission) => mission.requiredDepartments ?? []))];

      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        missions: companyMissions.length,
        completedMissions: companyMissions.filter((mission) => mission.status === "COMPLETED").length,
        activeMissions: companyMissions.filter((mission) => ["READY", "IN_PROGRESS", "WAITING_APPROVAL", "BLOCKED"].includes(mission.status)).length,
        departments,
        latestMissionId: companyMissions[0]?.id ?? null,
        productionMissions: companyMissions.filter((mission) => ["CLIENT_WEBSITE_DELIVERY", "BUILD_PREMIUM_WEBSITE", "REDESIGN_WEBSITE", "HOMEPAGE_REBUILD"].includes(mission.templateId)).length,
        growthMissions: companyMissions.filter((mission) => ["LEAD_RESEARCH", "SEO_GROWTH_SPRINT", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW", "WEEKLY_ANALYTICS_REVIEW", "NEWSLETTER_CAMPAIGN"].includes(mission.templateId)).length,
        revenueTasks: companyTasks.filter((task) => task.department === "revenue").length,
        searchTasks: companyTasks.filter((task) => task.department === "search").length,
        documentationStatus: companyTasks.length > 0 && companyTasks.every((task) => task.completionStatus === "COMPLETED") ? "healthy" : "needs review",
        healthScore: deriveCompanyHealthScore(companyMissions, companyTasks, companyHealth),
      };
    })
    .sort((a, b) => b.missions - a.missions || a.name.localeCompare(b.name));
}

function deriveCompanyHealthScore(companyMissions, companyTasks, companyHealth) {
  if (companyMissions.length === 0) {
    return 3;
  }

  const completion = companyMissions.filter((mission) => mission.status === "COMPLETED").length / companyMissions.length;
  const taskCompletion = companyTasks.length === 0 ? 0.5 : companyTasks.filter((task) => task.completionStatus === "COMPLETED").length / companyTasks.length;
  return round(average([completion * 10, taskCompletion * 10, companyHealth.overall]));
}

function scoreFromCount(count, max) {
  return Math.max(1, Math.min(10, round((count / Math.max(max, 1)) * 10)));
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function round(value) {
  return Number(value.toFixed(1));
}

function titleFromSlug(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function estimateRevenueContribution(department) {
  const mapping = {
    revenue: "High",
    marketing: "High",
    search: "Medium",
    publishing: "Medium",
    engineering: "Medium",
    client: "Medium",
    executive: "Indirect",
    design: "Indirect",
    documentation: "Indirect",
    operations: "Indirect",
    qa: "Indirect",
  };

  return mapping[department] ?? "Indirect";
}
