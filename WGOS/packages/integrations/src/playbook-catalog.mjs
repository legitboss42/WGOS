export const integrationPlaybookCatalog = [
  {
    id: "EXECUTIVE_CONTROL_PLAYBOOK",
    integrations: ["filesystem", "docs", "csv", "github"],
    primaryAgents: ["CEO_OPERATOR_AGENT", "WORKFLOW_ORCHESTRATOR_AGENT", "PROJECT_MANAGER_AGENT"],
  },
  {
    id: "MISSION_ROUTING_PLAYBOOK",
    integrations: ["docs", "filesystem", "csv"],
    primaryAgents: ["WORKFLOW_ORCHESTRATOR_AGENT", "PROJECT_MANAGER_AGENT"],
  },
  {
    id: "DESIGN_REVIEW_PLAYBOOK",
    integrations: ["figma", "images", "docs", "filesystem"],
    primaryAgents: ["PRODUCT_STRATEGIST_AGENT", "UI_UX_DESIGN_AGENT", "BRAND_DESIGN_AGENT", "MOTION_GRAPHICS_AGENT"],
  },
  {
    id: "REPO_DELIVERY_PLAYBOOK",
    integrations: ["filesystem", "github", "vercel", "docs"],
    primaryAgents: ["FRONTEND_ENGINEER_AGENT", "BACKEND_ENGINEER_AGENT", "FULL_STACK_ENGINEER_AGENT", "DEPLOYMENT_ENGINEER_AGENT"],
  },
  {
    id: "QUALITY_VALIDATION_PLAYBOOK",
    integrations: ["filesystem", "lighthouse", "pagespeed", "images", "docs"],
    primaryAgents: ["QA_ENGINEER_AGENT", "ACCESSIBILITY_ENGINEER_AGENT", "PERFORMANCE_ENGINEER_AGENT", "WEBSITE_AUDIT_AGENT"],
  },
  {
    id: "SEARCH_INTELLIGENCE_PLAYBOOK",
    integrations: ["search", "search-console", "ga4", "lighthouse", "pagespeed", "docs"],
    primaryAgents: ["SEO_AGENT", "TECHNICAL_SEO_AGENT", "AEO_AGENT", "GEO_AGENT", "SCHEMA_AGENT"],
  },
  {
    id: "SEARCH_CONSOLE_REVIEW_PLAYBOOK",
    integrations: ["search-console", "ga4", "docs", "filesystem"],
    primaryAgents: ["SEARCH_CONSOLE_AGENT", "SEO_AGENT", "TECHNICAL_SEO_AGENT"],
  },
  {
    id: "GA4_REVIEW_PLAYBOOK",
    integrations: ["ga4", "search-console", "crm", "csv", "docs"],
    primaryAgents: ["ANALYTICS_AGENT", "SEO_AGENT", "SEARCH_CONSOLE_AGENT", "CRO_AGENT", "REVENUE_OPERATIONS_AGENT"],
  },
  {
    id: "CONTROLLED_BROWSER_RESEARCH_PLAYBOOK",
    integrations: ["browser", "search", "maps", "business-directories", "docs"],
    primaryAgents: ["LEAD_RESEARCH_AGENT", "WEBSITE_AUDIT_AGENT", "BUSINESS_INTELLIGENCE_AGENT"],
  },
  {
    id: "LEAD_RESEARCH_PLAYBOOK",
    integrations: ["browser", "search", "maps", "business-directories", "crm", "csv"],
    primaryAgents: ["LEAD_RESEARCH_AGENT", "BUSINESS_INTELLIGENCE_AGENT", "MARKETING_STRATEGIST_AGENT"],
  },
  {
    id: "CRM_OUTREACH_DRAFT_PLAYBOOK",
    integrations: ["crm", "gmail", "csv", "docs"],
    primaryAgents: ["CRM_AGENT", "OUTREACH_DRAFTING_AGENT", "FOLLOW_UP_AGENT", "NEWSLETTER_AGENT"],
  },
  {
    id: "REVENUE_SIGNAL_PLAYBOOK",
    integrations: ["ga4", "search-console", "crm", "lighthouse", "pagespeed"],
    primaryAgents: ["ANALYTICS_AGENT", "CRO_AGENT", "ADSENSE_AGENT", "REVENUE_OPERATIONS_AGENT"],
  },
  {
    id: "EDITORIAL_OPERATIONS_PLAYBOOK",
    integrations: ["docs", "filesystem", "search", "csv", "images"],
    primaryAgents: ["EDITORIAL_MANAGER_AGENT", "CONTENT_STRATEGIST_AGENT", "COPYWRITER_AGENT", "PROOFREADER_AGENT", "INTERNAL_LINKING_AGENT"],
  },
  {
    id: "CLIENT_DELIVERY_PLAYBOOK",
    integrations: ["crm", "gmail", "docs", "filesystem", "csv"],
    primaryAgents: ["SALES_CONSULTANT_AGENT", "PROPOSAL_WRITER_AGENT", "CLIENT_SUCCESS_AGENT", "CLIENT_ONBOARDING_AGENT"],
  },
];

export function getIntegrationPlaybook(playbookId) {
  const match = integrationPlaybookCatalog.find((item) => item.id === playbookId);
  if (!match) {
    throw new Error(`Unknown integration playbook: ${playbookId}`);
  }
  return match;
}
