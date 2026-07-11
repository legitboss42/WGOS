import fs from "node:fs/promises";
import path from "node:path";
import { appendText, ensureDir, exists, readJson, writeJson, writeText } from "../../runtime/src/fs-utils.mjs";

const DEFAULT_SIGNATURE = [
  "Admin",
  "Web Growth",
  "Build. Grow. Monetize.",
  "admin@webgrowth.info",
  "https://webgrowth.info",
].join("\n");

export function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      current = "";
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

export async function readLeadsCsv(csvPath) {
  return parseCsv(await fs.readFile(csvPath, "utf8"));
}

export function firstEmail(value) {
  const match = String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
}

export function createOutreachState({ missionId, leads = [], sentMessages = [], defaultSender = "admin@webgrowth.info" }) {
  const sentByLead = new Map(sentMessages.map((message) => [message.leadId, message]));
  const records = leads.map((lead) => {
    const recipient = firstEmail(lead.public_email);
    const sent = sentByLead.get(lead.lead_id);
    const status = sent ? "SENT_AWAITING_REPLY" : recipient ? "READY_TO_SEND" : "MISSING_EMAIL";
    return {
      leadId: lead.lead_id,
      businessName: lead.business_name,
      industry: lead.industry,
      location: lead.location,
      recipient,
      sourceUrl: lead.source_url,
      subject: sent?.subject || subjectForLead(lead),
      status,
      messageId: sent?.messageId || "",
      threadId: sent?.threadId || "",
      sentAt: sent?.sentAt || "",
      replyStatus: "NO_REPLY_OBSERVED",
      bounceStatus: "NO_BOUNCE_OBSERVED",
      nextAction: status === "SENT_AWAITING_REPLY" ? "Monitor replies and bounces before follow-up." : status === "READY_TO_SEND" ? "Wait for explicit batch-send approval." : "Research a confirmed public email.",
      followUpApproved: false,
    };
  });

  return {
    missionId,
    generatedAt: new Date().toISOString(),
    defaultSender,
    signature: DEFAULT_SIGNATURE,
    policy: {
      batchSending: "Future sends should use small approved batches.",
      followUps: "No follow-up is sent without separate human approval.",
      stateChanges: "External contact actions must be logged with message IDs.",
    },
    summary: summarizeOutreachRecords(records),
    records,
  };
}

export function summarizeOutreachRecords(records) {
  return {
    total: records.length,
    sent: records.filter((record) => record.status === "SENT_AWAITING_REPLY" || record.status === "REPLIED" || record.status === "BOUNCED").length,
    readyToSend: records.filter((record) => record.status === "READY_TO_SEND").length,
    missingEmail: records.filter((record) => record.status === "MISSING_EMAIL").length,
    replied: records.filter((record) => record.status === "REPLIED").length,
    bounced: records.filter((record) => record.status === "BOUNCED").length,
    awaitingReply: records.filter((record) => record.status === "SENT_AWAITING_REPLY").length,
  };
}

export async function writeOutreachState({ root, state }) {
  const stateDir = path.join(root, "state", "outreach");
  const reportDir = path.join(root, "growth", "dashboard");
  const statePath = path.join(stateDir, `${state.missionId}.json`);
  const latestPath = path.join(stateDir, "latest.json");
  await writeJson(statePath, state);
  await writeJson(latestPath, state);
  await writeText(path.join(reportDir, "OUTREACH_OPERATOR.md"), renderOutreachOperatorMarkdown(state));
  await writeText(path.join(reportDir, "outreach-operator.html"), renderOutreachOperatorHtml(state));
  await appendText(path.join(root, "state", "logs", "outreach-events.jsonl"), `${JSON.stringify({
    time: new Date().toISOString(),
    missionId: state.missionId,
    action: "outreach_state_rendered",
    summary: state.summary,
  })}\n`);
  return { statePath, latestPath };
}

export async function loadLatestOutreachState(root) {
  return readJson(path.join(root, "state", "outreach", "latest.json"), null);
}

