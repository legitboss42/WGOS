import { agents } from "../../../scripts/lib/wgos-config.mjs";
import { integrationPlaybookCatalog } from "../../integrations/src/playbook-catalog.mjs";

const standardOpeners = [
  {
    agentSlug: "CEO_OPERATOR_AGENT",
    objective: "Interpret the human business objective as a company mission.",
    expectedOutput: "Executive mission brief",
    stage: "executive_intake",
  },
  {
    agentSlug: "WORKFLOW_ORCHESTRATOR_AGENT",
    objective: "Select departments, specialists, dependencies, and approval gates for the mission.",
    expectedOutput: "Workflow routing plan",
    stage: "executive_routing",
  },
  {
    agentSlug: "PROJECT_MANAGER_AGENT",
    objective: "Create the company task board, complexity estimate, and handoff-safe execution order.",
    expectedOutput: "Company task board",
    stage: "project_management",
  },
];

const standardClosers = [
  {
    agentSlug: "QA_ENGINEER_AGENT",
    objective: "Validate cross-department output quality and readiness.",
    expectedOutput: "QA conclusion",
    stage: "quality_assurance",
  },
  {
    agentSlug: "KNOWLEDGE_MANAGER_AGENT",
    objective: "Capture lessons learned, mission knowledge, and next actions.",
    expectedOutput: "Knowledge archive update",
    stage: "knowledge_capture",
  },
  {
    agentSlug: "DOCUMENTATION_AGENT",
    objective: "Finalize reporting, documentation status, and executive closeout.",
    expectedOutput: "Mission documentation closeout",
    stage: "documentation_closeout",
  },
];

const companyMissionProfiles = {
  DEMO_SYSTEM_VALIDATION: {
    businessValue: "Low",
    revenueImpact: "Indirect",
    estimatedComplexity: "Medium",
    missionType: "Internal operations",
  },
  BUILD_PREMIUM_WEBSITE: {
    businessValue: "High",
    revenueImpact: "High",
    estimatedComplexity: "High",
    missionType: "Website project",
  },
  REDESIGN_WEBSITE: {
    businessValue: "High",
    revenueImpact: "High",
    estimatedComplexity: "High",
    missionType: "Website project",
  },
  SEO_AUDIT: {
    businessValue: "High",
    revenueImpact: "Medium",
    estimatedComplexity: "Medium",
    missionType: "SEO improvement",
  },
  HOMEPAGE_REBUILD: {
    businessValue: "High",
    revenueImpact: "High",
    estimatedComplexity: "High",
    missionType: "Website project",
  },
  LAUNCH_BLOG_CLUSTER: {
    businessValue: "Medium",
    revenueImpact: "Medium",
    estimatedComplexity: "Medium",
    missionType: "Content program",
  },
  TECHNICAL_SEO_CLEANUP: {
    businessValue: "High",
    revenueImpact: "Medium",
    estimatedComplexity: "Medium",
    missionType: "SEO improvement",
  },
  WEEKLY_ANALYTICS_REVIEW: {
    businessValue: "Medium",
    revenueImpact: "Medium",
    estimatedComplexity: "Low",
    missionType: "Internal operations",
  },
  LEAD_RESEARCH: {
    businessValue: "High",
    revenueImpact: "High",
    estimatedComplexity: "Medium",
    missionType: "Growth campaign",
  },
  NEWSLETTER_CAMPAIGN: {
    businessValue: "Medium",
    revenueImpact: "Medium",
    estimatedComplexity: "Medium",
    missionType: "Growth campaign",
  },
};

const agentBySlug = new Map(agents.map((agent) => [agent.slug, agent]));

export function buildMissionExecutionPlan(template) {
  const specialistBlueprints = template.specialistBlueprints ?? template.taskBlueprints ?? [];
  const executionBlueprints = [
    ...addIfMissing(standardOpeners, specialistBlueprints),
    ...specialistBlueprints,
    ...addIfMissing(standardClosers, specialistBlueprints),
  ];

  const requiredAgents = unique(executionBlueprints.map((item) => item.agentSlug));
  const requiredDepartments = unique(requiredAgents.map((agentSlug) => agentBySlug.get(agentSlug)?.department).filter(Boolean));
  const requiredSkills = unique(requiredAgents.flatMap((agentSlug) => agentBySlug.get(agentSlug)?.skills ?? []));
  const requiredIntegrations = unique(
    integrationPlaybookCatalog
      .filter((playbook) => playbook.primaryAgents.some((agentSlug) => requiredAgents.includes(agentSlug)))
      .flatMap((playbook) => playbook.integrations)
  );

  const profile = companyMissionProfiles[template.id] ?? {
    businessValue: "Medium",
    revenueImpact: "Medium",
    estimatedComplexity: "Medium",
    missionType: "Internal operations",
  };

  return {
    ...template,
    specialistBlueprints,
    executionBlueprints,
    requiredAgents,
    requiredDepartments,
    requiredSkills,
    requiredIntegrations,
    businessValue: template.businessValue ?? profile.businessValue,
    revenueImpact: template.revenueImpact ?? profile.revenueImpact,
    estimatedComplexity: template.estimatedComplexity ?? profile.estimatedComplexity,
    missionType: template.missionType ?? profile.missionType,
    documentationUpdates: template.documentationUpdates ?? ["reports", "memory", "decisions", "executive-dashboard"],
    approvalGates: template.approvalGates ?? deriveApprovalGates(template.approvalClass),
  };
}

export function buildDepartmentSummaries(taskRecords) {
  const summaries = new Map();

  for (const task of taskRecords) {
    const current = summaries.get(task.department) ?? {
      department: task.department,
      assignedAgents: new Set(),
      completedTasks: 0,
      blockedTasks: 0,
      waitingApprovalTasks: 0,
    };

    current.assignedAgents.add(task.agentSlug);
    if (task.status === "COMPLETED") {
      current.completedTasks += 1;
    }
    if (task.status === "BLOCKED") {
      current.blockedTasks += 1;
    }
    if (task.status === "WAITING_APPROVAL") {
      current.waitingApprovalTasks += 1;
    }

    summaries.set(task.department, current);
  }

  return [...summaries.values()].map((item) => ({
    ...item,
    assignedAgents: [...item.assignedAgents],
  }));
}

function addIfMissing(standardTasks, currentTasks) {
  return standardTasks.filter((task) => !currentTasks.some((item) => item.agentSlug === task.agentSlug));
}

function unique(values) {
  return [...new Set(values)];
}

function deriveApprovalGates(approvalClass) {
  if (approvalClass === "A0" || approvalClass === "A1") {
    return ["Local-only execution"];
  }
  if (approvalClass === "A2") {
    return ["Read-only external observation", "Pause at login or protected account selection"];
  }
  return ["State-changing external action requires explicit human approval"];
}
