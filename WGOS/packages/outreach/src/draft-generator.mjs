export function createOutreachDraft({ lead, senderName = "Web Growth" }) {
  return {
    leadId: lead.lead_id,
    businessName: lead.business_name,
    subject: `Website growth idea for ${lead.business_name}`,
    body: [
      `Hi ${lead.business_name} team,`,
      "",
      `I noticed ${lead.short_personalization_note || "a public detail about your online presence"} and thought there may be a practical opportunity to improve ${lead.suggested_outreach_angle || "the website experience and lead path"}.`,
      "",
      `Web Growth helps businesses improve website structure, SEO, speed, and conversion paths without disrupting what is already working.`,
      "",
      "Would it be useful if I prepared a short, specific website improvement note for you to review?",
      "",
      `Best,`,
      senderName,
    ].join("\n"),
    status: "Draft Only - Human Approval Required",
  };
}

export function createDraftHandoff({ missionId, leads = [] }) {
  const drafts = leads.map((lead) => createOutreachDraft({ lead }));

  return {
    missionId,
    drafts,
    status: drafts.length ? "READY_FOR_HUMAN_REVIEW" : "WAITING_FOR_QUALIFIED_LEADS",
    policy: "No automatic sending. Human owner must approve every draft before email creation or sending.",
  };
}

export function renderDraftHandoffMarkdown(handoff) {
  return `# Outreach Draft Handoff

- Mission: ${handoff.missionId}
- Status: ${handoff.status}
- Drafts: ${handoff.drafts.length}
- Policy: ${handoff.policy}

## Drafts

${handoff.drafts.length ? handoff.drafts.map(renderDraft).join("\n\n") : "- No real drafts generated because no qualified live leads have been collected yet."}
`;
}

function renderDraft(draft) {
  return `### ${draft.businessName}

- Lead ID: ${draft.leadId}
- Subject: ${draft.subject}
- Status: ${draft.status}

\`\`\`text
${draft.body}
\`\`\``;
}