export async function recordObservation({ root, leadId, status, note = "", messageId = "", threadId = "" }) {
  const latestPath = path.join(root, "state", "outreach", "latest.json");
  const state = await readJson(latestPath, null);
  if (!state) throw new Error("No outreach state exists. Run npm.cmd run wgos:outreach:init first.");
  const record = state.records.find((item) => item.leadId === leadId);
  if (!record) throw new Error(`Lead not found in outreach state: ${leadId}`);

  const normalized = status.toUpperCase();
  if (!["REPLIED", "BOUNCED", "SENT_AWAITING_REPLY", "DO_NOT_CONTACT", "FOLLOW_UP_READY"].includes(normalized)) {
    throw new Error(`Unsupported outreach status: ${status}`);
  }

  record.status = normalized;
  if (normalized === "REPLIED") record.replyStatus = "REPLY_OBSERVED";
  if (normalized === "BOUNCED") record.bounceStatus = "BOUNCE_OBSERVED";
  if (messageId) record.messageId = messageId;
  if (threadId) record.threadId = threadId;
  record.lastObservationAt = new Date().toISOString();
  record.lastObservationNote = note;
  state.generatedAt = new Date().toISOString();
  state.summary = summarizeOutreachRecords(state.records);
  await writeOutreachState({ root, state });
  return record;
}

export function renderLiveSummary(state) {
  return [
    `WGOS Outreach Operator | ${state.missionId}`,
    `Updated: ${state.generatedAt}`,
    `Total: ${state.summary.total}`,
    `Sent: ${state.summary.sent}`,
    `Awaiting reply: ${state.summary.awaitingReply}`,
    `Replied: ${state.summary.replied}`,
    `Bounced: ${state.summary.bounced}`,
    `Ready to send: ${state.summary.readyToSend}`,
    `Missing email: ${state.summary.missingEmail}`,
    "",
    "Recent active records:",
    ...state.records
      .filter((record) => ["REPLIED", "BOUNCED", "SENT_AWAITING_REPLY", "READY_TO_SEND"].includes(record.status))
      .slice(0, 12)
      .map((record) => `- ${record.leadId} ${record.businessName}: ${record.status} ${record.recipient ? `(${record.recipient})` : ""}`),
  ].join("\n");
}

export function extractSentMessagesFromMarkdown(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("| WG-")) continue;
    const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (cells.length < 4) continue;
    rows.push({
      leadId: cells[0],
      businessName: cells[1],
      recipient: cells[2],
      messageId: cells[3],
      threadId: cells[3],
      subject: "",
      sentAt: "2026-07-10",
    });
  }
  return rows;
}

export async function readSentMessages(sendLogPath) {
  if (!(await exists(sendLogPath))) return [];
  return extractSentMessagesFromMarkdown(await fs.readFile(sendLogPath, "utf8"));
}

function subjectForLead(lead) {
  if (lead.suggested_outreach_angle) return lead.suggested_outreach_angle;
  return `Website growth idea for ${lead.business_name}`;
}

function renderOutreachOperatorMarkdown(state) {
  return `# Outreach Operator

Mission: ${state.missionId}
Generated: ${state.generatedAt}

## Live Summary

- Total leads: ${state.summary.total}
- Sent: ${state.summary.sent}
- Awaiting reply: ${state.summary.awaitingReply}
- Replied: ${state.summary.replied}
- Bounced: ${state.summary.bounced}
- Ready to send: ${state.summary.readyToSend}
- Missing email: ${state.summary.missingEmail}

## Rules

- Future sends should happen in small approved batches.
- Follow-ups require separate human approval.
- Reply and bounce observations should be recorded before any follow-up sequence.
- The Gmail connector is observed through Codex; local scripts do not directly access Gmail.

## Records

| Lead | Business | Recipient | Status | Message |
| --- | --- | --- | --- | --- |
${state.records.map((record) => `| ${record.leadId} | ${record.businessName} | ${record.recipient || "missing"} | ${record.status} | ${record.messageId || "-"} |`).join("\n")}
`;
}

