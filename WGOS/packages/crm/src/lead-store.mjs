export const leadColumns = [
  "lead_id",
  "date_found",
  "business_name",
  "industry",
  "location",
  "tier",
  "website_url",
  "source_url",
  "public_email",
  "public_phone_or_whatsapp",
  "contact_page_url",
  "social_profile_url",
  "website_quality_score",
  "business_value_score",
  "conversion_opportunity_score",
  "fit_score",
  "total_score",
  "priority_label",
  "top_3_website_issues",
  "recommended_web_growth_service",
  "short_personalization_note",
  "suggested_outreach_angle",
  "status",
];

export function createLeadCsv(leads = []) {
  return [
    leadColumns.join(","),
    ...leads.map((lead) => leadColumns.map((column) => csvCell(lead[column] ?? "")).join(",")),
  ].join("\n");
}

export function createCrmState({ missionId, leads = [], status = "READY_FOR_RESEARCH" }) {
  return {
    missionId,
    status,
    leadCount: leads.length,
    qualifiedLeadCount: leads.filter((lead) => Number(lead.total_score ?? 0) >= 60).length,
    draftCount: leads.filter((lead) => lead.status === "Draft Created").length,
    approvalCount: leads.filter((lead) => lead.status === "Approval Queue").length,
    nextAction: leads.length
      ? "Review qualified leads and approve draft preparation."
      : "Run controlled browser research before real leads are added.",
    schema: leadColumns,
  };
}

export function renderCrmStateMarkdown(state) {
  return `# CRM State

- Mission: ${state.missionId}
- Status: ${state.status}
- Leads: ${state.leadCount}
- Qualified Leads: ${state.qualifiedLeadCount}
- Drafts: ${state.draftCount}
- Pending Approvals: ${state.approvalCount}
- Next Action: ${state.nextAction}

## Schema

${state.schema.map((column) => `- ${column}`).join("\n")}
`;
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
