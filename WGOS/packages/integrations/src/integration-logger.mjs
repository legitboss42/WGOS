import path from "node:path";
import { appendText, formatDateTime } from "../../runtime/src/fs-utils.mjs";

export async function logIntegrationEvent(root, event) {
  const record = {
    time: formatDateTime(),
    agent: event.agent ?? "WGOS",
    missionId: event.missionId ?? null,
    taskId: event.taskId ?? null,
    integrationId: event.integrationId,
    action: event.action,
    result: event.result,
    approval: event.approval ?? "NOT_REQUIRED",
    errors: event.errors ?? [],
    durationMs: event.durationMs ?? 0,
    evidencePointer: event.evidencePointer ?? null,
  };

  await appendText(path.join(root, "logs", "integrations", `${record.integrationId}.jsonl`), `${JSON.stringify(record)}\n`);
  return record;
}
