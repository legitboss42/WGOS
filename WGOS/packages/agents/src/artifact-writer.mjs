import path from "node:path";
import { auditWebsiteHtml, renderWebsiteAuditMarkdown } from "../../audits/src/website-audit.mjs";
import { createCrmState, createLeadCsv, renderCrmStateMarkdown } from "../../crm/src/lead-store.mjs";
import { createDraftHandoff, renderDraftHandoffMarkdown } from "../../outreach/src/draft-generator.mjs";
import { writeJson, writeText } from "../../runtime/src/fs-utils.mjs";

const localAuditHtml = `<!doctype html>
<html lang="en">
  <head>
    <title>Local WGOS Audit Target</title>
    <meta name="description" content="Local audit fixture used to validate WGOS website audit execution.">
  </head>
  <body>
    <main>
      <h1>Local WGOS Audit Target</h1>
      <p>Contact us for a website audit, SEO review, or growth consultation.</p>
      <img src="/example.jpg">
      <a href="/contact">Contact</a>
    </main>
  </body>
</html>`;

export async function writeSpecialistExecutionArtifacts(root, missionRecord, taskRecord) {
  const runtime = taskRecord.report?.specialistRuntime;
  if (!runtime) {
    return [];
  }

  const written = [];
  const reportDir = path.join(root, "reports", missionRecord.id);

  if (runtime.kind === "frontend") {
    const file = path.join(root, "production", "development", `${missionRecord.id}-frontend-execution-plan.md`);
    await writeText(file, renderFrontendPlan(missionRecord, taskRecord, runtime));
    written.push(file);
  }

  if (runtime.kind === "seo") {
    const file = path.join(reportDir, "seo-audit-report.md");
    await writeText(file, renderSeoReport(missionRecord, taskRecord, runtime));
    written.push(file);
  }

  if (runtime.kind === "content") {
    const file = path.join(root, "growth", "content", `${missionRecord.id}-content-brief.md`);
    await writeText(file, renderContentBrief(missionRecord, taskRecord, runtime));
    written.push(file);
  }

  if (runtime.kind === "marketing") {
    const file = path.join(root, "growth", "marketing", `${missionRecord.id}-campaign-plan.md`);
    await writeText(file, renderMarketingPlan(missionRecord, taskRecord, runtime));
    written.push(file);
  }

  if (runtime.kind === "lead-research") {
    const csvFile = path.join(root, "growth", "crm", `${missionRecord.id}-lead-research.csv`);
    const runbookFile = path.join(root, "growth", "marketing", `${missionRecord.id}-lead-research-runbook.md`);
    await writeText(csvFile, createLeadCsv([]));
    await writeText(runbookFile, renderLeadResearchRunbook(missionRecord, taskRecord, runtime));
    written.push(csvFile, runbookFile);
  }

  if (runtime.kind === "website-audit") {
    const audit = auditWebsiteHtml({ url: runtime.websiteAuditEngine.defaultUrl, html: localAuditHtml });
    const file = path.join(reportDir, "website-audit-report.md");
    await writeText(file, renderWebsiteAuditMarkdown(audit));
    written.push(file);
  }

  if (runtime.kind === "crm") {
    const state = createCrmState({ missionId: missionRecord.id });
    const jsonFile = path.join(root, "growth", "crm", `${missionRecord.id}-crm-state.json`);
    const mdFile = path.join(root, "growth", "crm", `${missionRecord.id}-crm-state.md`);
    await writeJson(jsonFile, state);
    await writeText(mdFile, renderCrmStateMarkdown(state));
    written.push(jsonFile, mdFile);
  }

  if (runtime.kind === "outreach") {
    const handoff = createDraftHandoff({ missionId: missionRecord.id });
    const file = path.join(root, "growth", "marketing", `${missionRecord.id}-outreach-draft-handoff.md`);
    await writeText(file, renderDraftHandoffMarkdown(handoff));
    written.push(file);
  }

  taskRecord.specialistArtifacts = written.map((file) => path.relative(root, file).replace(/\\/g, "/"));
  return written;
}

