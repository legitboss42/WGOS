import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runMission } from "../packages/runtime/src/index.mjs";
import { readJson } from "../packages/runtime/src/fs-utils.mjs";

async function makeTempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), "wgos-dashboard-"));
}

test("dashboard and operator surfaces are generated from persistent state", async () => {
  const root = await makeTempRoot();
  await runMission({ root, templateId: "CLIENT_WEBSITE_DELIVERY", operator: "Test Runner" });
  const result = await runMission({ root, templateId: "REVENUE_OPPORTUNITY_REVIEW", operator: "Test Runner" });

  assert.equal(result.missionStatus, "COMPLETED");

  const dashboardJson = await readJson(path.join(root, "apps", "dashboard", "build", "dashboard.json"), null);
  const operatorJson = await readJson(path.join(root, "apps", "operator", "build", "operator.json"), null);

  assert.ok(dashboardJson);
  assert.ok(operatorJson);
  assert.ok(Array.isArray(dashboardJson.latestMissions));
  assert.ok(Array.isArray(operatorJson.recentTasks));
  assert.ok(Array.isArray(dashboardJson.analytics.departmentHistory));
  assert.ok(Array.isArray(operatorJson.departmentQueue));
  assert.ok(dashboardJson.productionPipeline);
  assert.ok(Array.isArray(dashboardJson.productionPipeline.stages));
  assert.ok(operatorJson.productionPipeline);
  assert.ok(dashboardJson.growthPipeline);
  assert.ok(operatorJson.growthPipeline);
  assert.ok(dashboardJson.revenueSnapshot);
  assert.ok(dashboardJson.intelligenceSummary);
  assert.ok(operatorJson.intelligenceSummary);
  assert.ok(Array.isArray(dashboardJson.companyPortfolio));
  assert.ok(Array.isArray(operatorJson.companyPortfolio));
  assert.ok(Array.isArray(dashboardJson.approvalQueue));
  assert.ok(Array.isArray(operatorJson.approvalQueue));
  assert.ok(operatorJson.approvalQueue.length > 0);

  const dashboardHtml = await fs.readFile(path.join(root, "apps", "dashboard", "build", "index.html"), "utf8");
  const operatorHtml = await fs.readFile(path.join(root, "apps", "operator", "build", "index.html"), "utf8");

  assert.match(dashboardHtml, /WGOS Dashboard/);
  assert.match(dashboardHtml, /mission-search/);
  assert.match(dashboardHtml, /Production Pipeline/);
  assert.match(dashboardHtml, /Growth Pipeline/);
  assert.match(dashboardHtml, /Revenue Snapshot/);
  assert.match(dashboardHtml, /Intelligence Snapshot/);
  assert.match(dashboardHtml, /Company Portfolio/);
  assert.match(operatorHtml, /WGOS Operator Surface/);
  assert.match(operatorHtml, /task-search/);
  assert.match(operatorHtml, /Production Mission Control/);
  assert.match(operatorHtml, /Growth Mission Control/);
  assert.match(operatorHtml, /Intelligence Control/);
  assert.match(operatorHtml, /Tenant Boundaries/);
  assert.match(operatorHtml, /Approval Queue/);
});
