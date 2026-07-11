import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runMission } from "../packages/runtime/src/index.mjs";
import { readJson } from "../packages/runtime/src/fs-utils.mjs";

async function makeTempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), "wgos-runtime-"));
}

test("runMission persists mission, tasks, reports, and memory outputs", async () => {
  const root = await makeTempRoot();
  const result = await runMission({ root, templateId: "DEMO_SYSTEM_VALIDATION", operator: "Test Runner" });

  assert.equal(result.missionStatus, "COMPLETED");

  const stateDir = path.join(root, "state");
  const missionsIndex = await readJson(path.join(stateDir, "missions.index.json"), []);
  const tasksIndex = await readJson(path.join(stateDir, "tasks.index.json"), []);
  const summary = await readJson(path.join(stateDir, "summary.json"), {});

  assert.equal(missionsIndex.length, 1);
  assert.equal(tasksIndex.length, 6);
  assert.equal(summary.completedMissionIds.length, 1);

  const missionReport = await fs.readFile(path.join(root, "reports", result.missionId, "mission-report.md"), "utf8");
  assert.match(missionReport, /Mission Report/);

  const currentState = await fs.readFile(path.join(root, "memory", "CURRENT_STATE.md"), "utf8");
  assert.match(currentState, /Last mission run/);

  const missionState = await readJson(path.join(root, "state", "missions", `${result.missionId}.json`), null);
  assert.ok(missionState);
  assert.ok(Array.isArray(missionState.requiredDepartments));
  assert.ok(missionState.requiredDepartments.includes("executive"));

  const missionMemory = await fs.readFile(path.join(root, "memory", "missions", `${result.missionId}.md`), "utf8");
  assert.match(missionMemory, /Mission Memory/);

  const firstTaskId = tasksIndex[0].id;
  const firstTask = await readJson(path.join(root, "state", "tasks", `${firstTaskId}.json`), null);
  assert.ok(firstTask);
  assert.ok(Array.isArray(firstTask.integrationsUsed));
  assert.ok(Array.isArray(firstTask.playbooksUsed));

  const analytics = await readJson(path.join(root, "state", "dashboards", "analytics.json"), null);
  assert.ok(analytics);
  assert.ok(Array.isArray(analytics.departmentHistory));
  assert.ok(analytics.intelligenceSummary);

  const companyHealth = await fs.readFile(path.join(root, "company-kpis", "company-health-score.md"), "utf8");
  assert.match(companyHealth, /Company Health Score/);

  const companyStatusBoard = await fs.readFile(path.join(root, "platform", "company-registry", "company-status-board.md"), "utf8");
  assert.match(companyStatusBoard, /Company Status Board/);
});

test("handoffs chain forward through the task sequence", async () => {
  const root = await makeTempRoot();
  const result = await runMission({ root, templateId: "HOMEPAGE_REBUILD", operator: "Test Runner" });
  const taskIndex = await readJson(path.join(root, "state", "tasks.index.json"), []);

  assert.equal(result.missionStatus, "COMPLETED");
  assert.ok(taskIndex.length >= 8);

  const firstTaskPath = path.join(root, "state", "tasks", `${taskIndex.at(-1).id}.json`);
  const firstTask = await readJson(firstTaskPath, null);
  assert.ok(firstTask);
  assert.ok(firstTask.handoff);
  assert.equal(firstTask.handoff.toAgentSlug !== null, true);
});

test("client website delivery mission routes cross-department production work", async () => {
  const root = await makeTempRoot();
  const result = await runMission({ root, templateId: "CLIENT_WEBSITE_DELIVERY", operator: "Test Runner" });

  assert.equal(result.missionStatus, "COMPLETED");

  const missionIndex = await readJson(path.join(root, "state", "missions.index.json"), []);
  const mission = missionIndex[0];
  assert.ok(mission);
  assert.equal(mission.templateId, "CLIENT_WEBSITE_DELIVERY");
  assert.ok(mission.requiredDepartments.includes("design"));
  assert.ok(mission.requiredDepartments.includes("engineering"));
  assert.ok(mission.requiredDepartments.includes("client"));

  const tasksIndex = await readJson(path.join(root, "state", "tasks.index.json"), []);
  assert.ok(tasksIndex.length >= 10);

  const projectMemory = await fs.readFile(path.join(root, "memory", "projects", `${result.missionId}.md`), "utf8");
  assert.match(projectMemory, /Project Memory/);

  const productionSummary = await fs.readFile(path.join(root, "reports", result.missionId, "website-production-summary.md"), "utf8");
  assert.match(productionSummary, /Website Production Summary/);

  const launchPreparation = await fs.readFile(path.join(root, "production", "launch", `${result.missionId}-launch-preparation.md`), "utf8");
  assert.match(launchPreparation, /Launch Preparation/);
});