function renderOutreachOperatorHtml(state) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WGOS Outreach Operator</title>
  <style>
    :root { --bg:#07130f; --panel:#0f211a; --ink:#edfdf5; --muted:#9fc4b5; --line:#24463a; --accent:#34d399; --warn:#fbbf24; --bad:#fb7185; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:"Segoe UI",sans-serif; background:radial-gradient(circle at top left,#17352a,var(--bg) 45%); color:var(--ink); }
    main { max-width:1180px; margin:0 auto; padding:28px 18px 64px; }
    .hero,.card { border:1px solid var(--line); background:rgba(15,33,26,.94); border-radius:18px; box-shadow:0 18px 44px rgba(0,0,0,.22); }
    .hero { padding:24px; }
    h1,h2 { margin:0; }
    p,.muted { color:var(--muted); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin-top:18px; }
    .card { padding:16px; margin-top:18px; }
    .metric { font-size:2rem; font-weight:800; margin-top:6px; }
    input,select { width:100%; padding:11px 12px; border-radius:12px; border:1px solid var(--line); background:#081711; color:var(--ink); }
    .filters { display:grid; grid-template-columns:2fr 1fr; gap:12px; margin-top:18px; }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    th,td { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); vertical-align:top; }
    th { color:var(--muted); font-size:.85rem; }
    .pill { display:inline-flex; padding:4px 10px; border-radius:999px; font-weight:700; font-size:.78rem; }
    .sent_awaiting_reply { background:rgba(52,211,153,.15); color:#86efac; }
    .replied { background:rgba(59,130,246,.2); color:#93c5fd; }
    .bounced,.missing_email { background:rgba(251,113,133,.18); color:#fda4af; }
    .ready_to_send,.follow_up_ready { background:rgba(251,191,36,.16); color:#fde68a; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>WGOS Outreach Operator</h1>
      <p>Mission ${escapeHtml(state.missionId)}. Generated ${escapeHtml(state.generatedAt)}.</p>
      <div class="grid">
        ${metric("Total", state.summary.total)}
        ${metric("Sent", state.summary.sent)}
        ${metric("Awaiting Reply", state.summary.awaitingReply)}
        ${metric("Replied", state.summary.replied)}
        ${metric("Bounced", state.summary.bounced)}
        ${metric("Missing Email", state.summary.missingEmail)}
      </div>
    </section>
    <section class="filters">
      <input id="q" type="search" placeholder="Search lead, business, recipient, status" />
      <select id="status">
        <option value="ALL">All statuses</option>
        <option value="SENT_AWAITING_REPLY">Sent awaiting reply</option>
        <option value="REPLIED">Replied</option>
        <option value="BOUNCED">Bounced</option>
        <option value="READY_TO_SEND">Ready to send</option>
        <option value="MISSING_EMAIL">Missing email</option>
      </select>
    </section>
    <section class="card">
      <h2>Live Outreach Records</h2>
      <div id="records"></div>
    </section>
  </main>
  <script id="data" type="application/json">${JSON.stringify(state).replace(/</g, "\\u003c")}</script>
  <script>
    const state = JSON.parse(document.getElementById("data").textContent);
    const q = document.getElementById("q");
    const status = document.getElementById("status");
    const records = document.getElementById("records");
    function esc(v){return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
    function pill(v){return '<span class="pill '+esc(String(v).toLowerCase())+'">'+esc(v)+'</span>'}
    function render(){
      const query = q.value.toLowerCase().trim();
      const selected = status.value;
      const rows = state.records.filter((r) => {
        const haystack = [r.leadId,r.businessName,r.recipient,r.status,r.messageId].join(" ").toLowerCase();
        return (selected === "ALL" || r.status === selected) && (!query || haystack.includes(query));
      });
      records.innerHTML = '<table><thead><tr><th>Lead</th><th>Business</th><th>Recipient</th><th>Status</th><th>Message</th><th>Next Action</th></tr></thead><tbody>' +
        rows.map((r) => '<tr><td>'+esc(r.leadId)+'</td><td>'+esc(r.businessName)+'</td><td>'+esc(r.recipient || "missing")+'</td><td>'+pill(r.status)+'</td><td>'+esc(r.messageId || "-")+'</td><td>'+esc(r.nextAction)+'</td></tr>').join("") +
        '</tbody></table>';
    }
    q.addEventListener("input", render);
    status.addEventListener("change", render);
    render();
  </script>
</body>
</html>`;
}

function metric(label, value) {
  return `<div class="card"><strong>${escapeHtml(label)}</strong><div class="metric">${escapeHtml(value)}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