function renderFrontendPlan(missionRecord, taskRecord, runtime) {
  return `# Frontend Execution Plan

- Mission: ${missionRecord.id}
- Task: ${taskRecord.id}
- Agent: ${taskRecord.agentTitle}
- Target Surface: ${runtime.implementationPlan.targetSurface}

## Component Strategy

${runtime.implementationPlan.componentStrategy.map((item) => `- ${item}`).join("\n")}

## Validation Commands

${runtime.implementationPlan.validationCommands.map((item) => `- \`${item}\``).join("\n")}

## Approval Checkpoints

${runtime.approvalCheckpoints.map((item) => `- ${item.action}: ${item.approvalRecord.status}`).join("\n")}
`;
}

function renderSeoReport(missionRecord, taskRecord, runtime) {
  return `# SEO Audit Report

- Mission: ${missionRecord.id}
- Task: ${taskRecord.id}
- Agent: ${taskRecord.agentTitle}
- Evidence Policy: ${runtime.auditPlan.evidencePolicy}

## Checks

${runtime.auditPlan.checks.map((item) => `- ${item}`).join("\n")}

## Output Buckets

${runtime.auditPlan.outputBuckets.map((item) => `- ${item}`).join("\n")}

## Controlled Sessions

${runtime.controlledSessions.map((item) => `- ${item.integrationId}: ${item.approvalCheckpoint.status}`).join("\n")}
`;
}

function renderContentBrief(missionRecord, taskRecord, runtime) {
  return `# Content Brief

- Mission: ${missionRecord.id}
- Task: ${taskRecord.id}
- Agent: ${taskRecord.agentTitle}

## Brief Fields

${runtime.contentSystem.briefFields.map((item) => `- ${item}`).join("\n")}

## Quality Rules

${runtime.contentSystem.qualityRules.map((item) => `- ${item}`).join("\n")}

## Publishing Gate

- Action: ${runtime.contentSystem.publishingGate.action}
- Status: ${runtime.contentSystem.publishingGate.approvalRecord.status}
`;
}

function renderMarketingPlan(missionRecord, taskRecord, runtime) {
  return `# Marketing Campaign Plan

- Mission: ${missionRecord.id}
- Task: ${taskRecord.id}
- Agent: ${taskRecord.agentTitle}
- Minimum Score: ${runtime.campaignPlan.scoreThreshold}
- No Automatic Outreach: ${runtime.campaignPlan.noAutomaticOutreach}

## Target Mix

${runtime.campaignPlan.targetMix.map((item) => `- ${item}`).join("\n")}

## CRM Statuses

${runtime.campaignPlan.crmStatuses.map((item) => `- ${item}`).join("\n")}
`;
}

function renderLeadResearchRunbook(missionRecord, taskRecord, runtime) {
  return `# Lead Research Runbook

- Mission: ${missionRecord.id}
- Task: ${taskRecord.id}
- Agent: ${taskRecord.agentTitle}
- Target Count: ${runtime.leadResearchRunbook.targetCount}
- Draft Policy: ${runtime.leadResearchRunbook.draftPolicy}

## Approved Sources

${runtime.leadResearchRunbook.approvedSources.map((item) => `- ${item}`).join("\n")}

## Required Fields

${runtime.leadResearchRunbook.requiredFields.map((item) => `- ${item}`).join("\n")}

## Scoring

- Business Value: ${runtime.leadResearchRunbook.scoring.businessValue}
- Website Problem Severity: ${runtime.leadResearchRunbook.scoring.websiteProblemSeverity}
- Conversion Opportunity: ${runtime.leadResearchRunbook.scoring.conversionOpportunity}
- Contactability: ${runtime.leadResearchRunbook.scoring.contactability}
- Fit: ${runtime.leadResearchRunbook.scoring.fit}
- Minimum Saved Score: ${runtime.leadResearchRunbook.scoring.minimumSavedScore}
`;
}
