# Runtime Mission Plan

{
  "mission_id": "WGOS-20260710-LEAD_GENERATION",
  "objective": "WGOS, find 50 qualified leads today",
  "mission_type": "LEAD_GENERATION",
  "workflows": [
    "LEAD_RESEARCH_WORKFLOW",
    "HUMAN_APPROVED_OUTREACH_WORKFLOW"
  ],
  "agents": [
    "MARKETING_STRATEGIST_AGENT",
    "LEAD_RESEARCH_AGENT",
    "WEBSITE_AUDIT_AGENT",
    "BUSINESS_INTELLIGENCE_AGENT",
    "CRM_AGENT",
    "OUTREACH_DRAFTING_AGENT",
    "QA_ENGINEER_AGENT",
    "KNOWLEDGE_MANAGER_AGENT",
    "DOCUMENTATION_AGENT"
  ],
  "departments": [
    "marketing",
    "engineering",
    "executive"
  ],
  "skills": [
    "CONTROLLED_BROWSER",
    "LEAD_RESEARCH",
    "OUTREACH",
    "CRM",
    "COPYWRITING"
  ],
  "approval_gates": [
    "HIGH: controlled browsing",
    "CRITICAL: sending/contacting/submitting forms"
  ],
  "expected_reports": [
    "lead-research-report",
    "outreach-draft-report",
    "crm-report"
  ],
  "memory_updates_required": [
    "WGOS/memory/CODEX_MEMORY.md",
    "WGOS/memory/CURRENT_STATE.md",
    "WGOS/memory/ACTIVE_TASKS.md",
    "WGOS/memory/NEXT_ACTIONS.md"
  ],
  "validation_steps": [
    "classification reviewed",
    "task board created",
    "approval gates listed",
    "report created",
    "memory updated"
  ],
  "task_board": [
    {
      "sequence": 1,
      "agent": "MARKETING_STRATEGIST_AGENT",
      "status": "READY",
      "expected_output": "lead-research-report"
    },
    {
      "sequence": 2,
      "agent": "LEAD_RESEARCH_AGENT",
      "status": "READY",
      "expected_output": "outreach-draft-report"
    },
    {
      "sequence": 3,
      "agent": "WEBSITE_AUDIT_AGENT",
      "status": "READY",
      "expected_output": "crm-report"
    },
    {
      "sequence": 4,
      "agent": "BUSINESS_INTELLIGENCE_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 5,
      "agent": "CRM_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 6,
      "agent": "OUTREACH_DRAFTING_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 7,
      "agent": "QA_ENGINEER_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 8,
      "agent": "KNOWLEDGE_MANAGER_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 9,
      "agent": "DOCUMENTATION_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    }
  ],
  "next_step": "Review approval gates, then execute the first task phase in Codex."
}
