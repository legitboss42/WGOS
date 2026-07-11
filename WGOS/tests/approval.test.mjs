import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runMission } from "../packages/runtime/src/index.mjs";
import { updateApprovalDecision } from "../packages/approval/src/approval-queue.mjs";
import { readJson } from "../packages/runtime/src/fs-utils.mjs";

async function makeTempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), "wgos-approval-"));
}

test("approval queue captures specialist checkpoints from completed local missions", async () => {
  const root = await makeTempRoot();
  await runMission({ root, templateId: "LEAD_RESEARCH", operator: "Approval Test" });

  const queue = await readJson(path.join(root, "state", "approvals", "queue.json"), []);
  assert.ok(queue.length >= 3);
  assert.ok(queue.some((item) => item.action === "send_email"));
  assert.ok(queue.some((item) => item.source === "controlledSession"));

  const report = await fs.readFile(path.join(root, "reports", "approvals", "latest-approval-queue.md"), "utf8");
  assert.match(report, /Approval Queue/);
  assert.match(report, /Await human approval/);
});

test("approval decisions update queue state and operator payload", async () => {
  const root = await makeTempRoot();
  await runMission({ root, templateId: "LEAD_RESEARCH", operator: "Approval Test" });

  const queue = await readJson(path.join(root, "state", "approvals", "queue.json"), []);
  const first = queue[0];
  const updated = await updateApprovalDecision(root, first.id, "REVISION_REQUESTED", {
    reviewer: "Test Reviewer",
    note: "Tighten evidence before approval.",
  });

  assert.equal(updated.status, "REVISION_REQUESTED");
  assert.equal(updated.reviewer, "Test Reviewer");
  assert.match(updated.nextAction, /Revise/);

  const nextQueue = await readJson(path.join(root, "state", "approvals", "queue.json"), []);
  assert.equal(nextQueue.find((item) => item.id === first.id).status, "REVISION_REQUESTED");

  const operator = await readJson(path.join(root, "apps", "operator", "build", "operator.json"), null);
  assert.ok(Array.isArray(operator.approvalQueue));
  assert.ok(operator.approvalQueue.length > 0);
});
