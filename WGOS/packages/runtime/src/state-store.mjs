import path from "node:path";
import { WGOS_ROOT, agents, departments } from "../../../scripts/lib/wgos-config.mjs";
import { appendText, ensureDir, formatDateTime, readJson, writeJson } from "./fs-utils.mjs";

export function getStatePaths(root = WGOS_ROOT) {
  const stateRoot = path.join(root, "state");

  return {
    root,
    stateRoot,
    missionsDir: path.join(stateRoot, "missions"),
    tasksDir: path.join(stateRoot, "tasks"),
    reportsDir: path.join(stateRoot, "reports"),
    approvalsDir: path.join(stateRoot, "approvals"),
    dashboardsDir: path.join(stateRoot, "dashboards"),
    departmentsDir: path.join(stateRoot, "departments"),
    logsDir: path.join(stateRoot, "logs"),
    metricsDir: path.join(stateRoot, "metrics"),
    eventLog: path.join(stateRoot, "logs", "events.jsonl"),
    summary: path.join(stateRoot, "summary.json"),
    missionIndex: path.join(stateRoot, "missions.index.json"),
    taskIndex: path.join(stateRoot, "tasks.index.json"),
    scorecards: path.join(stateRoot, "metrics", "agent-scorecards.json"),
    departmentMetrics: path.join(stateRoot, "metrics", "department-metrics.json"),
    analytics: path.join(stateRoot, "dashboards", "analytics.json"),
  };
}

export async function initializeState(root = WGOS_ROOT) {
  const paths = getStatePaths(root);

  await Promise.all([
    ensureDir(paths.missionsDir),
    ensureDir(paths.tasksDir),
    ensureDir(paths.reportsDir),
    ensureDir(paths.approvalsDir),
    ensureDir(paths.dashboardsDir),
    ensureDir(paths.departmentsDir),
    ensureDir(paths.logsDir),
    ensureDir(paths.metricsDir),
  ]);

  const defaults = [
    [
      paths.summary,
      {
        generatedAt: formatDateTime(),
        activeMissionIds: [],
        completedMissionIds: [],
        waitingApprovalMissionIds: [],
        missionCount: 0,
        taskCount: 0,
      },
    ],
    [paths.missionIndex, []],
    [paths.taskIndex, []],
    [path.join(paths.approvalsDir, "queue.json"), []],
    [
      paths.scorecards,
      agents.map((agent) => ({
        agentId: agent.id,
        agentSlug: agent.slug,
        agentTitle: agent.title,
        department: agent.department,
        tasksCompleted: 0,
        qaPasses: 0,
        qaFailures: 0,
        documentationUpdates: 0,
        memoryUpdates: 0,
        approvalPauses: 0,
        retries: 0,
        businessImpactNotes: [],
        lastExecutionAt: null,
      })),
    ],
    [
      paths.departmentMetrics,
      departments.map((department) => ({
        department: department.id,
        missionsTouched: 0,
        tasksCompleted: 0,
        blockedTasks: 0,
        waitingApprovalTasks: 0,
        lastMissionId: null,
      })),
    ],
  ];

  for (const [filePath, defaultValue] of defaults) {
    if ((await readJson(filePath, null)) === null) {
      await writeJson(filePath, defaultValue);
    }
  }

  return paths;
}

export async function appendEvent(root, event) {
  const paths = getStatePaths(root);
  const payload = {
    at: formatDateTime(),
    ...event,
  };
  await appendText(paths.eventLog, `${JSON.stringify(payload)}\n`);
}

export async function saveMission(root, missionRecord) {
  const paths = getStatePaths(root);
  await writeJson(path.join(paths.missionsDir, `${missionRecord.id}.json`), missionRecord);

  const index = await readJson(paths.missionIndex, []);
  const nextIndex = [...index.filter((item) => item.id !== missionRecord.id), summarizeMission(missionRecord)];
  await writeJson(paths.missionIndex, sortByUpdated(nextIndex));
  await updateSummary(root);
}

export async function saveTask(root, taskRecord) {
  const paths = getStatePaths(root);
  await writeJson(path.join(paths.tasksDir, `${taskRecord.id}.json`), taskRecord);

  const index = await readJson(paths.taskIndex, []);
  const nextIndex = [...index.filter((item) => item.id !== taskRecord.id), summarizeTask(taskRecord)];
  await writeJson(paths.taskIndex, sortByUpdated(nextIndex));
  await updateSummary(root);
}

export async function saveReport(root, missionId, reportRecord) {
  const paths = getStatePaths(root);
  await writeJson(path.join(paths.reportsDir, `${missionId}.json`), reportRecord);
}

export async function loadMission(root, missionId) {
  const paths = getStatePaths(root);
  return readJson(path.join(paths.missionsDir, `${missionId}.json`), null);
}

