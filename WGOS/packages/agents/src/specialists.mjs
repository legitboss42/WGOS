import { buildApprovalChecklist, buildControlledSessionPlan } from "../../integrations/src/controlled-session.mjs";

const specialistModules = {
  FRONTEND_ENGINEER_AGENT: {
    kind: "frontend",
    plan({ agent, task }) {
      return {
        module: "frontend",
        executionSteps: [
          "Inspect route and component ownership before editing.",
          "Identify server/client component boundaries.",
          "Define responsive, accessible implementation notes.",
          "List validation commands before handoff.",
        ],
        expectedArtifacts: ["component plan", "route impact note", "validation command list"],
        codeSafety: ["no route rename without approval", "no production deploy", "preserve SEO metadata"],
        owner: agent.slug,
        objective: task.objective,
      };
    },
    execute({ context, task }) {
      return {
        implementationPlan: {
          targetSurface: inferSurface(task.objective),
          componentStrategy: ["reuse existing shared components", "avoid unnecessary client components", "document route impact"],
          validationCommands: ["npm.cmd run lint", "npx.cmd tsc --noEmit", "npm.cmd run build"],
        },
        approvalCheckpoints: [
          buildApprovalChecklist({
            action: "deploy",
            target: context.mission.companyId,
            evidence: ["build output", "QA report", "deployment checklist"],
          }),
        ],
      };
    },
    validate() {
      return ["implementation has defined validation", "deployment remains approval-gated", "accessibility and performance checks are named"];
    },
  },
  SEO_AGENT: {
    kind: "seo",
    plan({ task }) {
      return {
        module: "seo",
        executionSteps: [
          "Classify search intent and affected pages.",
          "Review metadata, canonicals, schema, internal links, and indexability.",
          "Use Search Console only through a controlled read-only session when capability is available.",
          "Separate confirmed account data from local recommendations.",
        ],
        expectedArtifacts: ["SEO findings", "technical risk list", "prioritized opportunity backlog"],
        objective: task.objective,
      };
    },
    execute({ context }) {
      return {
        auditPlan: {
          checks: ["metadata", "canonical", "schema", "headings", "internal links", "sitemap", "robots", "indexability", "AEO", "GEO"],
          evidencePolicy: "Label live Search Console or GA4 data as confirmed only when read from an exposed session.",
          outputBuckets: ["issues", "fixes", "priority", "approval gates", "next actions"],
        },
        controlledSessions: [
          buildControlledSessionPlan({
            integrationId: "search-console",
            purpose: "Read-only SEO validation",
            approvalClass: context.mission.approvalClass,
            requestedActions: ["read"],
          }),
          buildControlledSessionPlan({
            integrationId: "ga4",
            purpose: "Read-only traffic and conversion review",
            approvalClass: context.mission.approvalClass,
            requestedActions: ["read"],
          }),
        ],
      };
    },
    validate() {
      return ["recommendations map to search intent", "live data claims require evidence", "indexing requests remain approval-gated"];
    },
  },
  CONTENT_STRATEGIST_AGENT: {
    kind: "content",
    plan({ task }) {
      return {
        module: "content",
        executionSteps: [
          "Define topic, audience, search intent, and business goal.",
          "Create outline, FAQ opportunities, internal-link targets, and proof requirements.",
          "Flag any publishing or claim-risk approval gates.",
        ],
        expectedArtifacts: ["content brief", "outline", "internal linking plan", "publishing readiness notes"],
        objective: task.objective,
      };
    },
    execute() {
      return {
        contentSystem: {
          briefFields: ["primary keyword", "secondary topics", "reader problem", "offer alignment", "CTA", "trust proof"],
          qualityRules: ["people-first", "no copied content", "no invented metrics", "clear source/evidence labels"],
          publishingGate: buildApprovalChecklist({
            action: "publish",
            target: "content surface",
            evidence: ["final draft", "SEO review", "QA report"],
          }),
        },
      };
    },
    validate() {
      return ["content has a single intent", "claims are evidence-safe", "publishing remains approval-gated"];
    },
  },
  MARKETING_STRATEGIST_AGENT: {
    kind: "marketing",
    plan({ task }) {
      return {
        module: "marketing",
        executionSteps: [
          "Define target segment, offer, channel, and lead-quality threshold.",
          "Map research sources and scoring criteria.",
          "Route live research through controlled browsing when available.",
          "Prepare outreach only as drafts for approval.",
        ],
        expectedArtifacts: ["campaign brief", "lead scoring rules", "CRM status map", "approval queue"],
        objective: task.objective,
      };
    },
    execute({ context }) {
      return {
        campaignPlan: {
          targetMix: ["70-80% Tier 1", "20-25% Tier 2", "5-10% Tier 3"],
          scoreThreshold: 60,
          crmStatuses: ["Research", "Audit", "Draft", "Approval", "Contacted", "Reply", "Meeting", "Proposal", "Won", "Lost"],
          noAutomaticOutreach: true,
        },
        controlledSessions: [
          buildControlledSessionPlan({
            integrationId: "browser",
            purpose: "Lead source review and website audit observation",
            approvalClass: context.mission.approvalClass,
            requestedActions: ["read"],
          }),
        ],
      };
    },
    validate() {
      return ["lead quality threshold is explicit", "CRM state is defined", "outreach remains draft-only"];
    },
  },
  LEAD_RESEARCH_AGENT: {
    kind: "lead-research",
    plan({ task }) {
      return {
        module: "lead-research",
        executionSteps: [
          "Open controlled browser session only when capability is attached.",
          "Search approved sources using industry and location formulas.",
          "Score each lead and keep only leads scoring 60+ unless instructed otherwise.",
          "Create mini audit, personalization angle, and draft handoff record.",
          "Stop before contact, form submission, or email sending.",
        ],
        expectedArtifacts: ["qualified lead table", "mini audit set", "personalization angles", "outreach draft handoff"],
        objective: task.objective,
      };
    },
    execute({ context }) {
      const browserSession = buildControlledSessionPlan({
        integrationId: "browser",
        purpose: "Lead research and website audit collection",
        approvalClass: context.mission.approvalClass,
        requestedActions: ["read"],
      });

      return {
        leadResearchRunbook: {
          targetCount: 50,
          approvedSources: ["Google Search", "Google Maps", "business directories", "Yelp", "LinkedIn company pages", "Instagram", "Facebook", "TikTok"],
          requiredFields: [
            "lead_id",
            "business_name",
            "industry",
            "location",
            "tier",
            "website_url",
            "source_url",
            "public_email",
            "contact_page_url",
            "website_quality_score",
            "total_score",
            "priority_label",
            "top_3_website_issues",
            "suggested_outreach_angle",
            "status",
          ],
          scoring: {
            businessValue: 25,
            websiteProblemSeverity: 25,
            conversionOpportunity: 20,
            contactability: 15,
            fit: 15,
            minimumSavedScore: 60,
          },
          draftPolicy: "Draft only. No automatic email sending, form submission, or prospect contact.",
        },
        controlledSessions: [browserSession],
        approvalCheckpoints: [
          buildApprovalChecklist({
            action: "send_email",
            target: "qualified prospect list",
            evidence: ["lead table", "mini audits", "draft copy", "CRM status"],
          }),
        ],
      };
    },
    validate() {
      return ["50-lead target is explicit", "score threshold is explicit", "contact actions are approval-gated"];
    },
  },
  WEBSITE_AUDIT_AGENT: {
    kind: "website-audit",
    plan({ task }) {
      return {
        module: "website-audit",
        executionSteps: [
          "Collect URL or local audit target.",
          "Check metadata, headings, links, images, forms, trust signals, and conversion path.",
          "Create a mini audit suitable for lead qualification or SEO handoff.",
        ],
        expectedArtifacts: ["website audit report", "top issues", "recommended service"],
        objective: task.objective,
      };
    },
    execute() {
      return {
        websiteAuditEngine: {
          defaultUrl: "local-wgos-audit-fixture",
          checks: ["title", "meta description", "h1", "h2", "links", "images", "alt text", "forms", "conversion path"],
          output: ["score", "issues", "recommendations"],
        },
      };
    },
    validate() {
      return ["audit checks are explicit", "recommendations are evidence-based", "no live claim without source"];
    },
  },
  CRM_AGENT: {
    kind: "crm",
    plan({ task }) {
      return {
        module: "crm",
        executionSteps: [
          "Create or update tenant-scoped CRM state.",
          "Track lead status, draft status, approval state, and next action.",
          "Keep contact actions separate from local CRM preparation.",
        ],
        expectedArtifacts: ["CRM state JSON", "CRM state markdown", "lead CSV schema"],
        objective: task.objective,
      };
    },
    execute() {
      return {
        crmExecution: {
          statusModel: ["Research", "Audit", "Draft", "Approval Queue", "Human Sent", "Reply", "Meeting", "Proposal", "Won", "Lost"],
          writesExternalCrm: false,
          localOnly: true,
        },
      };
    },
    validate() {
      return ["CRM state is tenant-scoped", "external CRM writes are disabled", "approval status is visible"];
    },
  },
  OUTREACH_DRAFTING_AGENT: {
    kind: "outreach",
    plan({ task }) {
      return {
        module: "outreach",
        executionSteps: [
          "Use qualified lead evidence only.",
          "Draft personalized outreach without sending.",
          "Create a handoff for human review and approval.",
        ],
        expectedArtifacts: ["outreach draft handoff", "approval queue item"],
        objective: task.objective,
      };
    },
    execute() {
      return {
        outreachPolicy: {
          automaticSending: false,
          requiredDraftElements: ["business name", "verified observation", "likely impact", "relevant service", "soft CTA"],
          approvalRequiredBefore: ["Gmail draft creation", "email sending", "contact form submission"],
        },
      };
    },
    validate() {
      return ["draft-only policy is explicit", "personalization requires evidence", "sending remains blocked"];
    },
  },
};

export function getSpecialistModule(agentSlug) {
  return specialistModules[agentSlug] ?? null;
}

export function buildSpecialistPlan({ agent, context, task, profile }) {
  const specialistModule = getSpecialistModule(agent.slug);
  if (!specialistModule) {
    return null;
  }

  return {
    kind: specialistModule.kind,
    ...specialistModule.plan({ agent, context, task, profile }),
  };
}

export function executeSpecialistModule({ agent, context, task, profile }) {
  const specialistModule = getSpecialistModule(agent.slug);
  if (!specialistModule) {
    return null;
  }

  return {
    kind: specialistModule.kind,
    ...specialistModule.execute({ agent, context, task, profile }),
    validationRules: specialistModule.validate({ agent, context, task, profile }),
  };
}

function inferSurface(objective) {
  const text = objective.toLowerCase();
  if (text.includes("homepage")) return "homepage";
  if (text.includes("client")) return "client website";
  if (text.includes("component")) return "component system";
  return "website surface";
}
