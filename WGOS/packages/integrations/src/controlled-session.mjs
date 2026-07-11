const externalActionApprovals = new Set(["send_email", "submit_form", "publish", "deploy", "dns_change", "purchase", "request_indexing"]);

export function buildControlledSessionPlan({
  integrationId,
  purpose,
  approvalClass,
  requestedActions = [],
  authenticated = false,
  capabilityAvailable = false,
}) {
  const externalActions = requestedActions.filter((action) => externalActionApprovals.has(action));
  const requiresCapability = ["browser", "search-console", "ga4", "gmail", "cloudflare", "namecheap", "vercel"].includes(integrationId);
  const requiresHumanApproval = approvalClass !== "A0" && (externalActions.length > 0 || requiresCapability);

  return {
    integrationId,
    purpose,
    capabilityAvailable,
    authenticated,
    requestedActions,
    externalActions,
    approvalCheckpoint: requiresHumanApproval
      ? {
          status: "WAITING_APPROVAL_BEFORE_LIVE_ACTION",
          reason: `${integrationId} requires confirmed capability, authentication state, and human approval before live execution.`,
          stopConditions: ["login", "2FA", "CAPTCHA", "billing", "verification", "property selection", "state-changing action"],
        }
      : {
          status: "LOCAL_ONLY",
          reason: "No live integration or external action is required for this local execution step.",
          stopConditions: [],
        },
    allowedNow: !requiresCapability && externalActions.length === 0,
  };
}

export function buildApprovalChecklist({ action, target, evidence = [] }) {
  return {
    action,
    target,
    evidence,
    requiredBefore: ["external contact", "account modification", "publishing", "deployment", "billing", "DNS", "indexing request"],
    approvalRecord: {
      approver: "Human owner",
      status: "PENDING",
      notesRequired: true,
    },
  };
}