export async function loadTasksForMission(root, missionId) {
  const paths = getStatePaths(root);
  const taskIndex = await readJson(paths.taskIndex, []);
  const taskIds = taskIndex.filter((task) => task.missionId === missionId).map((task) => task.id);

  const tasks = await Promise.all(taskIds.map((taskId) => readJson(path.join(paths.tasksDir, `${taskId}.json`), null)));
  return tasks.filter(Boolean).sort((a, b) => a.sequence - b.sequence);
}

export async function updateScorecard(root, delta) {
  const paths = getStatePaths(root);
  const scorecards = await readJson(paths.scorecards, []);
  const existing = scorecards.find((item) => item.agentSlug === delta.agentSlug);
  if (!existing) {
    return;
  }

  existing.tasksCompleted += delta.tasksCompleted ?? 0;
  existing.qaPasses += delta.qaPasses ?? 0;
  existing.qaFailures += delta.qaFailures ?? 0;
  existing.documentationUpdates += delta.documentationUpdates ?? 0;
  existing.memoryUpdates += delta.memoryUpdates ?? 0;
  existing.approvalPauses += delta.approvalPauses ?? 0;
  existing.retries += delta.retries ?? 0;
  existing.lastExecutionAt = delta.lastExecutionAt ?? formatDateTime();

  if (delta.businessImpactNote) {
    existing.businessImpactNotes = [delta.businessImpactNote, ...existing.businessImpactNotes].slice(0, 5);
  }

  await writeJson(paths.scorecards, scorecards);
}

export async function updateDepartmentMetric(root, delta) {
  const paths = getStatePaths(root);
  const metrics = await readJson(paths.departmentMetrics, []);
  const existing = metrics.find((item) => item.department === delta.department);
  if (!existing) {
    return;
  }

  existing.missionsTouched += delta.missionsTouched ?? 0;
  existing.tasksCompleted += delta.tasksCompleted ?? 0;
  existing.blockedTasks += delta.blockedTasks ?? 0;
  existing.waitingApprovalTasks += delta.waitingApprovalTasks ?? 0;
  existing.lastMissionId = delta.lastMissionId ?? existing.lastMissionId;

  await writeJson(paths.departmentMetrics, metrics);
}

export async function updateSummary(root = WGOS_ROOT) {
  const paths = getStatePaths(root);
  const missions = await readJson(paths.missionIndex, []);
  const tasks = await readJson(paths.taskIndex, []);

  const activeMissionIds = missions.filter((mission) => ["READY", "IN_PROGRESS", "BLOCKED"].includes(mission.status)).map((mission) => mission.id);
  const completedMissionIds = missions.filter((mission) => mission.status === "COMPLETED").map((mission) => mission.id);
  const waitingApprovalMissionIds = missions
    .filter((mission) => mission.status === "WAITING_APPROVAL")
    .map((mission) => mission.id);
  const blockedTaskCount = tasks.filter((task) => task.status === "BLOCKED").length;
  const waitingApprovalTaskCount = tasks.filter((task) => task.status === "WAITING_APPROVAL").length;
  const activeAgentCount = [...new Set(tasks.filter((task) => !["COMPLETED", "ARCHIVED"].includes(task.status)).map((task) => task.agentSlug))].length;

  await writeJson(paths.summary, {
    generatedAt: formatDateTime(),
    activeMissionIds,
    completedMissionIds,
    waitingApprovalMissionIds,
    missionCount: missions.length,
    taskCount: tasks.length,
    departmentCount: departments.length,
    blockedTaskCount,
    waitingApprovalTaskCount,
    activeAgentCount,
  });
}

function summarizeMission(missionRecord) {
  return {
    id: missionRecord.id,
    templateId: missionRecord.templateId,
    companyId: missionRecord.companyId,
    objective: missionRecord.objective,
    status: missionRecord.status,
    approvalClass: missionRecord.approvalClass,
    startedAt: missionRecord.startedAt,
    updatedAt: missionRecord.updatedAt,
    taskCount: missionRecord.taskIds.length,
    requiredDepartments: missionRecord.requiredDepartments ?? [],
    requiredAgents: missionRecord.requiredAgents ?? [],
    businessValue: missionRecord.businessValue ?? "Medium",
    revenueImpact: missionRecord.revenueImpact ?? "Medium",
    estimatedComplexity: missionRecord.estimatedComplexity ?? "Medium",
  };
}

function summarizeTask(taskRecord) {
  return {
    id: taskRecord.id,
    missionId: taskRecord.missionId,
    agentSlug: taskRecord.agentSlug,
    status: taskRecord.status,
    sequence: taskRecord.sequence,
    updatedAt: taskRecord.updatedAt,
    department: taskRecord.department,
    completionStatus: taskRecord.completionStatus ?? taskRecord.status,
    approvalStatus: taskRecord.approvalStatus ?? "NOT_REQUIRED",
  };
}

function sortByUpdated(items) {
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
