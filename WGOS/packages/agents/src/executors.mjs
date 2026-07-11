import { agents, approvalClasses } from "../../../scripts/lib/wgos-config.mjs";
import { integrationCatalog } from "../../integrations/src/integration-catalog.mjs";
import { integrationPlaybookCatalog } from "../../integrations/src/playbook-catalog.mjs";
import { buildSpecialistPlan, executeSpecialistModule } from "./specialists.mjs";

const agentMap = new Map(agents.map((agent) => [agent.slug, agent]));
const approvalOrder = new Map(approvalClasses.map((item, index) => [item.id, index]));
const integrationMap = new Map(integrationCatalog.map((integration) => [integration.id, integration]));

const departmentExecutionProfiles = {
  executive: {
    actions: ["frame mission context", "route dependencies", "protect approvals"],
    validations: ["mission scope is clear", "handoff order is explicit", "approval gates are documented"],
    evidence: ["mission brief", "dependency map", "approval map"],
    kpiFocus: ["documentation compliance", "mission throughput"],
  },
  design: {
    actions: ["shape user flow", "evaluate brand alignment", "specify layout and motion intent"],
    validations: ["user journey is coherent", "design decisions support conversion", "motion does not conflict with accessibility"],
    evidence: ["experience notes", "wireframe guidance", "interaction recommendations"],
    kpiFocus: ["conversion clarity", "brand consistency"],
  },
  engineering: {
    actions: ["implement scoped changes", "protect reliability", "prepare validation evidence"],
    validations: ["implementation matches task objective", "technical risks are surfaced", "release constraints are documented"],
    evidence: ["implementation notes", "validation notes", "handoff blockers"],
    kpiFocus: ["delivery throughput", "quality pass rate"],
  },
  search: {
    actions: ["analyze search intent", "identify crawl and metadata issues", "prioritize visibility improvements"],
    validations: ["search recommendations map to intent", "technical constraints are noted", "measurement path is defined"],
    evidence: ["search findings", "SERP opportunity notes", "optimization backlog"],
    kpiFocus: ["organic growth", "indexation quality"],
  },
  publishing: {
    actions: ["plan editorial output", "tighten messaging", "protect quality and internal links"],
    validations: ["content matches search intent", "claims remain factual", "publishing dependencies are explicit"],
    evidence: ["content brief", "draft notes", "linking recommendations"],
    kpiFocus: ["content throughput", "content quality"],
  },
  marketing: {
    actions: ["research pipeline opportunities", "score lead quality", "prepare compliant outreach context"],
    validations: ["evidence is verified", "lead quality threshold is clear", "external action remains approval-gated"],
    evidence: ["lead notes", "audit findings", "personalization angles"],
    kpiFocus: ["pipeline health", "qualified opportunities"],
  },
  revenue: {
    actions: ["surface monetization signals", "connect analytics to action", "prioritize revenue moves"],
    validations: ["opportunities are measurable", "revenue assumptions are labeled", "next action is economically sound"],
    evidence: ["revenue signal summary", "KPI deltas", "prioritized opportunities"],
    kpiFocus: ["revenue impact", "conversion lift"],
  },
  client: {
    actions: ["align delivery expectations", "clarify client value", "prepare safe next-step communication"],
    validations: ["scope is client-safe", "handoff is clear", "no external contact bypass occurs"],
    evidence: ["client notes", "proposal inputs", "onboarding checkpoints"],
    kpiFocus: ["client retention", "proposal readiness"],
  },
};

