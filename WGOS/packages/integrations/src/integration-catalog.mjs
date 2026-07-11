export const integrationCatalog = [
  {
    id: "browser",
    title: "Controlled Browser",
    approvalLevel: "HIGH",
    runtimeDocs: [
      "integrations/core/INTEGRATION_CONTRACT.md",
      "integrations/runtime/CONTROLLED_OPERATIONS_RUNTIME.md",
    ],
  },
  {
    id: "search-console",
    title: "Search Console",
    approvalLevel: "HIGH",
    runtimeDocs: [
      "integrations/core/AUTHENTICATION_MODEL.md",
      "integrations/approval/INTEGRATION_APPROVAL_MODEL.md",
    ],
  },
  {
    id: "ga4",
    title: "GA4",
    approvalLevel: "HIGH",
    runtimeDocs: [
      "integrations/core/AUTHENTICATION_MODEL.md",
      "integrations/logging/LOG_SCHEMA.md",
    ],
  },
  {
    id: "github",
    title: "GitHub",
    approvalLevel: "HIGH",
    runtimeDocs: [
      "integrations/core/INTEGRATION_LIFECYCLE.md",
      "integrations/logging/LOG_SCHEMA.md",
    ],
  },
  {
    id: "filesystem",
    title: "Filesystem",
    approvalLevel: "NORMAL",
    runtimeDocs: [
      "integrations/core/INTEGRATION_CONTRACT.md",
      "integrations/logging/LOG_SCHEMA.md",
    ],
  },
];

export function getIntegrationDefinition(integrationId) {
  const match = integrationCatalog.find((item) => item.id === integrationId);
  if (!match) {
    throw new Error(`Unknown integration: ${integrationId}`);
  }
  return match;
}
