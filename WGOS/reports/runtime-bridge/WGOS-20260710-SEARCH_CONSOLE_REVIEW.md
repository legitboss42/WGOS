# Runtime Mission Plan

{
  "mission_id": "WGOS-20260710-SEARCH_CONSOLE_REVIEW",
  "objective": "WGOS, check Search Console and GA4",
  "mission_type": "SEARCH_CONSOLE_REVIEW",
  "workflows": [
    "SEO_GROWTH_WORKFLOW"
  ],
  "agents": [
    "SEARCH_CONSOLE_AGENT",
    "SEO_AGENT",
    "TECHNICAL_SEO_AGENT",
    "DOCUMENTATION_AGENT"
  ],
  "departments": [
    "search",
    "executive"
  ],
  "skills": [
    "SEARCH_CONSOLE",
    "SEO"
  ],
  "approval_gates": [
    "HIGH: read-only Search Console",
    "CRITICAL: request indexing"
  ],
  "expected_reports": [
    "search-console-review-report"
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
      "agent": "SEARCH_CONSOLE_AGENT",
      "status": "READY",
      "expected_output": "search-console-review-report"
    },
    {
      "sequence": 2,
      "agent": "SEO_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 3,
      "agent": "TECHNICAL_SEO_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    },
    {
      "sequence": 4,
      "agent": "DOCUMENTATION_AGENT",
      "status": "READY",
      "expected_output": "agent output and handoff"
    }
  ],
  "next_step": "Review approval gates, then execute the first task phase in Codex."
}