test("revenue opportunity mission produces growth artifacts", async () => {
  const root = await makeTempRoot();
  const result = await runMission({ root, templateId: "REVENUE_OPPORTUNITY_REVIEW", operator: "Test Runner" });

  assert.equal(result.missionStatus, "COMPLETED");

  const revenueSummary = await fs.readFile(path.join(root, "growth", "revenue", `${result.missionId}-revenue-opportunities.md`), "utf8");
  assert.match(revenueSummary, /Revenue Opportunities/);

  const analyticsSummary = await fs.readFile(path.join(root, "growth", "analytics", `${result.missionId}-analytics-summary.md`), "utf8");
  assert.match(analyticsSummary, /Growth Analytics Summary/);

  const crmState = await fs.readFile(path.join(root, "growth", "crm", `${result.missionId}-crm-state.md`), "utf8");
  assert.match(crmState, /Growth CRM State/);

  const forecast = await fs.readFile(path.join(root, "intelligence", "forecasting", "next-quarter-forecast.md"), "utf8");
  assert.match(forecast, /Next Quarter Forecast/);

  const decisionAnalysis = await fs.readFile(path.join(root, "intelligence", "recommendations", "decision-analysis.md"), "utf8");
  assert.match(decisionAnalysis, /Decision Analysis/);

  const operatingScorecard = await fs.readFile(path.join(root, "companies", "web-growth", "OPERATING_SCORECARD.md"), "utf8");
  assert.match(operatingScorecard, /Operating Scorecard/);
});

test("specialist agents produce executable module outputs and approval checkpoints", async () => {
  const root = await makeTempRoot();
  const clientResult = await runMission({ root, templateId: "CLIENT_WEBSITE_DELIVERY", operator: "Test Runner" });
  const leadResult = await runMission({ root, templateId: "LEAD_RESEARCH", operator: "Test Runner" });

  const tasksIndex = await readJson(path.join(root, "state", "tasks.index.json"), []);
  const taskDetails = await Promise.all(
    tasksIndex.map((task) => readJson(path.join(root, "state", "tasks", `${task.id}.json`), null))
  );

  const byAgent = new Map(taskDetails.filter(Boolean).map((task) => [task.agentSlug, task]));

  const frontend = byAgent.get("FRONTEND_ENGINEER_AGENT");
  assert.equal(frontend.report.specialistRuntime.kind, "frontend");
  assert.ok(frontend.report.specialistRuntime.implementationPlan.validationCommands.includes("npm.cmd run build"));

  const seo = byAgent.get("SEO_AGENT");
  assert.equal(seo.report.specialistRuntime.kind, "seo");
  assert.ok(seo.report.specialistRuntime.controlledSessions.some((session) => session.integrationId === "search-console"));

  const content = byAgent.get("CONTENT_STRATEGIST_AGENT");
  assert.equal(content.report.specialistRuntime.kind, "content");
  assert.equal(content.report.specialistRuntime.contentSystem.publishingGate.action, "publish");

  const marketing = byAgent.get("MARKETING_STRATEGIST_AGENT");
  assert.equal(marketing.report.specialistRuntime.kind, "marketing");
  assert.equal(marketing.report.specialistRuntime.campaignPlan.noAutomaticOutreach, true);

  const leadResearch = byAgent.get("LEAD_RESEARCH_AGENT");
  assert.equal(leadResearch.report.specialistRuntime.kind, "lead-research");
  assert.equal(leadResearch.report.specialistRuntime.leadResearchRunbook.targetCount, 50);
  assert.equal(leadResearch.report.specialistRuntime.approvalCheckpoints[0].action, "send_email");

  const seoReport = await fs.readFile(path.join(root, "reports", clientResult.missionId, "seo-audit-report.md"), "utf8");
  assert.match(seoReport, /SEO Audit Report/);

  const leadCsv = await fs.readFile(path.join(root, "growth", "crm", `${leadResult.missionId}-lead-research.csv`), "utf8");
  assert.match(leadCsv, /lead_id,date_found,business_name/);

  const auditReport = await fs.readFile(path.join(root, "reports", leadResult.missionId, "website-audit-report.md"), "utf8");
  assert.match(auditReport, /Website Audit/);

  const crmState = await readJson(path.join(root, "growth", "crm", `${leadResult.missionId}-crm-state.json`), null);
  assert.equal(crmState.status, "READY_FOR_RESEARCH");

  const outreachHandoff = await fs.readFile(path.join(root, "growth", "marketing", `${leadResult.missionId}-outreach-draft-handoff.md`), "utf8");
  assert.match(outreachHandoff, /No automatic sending/);
});