const agentOverrides = {
  CEO_OPERATOR_AGENT: {
    actions: ["define business outcome", "set mission guardrails", "rank business value versus risk"],
    deliverables: ["executive brief", "mission intent snapshot"],
  },
  WORKFLOW_ORCHESTRATOR_AGENT: {
    actions: ["pick departments", "sequence specialist handoffs", "match workflows to integrations"],
    deliverables: ["routing matrix", "dependency chain"],
  },
  PROJECT_MANAGER_AGENT: {
    actions: ["construct task board", "assign dependencies", "track blockers and approvals"],
    deliverables: ["task board", "risk register"],
  },
  FRONTEND_ENGINEER_AGENT: {
    actions: ["map UI implementation", "identify component changes", "protect route and metadata surfaces"],
    deliverables: ["implementation checklist", "UI validation notes"],
  },
  SEO_AGENT: {
    actions: ["group search opportunities", "prioritize page-level SEO fixes", "connect recommendations to traffic impact"],
    deliverables: ["SEO action plan", "intent map"],
  },
  TECHNICAL_SEO_AGENT: {
    actions: ["inspect crawl and indexation paths", "flag technical blockers", "define validation steps"],
    deliverables: ["technical SEO findings", "crawl remediation plan"],
  },
  ANALYTICS_AGENT: {
    actions: ["summarize KPI movement", "spot growth anomalies", "recommend reporting follow-through"],
    deliverables: ["analytics summary", "KPI recommendations"],
  },
  LEAD_RESEARCH_AGENT: {
    actions: ["collect qualified lead signals", "score lead fit", "prepare safe research log entries"],
    deliverables: ["lead shortlist", "lead scoring notes"],
  },
  WEBSITE_AUDIT_AGENT: {
    actions: ["review trust and UX issues", "identify conversion leaks", "rank audit findings by business value"],
    deliverables: ["mini audit", "service-fit recommendations"],
  },
  BUSINESS_INTELLIGENCE_AGENT: {
    actions: ["enrich business context", "validate public evidence", "identify outreach-safe angles"],
    deliverables: ["business intelligence notes", "context enrichment report"],
  },
  OUTREACH_DRAFTING_AGENT: {
    actions: ["draft compliant personalization", "tie message to verified evidence", "preserve human approval gate"],
    deliverables: ["draft angle", "outreach copy inputs"],
  },
  CRO_AGENT: {
    actions: ["spot funnel friction", "rank conversion tests", "connect changes to revenue impact"],
    deliverables: ["CRO hypotheses", "conversion priority list"],
  },
  QA_ENGINEER_AGENT: {
    actions: ["test handoff integrity", "verify output completeness", "reject weak evidence"],
    deliverables: ["QA disposition", "validation exceptions"],
  },
  KNOWLEDGE_MANAGER_AGENT: {
    actions: ["archive lessons learned", "update institutional memory", "reduce repeat failure risk"],
    deliverables: ["knowledge updates", "lesson summary"],
  },
  DOCUMENTATION_AGENT: {
    actions: ["close reporting gaps", "synchronize records", "produce executive-ready documentation"],
    deliverables: ["closeout report", "documentation audit"],
  },
};

export function getAgentBySlug(agentSlug) {
  const agent = agentMap.get(agentSlug);
  if (!agent) {
    throw new Error(`Unknown agent: ${agentSlug}`);
  }
  return agent;
}

export function createAgentExecutor(agentSlug) {
  const agent = getAgentBySlug(agentSlug);

  return {
    agent,
    Mission(context, task) {
      const profile = buildExecutionProfile(agent, context, task);

      return {
        objective: task.objective,
        successDefinition: task.expectedOutput,
        companyId: context.mission.companyId,
        approvalClass: context.mission.approvalClass,
        missionType: context.mission.missionType,
        requiredDepartments: context.mission.requiredDepartments,
        requiredIntegrations: profile.integrationsUsed.map((item) => item.id),
        playbooks: profile.playbooksUsed.map((playbook) => playbook.id),
      };
    },
    Plan(context, task) {
      const profile = buildExecutionProfile(agent, context, task);
      const specialistPlan = buildSpecialistPlan({ agent, context, task, profile });

      return {
        skillsLoaded: agent.skills,
        workstreams: profile.actions,
        validationChecks: profile.validations,
        dependencies: task.dependencies,
        requiredEvidence: profile.evidence,
        playbooks: profile.playbooksUsed.map((playbook) => playbook.id),
        integrations: profile.integrationsUsed.map((item) => `${item.title} (${item.approvalLevel})`),
        collaborationTargets: profile.collaborationTargets,
        specialistPlan,
      };
    },
    Execute(context, task) {
      const profile = buildExecutionProfile(agent, context, task);
      const approvalGateReached = requiresApprovalPause(context.mission.approvalClass, profile.integrationsUsed);
      const specialistRuntime = executeSpecialistModule({ agent, context, task, profile });

      return {
        summary: summarizeExecution(agent, task, context, profile),
        artifacts: profile.deliverables.map((item) => `${agent.slug}:${item}`),
        evidence: profile.evidence,
        integrationsUsed: profile.integrationsUsed,
        playbooksUsed: profile.playbooksUsed.map((playbook) => playbook.id),
        collaborationRequests: profile.collaborationTargets.map((target) => ({
          target,
          reason: `Coordinate ${task.expectedOutput.toLowerCase()} with ${target}.`,
        })),
        specialistOutputs: profile.deliverables,
        kpiFocus: profile.kpiFocus,
        approvalGateReached,
        specialistRuntime,
      };
    },
    Validate(context, task, execution) {
      if (execution.approvalGateReached) {
        return {
          status: "WAITING_APPROVAL",
          passed: false,
          notes: "Mission approval class or integration mix requires a human pause before external execution can continue.",
        };
      }

      return {
        status: "COMPLETED",
        passed: true,
        notes: `${agent.title} completed ${task.expectedOutput.toLowerCase()} with ${execution.integrationsUsed.length} tracked integrations.`,
      };
    },
    Report(context, task, execution, validation) {
      return {
        agent: agent.title,
        taskId: task.id,
        objective: task.objective,
        actions: execution.summary,
        validation: validation.notes,
        nextStep: task.nextAgentSlug ? `Hand off to ${task.nextAgentSlug}.` : "Close the mission task chain.",
        integrations: execution.integrationsUsed.map((item) => item.id),
        playbooks: execution.playbooksUsed,
        specialistOutputs: execution.specialistOutputs,
        specialistRuntime: execution.specialistRuntime,
      };
    },
    UpdateMemory(context, task) {
      return {
        currentState: `${task.id}: ${agent.title} completed ${task.objective}.`,
        nextAction: task.nextAgentSlug ? `${task.nextAgentSlug} should take over ${task.id}.` : `Archive ${task.id}.`,
        codexMemory: `${context.mission.id} used ${agent.title} for ${task.expectedOutput}.`,
      };
    },
    HandOff(context, task, validation) {
      const profile = buildExecutionProfile(agent, context, task);

      return {
        fromAgentSlug: agent.slug,
        toAgentSlug: task.nextAgentSlug ?? null,
        status: validation.status,
        validationNeeded: task.nextAgentSlug ? `Downstream review by ${task.nextAgentSlug}.` : "Mission closeout validation only.",
        completedWork: profile.deliverables,
        collaborationTargets: profile.collaborationTargets,
      };
    },
    RequestApproval(context) {
      const profile = buildExecutionProfile(agent, context, context.currentTask ?? {});
      return {
        required: requiresApprovalPause(context.mission.approvalClass, profile.integrationsUsed),
        approvalClass: context.mission.approvalClass,
        riskyIntegrations: profile.integrationsUsed
          .filter((item) => item.approvalLevel === "HIGH")
          .map((item) => item.id),
      };
    },
    Recover(task, error) {
      return {
        status: "BLOCKED",
        reason: error.message,
        recommendation: `Re-run ${task.id} after resolving the blocker and preserving prior evidence.`,
      };
    },
    Archive() {
      return {
        archived: true,
      };
    },
  };
}

