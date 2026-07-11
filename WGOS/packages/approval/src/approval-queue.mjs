import path from "node:path";
import { formatDateTime, readJson, writeJson, writeText } from "../../runtime/src/fs-utils.mjs";

export function collectApprovalItems(missionRecord, tasks = []) {
  const items = [];

  for (const task of tasks) {
    const runtime = task.report?.specialistRuntime;
    for (const checkpoint of runtime?.approvalCheckpoints ?? []) {
      items.push(createApprovalItem({ missionRecord, task, checkpoint, source: "approvalCheckpoint" }));
    }

    for (const session of runtime?.controlledSessions ?? []) {
      if (session.approvalCheckpoint?.status && session.approvalCheckpoint.status !== "LOCAL_ONLY") {
        items.push(
          createApprovalItem({
            missionRecord,
            task,
            checkpoint: {
              action: `${session.integrationId}:${session.purpose ?? session.action ?? "controlled_session"}`,
              target: missionRecord.companyId,
              evidence: [session.approvalCheckpoint.reason],
              approvalRecord: {
                status: "PENDING",
                approver: "Human owner",
                notesRequired: true,
              },
            },
            source: "controlledSession",
            integrationId: session.integrationId,
          })
        );
      }
    }
  }

  return dedupeApprovals(items);
}

export async function updateApprovalQueue(root, missionRecord, tasks = []) {
  const queuePath = path.join(root, "state", "approvals", "queue.json");
  const existing = await readJson(queuePath, []);
  const missionItems = collectApprovalItems(missionRecord, tasks);
  const nextQueue = [
    ...existing.filter((item) => item.missionId !== missionRecord.id),
    ...missionItems,
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  await writeJson(queuePath, nextQueue);
  for (const item of missionItems) {
    await writeJson(path.join(root, "state", "approvals", `${item.id}.json`), item);
  }
  await writeText(path.join(root, "reports", "approvals", "latest-approval-queue.md"), renderApprovalQueueMarkdown(nextQueue));

  return nextQueue;
}

export async function updateApprovalDecision(root, approvalId, decision, { reviewer = "Human owner", note = "" } = {}) {
  const queuePath = path.join(root, "state", "approvals", "queue.json");
  const queue = await readJson(queuePath, []);
  const item = queue.find((entry) => entry.id === approvalId);
  if (!item) {
    throw new Error(`Unknown approval item: ${approvalId}`);
  }

  if (!["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(decision)) {
    throw new Error(`Unsupported approval decision: ${decision}`);
  }

  item.status = decision;
  item.reviewedAt = formatDateTime();
  item.reviewer = reviewer;
  item.reviewNote = note;
  item.nextAction = decision === "APPROVED"
    ? "Resume the mission step or perform the approved action through the relevant controlled adapter."
    : decision === "REJECTED"
      ? "Do not perform the requested action. Revise the plan or close the item."
      : "Revise the work and resubmit for approval.";

  await writeJson(queuePath, queue);
  await writeJson(path.join(root, "state", "approvals", `${item.id}.json`), item);
  await writeText(path.join(root, "reports", "approvals", "latest-approval-queue.md"), renderApprovalQueueMarkdown(queue));
  return item;
}

export function renderApprovalQueueMarkdown(queue = []) {
  return `# Approval Queue

| Approval ID | Status | Mission | Task | Agent | Action | Target | Next Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
${queue.length ? queue.map((item) => `| ${item.id} | ${item.status} | ${item.missionId} | ${item.taskId} | ${item.agentSlug} | ${item.action} | ${item.target} | ${item.nextAction} |`).join("\n") : "| - | EMPTY | - | - | - | - | - | No approval items are pending. |"}
`;
}

function createApprovalItem({ missionRecord, task, checkpoint, source, integrationId = null }) {
  const action = checkpoint.action ?? "approval_required";
  const id = `${missionRecord.id}-${task.id}-${slugify(action)}`.toUpperCase();
  return {
    id,
    missionId: missionRecord.id,
    companyId: missionRecord.companyId,
    taskId: task.id,
    agentSlug: task.agentSlug,
    agentTitle: task.agentTitle,
    department: task.department,
    source,
    integrationId,
    action,
    target: checkpoint.target ?? missionRecord.companyId,
    evidence: checkpoint.evidence ?? [],
    status: checkpoint.approvalRecord?.status ?? "PENDING",
    approver: checkpoint.approvalRecord?.approver ?? "Human owner",
    notesRequired: checkpoint.approvalRecord?.notesRequired ?? true,
    createdAt: formatDateTime(),
    reviewedAt: null,
    reviewer: null,
    reviewNote: "",
    nextAction: "Await human approval, rejection, or revision request.",
  };
}

function dedupeApprovals(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
