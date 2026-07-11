import fs from "node:fs/promises";
import path from "node:path";
import {
  WGOS_ROOT,
  agents,
  departments,
  integrations,
  skills,
  templates,
  tenants,
  workflows,
} from "./lib/wgos-config.mjs";

async function exists(relPath) {
  try {
    await fs.access(path.join(WGOS_ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function read(relPath) {
  return fs.readFile(path.join(WGOS_ROOT, relPath), "utf8");
}

async function assertFile(relPath, failures) {
  if (!(await exists(relPath))) {
    failures.push(`Missing file: ${relPath}`);
  }
}

async function assertContent(relPath, checks, failures) {
  const content = await read(relPath);
  for (const check of checks) {
    if (!content.includes(check)) {
      failures.push(`Missing expected content in ${relPath}: ${check}`);
    }
  }
  if (content.includes('"@') || content.includes("'WGOS/")) {
    failures.push(`Generator artifact leak found in ${relPath}`);
  }
}

async function main() {
  const failures = [];

  const requiredRootFiles = [
    "README.md",
    "AGENTS.md",
    "COMPANY.md",
    "MISSION.md",
    "VALUES.md",
    "ORGANIZATION.md",
    "BUSINESS_MODEL.md",
    "RULE_ZERO.md",
    "ORCHESTRATOR.md",
    "PROJECT_MANAGER.md",
    "KNOWLEDGE_MANAGER.md",
    "APPROVAL_GATES.md",
    "MEMORY.md",
    "SKILLS.md",
    "WORKFLOWS.md",
    "PROJECT_HANDOFF.md",
    "ROADMAP.md",
    "CHANGELOG.md",
    "PHASE_STATUS.md",
    "apps/README.md",
    "apps/dashboard/README.md",
    "apps/operator/README.md",
    "apps/client-portal/README.md",
    "apps/admin/README.md",
    "packages/README.md",
    "packages/runtime/README.md",
    "packages/agents/README.md",
    "packages/memory/README.md",
    "packages/workflows/README.md",
    "packages/integrations/README.md",
    "packages/reporting/README.md",
    "packages/analytics/README.md",
    "packages/ui/README.md",
    "docs/README.md",
    "docs/ARCHITECTURE.md",
    "examples/README.md",
    "tests/README.md",
    "state/README.md",
    "production/README.md",
    "production/workflows/README.md",
    "production/workflows/CLIENT_WEBSITE_PIPELINE.md",
    "production/workflows/CLIENT_DISCOVERY_WORKFLOW.md",
    "production/workflows/WEBSITE_STRATEGY_WORKFLOW.md",
    "production/workflows/INFORMATION_ARCHITECTURE_WORKFLOW.md",
    "production/workflows/DESIGN_PIPELINE_WORKFLOW.md",
    "production/workflows/MOTION_PIPELINE_WORKFLOW.md",
    "production/workflows/ENGINEERING_PIPELINE_WORKFLOW.md",
    "production/workflows/CONTENT_PIPELINE_WORKFLOW.md",
    "production/workflows/SEO_PIPELINE_WORKFLOW.md",
    "production/workflows/CLIENT_REVIEW_WORKFLOW.md",
    "production/workflows/LAUNCH_PIPELINE_WORKFLOW.md",
    "production/workflows/POST_LAUNCH_PIPELINE_WORKFLOW.md",
    "production/workflows/CASE_STUDY_PIPELINE_WORKFLOW.md",
    "production/templates/README.md",
    "production/templates/CLIENT_DISCOVERY_TEMPLATE.md",
    "production/templates/SITE_STRATEGY_TEMPLATE.md",
    "production/templates/PAGE_STRATEGY_TEMPLATE.md",
    "production/templates/INFORMATION_ARCHITECTURE_TEMPLATE.md",
    "production/templates/DESIGN_DIRECTION_TEMPLATE.md",
    "production/templates/MOTION_SPEC_TEMPLATE.md",
    "production/templates/ENGINEERING_HANDOFF_TEMPLATE.md",
    "production/templates/CLIENT_REVIEW_TEMPLATE.md",
    "production/templates/CASE_STUDY_TEMPLATE.md",
    "production/templates/WEBSITE_BLUEPRINT_LIBRARY.md",
    "production/checklists/README.md",
    "production/checklists/LAUNCH_READINESS_CHECKLIST.md",
    "production/checklists/DESIGN_QA_CHECKLIST.md",
    "production/checklists/ENGINEERING_QA_CHECKLIST.md",
    "production/checklists/SEO_RELEASE_CHECKLIST.md",
    "production/checklists/CLIENT_APPROVAL_CHECKLIST.md",
    "production/checklists/POST_LAUNCH_BASELINE_CHECKLIST.md",
    "production/client-delivery/README.md",
    "production/client-delivery/CLIENT_REVIEW_AND_REVISION_SYSTEM.md",
    "production/client-delivery/HANDOFF_PACKAGE_TEMPLATE.md",
    "production/design/README.md",
    "production/design/BLUEPRINT_MATRIX.md",
    "production/development/README.md",
    "production/development/WEBSITE_HEALTH_SCORING.md",
    "production/seo/README.md",
    "production/content/README.md",
    "production/motion/README.md",
    "production/qa/README.md",
    "production/qa/QA_VALIDATION_SEQUENCE.md",
    "production/launch/README.md",
    "production/launch/POST_LAUNCH_BASELINE.md",
    "memory/projects/README.md",
    "memory/projects/PROJECT_MEMORY_TEMPLATE.md",
    "growth/README.md",
    "growth/marketing/README.md",
    "growth/marketing/LEAD_GENERATION_ENGINE.md",
    "growth/marketing/WEBSITE_AUDIT_ENGINE.md",
    "growth/seo/README.md",
    "growth/seo/SEO_GROWTH_ENGINE.md",
    "growth/content/README.md",
    "growth/content/CONTENT_MARKETING_ENGINE.md",
    "growth/adsense/README.md",
    "growth/adsense/ADSENSE_READINESS_ENGINE.md",
    "growth/affiliate/README.md",
    "growth/affiliate/AFFILIATE_ENGINE.md",
    "growth/newsletter/README.md",
    "growth/newsletter/NEWSLETTER_ENGINE.md",
    "growth/social/README.md",
    "growth/social/SOCIAL_CONTENT_ENGINE.md",
    "growth/crm/README.md",
    "growth/crm/CRM_PIPELINE.md",
    "growth/analytics/README.md",
    "growth/analytics/ANALYTICS_ENGINE.md",
    "growth/revenue/README.md",
    "growth/revenue/REVENUE_ENGINE.md",
    "growth/revenue/DIGITAL_PRODUCT_ENGINE.md",
    "growth/revenue/FREE_TOOLS_ENGINE.md",
    "growth/revenue/REVENUE_OPPORTUNITY_MAP.md",
    "growth/dashboard/README.md",
    "growth/dashboard/REVENUE_DASHBOARD.md",
    "growth/dashboard/COMPANY_KPI_DASHBOARD.md",
    "growth/dashboard/EXECUTIVE_REVIEW_CADENCE.md",
    "growth/playbooks/README.md",
    "growth/playbooks/SEO_GROWTH_PLAYBOOK.md",
    "growth/playbooks/CONTENT_MARKETING_PLAYBOOK.md",
    "growth/playbooks/ADSENSE_READINESS_PLAYBOOK.md",
    "growth/playbooks/NEWSLETTER_PLAYBOOK.md",
    "growth/playbooks/SOCIAL_REPURPOSING_PLAYBOOK.md",
    "growth/playbooks/AFFILIATE_OPPORTUNITY_PLAYBOOK.md",
    "growth/playbooks/REVENUE_OPPORTUNITY_PLAYBOOK.md",
    "company-kpis/agent-performance.md",
    "company-kpis/department-performance.md",
    "company-kpis/company-health-score.md",
    "intelligence/history/mission-trend-summary.md",
    "intelligence/learning/latest-learning.md",
    "intelligence/patterns/recurring-patterns.md",
    "intelligence/recommendations/prioritized-recommendations.md",
    "intelligence/recommendations/automation-opportunities.md",
    "intelligence/recommendations/decision-analysis.md",
    "intelligence/benchmarks/operating-benchmarks.md",
    "intelligence/forecasting/next-quarter-forecast.md",
    "intelligence/scoring/mission-intelligence-scorecard.md",
    "intelligence/optimization/workflow-improvements.md",
    "memory/library/README.md",
    "memory/library/BEST_PRACTICES.md",
    "memory/library/COMMON_MISTAKES.md",
    "memory/library/INDUSTRY_INSIGHTS.md",
    "memory/library/ARCHITECTURE_DECISIONS.md",
    "platform/tenant-management/TENANT_ISOLATION_RULES.md",
    "platform/tenant-management/PERMISSION_MODEL.md",
    "platform/resource-management/RESOURCE_SHARING_MATRIX.md",
    "platform/resource-management/WORKLOAD_MANAGEMENT.md",
    "platform/global-memory/KNOWLEDGE_SHARING_POLICY.md",
    "platform/global-reporting/PORTFOLIO_DASHBOARD.md",
    "platform/global-reporting/GLOBAL_EXECUTIVE_REPORTING.md",
    "platform/company-registry/company-status-board.md",
    "platform/GOVERNANCE.md",
    "platform/VERSIONING.md",
    "platform/MARKETPLACE_FOUNDATION.md",
    "platform/BACKUP_AND_RECOVERY.md",
    "platform/SECURITY_MODEL.md",
    "companies/web-growth/MISSION_SUMMARY.md",
    "companies/web-growth/OPERATING_SCORECARD.md",
    "companies/web-growth/TENANT_BOUNDARY.md",
    "companies/web-growth/memory/README.md",
    "companies/web-growth/projects/README.md",
    "companies/web-growth/crm/README.md",
    "companies/client-template/MISSION_SUMMARY.md",
    "companies/client-template/OPERATING_SCORECARD.md",
    "companies/client-template/TENANT_BOUNDARY.md",
    "companies/shared/SHARED_SERVICES.md",
    "clients/active/CLIENT_OPERATING_TEMPLATE.md",
    "clients/CLIENT_LIFECYCLE.md",
    "clients/CLIENT_PORTAL_FRAMEWORK.md",
    "packages/agents/src/specialists.mjs",
    "packages/agents/src/artifact-writer.mjs",
    "packages/approval/README.md",
    "packages/approval/src/approval-queue.mjs",
    "packages/audits/src/website-audit.mjs",
    "packages/crm/src/lead-store.mjs",
    "packages/outreach/src/draft-generator.mjs",
    "packages/integrations/src/controlled-session.mjs",
    "packages/integrations/src/capability-registry.mjs",
    "packages/integrations/src/read-only-adapters.mjs",
    "packages/integrations/src/lighthouse-runner.mjs",
    "packages/integrations/src/integration-logger.mjs",
    "scripts/inspect-url.mjs",
    "integrations/CAPABILITY_REPORT.md",
    "state/integrations/capabilities.json",
    "state/approvals/queue.json",
    "reports/approvals/latest-approval-queue.md",
    "scripts/approvals.mjs",
    "release/v1/RELEASE_NOTES.md",
    "release/v1/ARCHITECTURE_SUMMARY.md",
    "release/v1/PRODUCTION_READINESS_SCORE.md",
    "release/v1/KNOWN_LIMITATIONS.md",
    "release/reports/RUNTIME_VALIDATION_REPORT.md",
    "release/reports/DOCUMENTATION_COVERAGE_REPORT.md",
    "release/reports/MEMORY_COVERAGE_REPORT.md",
    "release/reports/V1_RELEASE_VALIDATION_REPORT.md",
    "release/security/SECURITY_REVIEW_SUMMARY.md",
    "release/checklists/V1_RELEASE_CHECKLIST.md",
    "release/tests/MISSION_STRESS_TEST_PLAN.md",
    "release/tests/MISSION_STRESS_TEST_REPORT.md",
    "release/validation/AGENT_CERTIFICATION.md",
    "release/validation/DEPARTMENT_CERTIFICATION.md",
    "release/validation/WORKFLOW_CERTIFICATION.md",
    "release/documentation/COMPANY_OPERATING_MANUAL.md",
    "release/playbooks/CEO_PLAYBOOK.md",
    "release/playbooks/DEVELOPER_PLAYBOOK.md",
    "release/examples/MISSION_EXAMPLES.md",
    "release/migration/V2_ROADMAP.md",
    "runtime/core/AGENT_INVOCATION.md",
    "runtime/core/AGENT_LIFECYCLE.md",
    "runtime/core/AGENT_COMMUNICATION_PROTOCOL.md",
    "runtime/execution/EXECUTION_RULES.md",
    "runtime/execution/SKILL_LOADING.md",
    "runtime/execution/FAILURE_RECOVERY.md",
    "runtime/execution/CONTROLLED_BROWSER_RUNTIME.md",
    "runtime/execution/DAILY_OPERATIONS_RUNTIME.md",
    "runtime/execution/AGENT_HEALTH_SYSTEM.md",
    "runtime/memory/MEMORY_UPDATE_PROTOCOL.md",
    "runtime/reporting/REPORT_STANDARD.md",
    "runtime/approval/APPROVAL_LEVELS.md",
    "runtime/approval/APPROVAL_REQUEST_FORMAT.md",
    "runtime/tasks/TASK_SYSTEM.md",
    "runtime/tasks/HANDOFF_PROTOCOL.md",
    "runtime/prompts/MISSION_TEMPLATE.md",
    "runtime/prompts/TASK_TEMPLATE.md",
    "runtime/prompts/EXECUTION_PLAN_TEMPLATE.md",
    "runtime/prompts/APPROVAL_REQUEST_TEMPLATE.md",
    "runtime/prompts/AGENT_REPORT_TEMPLATE.md",
    "runtime/prompts/HANDOFF_TEMPLATE.md",
    "runtime/prompts/MEMORY_UPDATE_TEMPLATE.md",
    "runtime/prompts/DECISION_UPDATE_TEMPLATE.md",
    "runtime/prompts/EXECUTIVE_SUMMARY_TEMPLATE.md",
    "runtime/examples/SAMPLE_INVOCATION.md",
    "runtime/examples/SAMPLE_EXECUTION_PLAN.md",
    "runtime/examples/SAMPLE_APPROVAL_REQUEST.md",
    "runtime/examples/SAMPLE_REPORT.md",
    "runtime/examples/SAMPLE_HANDOFF.md",
    "integrations/AGENT_ACCESS_MATRIX.md",
    "integrations/LOGGING_SYSTEM.md",
    "integrations/LEAD_RESEARCH_INTEGRATION.md",
    "integrations/WEBSITE_AUDIT_ENGINE.md",
    "integrations/ANALYTICS_ENGINE.md",
    "workflows/HOMEPAGE_REBUILD_COLLABORATION_WORKFLOW.md",
    "workflows/BLOG_ARTICLE_COLLABORATION_WORKFLOW.md",
    "workflows/LEAD_GENERATION_COLLABORATION_WORKFLOW.md",
    "mission-templates/EXECUTIVE_MISSION_TEMPLATE.md",
    "mission-templates/BUILD_WEBSITE_MISSION_TEMPLATE.md",
    "mission-templates/SEO_AUDIT_MISSION_TEMPLATE.md",
    "mission-templates/HOMEPAGE_REBUILD_MISSION_TEMPLATE.md",
    "mission-templates/BLOG_CLUSTER_MISSION_TEMPLATE.md",
    "mission-templates/CASE_STUDY_MISSION_TEMPLATE.md",
    "mission-templates/PROPOSAL_MISSION_TEMPLATE.md",
    "mission-templates/WEBSITE_SPEED_AUDIT_MISSION_TEMPLATE.md",
    "mission-templates/ADSENSE_REVIEW_MISSION_TEMPLATE.md",
    "mission-templates/LEAD_RESEARCH_MISSION_TEMPLATE.md",
    "mission-templates/CLIENT_ONBOARDING_MISSION_TEMPLATE.md",
    "mission-templates/WEEKLY_ANALYTICS_REVIEW_MISSION_TEMPLATE.md",
    "mission-templates/NEWSLETTER_CAMPAIGN_MISSION_TEMPLATE.md",
    "company-kpis/AGENT_SCORECARD.md",
    "company-kpis/AGENT_SCORECARD_TEMPLATE.md",
    "packages/runtime/src/index.mjs",
    "packages/runtime/src/mission-runtime.mjs",
    "packages/runtime/src/state-store.mjs",
    "packages/runtime/src/mission-catalog.mjs",
    "packages/runtime/src/department-router.mjs",
    "packages/agents/src/executors.mjs",
    "packages/integrations/src/README.md",
    "packages/integrations/src/integration-catalog.mjs",
    "packages/integrations/src/playbook-catalog.mjs",
    "packages/memory/src/memory-updater.mjs",
    "packages/reporting/src/reporting.mjs",
    "packages/analytics/src/scorecards.mjs",
    "packages/ui/src/render-surfaces.mjs",
    "scripts/run-mission.mjs",
    "scripts/generate-dashboard.mjs",
    "tests/runtime.test.mjs",
    "tests/dashboard.test.mjs",
    "departments/content/README.md",
    "memory/company/README.md",
    "memory/departments/README.md",
    "memory/agents/README.md",
    "memory/missions/README.md",
    "memory/clients/README.md",
    "memory/marketing/README.md",
    "memory/seo/README.md",
    "memory/content/README.md",
    "memory/publishing/README.md",
    "memory/revenue/README.md",
    "integrations/core/README.md",
    "integrations/core/INTEGRATION_CONTRACT.md",
    "integrations/core/INTEGRATION_LIFECYCLE.md",
    "integrations/core/AUTHENTICATION_MODEL.md",
    "integrations/core/ERROR_HANDLING.md",
    "integrations/approval/README.md",
    "integrations/approval/INTEGRATION_APPROVAL_MODEL.md",
    "integrations/logging/README.md",
    "integrations/logging/LOG_SCHEMA.md",
    "integrations/runtime/README.md",
    "integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md",
    "integrations/examples/README.md",
    "integrations/examples/READ_ONLY_PORTAL_REVIEW.md",
    "integrations/examples/APPROVAL_PAUSE_EXAMPLE.md",
    "integrations/playbooks/README.md",
    "integrations/playbooks/EXECUTIVE_CONTROL_PLAYBOOK.md",
    "integrations/playbooks/MISSION_ROUTING_PLAYBOOK.md",
    "integrations/playbooks/DESIGN_REVIEW_PLAYBOOK.md",
    "integrations/playbooks/REPO_DELIVERY_PLAYBOOK.md",
    "integrations/playbooks/QUALITY_VALIDATION_PLAYBOOK.md",
    "integrations/playbooks/SEARCH_INTELLIGENCE_PLAYBOOK.md",
    "integrations/playbooks/SEARCH_CONSOLE_REVIEW_PLAYBOOK.md",
    "integrations/playbooks/GA4_REVIEW_PLAYBOOK.md",
    "integrations/playbooks/CONTROLLED_BROWSER_RESEARCH_PLAYBOOK.md",
    "integrations/playbooks/LEAD_RESEARCH_PLAYBOOK.md",
    "integrations/playbooks/CRM_OUTREACH_DRAFT_PLAYBOOK.md",
    "integrations/playbooks/REVENUE_SIGNAL_PLAYBOOK.md",
    "integrations/playbooks/EDITORIAL_OPERATIONS_PLAYBOOK.md",
    "integrations/playbooks/CLIENT_DELIVERY_PLAYBOOK.md",
  ];

  for (const file of requiredRootFiles) {
    await assertFile(file, failures);
  }

  for (const department of departments) {
    await assertFile(`departments/${department.id}/README.md`, failures);
  }

  for (const agent of agents) {
    await assertFile(`agents/${agent.department}/${agent.slug}.md`, failures);
    await assertContent(
      `agents/${agent.department}/${agent.slug}.md`,
      [
        "## Capabilities",
        "## Limitations",
        "## Runtime hooks",
        "## Validation rules",
        "## Memory rules",
        "## Report format",
        "## Failure recovery",
        "## Retry logic",
        "## Example missions",
        "## Execution contract",
        "Mission()",
        "Plan()",
        "Execute()",
        "Validate()",
        "Report()",
        "UpdateMemory()",
        "HandOff()",
        "RequestApproval()",
        "Recover()",
        "Archive()",
        "## Agent scorecard metrics",
        "## Self-improvement requirement",
        "runtime/core/AGENT_INVOCATION.md",
        "packages/runtime/src/mission-runtime.mjs",
        "## Allowed integrations",
        "## Integration playbooks",
      ],
      failures
    );
  }

  for (const workflow of workflows) {
    await assertFile(`workflows/${workflow.slug}.md`, failures);
    await assertContent(
      `workflows/${workflow.slug}.md`,
      [
        "## Runtime references",
        "runtime/core/AGENT_COMMUNICATION_PROTOCOL.md",
        "packages/runtime/src/mission-runtime.mjs",
      ],
      failures
    );
  }

  for (const integration of integrations) {
    await assertFile(`integrations/${integration}/README.md`, failures);
  }

  for (const skill of skills) {
    await assertFile(`skills/${skill}.md`, failures);
  }

  for (const template of templates) {
    await assertFile(`templates/${template}.md`, failures);
  }

  for (const tenant of tenants) {
    await assertFile(`companies/${tenant.slug}/README.md`, failures);
  }

  const registryChecks = [
    "registry/agents.json",
    "registry/departments.json",
    "registry/skills.json",
    "registry/workflows.json",
    "registry/integrations.json",
    "registry/templates.json",
    "registry/tenants.json",
    "registry/statuses.json",
    "registry/approval-classes.json",
  ];

  for (const file of registryChecks) {
    await assertFile(file, failures);
  }

  await assertContent("README.md", ["WGOS", "wgos:verify", "wgos:demo", "software-first"], failures);
  await assertContent("PHASE_STATUS.md", ["Phase 10", "Phase 9", "Post V1.0 Transition"], failures);
  await assertContent("APPROVAL_GATES.md", ["A0", "A4"], failures);
  await assertContent("docs/ARCHITECTURE.md", ["apps/", "packages/", "companies/"], failures);
  await assertContent("state/README.md", ["JSON", "JSONL", "memory/"], failures);
  await assertContent("production/README.md", ["Client request", "deployment preparation", "No autonomous deployment"], failures);
  await assertContent("production/workflows/CLIENT_WEBSITE_PIPELINE.md", ["Client discovery", "Engineering planning and implementation", "Post-launch baseline"], failures);
  await assertContent("production/workflows/CLIENT_DISCOVERY_WORKFLOW.md", ["Revenue goals", "Technical requirements", "Success metric sheet"], failures);
  await assertContent("production/workflows/WEBSITE_STRATEGY_WORKFLOW.md", ["Site strategy", "Revenue strategy", "Motion strategy"], failures);
  await assertContent("production/workflows/INFORMATION_ARCHITECTURE_WORKFLOW.md", ["Site map", "Internal linking framework", "User journeys"], failures);
  await assertContent("production/workflows/DESIGN_PIPELINE_WORKFLOW.md", ["Moodboard", "Typography system", "Major design direction changes require explicit human approval"], failures);
  await assertContent("production/workflows/MOTION_PIPELINE_WORKFLOW.md", ["GSAP timeline plan", "Reduced-motion alternative set", "Motion must support comprehension"], failures);
  await assertContent("production/workflows/ENGINEERING_PIPELINE_WORKFLOW.md", ["Next.js implementation plan", "Server-component versus client-component decisions", "Deployment remains approval-gated"], failures);
  await assertContent("production/workflows/CONTENT_PIPELINE_WORKFLOW.md", ["Page copy plan", "FAQ inventory", "Metadata and schema recommendations"], failures);
  await assertContent("production/workflows/SEO_PIPELINE_WORKFLOW.md", ["Canonical strategy", "AEO opportunities", "AdSense readiness"], failures);
  await assertContent("production/workflows/CLIENT_REVIEW_WORKFLOW.md", ["Progress reports", "Revision tracker", "No production change proceeds past the review gate"], failures);
  await assertContent("production/workflows/LAUNCH_PIPELINE_WORKFLOW.md", ["Build passes", "Client approved", "Human approval is required"], failures);
  await assertContent("production/workflows/POST_LAUNCH_PIPELINE_WORKFLOW.md", ["Launch report", "SEO baseline", "Maintenance recommendations"], failures);
  await assertContent("production/workflows/CASE_STUDY_PIPELINE_WORKFLOW.md", ["Before state", "Performance gains", "Only verified outcomes"], failures);
  await assertContent("production/templates/WEBSITE_BLUEPRINT_LIBRARY.md", ["Agency", "Medical", "Knowledge Base"], failures);
  await assertContent("production/checklists/LAUNCH_READINESS_CHECKLIST.md", ["Documentation updated", "Deployment checklist approved by a human"], failures);
  await assertContent("production/checklists/SEO_RELEASE_CHECKLIST.md", ["Canonicals confirmed", "AEO and GEO opportunities logged"], failures);
  await assertContent("production/client-delivery/CLIENT_REVIEW_AND_REVISION_SYSTEM.md", ["Review round", "Revision request", "out-of-scope requests"], failures);
  await assertContent("production/design/BLUEPRINT_MATRIX.md", ["Law Firm", "E-commerce / Blog / Knowledge Base", "Conversion emphasis"], failures);
  await assertContent("production/development/WEBSITE_HEALTH_SCORING.md", ["Design", "Maintainability", "1-10 score"], failures);
  await assertContent("production/qa/QA_VALIDATION_SEQUENCE.md", ["Build", "Typecheck", "Documentation confirmation"], failures);
  await assertContent("production/launch/POST_LAUNCH_BASELINE.md", ["Performance snapshot", "Search Console checklist state", "Immediate follow-up recommendations"], failures);
  await assertContent("memory/projects/PROJECT_MEMORY_TEMPLATE.md", ["Client", "Components", "Future improvements"], failures);
  await assertContent("growth/README.md", ["Growth pillars", "Lead generation", "Revenue analytics"], failures);
  await assertContent("growth/marketing/LEAD_GENERATION_ENGINE.md", ["50 qualified business leads", "Tier 1", "No automatic outreach"], failures);
  await assertContent("growth/marketing/WEBSITE_AUDIT_ENGINE.md", ["Trust Signals", "Estimated opportunity", "Priority"], failures);
  await assertContent("growth/seo/SEO_GROWTH_ENGINE.md", ["Metadata", "Search Console issues", "GEO"], failures);
  await assertContent("growth/content/CONTENT_MARKETING_ENGINE.md", ["Editorial calendar", "Topic gap analysis", "Featured snippets"], failures);
  await assertContent("growth/adsense/ADSENSE_READINESS_ENGINE.md", ["Policy compliance", "Approval score", "Policy risk report"], failures);
  await assertContent("growth/newsletter/NEWSLETTER_ENGINE.md", ["Lead magnets", "Welcome series", "No emails are sent without approval"], failures);
  await assertContent("growth/social/SOCIAL_CONTENT_ENGINE.md", ["LinkedIn", "TikTok", "posting calendar"], failures);
  await assertContent("growth/affiliate/AFFILIATE_ENGINE.md", ["Revenue estimates", "Placement strategy", "Compliance"], failures);
  await assertContent("growth/crm/CRM_PIPELINE.md", ["Lead", "Proposal", "Future opportunity"], failures);
  await assertContent("growth/analytics/ANALYTICS_ENGINE.md", ["Organic traffic", "CTR", "Revenue"], failures);
  await assertContent("growth/revenue/REVENUE_ENGINE.md", ["Website Development", "Affiliate Marketing", "Future SaaS"], failures);
  await assertContent("growth/revenue/DIGITAL_PRODUCT_ENGINE.md", ["Templates", "Prompt libraries", "Track pricing"], failures);
  await assertContent("growth/revenue/FREE_TOOLS_ENGINE.md", ["SEO opportunity", "Revenue potential"], failures);
  await assertContent("growth/revenue/REVENUE_OPPORTUNITY_MAP.md", ["Revenue potential", "Repeatability", "Required approvals"], failures);
  await assertContent("growth/dashboard/REVENUE_DASHBOARD.md", ["Monthly revenue", "Pipeline value", "Affiliate opportunities"], failures);
  await assertContent("growth/dashboard/COMPANY_KPI_DASHBOARD.md", ["Organic clicks", "Proposals", "Client retention"], failures);
  await assertContent("growth/dashboard/EXECUTIVE_REVIEW_CADENCE.md", ["Daily report", "Quarterly report", "Recommended priorities"], failures);
  await assertContent("growth/playbooks/SEO_GROWTH_PLAYBOOK.md", ["Metadata backlog", "AEO opportunities", "GEO opportunities"], failures);
  await assertContent("growth/playbooks/CONTENT_MARKETING_PLAYBOOK.md", ["Topical map", "Refresh schedule", "Snippet targets"], failures);
  await assertContent("growth/playbooks/ADSENSE_READINESS_PLAYBOOK.md", ["Trust-page coverage", "Policy-risk summary", "Recommendations"], failures);
  await assertContent("growth/playbooks/NEWSLETTER_PLAYBOOK.md", ["Lead-magnet plan", "Subscriber-growth opportunities"], failures);
  await assertContent("growth/playbooks/SOCIAL_REPURPOSING_PLAYBOOK.md", ["Academy articles", "posting calendar"], failures);
  await assertContent("growth/playbooks/AFFILIATE_OPPORTUNITY_PLAYBOOK.md", ["Product fit", "Revenue estimate", "Supporting content need"], failures);
  await assertContent("growth/playbooks/REVENUE_OPPORTUNITY_PLAYBOOK.md", ["Revenue potential", "Speed to payment", "required approvals"], failures);
  await assertContent("company-kpis/agent-performance.md", ["Agent", "Last Execution"], failures);
  await assertContent("company-kpis/department-performance.md", ["Department", "Revenue Contribution"], failures);
  await assertContent("company-kpis/company-health-score.md", ["Revenue readiness", "Overall company health"], failures);
  await assertContent("intelligence/history/mission-trend-summary.md", ["Total missions tracked", "Growth missions", "Average completion rate"], failures);
  await assertContent("intelligence/learning/latest-learning.md", ["What worked", "What is weak", "Next learning focus"], failures);
  await assertContent("intelligence/patterns/recurring-patterns.md", ["Template patterns", "Department patterns"], failures);
  await assertContent("intelligence/recommendations/prioritized-recommendations.md", ["1."], failures);
  await assertContent("intelligence/recommendations/automation-opportunities.md", ["1."], failures);
  await assertContent("intelligence/recommendations/decision-analysis.md", ["1."], failures);
  await assertContent("intelligence/benchmarks/operating-benchmarks.md", ["Average tasks per mission", "Top agent task count"], failures);
  await assertContent("intelligence/forecasting/next-quarter-forecast.md", ["Forecasted mission mix", "Execution pressure", "Planning note"], failures);
  await assertContent("intelligence/scoring/mission-intelligence-scorecard.md", ["Learning coverage", "Recommendation confidence", "Pattern stability"], failures);
  await assertContent("intelligence/optimization/workflow-improvements.md", ["1."], failures);
  await assertContent("memory/library/README.md", ["Best practices", "Architecture decisions"], failures);
  await assertContent("memory/library/BEST_PRACTICES.md", ["- "], failures);
  await assertContent("memory/library/COMMON_MISTAKES.md", ["- "], failures);
  await assertContent("memory/library/INDUSTRY_INSIGHTS.md", ["- "], failures);
  await assertContent("memory/library/ARCHITECTURE_DECISIONS.md", ["- "], failures);
  await assertContent("platform/tenant-management/TENANT_ISOLATION_RULES.md", ["Company-specific reports", "Shared intelligence", "CRM"], failures);
  await assertContent("platform/tenant-management/PERMISSION_MODEL.md", ["least privilege", "tenant-scoped", "Global reporting"], failures);
  await assertContent("platform/resource-management/RESOURCE_SHARING_MATRIX.md", ["Shareable", "Restricted", "Conditional"], failures);
  await assertContent("platform/resource-management/WORKLOAD_MANAGEMENT.md", ["agent workload", "mission queues", "approval queues"], failures);
  await assertContent("platform/global-memory/KNOWLEDGE_SHARING_POLICY.md", ["de-identified", "tenant-specific", "reusable playbooks"], failures);
  await assertContent("platform/global-reporting/PORTFOLIO_DASHBOARD.md", ["company count", "cross-company benchmarks"], failures);
  await assertContent("platform/global-reporting/GLOBAL_EXECUTIVE_REPORTING.md", ["weekly", "quarterly", "Department utilization"], failures);
  await assertContent("platform/company-registry/company-status-board.md", ["Company", "Portfolio Health"], failures);
  await assertContent("platform/GOVERNANCE.md", ["approval routing", "Rule Zero", "Cross-company playbooks"], failures);
  await assertContent("platform/VERSIONING.md", ["WGOS version", "Company version", "Integration version"], failures);
  await assertContent("platform/MARKETPLACE_FOUNDATION.md", ["agent packs", "workflow packs", "version compatibility"], failures);
  await assertContent("platform/BACKUP_AND_RECOVERY.md", ["backup scope", "restore", "Preserve company isolation"], failures);
  await assertContent("platform/SECURITY_MODEL.md", ["secret handling", "Audit logs", "approval-gated"], failures);
  await assertContent("companies/web-growth/OPERATING_SCORECARD.md", ["Portfolio health", "Production missions"], failures);
  await assertContent("companies/client-template/OPERATING_SCORECARD.md", ["Portfolio health", "Production missions"], failures);
  await assertContent("companies/web-growth/TENANT_BOUNDARY.md", ["Company-specific mission notes", "de-identified", "tenant-scoped"], failures);
  await assertContent("companies/web-growth/memory/README.md", ["isolated company memory"], failures);
  await assertContent("companies/web-growth/projects/README.md", ["active and archived projects"], failures);
  await assertContent("companies/web-growth/crm/README.md", ["tenant-scoped lead"], failures);
  await assertContent("companies/shared/SHARED_SERVICES.md", ["runtime", "QA", "security guardrails"], failures);
  await assertContent("clients/active/CLIENT_OPERATING_TEMPLATE.md", ["Client ID", "Approval state", "Next action"], failures);
  await assertContent("clients/CLIENT_LIFECYCLE.md", ["Prospect", "Launch", "Case Study"], failures);
  await assertContent("clients/CLIENT_PORTAL_FRAMEWORK.md", ["Project status", "Approval actions", "tenant-isolated"], failures);
  await assertContent("packages/agents/README.md", ["Implemented specialist modules", "Lead Research Agent", "approval checkpoint"], failures);
  await assertContent("packages/approval/README.md", ["Persistent approval queue", "approve, reject", "revision-request"], failures);
  await assertContent("packages/approval/src/approval-queue.mjs", ["collectApprovalItems", "updateApprovalDecision", "REVISION_REQUESTED"], failures);
  await assertContent("packages/audits/README.md", ["website audit engine", "fetch a URL", "markdown audit report"], failures);
  await assertContent("packages/crm/README.md", ["lead CSV", "CRM state", "without contacting"], failures);
  await assertContent("packages/outreach/README.md", ["Draft-only", "handoff records", "never sends email"], failures);
  await assertContent("packages/agents/src/specialists.mjs", ["FRONTEND_ENGINEER_AGENT", "SEO_AGENT", "LEAD_RESEARCH_AGENT"], failures);
  await assertContent("packages/agents/src/specialists.mjs", ["targetCount: 50", "No automatic email sending", "WEBSITE_AUDIT_AGENT"], failures);
  await assertContent("packages/agents/src/artifact-writer.mjs", ["writeSpecialistExecutionArtifacts", "lead-research.csv", "website-audit-report.md"], failures);
  await assertContent("packages/audits/src/website-audit.mjs", ["auditWebsiteUrl", "auditWebsiteHtml", "renderWebsiteAuditMarkdown"], failures);
  await assertContent("packages/crm/src/lead-store.mjs", ["leadColumns", "createLeadCsv", "createCrmState"], failures);
  await assertContent("packages/outreach/src/draft-generator.mjs", ["createOutreachDraft", "createDraftHandoff", "No automatic sending"], failures);
  await assertContent("packages/integrations/src/controlled-session.mjs", ["WAITING_APPROVAL_BEFORE_LIVE_ACTION", "stopConditions", "send_email"], failures);
  await assertContent("packages/integrations/src/capability-registry.mjs", ["getCapabilityState", "WGOS_BROWSER_CONTROL", "WAITING_CAPABILITY"], failures);
  await assertContent("packages/integrations/src/read-only-adapters.mjs", ["createControlledBrowserAdapter", "createSearchConsoleAdapter", "createLighthouseAdapter"], failures);
  await assertContent("packages/integrations/src/lighthouse-runner.mjs", ["runLocalLighthouseAudit", "chrome-launcher", "renderLighthouseMarkdown"], failures);
  await assertContent("packages/integrations/src/integration-logger.mjs", ["logIntegrationEvent", "jsonl", "evidencePointer"], failures);
  await assertContent("scripts/inspect-url.mjs", ["wgos:inspect-url", "createReadOnlyIntegrationAdapters", "inspection.md"], failures);
  await assertContent("integrations/CAPABILITY_REPORT.md", ["Integration Capability Report", "UNAVAILABLE means", "human pause"], failures);
  await assertContent("state/integrations/capabilities.json", ["browser", "search-console", "ga4"], failures);
  await assertContent("packages/integrations/src/README.md", ["Controlled sessions", "read-only-adapters.mjs", "truthful capability checks"], failures);
  await assertContent("state/approvals/queue.json", ["send_email", "PENDING", "Await human approval"], failures);
  await assertContent("reports/approvals/latest-approval-queue.md", ["Approval Queue", "Await human approval"], failures);
  await assertContent("scripts/approvals.mjs", ["updateApprovalDecision", "REVISION_REQUESTED", "renderSurfaces"], failures);
  await assertContent("release/v1/RELEASE_NOTES.md", ["WGOS v1.0.0", "Breaking changes", "Known limitations"], failures);
  await assertContent("release/v1/ARCHITECTURE_SUMMARY.md", ["Core layers", "Runtime", "Release contract"], failures);
  await assertContent("release/v1/PRODUCTION_READINESS_SCORE.md", ["9.0 / 10", "Remaining gap", "session-specific capability checks"], failures);
  await assertContent("release/v1/KNOWN_LIMITATIONS.md", ["external actions", "Browser profile cleanup", "Client portal"], failures);
  await assertContent("release/reports/RUNTIME_VALIDATION_REPORT.md", ["Mission engine", "Tenant portfolio reporting", "wgos:release"], failures);
  await assertContent("release/reports/DOCUMENTATION_COVERAGE_REPORT.md", ["Agents:", "Workflows:", "production-ready"], failures);
  await assertContent("release/reports/MEMORY_COVERAGE_REPORT.md", ["Mission memory", "Knowledge library", "Release requirement"], failures);
  await assertContent("release/reports/V1_RELEASE_VALIDATION_REPORT.md", ["Passed", "Missions simulated", "Runtime tasks generated"], failures);
  await assertContent("release/security/SECURITY_REVIEW_SUMMARY.md", ["Approval enforcement", "Company isolation", "explicit human approval"], failures);
  await assertContent("release/checklists/V1_RELEASE_CHECKLIST.md", ["Release notes created", "Stress-test simulations run", "Verification passed"], failures);
  await assertContent("release/tests/MISSION_STRESS_TEST_PLAN.md", ["BUILD_PREMIUM_WEBSITE", "Correct departments selected", "Dashboard and operator surfaces updated"], failures);
  await assertContent("release/tests/MISSION_STRESS_TEST_REPORT.md", ["Passed", "Persistent state written", "CLIENT_WEBSITE_DELIVERY"], failures);
  await assertContent("release/validation/AGENT_CERTIFICATION.md", ["Certified", "production-ready", "Runtime"], failures);
  await assertContent("release/validation/DEPARTMENT_CERTIFICATION.md", ["Certified", "Executive", "Engineering"], failures);
  await assertContent("release/validation/WORKFLOW_CERTIFICATION.md", ["Certified", "Workflow Orchestration", "Approval"], failures);
  await assertContent("release/documentation/COMPANY_OPERATING_MANUAL.md", ["How WGOS works", "Add companies", "Perform upgrades"], failures);
  await assertContent("release/playbooks/CEO_PLAYBOOK.md", ["Start a mission", "Approve work", "Quarterly review"], failures);
  await assertContent("release/playbooks/DEVELOPER_PLAYBOOK.md", ["Architecture", "Testing", "Contribution guidelines"], failures);
  await assertContent("release/examples/MISSION_EXAMPLES.md", ["Find 50 Qualified Leads", "Prepare 50 Personalized Outreach Drafts", "Launch Website"], failures);
  await assertContent("release/migration/V2_ROADMAP.md", ["Voice", "marketplace", "Rule Zero"], failures);
  await assertContent("departments/content/README.md", ["publishing", "Do not recreate legacy `agents/content/` copies"], failures);
  await assertContent("packages/integrations/src/README.md", ["Executable integration metadata", "integration catalog"], failures);
  await assertContent("packages/integrations/src/playbook-catalog.mjs", ["integrationPlaybookCatalog", "getIntegrationPlaybook"], failures);
  await assertContent("packages/runtime/src/department-router.mjs", ["buildMissionExecutionPlan", "buildDepartmentSummaries"], failures);
  await assertContent("runtime/core/AGENT_INVOCATION.md", ["Mission ID", "Task ID", "Target Agent"], failures);
  await assertContent("runtime/core/AGENT_LIFECYCLE.md", ["Receive Task", "Update Memory", "Hand Off"], failures);
  await assertContent("runtime/core/AGENT_COMMUNICATION_PROTOCOL.md", ["TASK", "HANDOFF", "COMPLETE"], failures);
  await assertContent("runtime/execution/SKILL_LOADING.md", ["Frontend", "SEO", "Marketing"], failures);
  await assertContent("runtime/execution/CONTROLLED_BROWSER_RUNTIME.md", ["Open Session", "Wait For Human Login", "Never bypass login"], failures);
  await assertContent("runtime/execution/DAILY_OPERATIONS_RUNTIME.md", ["Morning start", "Evening close"], failures);
  await assertContent("runtime/execution/AGENT_HEALTH_SYSTEM.md", ["last execution", "QA pass rate"], failures);
  await assertContent("runtime/approval/APPROVAL_LEVELS.md", ["LOW", "NORMAL", "HIGH", "CRITICAL"], failures);
  await assertContent("runtime/tasks/TASK_SYSTEM.md", ["BACKLOG", "WAITING_APPROVAL", "ARCHIVED"], failures);
  await assertContent("runtime/tasks/HANDOFF_PROTOCOL.md", ["Current Status", "Next Required Agent", "Validation Needed"], failures);
  await assertContent("runtime/memory/MEMORY_UPDATE_PROTOCOL.md", ["CODEX_MEMORY", "PROJECT_HANDOFF", "Automatically determine"], failures);
  await assertContent("runtime/reporting/REPORT_STANDARD.md", ["Mission", "Files Created", "Next Step"], failures);
  await assertContent("integrations/browser/README.md", ["Pause for login", "Pause for 2FA", "Never bypass authentication"], failures);
  await assertContent("integrations/search/README.md", ["query construction", "duplicate detection", "lead quality scoring"], failures);
  await assertContent("integrations/search-console/README.md", ["Coverage", "URL Inspection", "index requests"], failures);
  await assertContent("integrations/ga4/README.md", ["Traffic", "Conversions", "Growth Trends"], failures);
  await assertContent("integrations/gmail/README.md", ["Draft emails", "Never:", "be linked to CRM"], failures);
  await assertContent("integrations/github/README.md", ["Branch inspection", "Pull request review", "Never push without approval"], failures);
  await assertContent("integrations/lighthouse/README.md", ["Accessibility audits", "SEO audits", "Screenshot capture"], failures);
  await assertContent("integrations/filesystem/README.md", ["Read", "Write", "Never delete important files without approval"], failures);
  await assertContent("integrations/crm/README.md", ["Lead", "Proposal", "Won"], failures);
  await assertContent("integrations/ANALYTICS_ENGINE.md", ["Traffic", "Outreach", "Agent Performance"], failures);
  await assertContent("integrations/AGENT_ACCESS_MATRIX.md", ["Search", "Marketing", "Engineering"], failures);
  await assertContent("integrations/LOGGING_SYSTEM.md", ["time", "agent", "duration"], failures);
  await assertContent("integrations/core/INTEGRATION_CONTRACT.md", ["allowed read operations", "approval class mapping", "failure escalation path"], failures);
  await assertContent("integrations/core/INTEGRATION_LIFECYCLE.md", ["Load capability definition", "Confirm authentication state", "Update memory"], failures);
  await assertContent("integrations/core/AUTHENTICATION_MODEL.md", ["WAITING_LOGIN", "WAITING_APPROVAL", "protected surface"], failures);
  await assertContent("integrations/approval/INTEGRATION_APPROVAL_MODEL.md", ["LOW", "HIGH", "CRITICAL"], failures);
  await assertContent("integrations/logging/LOG_SCHEMA.md", ["mission_id", "capability_state", "evidence_pointer"], failures);
  await assertContent("integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md", ["Check session capability", "Capture evidence", "Update report and memory outputs"], failures);
  await assertContent("packages/integrations/src/integration-catalog.mjs", ["integrationCatalog", "getIntegrationDefinition"], failures);
  await assertContent("integrations/playbooks/SEARCH_INTELLIGENCE_PLAYBOOK.md", ["SEO", "search-console", "Update memory, reports, and handoff artifacts"], failures);
  await assertContent("integrations/playbooks/LEAD_RESEARCH_PLAYBOOK.md", ["Lead Research", "crm", "Persist lead state to CSV and CRM-ready records"], failures);
  await assertContent("integrations/playbooks/CRM_OUTREACH_DRAFT_PLAYBOOK.md", ["Outreach Drafting", "gmail", "without sending anything"], failures);
  await assertContent("integrations/playbooks/CLIENT_DELIVERY_PLAYBOOK.md", ["Client Success", "crm", "onboarding artifacts"], failures);
  await assertContent("agents/search/SEO_AGENT.md", ["search-console", "ga4", "SEARCH_INTELLIGENCE_PLAYBOOK"], failures);
  await assertContent("agents/marketing/LEAD_RESEARCH_AGENT.md", ["browser", "business-directories", "LEAD_RESEARCH_PLAYBOOK"], failures);
  await assertContent("agents/engineering/FRONTEND_ENGINEER_AGENT.md", ["github", "vercel", "REPO_DELIVERY_PLAYBOOK"], failures);
  await assertContent("agents/client/CLIENT_SUCCESS_AGENT.md", ["crm", "gmail", "CLIENT_DELIVERY_PLAYBOOK"], failures);
  await assertContent("runtime/core/AGENT_LIFECYCLE.md", ["Receive Task", "Complete"], failures);
  await assertContent("growth/playbooks/LEAD_GENERATION_PLAYBOOK.md", ["No automatic outreach"], failures);
  await assertContent("platform/company-registry/COMPANY_REGISTRY_TEMPLATE.md", ["Company ID", "Assigned Agents"], failures);
  await assertContent("workflows/HOMEPAGE_REBUILD_COLLABORATION_WORKFLOW.md", ["Product Strategist", "QA Engineer", "Knowledge Manager"], failures);
  await assertContent("workflows/HOMEPAGE_REBUILD_COLLABORATION_WORKFLOW.md", ["## Runtime references", "packages/runtime/src/mission-runtime.mjs"], failures);
  await assertContent("workflows/BLOG_ARTICLE_COLLABORATION_WORKFLOW.md", ["SEO Agent", "Copywriter", "Schema Agent", "## Runtime references"], failures);
  await assertContent("workflows/LEAD_GENERATION_COLLABORATION_WORKFLOW.md", ["Lead Research Agent", "Outreach Drafting Agent", "no unauthorized contact action", "## Runtime references"], failures);
  await assertContent("mission-templates/BUILD_WEBSITE_MISSION_TEMPLATE.md", ["Mission objective", "Required agents", "Approval gates"], failures);
  await assertContent("mission-templates/SEO_AUDIT_MISSION_TEMPLATE.md", ["Search Console", "Approval gates", "Documentation"], failures);
  await assertContent("mission-templates/LEAD_RESEARCH_MISSION_TEMPLATE.md", ["exactly 50 qualified leads", "Required agents", "Documentation"], failures);
  await assertContent("mission-templates/WEEKLY_ANALYTICS_REVIEW_MISSION_TEMPLATE.md", ["weekly executive analytics review", "Required departments", "Required integrations"], failures);
  await assertContent("mission-templates/NEWSLETTER_CAMPAIGN_MISSION_TEMPLATE.md", ["newsletter campaign", "Required agents", "Approval gates"], failures);
  await assertContent("mission-templates/CLIENT_WEBSITE_DELIVERY_MISSION_TEMPLATE.md", ["production-ready website package", "Required departments", "Approval gates"], failures);
  await assertContent("mission-templates/SEO_GROWTH_SPRINT_MISSION_TEMPLATE.md", ["organic visibility", "Required departments", "Approval gates"], failures);
  await assertContent("mission-templates/CONTENT_MARKETING_SPRINT_MISSION_TEMPLATE.md", ["content growth plan", "Required agents", "Documentation"], failures);
  await assertContent("mission-templates/REVENUE_OPPORTUNITY_REVIEW_MISSION_TEMPLATE.md", ["revenue opportunities", "Required integrations", "Approval gates"], failures);
  await assertContent("company-kpis/AGENT_SCORECARD.md", ["Tasks Completed", "QA Pass Rate", "Business Impact"], failures);
  await assertContent("company-kpis/AGENT_SCORECARD_TEMPLATE.md", ["Agent", "Period", "Improvement Recommendation"], failures);
  await assertContent("agents/search/SEO_AGENT.md", ["search-console", "ga4", "SEARCH_INTELLIGENCE_PLAYBOOK"], failures);
  await assertContent("agents/marketing/LEAD_RESEARCH_AGENT.md", ["browser", "business-directories", "LEAD_RESEARCH_PLAYBOOK"], failures);
  await assertContent("agents/engineering/FRONTEND_ENGINEER_AGENT.md", ["github", "vercel", "REPO_DELIVERY_PLAYBOOK"], failures);
  await assertContent("agents/client/CLIENT_SUCCESS_AGENT.md", ["crm", "gmail", "CLIENT_DELIVERY_PLAYBOOK"], failures);

  if (await exists("agents/content")) {
    failures.push("Legacy folder should not exist: agents/content");
  }

  const agentsRegistry = JSON.parse(await read("registry/agents.json"));
  if (agentsRegistry.length !== agents.length) {
    failures.push(`Agent registry length mismatch: expected ${agents.length}, got ${agentsRegistry.length}`);
  }

  const departmentsRegistry = JSON.parse(await read("registry/departments.json"));
  if (departmentsRegistry.length !== departments.length) {
    failures.push(`Department registry length mismatch: expected ${departments.length}, got ${departmentsRegistry.length}`);
  }

  const invalidDepartments = agentsRegistry.filter(
    (agent) => !departmentsRegistry.some((department) => department.id === agent.department)
  );
  if (invalidDepartments.length > 0) {
    failures.push(`Agents mapped to missing departments: ${invalidDepartments.map((agent) => agent.slug).join(", ")}`);
  }

  if (failures.length > 0) {
    console.error("WGOS verification failed.");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("WGOS verification passed.");
  console.log(`Agents: ${agents.length}`);
  console.log(`Departments: ${departments.length}`);
  console.log(`Skills: ${skills.length}`);
  console.log(`Workflows: ${workflows.length}`);
  console.log(`Integrations: ${integrations.length}`);
  console.log(`Templates: ${templates.length}`);
  console.log(`Tenants: ${tenants.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
