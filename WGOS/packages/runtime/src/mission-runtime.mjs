import path from "node:path";
import { WGOS_ROOT } from "../../../scripts/lib/wgos-config.mjs";
import { createAgentExecutor, getAgentBySlug } from "../../agents/src/executors.mjs";
import { writeSpecialistExecutionArtifacts } from "../../agents/src/artifact-writer.mjs";
import { updateApprovalQueue } from "../../approval/src/approval-queue.mjs";
import { writeScorecardArtifacts } from "../../analytics/src/scorecards.mjs";
import { writeMemoryArtifacts } from "../../memory/src/memory-updater.mjs";
import { writeMissionArtifacts } from "../../reporting/src/reporting.mjs";
import { renderSurfaces } from "../../ui/src/render-surfaces.mjs";
import { formatDate, formatDateTime, slugify, writeText } from "./fs-utils.mjs";
import {
  appendEvent,
  initializeState,
  saveMission,
  saveReport,
  saveTask,
  updateDepartmentMetric,
  updateScorecard,
} from "./state-store.mjs";
import { getMissionTemplate } from "./mission-catalog.mjs";
import { buildDepartmentSummaries, buildMissionExecutionPlan } from "./department-router.mjs";

export async function runMission({
  root = WGOS_ROOT,
  templateId = "DEMO_SYSTEM_VALIDATION",
  companyId,
  operator = "Codex",
} = {}) {
  await initializeState(root);

  const template = buildMissionExecutionPlan(getMissionTemplate(templateId));
  const missionId = `${formatDate().replace(/-/g, "")}-${slugify(template.id)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  const startedAt = formatDateTime();
  const taskIds = [];

  const missionRecord = {
    id: missionId,
    templateId: template.id,
    companyId: companyId ?? template.companyId,
    objective: template.objective,
    missionType: template.missionType,
    approvalClass: template.approvalClass,
    workflows: template.workflows,
    successCriteria: template.successCriteria,
    requiredDepartments: template.requiredDepartments,
    requiredAgents: template.requiredAgents,
    requiredSkills: template.requiredSkills,
    requiredIntegrations: template.requiredIntegrations,
    approvalGates: template.approvalGates,
    businessValue: template.businessValue,
    revenueImpact: template.revenueImpact,
    estimatedComplexity: template.estimatedComplexity,
    documentationUpdates: template.documentationUpdates,
    priority: "HIGH",
    qaStatus: "PENDING",
    documentationStatus: "PENDING",
    approvalStatus: template.approvalClass === "A1" ? "NOT_REQUIRED" : "WAITING_APPROVAL",
    completionStatus: "IN_PROGRESS",
    status: "IN_PROGRESS",
    startedAt,
    updatedAt: startedAt,
    operator,
    taskIds,
    openRisks: [],
  };

  await appendEvent(root, { kind: "mission.started", missionId, templateId: template.id });
  await saveMission(root, missionRecord);

  const taskRecords = [];

  for (const [index, blueprint] of template.executionBlueprints.entries()) {
    const agent = getAgentBySlug(blueprint.agentSlug);
    const executor = createAgentExecutor(blueprint.agentSlug);
    const taskId = `${missionId}-T${String(index + 1).padStart(3, "0")}`;
    const nextAgentSlug = template.executionBlueprints[index + 1]?.agentSlug ?? null;

    const taskRecord = {
      id: taskId,
      missionId,
      sequence: index + 1,
      agentSlug: agent.slug,
      agentTitle: agent.title,
      department: agent.department,
      objective: blueprint.objective,
      expectedOutput: blueprint.expectedOutput,
      stage: blueprint.stage ?? "specialist_execution",
      status: "IN_PROGRESS",
      dependencies: blueprint.dependencies ?? [],
      nextAgentSlug,
      estimatedComplexity: template.estimatedComplexity,
      businessValue: template.businessValue,
      revenueImpact: template.revenueImpact,
      priority: missionRecord.priority,
      documentationStatus: "PENDING",
      qaStatus: agent.slug === "QA_ENGINEER_AGENT" ? "IN_PROGRESS" : "PENDING",
      approvalStatus: missionRecord.approvalStatus,
      completionStatus: "IN_PROGRESS",
      startedAt: formatDateTime(),
      updatedAt: formatDateTime(),
      report: null,
      handoff: null,
    };

    taskIds.push(taskId);
    await saveTask(root, taskRecord);
    await appendEvent(root, { kind: "task.started", missionId, taskId, agentSlug: agent.slug });

    try {
      const context = { mission: missionRecord, previousTask: taskRecords.at(-1) ?? null, currentTask: taskRecord };
      const missionHook = executor.Mission(context, taskRecord);
      const planHook = executor.Plan(context, taskRecord);
      const executionHook = executor.Execute(context, taskRecord);
      const validationHook = executor.Validate(context, taskRecord, executionHook);
      const reportHook = executor.Report(context, taskRecord, executionHook, validationHook);
      const memoryHook = executor.UpdateMemory(context, taskRecord);
      const handoffHook = executor.HandOff(context, taskRecord, validationHook);

      taskRecord.status = validationHook.status;
      taskRecord.updatedAt = formatDateTime();
      taskRecord.documentationStatus = "UPDATED";
      taskRecord.qaStatus = agent.slug === "QA_ENGINEER_AGENT" ? (validationHook.status === "COMPLETED" ? "PASSED" : "FAILED") : taskRecord.qaStatus;
      taskRecord.approvalStatus = validationHook.status === "WAITING_APPROVAL" ? "WAITING_APPROVAL" : "NOT_REQUIRED";
      taskRecord.completionStatus = validationHook.status;
      taskRecord.runtime = {
        mission: missionHook,
        plan: planHook,
        execution: executionHook,
        validation: validationHook,
        memory: memoryHook,
      };
      taskRecord.integrationsUsed = executionHook.integrationsUsed ?? [];
      taskRecord.playbooksUsed = executionHook.playbooksUsed ?? [];
      taskRecord.collaborationRequests = executionHook.collaborationRequests ?? [];
      taskRecord.kpiFocus = executionHook.kpiFocus ?? [];
      taskRecord.report = reportHook;
      taskRecord.handoff = handoffHook;
      await writeSpecialistExecutionArtifacts(root, missionRecord, taskRecord);

      await saveTask(root, taskRecord);
      await updateScorecard(root, {
        agentSlug: agent.slug,
        tasksCompleted: validationHook.status === "COMPLETED" ? 1 : 0,
        qaPasses: agent.slug === "QA_ENGINEER_AGENT" && validationHook.status === "COMPLETED" ? 1 : 0,
        qaFailures: validationHook.status === "FAILED_QA" ? 1 : 0,
        documentationUpdates: 1,
        memoryUpdates: 1,
        approvalPauses: validationHook.status === "WAITING_APPROVAL" ? 1 : 0,
        lastExecutionAt: taskRecord.updatedAt,
        businessImpactNote: reportHook.actions,
      });
      await updateDepartmentMetric(root, {
        department: taskRecord.department,
        missionsTouched: 0,
        tasksCompleted: validationHook.status === "COMPLETED" ? 1 : 0,
        blockedTasks: validationHook.status === "BLOCKED" ? 1 : 0,
        waitingApprovalTasks: validationHook.status === "WAITING_APPROVAL" ? 1 : 0,
        lastMissionId: missionId,
      });
      await appendEvent(root, { kind: "task.completed", missionId, taskId, status: taskRecord.status });
    } catch (error) {
      const recovery = executor.Recover(taskRecord, error);
      taskRecord.status = recovery.status;
      taskRecord.updatedAt = formatDateTime();
      taskRecord.report = {
        agent: agent.title,
        taskId,
        objective: blueprint.objective,
        actions: "Execution failed before completion.",
        validation: recovery.reason,
        nextStep: recovery.recommendation,
      };
      taskRecord.handoff = {
        fromAgentSlug: agent.slug,
        toAgentSlug: null,
        status: recovery.status,
        validationNeeded: "Resolve the blocker before retrying.",
      };
      taskRecord.documentationStatus = "BLOCKED";
      taskRecord.qaStatus = "BLOCKED";
      taskRecord.approvalStatus = "BLOCKED";
      taskRecord.completionStatus = "BLOCKED";
      missionRecord.openRisks.push(`${taskId}: ${recovery.reason}`);
      await saveTask(root, taskRecord);
      await updateDepartmentMetric(root, {
        department: taskRecord.department,
        missionsTouched: 0,
        blockedTasks: 1,
        lastMissionId: missionId,
      });
      await appendEvent(root, { kind: "task.blocked", missionId, taskId, reason: recovery.reason });
    }

    taskRecords.push(taskRecord);
  }

  missionRecord.status = deriveMissionStatus(taskRecords);
  missionRecord.updatedAt = formatDateTime();
  missionRecord.completionStatus = missionRecord.status;
  missionRecord.qaStatus = taskRecords.some((task) => task.qaStatus === "FAILED") ? "FAILED" : "PASSED";
  missionRecord.documentationStatus = taskRecords.every((task) => task.documentationStatus === "UPDATED") ? "UPDATED" : "PARTIAL";
  missionRecord.approvalStatus = taskRecords.some((task) => task.approvalStatus === "WAITING_APPROVAL") ? "WAITING_APPROVAL" : "CLEARED";
  missionRecord.departmentSummaries = buildDepartmentSummaries(taskRecords);

  for (const summary of missionRecord.departmentSummaries) {
    await updateDepartmentMetric(root, {
      department: summary.department,
      missionsTouched: 1,
      lastMissionId: missionId,
    });
  }

  const reportRecord = {
    missionId,
    qaResult: missionRecord.status === "COMPLETED" ? "PASS" : missionRecord.status,
    validationSummary: summarizeValidation(taskRecords),
    nextStep: missionRecord.status === "COMPLETED" ? "Run the next real mission through the same runtime." : "Resolve the waiting approval or blocked task before continuing.",
    nextRequiredAgent: taskRecords.find((task) => task.status !== "COMPLETED")?.agentSlug ?? null,
    executiveSummary: `Mission ${missionRecord.id} routed ${missionRecord.requiredDepartments.length} departments across ${taskRecords.length} tasks.`,
    integrationSummary: unique(taskRecords.flatMap((task) => (task.integrationsUsed ?? []).map((item) => item.id))),
    collaborationSummary: taskRecords.flatMap((task) => task.collaborationRequests ?? []),
  };

  await saveMission(root, missionRecord);
  await updateApprovalQueue(root, missionRecord, taskRecords);
  await saveReport(root, missionId, reportRecord);
  await writeMissionArtifacts(root, missionRecord, taskRecords, reportRecord);
  await writeMemoryArtifacts(root, missionRecord, taskRecords);
  await writeScorecardArtifacts(root);
  await renderSurfaces(root);
  await writeExecutiveSummary(root, missionRecord, reportRecord);
  await appendEvent(root, { kind: "mission.completed", missionId, status: missionRecord.status });

  return {
    missionId,
    missionStatus: missionRecord.status,
    taskCount: taskRecords.length,
  };
}

function deriveMissionStatus(taskRecords) {
  if (taskRecords.some((task) => task.status === "BLOCKED")) {
    return "BLOCKED";
  }
  if (taskRecords.some((task) => task.status === "WAITING_APPROVAL")) {
    return "WAITING_APPROVAL";
  }
  if (taskRecords.every((task) => task.status === "COMPLETED")) {
    return "COMPLETED";
  }
  return "IN_PROGRESS";
}

function summarizeValidation(taskRecords) {
  const counts = {
    completed: taskRecords.filter((task) => task.status === "COMPLETED").length,
    blocked: taskRecords.filter((task) => task.status === "BLOCKED").length,
    waitingApproval: taskRecords.filter((task) => task.status === "WAITING_APPROVAL").length,
  };

  return `Completed: ${counts.completed}, Blocked: ${counts.blocked}, Waiting approval: ${counts.waitingApproval}.`;
}

function unique(values) {
  return [...new Set(values)];
}

async function writeExecutiveSummary(root, missionRecord, reportRecord) {
  await writeText(
    path.join(root, "executive-dashboard", "latest-summary.md"),
    `
# Latest Executive Summary

- Mission: ${missionRecord.id}
- Status: ${missionRecord.status}
- Template: ${missionRecord.templateId}
- Type: ${missionRecord.missionType}
- Objective: ${missionRecord.objective}
- Required departments: ${missionRecord.requiredDepartments.join(", ")}
- Business value: ${missionRecord.businessValue}
- Revenue impact: ${missionRecord.revenueImpact}
- QA status: ${missionRecord.qaStatus}
- Documentation status: ${missionRecord.documentationStatus}
- Validation: ${reportRecord.validationSummary}
- Next recommended move: ${reportRecord.nextStep}
`
  );

  await writeText(
    path.join(root, "executive-dashboard", "weekly-review.md"),
    `
# CEO Weekly Review

- Company Health: ${missionRecord.status === "COMPLETED" ? "Stable" : "Needs attention"}
- Revenue Opportunities: ${missionRecord.revenueImpact}
- Technical Debt: ${missionRecord.requiredDepartments.includes("engineering") ? "Monitor engineering follow-ups" : "Low in this mission"}
- Marketing Opportunities: ${missionRecord.requiredDepartments.includes("marketing") ? "Mission produced marketing-facing execution" : "No active marketing mission in this run"}
- SEO Wins: ${missionRecord.requiredDepartments.includes("search") ? "Search department routed and documented" : "No search mission in this run"}
- Content Wins: ${missionRecord.requiredDepartments.includes("publishing") ? "Publishing work routed and captured" : "No publishing mission in this run"}
- Website Progress: ${missionRecord.missionType}
- Blocked Missions: ${missionRecord.status === "BLOCKED" ? missionRecord.id : "None"}
- Top Performing Agents: ${missionRecord.requiredAgents.slice(0, 5).join(", ")}
- Weakest Areas: ${missionRecord.openRisks.length ? missionRecord.openRisks.join("; ") : "No major weaknesses recorded in this mission"}
- Recommendations: Continue using autonomous mission routing and expand live specialist execution where safe.
`
  );
}
