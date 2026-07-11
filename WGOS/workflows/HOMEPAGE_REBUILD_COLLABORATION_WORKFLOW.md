# Homepage Rebuild Collaboration Workflow

## Purpose

Coordinate a homepage rebuild from strategy through implementation, validation, documentation, and memory capture.

## Trigger

Use this workflow when a homepage needs structural, UX, messaging, design, engineering, SEO, accessibility, performance, and QA coordination.

## Agents involved

- `PRODUCT_STRATEGIST_AGENT`
- `UI_UX_DESIGN_AGENT`
- `MOTION_GRAPHICS_AGENT`
- `FRONTEND_ENGINEER_AGENT`
- `SEO_AGENT`
- `ACCESSIBILITY_ENGINEER_AGENT`
- `PERFORMANCE_ENGINEER_AGENT`
- `QA_ENGINEER_AGENT`
- `DOCUMENTATION_AGENT`
- `KNOWLEDGE_MANAGER_AGENT`

## Step-by-step process

1. Product Strategist defines objective, audience, offer hierarchy, and success metric.
2. UI UX Designer turns strategy into page structure, content order, and CTA map.
3. Motion Graphics Designer defines motion rules that support comprehension and respect reduced motion.
4. Frontend Engineer implements the approved structure and interaction model.
5. SEO Agent reviews metadata, internal links, and search-intent alignment.
6. Accessibility Engineer validates semantics, keyboard flow, contrast, and motion safety.
7. Performance Engineer reviews Core Web Vitals risk and implementation weight.
8. QA Engineer validates the complete experience and routes defects back if needed.
9. Documentation Agent records what changed, what was validated, and what remains.
10. Knowledge Manager updates memory, next actions, and durable decisions.

## Required inputs

- Mission brief
- Existing homepage evidence
- Brand and offer context
- Validation requirements

## Outputs

- Approved implementation handoff or completed local build
- Validation evidence
- Mission report
- Memory updates

## Approval gates

- Pause before any production deployment.
- Pause before any external publishing or account-level change.

## Runtime references

- `runtime/core/AGENT_COMMUNICATION_PROTOCOL.md`
- `runtime/execution/EXECUTION_RULES.md`
- `runtime/tasks/TASK_SYSTEM.md`
- `runtime/tasks/HANDOFF_PROTOCOL.md`
- `packages/runtime/src/mission-runtime.mjs`
- `packages/runtime/src/mission-catalog.mjs`

## Documentation updates required

- Update `reports/`, `memory/`, `decisions/`, and `PROJECT_HANDOFF.md`.

## Failure handling

- Route defects back to the originating specialist with exact validation evidence.
- Mark the mission blocked when approval, content, or dependency gaps stop safe progress.

## Completion criteria

- Strategy, implementation, validation, and documentation are complete.
- The next step is explicit if production action is still pending.