function buildExecutionProfile(agent, context, task) {
  const departmentProfile = departmentExecutionProfiles[agent.department] ?? departmentExecutionProfiles.executive;
  const override = agentOverrides[agent.slug] ?? {};
  const playbooksUsed = integrationPlaybookCatalog.filter(
    (playbook) =>
      playbook.primaryAgents.includes(agent.slug) &&
      playbook.integrations.some((integrationId) => context.mission.requiredIntegrations.includes(integrationId))
  );
  const integrationsUsed = resolveIntegrations(context.mission.requiredIntegrations, playbooksUsed);
  const collaborationTargets = unique(
    [
      task.nextAgentSlug,
      ...playbooksUsed.flatMap((playbook) => playbook.primaryAgents.filter((slug) => slug !== agent.slug)),
    ].filter(Boolean)
  );
  const deliverables = unique([
    ...(override.deliverables ?? []),
    ...agent.outputs.map((output) => output.toLowerCase()),
    `${task.stage ?? "mission"} output`,
  ]);

  return {
    actions: unique([...(override.actions ?? []), ...departmentProfile.actions]),
    validations: departmentProfile.validations,
    evidence: unique([...departmentProfile.evidence, task.expectedOutput, ...deliverables]),
    kpiFocus: unique([...departmentProfile.kpiFocus, context.mission.businessValue, context.mission.revenueImpact]),
    playbooksUsed,
    integrationsUsed,
    collaborationTargets,
    deliverables,
  };
}

function resolveIntegrations(requiredIntegrations, playbooksUsed) {
  const playbookIntegrations = playbooksUsed.flatMap((playbook) => playbook.integrations);
  return unique([...requiredIntegrations.filter((id) => playbookIntegrations.includes(id)), ...playbookIntegrations]).map((id) => {
    const definition = integrationMap.get(id);
    return (
      definition ?? {
        id,
        title: titleFromId(id),
        approvalLevel: "NORMAL",
        runtimeDocs: [],
      }
    );
  });
}

function summarizeExecution(agent, task, context, profile) {
  const workflowList = context.mission.workflows.join(", ");
  const integrationList = profile.integrationsUsed.map((item) => item.id).join(", ") || "local runtime only";
  const playbookList = profile.playbooksUsed.map((playbook) => playbook.id).join(", ") || "direct runtime plan";
  return `${agent.title} executed ${task.objective} for mission ${context.mission.id} using workflows: ${workflowList}; playbooks: ${playbookList}; integrations: ${integrationList}.`;
}

function requiresApprovalPause(approvalClass, integrationsUsed = []) {
  void integrationsUsed;
  return (approvalOrder.get(approvalClass) ?? 0) >= (approvalOrder.get("A2") ?? 2);
}

function unique(values) {
  return [...new Set(values)];
}

function titleFromId(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
