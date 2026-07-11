import path from "node:path";
import { WGOS_ROOT } from "../../../scripts/lib/wgos-config.mjs";
import { ensureDir, readJson, writeJson, writeText } from "../../runtime/src/fs-utils.mjs";
import { getStatePaths } from "../../runtime/src/state-store.mjs";

export async function renderSurfaces(root = WGOS_ROOT) {
  const paths = getStatePaths(root);
  const summary = await readJson(paths.summary, {});
  const missions = await readJson(paths.missionIndex, []);
  const tasks = await readJson(paths.taskIndex, []);
  const scorecards = await readJson(paths.scorecards, []);
  const departmentMetrics = await readJson(paths.departmentMetrics, []);
  const approvalQueue = await readJson(path.join(paths.stateRoot, "approvals", "queue.json"), []);
  const analytics = await readJson(paths.analytics, {
    missionAnalytics: { byTemplate: [] },
    departmentHistory: [],
  });

  const currentMissions = missions.filter((mission) => ["READY", "IN_PROGRESS", "BLOCKED", "WAITING_APPROVAL"].includes(mission.status));
  const blockedTasks = tasks.filter((task) => task.status === "BLOCKED");
  const pendingApprovals = tasks.filter((task) => task.status === "WAITING_APPROVAL");
  const departments = unique(tasks.map((task) => task.department).filter(Boolean));
  const websiteMissionTemplates = ["BUILD_PREMIUM_WEBSITE", "REDESIGN_WEBSITE", "HOMEPAGE_REBUILD", "CLIENT_WEBSITE_DELIVERY"];
  const growthMissionTemplates = ["LEAD_RESEARCH", "SEO_GROWTH_SPRINT", "CONTENT_MARKETING_SPRINT", "REVENUE_OPPORTUNITY_REVIEW", "WEEKLY_ANALYTICS_REVIEW", "NEWSLETTER_CAMPAIGN"];
  const websiteProjects = missions.filter((mission) => websiteMissionTemplates.includes(mission.templateId));
  const growthMissions = missions.filter((mission) => growthMissionTemplates.includes(mission.templateId));
  const latestWebsiteProject = websiteProjects[0] ?? null;
  const latestWebsiteTasks = latestWebsiteProject ? tasks.filter((task) => task.missionId === latestWebsiteProject.id) : [];
  const latestGrowthMission = growthMissions[0] ?? null;
  const latestGrowthTasks = latestGrowthMission ? tasks.filter((task) => task.missionId === latestGrowthMission.id) : [];

  const dashboardPayload = {
    generatedAt: summary.generatedAt,
    missionCount: summary.missionCount ?? 0,
    activeMissionCount: (summary.activeMissionIds ?? []).length,
    waitingApprovalCount: (summary.waitingApprovalMissionIds ?? []).length,
    completedMissionCount: (summary.completedMissionIds ?? []).length,
    activeAgentCount: summary.activeAgentCount ?? 0,
    blockedTaskCount: summary.blockedTaskCount ?? 0,
    currentMissions: currentMissions.slice(0, 12),
    blockedTasks: blockedTasks.slice(0, 12),
    pendingApprovals: pendingApprovals.slice(0, 12),
    approvalQueue: approvalQueue.slice(0, 12),
    leadPipeline: missions.filter((mission) => mission.templateId === "LEAD_RESEARCH").slice(0, 5),
    seoProgress: missions.filter((mission) => ["SEO_AUDIT", "TECHNICAL_SEO_CLEANUP"].includes(mission.templateId)).slice(0, 5),
    contentProgress: missions.filter((mission) => ["LAUNCH_BLOG_CLUSTER", "NEWSLETTER_CAMPAIGN"].includes(mission.templateId)).slice(0, 5),
    websiteProjects: websiteProjects.slice(0, 8),
    revenueOpportunities: missions.filter((mission) => ["WEEKLY_ANALYTICS_REVIEW", "LEAD_RESEARCH"].includes(mission.templateId)).slice(0, 5),
    departmentHealth: departmentMetrics,
    documentationHealth: analytics.missionAnalytics?.documentationHealth ?? "needs review",
    memoryHealth: "Mission memory expansion active",
    qaHealth: blockedTasks.length === 0 ? "Healthy" : "Blocked tasks present",
    latestMissions: missions.slice(0, 20),
    topAgents: [...scorecards].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 8),
    analytics,
    departments,
    statusFilters: ["ALL", "COMPLETED", "IN_PROGRESS", "BLOCKED", "WAITING_APPROVAL"],
    productionPipeline: latestWebsiteProject ? buildProductionPipeline(latestWebsiteProject, latestWebsiteTasks) : null,
    growthPipeline: latestGrowthMission ? buildGrowthPipeline(latestGrowthMission, latestGrowthTasks) : null,
    growthMissions: growthMissions.slice(0, 8),
    revenueSnapshot: buildRevenueSnapshot(growthMissions, latestGrowthTasks),
    intelligenceSummary: analytics.intelligenceSummary ?? null,
    companyPortfolio: analytics.companyPortfolio ?? [],
  };

  const operatorPayload = {
    generatedAt: summary.generatedAt,
    openTasks: tasks.filter((task) => !["COMPLETED", "ARCHIVED"].includes(task.status)).slice(0, 40),
    recentTasks: tasks.slice(0, 40),
    latestMissions: missions.slice(0, 20),
    approvalQueue: approvalQueue.slice(0, 20),
    departmentQueue: buildDepartmentQueue(tasks, departments),
    analytics,
    productionPipeline: dashboardPayload.productionPipeline,
    productionTasks: latestWebsiteTasks.slice(0, 30),
    growthPipeline: dashboardPayload.growthPipeline,
    growthTasks: latestGrowthTasks.slice(0, 30),
    revenueSnapshot: dashboardPayload.revenueSnapshot,
    intelligenceSummary: dashboardPayload.intelligenceSummary,
    companyPortfolio: dashboardPayload.companyPortfolio,
  };

  const dashboardDir = path.join(root, "apps", "dashboard", "build");
  const operatorDir = path.join(root, "apps", "operator", "build");

  await Promise.all([ensureDir(dashboardDir), ensureDir(operatorDir)]);
  await writeJson(path.join(dashboardDir, "dashboard.json"), dashboardPayload);
  await writeJson(path.join(operatorDir, "operator.json"), operatorPayload);

  await writeText(path.join(dashboardDir, "index.html"), renderDashboardHtml(dashboardPayload));
  await writeText(path.join(operatorDir, "index.html"), renderOperatorHtml(operatorPayload));
}

function renderDashboardHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WGOS Dashboard</title>
  <style>
    :root { color-scheme: light; --bg:#f3efe7; --panel:#fffdf8; --ink:#1a1816; --muted:#5d554c; --line:#dfd4c4; --accent:#0f766e; --accent-2:#8b5cf6; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:"Segoe UI",sans-serif; background: radial-gradient(circle at top, #fbf6ea 0, var(--bg) 55%); color:var(--ink); }
    main { max-width: 1260px; margin: 0 auto; padding: 28px 18px 64px; }
    h1,h2,h3 { margin:0; }
    .hero,.card { background:var(--panel); border:1px solid var(--line); border-radius:18px; }
    .hero { display:grid; gap:16px; padding:24px; box-shadow:0 14px 40px rgba(67, 43, 18, 0.08); }
    .subtle,.hero p { color:var(--muted); margin:0; }
    .kpis,.grid-2,.grid-3 { display:grid; gap:16px; margin-top:18px; }
    .kpis { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .card { padding:18px; box-shadow:0 10px 24px rgba(67, 43, 18, 0.05); }
    .metric { font-size:2rem; font-weight:700; margin-top:6px; }
    .toolbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-top:18px; }
    .toolbar input,.toolbar select,.toolbar button { padding:10px 12px; border-radius:12px; border:1px solid var(--line); background:#fff; color:var(--ink); }
    .toolbar button.active { background:var(--accent); color:#fff; border-color:var(--accent); }
    table { width:100%; border-collapse:collapse; }
    th,td { text-align:left; padding:10px 8px; border-bottom:1px solid #efe4d6; vertical-align:top; }
    th { color:var(--muted); font-size:.85rem; }
    .pill { display:inline-flex; padding:4px 10px; border-radius:999px; font-size:.8rem; font-weight:600; }
    .pill.completed { background:#dcfce7; color:#166534; }
    .pill.blocked { background:#fee2e2; color:#991b1b; }
    .pill.waiting_approval { background:#fef3c7; color:#92400e; }
    .pill.in_progress,.pill.ready { background:#dbeafe; color:#1d4ed8; }
    .list,.stages { display:grid; gap:10px; }
    .mini,.stage { padding:12px; border:1px solid #ede0cf; border-radius:14px; background:#fffdfa; }
    .bars { display:grid; gap:10px; }
    .bar { height:10px; background:#efe4d6; border-radius:999px; overflow:hidden; }
    .bar > span { display:block; height:100%; background:linear-gradient(90deg, var(--accent), var(--accent-2)); }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div>
        <h1>WGOS Dashboard</h1>
        <p>Generated ${escapeHtml(payload.generatedAt ?? "unknown")} from persistent mission state and KPI analytics.</p>
      </div>
      <div class="kpis">
        ${renderMetricCard("Current Missions", payload.activeMissionCount)}
        ${renderMetricCard("Completed Missions", payload.completedMissionCount)}
        ${renderMetricCard("Active Agents", payload.activeAgentCount)}
        ${renderMetricCard("Blocked Tasks", payload.blockedTaskCount)}
        ${renderMetricCard("Pending Approvals", payload.waitingApprovalCount)}
        ${renderMetricCard("Documentation Health", payload.documentationHealth)}
      </div>
    </section>
    <section class="toolbar" aria-label="Mission filters">
      <input id="mission-search" type="search" placeholder="Search mission, company, or template" />
      <select id="mission-department">
        <option value="ALL">All departments</option>
        ${payload.departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("")}
      </select>
      ${payload.statusFilters.map((status) => `<button type="button" data-status="${escapeHtml(status)}"${status === "ALL" ? ' class="active"' : ""}>${escapeHtml(status)}</button>`).join("")}
    </section>
    <section class="grid-2">
      <div class="card">
        <h2>Mission Queue</h2>
        <p class="subtle">Filterable view of current and recent company missions.</p>
        <div id="mission-table"></div>
      </div>
      <div class="card">
        <h2>KPI Snapshot</h2>
        <div class="grid-3">
          ${renderMetricCard("Avg Tasks / Mission", payload.analytics.missionAnalytics?.averageTaskCount ?? 0)}
          ${renderMetricCard("Avg Departments / Mission", payload.analytics.missionAnalytics?.averageDepartmentCount ?? 0)}
          ${renderMetricCard("QA Health", payload.qaHealth)}
        </div>
        <div class="bars" id="template-bars"></div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h2>Production Pipeline</h2>
        <div id="production-pipeline"></div>
      </div>
      <div class="card">
        <h2>Growth Pipeline</h2>
        <div id="growth-pipeline"></div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h2>Department Health</h2>
        <div id="department-table"></div>
      </div>
      <div class="card">
        <h2>Revenue Snapshot</h2>
        <div id="revenue-snapshot"></div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h2>Intelligence Snapshot</h2>
        <div id="intelligence-snapshot"></div>
      </div>
      <div class="card">
        <h2>Top Agents</h2>
        <div id="agent-table"></div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h2>Company Portfolio</h2>
        <div id="company-portfolio"></div>
      </div>
      <div class="card">
        <h2>Tenant Health</h2>
        <div id="tenant-health"></div>
      </div>
    </section>
    <section class="grid-3">
      ${renderMissionCollectionCard("Website Projects", payload.websiteProjects)}
      ${renderMissionCollectionCard("Growth Missions", payload.growthMissions)}
      ${renderMissionCollectionCard("Lead Pipeline", payload.leadPipeline)}
      ${renderMissionCollectionCard("SEO Progress", payload.seoProgress)}
      ${renderMissionCollectionCard("Content Progress", payload.contentProgress)}
      ${renderMissionCollectionCard("Revenue Opportunities", payload.revenueOpportunities)}
      ${renderApprovalCollectionCard("Approval Queue", payload.approvalQueue)}
    </section>
  </main>
  <script id="wgos-dashboard-data" type="application/json">${serializeJsonForHtml(payload)}</script>
  <script>
    const payload = JSON.parse(document.getElementById("wgos-dashboard-data").textContent);
    let currentStatus = "ALL";
    const missionSearch = document.getElementById("mission-search");
    const missionDepartment = document.getElementById("mission-department");
    const buttons = Array.from(document.querySelectorAll("[data-status]"));
    function escapeHtml(value) {
      return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
    }
    function statusPill(status) {
      const cls = String(status || "unknown").toLowerCase();
      return '<span class="pill ' + cls + '">' + escapeHtml(status || "UNKNOWN") + '</span>';
    }
    function renderTable(targetId, headers, rows) {
      const target = document.getElementById(targetId);
      const body = rows.length ? rows.map((row) => "<tr>" + row.map((cell) => "<td>" + cell + "</td>").join("") + "</tr>").join("") : '<tr><td colspan="' + headers.length + '">No rows in this view.</td></tr>';
      target.innerHTML = '<table><thead><tr>' + headers.map((header) => "<th>" + header + "</th>").join("") + '</tr></thead><tbody>' + body + "</tbody></table>";
    }
    function getFilteredMissions() {
      const query = missionSearch.value.trim().toLowerCase();
      const department = missionDepartment.value;
      return payload.latestMissions.filter((mission) => {
        const matchesStatus = currentStatus === "ALL" || mission.status === currentStatus;
        const matchesDepartment = department === "ALL" || (mission.requiredDepartments || []).includes(department);
        const matchesQuery = !query || [mission.id, mission.companyId, mission.templateId, mission.objective].join(" ").toLowerCase().includes(query);
        return matchesStatus && matchesDepartment && matchesQuery;
      });
    }
    function renderMissionQueue() {
      renderTable("mission-table", ["Mission", "Status", "Template", "Company", "Departments", "Complexity"], getFilteredMissions().map((mission) => [
        escapeHtml(mission.id), statusPill(mission.status), escapeHtml(mission.templateId), escapeHtml(mission.companyId), escapeHtml((mission.requiredDepartments || []).join(", ")), escapeHtml(mission.estimatedComplexity || "Medium")
      ]));
    }
    function renderDepartmentHealth() {
      renderTable("department-table", ["Department", "Missions", "Tasks", "Completed", "Completion Rate"], (payload.analytics.departmentHistory || []).map((item) => [
        escapeHtml(item.department), escapeHtml(item.missions), escapeHtml(item.tasks), escapeHtml(item.completedTasks), escapeHtml(item.completionRate + "%")
      ]));
    }
    function renderAgentHealth() {
      renderTable("agent-table", ["Agent", "Department", "Tasks", "QA", "Approvals"], (payload.topAgents || []).map((item) => [
        escapeHtml(item.agentTitle), escapeHtml(item.department), escapeHtml(item.tasksCompleted), escapeHtml(item.qaPasses), escapeHtml(item.approvalPauses)
      ]));
    }
    function renderIntelligenceSnapshot() {
      const target = document.getElementById("intelligence-snapshot");
      const intelligence = payload.intelligenceSummary;
      if (!intelligence) {
        target.innerHTML = '<div class="mini">No intelligence summary generated yet.</div>';
        return;
      }
      target.innerHTML = '<div class="list">' +
        '<div class="mini"><strong>Top template</strong><div>' + escapeHtml(intelligence.topTemplate || "None") + '</div></div>' +
        '<div class="mini"><strong>Top department</strong><div>' + escapeHtml(intelligence.topDepartment || "None") + '</div></div>' +
        '<div class="mini"><strong>Completion rate</strong><div>' + escapeHtml(intelligence.averageCompletionRate + "%") + '</div></div>' +
        '<div class="mini"><strong>Planning note</strong><div class="subtle">' + escapeHtml(intelligence.planningNote || "None") + '</div></div>' +
      '</div>';
    }
    function renderCompanyPortfolio() {
      renderTable("company-portfolio", ["Company", "Missions", "Completed", "Health"], (payload.companyPortfolio || []).map((item) => [
        escapeHtml(item.name), escapeHtml(item.missions), escapeHtml(item.completedMissions), escapeHtml(item.healthScore + "/10")
      ]));
    }
    function renderTenantHealth() {
      const target = document.getElementById("tenant-health");
      if (!payload.companyPortfolio?.length) {
        target.innerHTML = '<div class="mini">No tenant portfolio data generated yet.</div>';
        return;
      }
      target.innerHTML = '<div class="list">' + payload.companyPortfolio.map((item) =>
        '<div class="mini"><strong>' + escapeHtml(item.name) + '</strong><div>' + escapeHtml(item.slug) + '</div><div class="subtle">' + escapeHtml(item.documentationStatus) + ' · ' + escapeHtml(item.healthScore + "/10") + '</div></div>'
      ).join("") + '</div>';
    }
    function renderTemplateBars() {
      const target = document.getElementById("template-bars");
      const items = (payload.analytics.missionAnalytics?.byTemplate || []).slice(0, 6);
      const max = Math.max(...items.map((item) => item.missions), 1);
      target.innerHTML = items.map((item) => {
        const width = Math.max(6, Math.round((item.missions / max) * 100));
        return '<div><div><strong>' + escapeHtml(item.templateId) + '</strong> <span class="subtle">(' + escapeHtml(item.missions) + ' missions)</span></div><div class="bar"><span style="width:' + width + '%"></span></div></div>';
      }).join("");
    }
    function renderProductionPipeline() {
      const target = document.getElementById("production-pipeline");
      if (!payload.productionPipeline) {
        target.innerHTML = '<div class="mini">No website-production mission has been run yet.</div>';
        return;
      }
      target.innerHTML = '<div class="mini"><strong>Latest website mission</strong><div>' + escapeHtml(payload.productionPipeline.missionId) + '</div><div class="subtle">' + escapeHtml(payload.productionPipeline.companyId) + '</div></div><div class="stages">' +
        payload.productionPipeline.stages.map((stage) => '<div class="stage"><strong>' + escapeHtml(stage.label) + '</strong><div>' + statusPill(stage.status) + '</div><div class="subtle">' + escapeHtml(stage.summary) + '</div></div>').join("") +
        '</div>';
    }
    function renderGrowthPipeline() {
      const target = document.getElementById("growth-pipeline");
      if (!payload.growthPipeline) {
        target.innerHTML = '<div class="mini">No growth mission has been run yet.</div>';
        return;
      }
      target.innerHTML = '<div class="mini"><strong>Latest growth mission</strong><div>' + escapeHtml(payload.growthPipeline.missionId) + '</div><div class="subtle">' + escapeHtml(payload.growthPipeline.companyId) + '</div></div><div class="stages">' +
        payload.growthPipeline.stages.map((stage) => '<div class="stage"><strong>' + escapeHtml(stage.label) + '</strong><div>' + statusPill(stage.status) + '</div><div class="subtle">' + escapeHtml(stage.summary) + '</div></div>').join("") +
        '</div>';
    }
    function renderRevenueSnapshot() {
      const target = document.getElementById("revenue-snapshot");
      const snapshot = payload.revenueSnapshot;
      target.innerHTML = '<div class="list">' +
        '<div class="mini"><strong>Growth missions</strong><div>' + escapeHtml(snapshot.growthMissionCount) + '</div></div>' +
        '<div class="mini"><strong>Revenue-focused outputs</strong><div>' + escapeHtml(snapshot.revenueTaskCount) + '</div></div>' +
        '<div class="mini"><strong>Marketing outputs</strong><div>' + escapeHtml(snapshot.marketingTaskCount) + '</div></div>' +
        '<div class="mini"><strong>Search outputs</strong><div>' + escapeHtml(snapshot.searchTaskCount) + '</div></div>' +
        '<div class="mini"><strong>Latest revenue mission</strong><div>' + escapeHtml(snapshot.latestRevenueMission || "None yet") + '</div></div>' +
      '</div>';
    }
    buttons.forEach((button) => button.addEventListener("click", () => {
      currentStatus = button.dataset.status;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      renderMissionQueue();
    }));
    missionSearch.addEventListener("input", renderMissionQueue);
    missionDepartment.addEventListener("change", renderMissionQueue);
    renderMissionQueue();
    renderDepartmentHealth();
    renderTemplateBars();
    renderProductionPipeline();
    renderGrowthPipeline();
    renderRevenueSnapshot();
    renderIntelligenceSnapshot();
    renderAgentHealth();
    renderCompanyPortfolio();
    renderTenantHealth();
  </script>
</body>
</html>`;
}

function renderOperatorHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WGOS Operator Surface</title>
  <style>
    :root { color-scheme: dark; --bg:#091019; --panel:#101b29; --ink:#e7eef7; --muted:#9ab0c6; --line:#203246; --accent:#38bdf8; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:"Segoe UI",sans-serif; background:radial-gradient(circle at top, #16263a 0, var(--bg) 45%); color:var(--ink); }
    main { max-width:1240px; margin:0 auto; padding:28px 18px 64px; }
    .hero,.card { border:1px solid var(--line); background:rgba(16,27,41,.95); border-radius:18px; }
    .hero { padding:24px; box-shadow:0 14px 36px rgba(0,0,0,.26); }
    .hero p,.subtle { color:var(--muted); }
    .grid,.grid-2 { display:grid; gap:16px; margin-top:18px; }
    .grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
    .card { padding:18px; }
    .metric { font-size:2rem; font-weight:700; margin-top:6px; }
    table { width:100%; border-collapse:collapse; }
    th,td { text-align:left; padding:10px 8px; border-bottom:1px solid #1d3042; vertical-align:top; }
    th { color:var(--muted); font-size:.85rem; }
    .toolbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-top:18px; }
    .toolbar input,.toolbar select { padding:10px 12px; border-radius:12px; border:1px solid var(--line); background:#0c1622; color:var(--ink); }
    .pill { display:inline-flex; padding:4px 10px; border-radius:999px; font-size:.8rem; font-weight:600; }
    .pill.completed { background:rgba(34,197,94,.18); color:#86efac; }
    .pill.blocked { background:rgba(239,68,68,.18); color:#fca5a5; }
    .pill.waiting_approval { background:rgba(245,158,11,.18); color:#fcd34d; }
    .pill.in_progress,.pill.ready { background:rgba(56,189,248,.18); color:#93c5fd; }
    .list,.stages { display:grid; gap:10px; }
    .mini,.stage { padding:12px; border:1px solid #1d3042; border-radius:14px; background:#0d1724; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>WGOS Operator Surface</h1>
      <p>Generated ${escapeHtml(payload.generatedAt ?? "unknown")} from persistent task state, mission history, and approval queues.</p>
      <div class="grid">
        ${renderMetricCard("Open Tasks", payload.openTasks.length)}
        ${renderMetricCard("Approval Queue", payload.approvalQueue.length)}
        ${renderMetricCard("Recent Missions", payload.latestMissions.length)}
        ${renderMetricCard("Tracked Departments", payload.departmentQueue.length)}
      </div>
    </section>
    <section class="toolbar" aria-label="Operator filters">
      <input id="task-search" type="search" placeholder="Search task, mission, or agent" />
      <select id="task-status">
        <option value="ALL">All open statuses</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="BLOCKED">BLOCKED</option>
        <option value="WAITING_APPROVAL">WAITING_APPROVAL</option>
      </select>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Open Task Queue</h2><div id="task-table"></div></div>
      <div class="card"><h2>Production Mission Control</h2><div id="production-control"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Approval Queue</h2><div id="approval-list" class="list"></div></div>
      <div class="card"><h2>Growth Mission Control</h2><div id="growth-control"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Department Queue</h2><div id="department-queue"></div></div>
      <div class="card"><h2>Revenue Snapshot</h2><div id="revenue-snapshot"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Recent Missions</h2><div id="mission-list"></div></div>
      <div class="card"><h2>Production Tasks</h2><div id="production-tasks"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Growth Tasks</h2><div id="growth-tasks"></div></div>
      <div class="card"><h2>Growth Analytics</h2><div id="growth-analytics"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Intelligence Control</h2><div id="intelligence-control"></div></div>
      <div class="card"><h2>Forecast</h2><div id="forecast-view"></div></div>
    </section>
    <section class="grid-2">
      <div class="card"><h2>Company Portfolio</h2><div id="company-portfolio"></div></div>
      <div class="card"><h2>Tenant Boundaries</h2><div id="tenant-boundaries"></div></div>
    </section>
  </main>
  <script id="wgos-operator-data" type="application/json">${serializeJsonForHtml(payload)}</script>
  <script>
    const payload = JSON.parse(document.getElementById("wgos-operator-data").textContent);
    const taskSearch = document.getElementById("task-search");
    const taskStatus = document.getElementById("task-status");
    function escapeHtml(value) {
      return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
    }
    function statusPill(status) {
      const cls = String(status || "unknown").toLowerCase();
      return '<span class="pill ' + cls + '">' + escapeHtml(status || "UNKNOWN") + '</span>';
    }
    function renderTable(targetId, headers, rows) {
      const target = document.getElementById(targetId);
      const body = rows.length ? rows.map((row) => "<tr>" + row.map((cell) => "<td>" + cell + "</td>").join("") + "</tr>").join("") : '<tr><td colspan="' + headers.length + '">No rows in this view.</td></tr>';
      target.innerHTML = '<table><thead><tr>' + headers.map((header) => "<th>" + header + "</th>").join("") + '</tr></thead><tbody>' + body + "</tbody></table>";
    }
    function getFilteredTasks() {
      const query = taskSearch.value.trim().toLowerCase();
      const status = taskStatus.value;
      return payload.openTasks.filter((task) => {
        const matchesStatus = status === "ALL" || task.status === status;
        const matchesQuery = !query || [task.id, task.missionId, task.agentSlug, task.department].join(" ").toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
      });
    }
    function renderTasks() {
      renderTable("task-table", ["Task", "Mission", "Agent", "Department", "Status", "Updated"], getFilteredTasks().map((task) => [
        escapeHtml(task.id), escapeHtml(task.missionId), escapeHtml(task.agentSlug), escapeHtml(task.department), statusPill(task.status), escapeHtml(task.updatedAt)
      ]));
    }
    function renderApprovals() {
      const target = document.getElementById("approval-list");
      target.innerHTML = payload.approvalQueue.length ? payload.approvalQueue.map((item) => '<div class="mini"><strong>' + escapeHtml(item.id) + '</strong><div class="subtle">' + escapeHtml(item.missionId) + ' / ' + escapeHtml(item.taskId) + '</div><div>' + statusPill(item.status) + ' ' + escapeHtml(item.agentSlug) + '</div><div>Action: ' + escapeHtml(item.action) + '</div><div>Target: ' + escapeHtml(item.target) + '</div><div class="subtle">' + escapeHtml(item.nextAction) + '</div></div>').join("") : '<div class="mini">No approval items pending.</div>';
    }
    function renderDepartmentQueue() {
      renderTable("department-queue", ["Department", "Open Tasks", "Blocked", "Waiting Approval"], payload.departmentQueue.map((item) => [
        escapeHtml(item.department), escapeHtml(item.openTasks), escapeHtml(item.blockedTasks), escapeHtml(item.waitingApprovalTasks)
      ]));
    }
    function renderMissionList() {
      renderTable("mission-list", ["Mission", "Template", "Status", "Departments"], payload.latestMissions.map((mission) => [
        escapeHtml(mission.id), escapeHtml(mission.templateId), statusPill(mission.status), escapeHtml((mission.requiredDepartments || []).join(", "))
      ]));
    }
    function renderProductionControl() {
      const target = document.getElementById("production-control");
      if (!payload.productionPipeline) {
        target.innerHTML = '<div class="mini">No website-production mission has been executed yet.</div>';
        return;
      }
      target.innerHTML = payload.productionPipeline.stages.map((stage) => '<div class="stage"><strong>' + escapeHtml(stage.label) + '</strong><div>' + statusPill(stage.status) + '</div><div class="subtle">' + escapeHtml(stage.summary) + '</div></div>').join("");
    }
    function renderGrowthControl() {
      const target = document.getElementById("growth-control");
      if (!payload.growthPipeline) {
        target.innerHTML = '<div class="mini">No growth mission has been executed yet.</div>';
        return;
      }
      target.innerHTML = payload.growthPipeline.stages.map((stage) => '<div class="stage"><strong>' + escapeHtml(stage.label) + '</strong><div>' + statusPill(stage.status) + '</div><div class="subtle">' + escapeHtml(stage.summary) + '</div></div>').join("");
    }
    function renderProductionTasks() {
      renderTable("production-tasks", ["Task", "Agent", "Stage", "Status"], payload.productionTasks.map((task) => [
        escapeHtml(task.id), escapeHtml(task.agentSlug), escapeHtml(task.department), statusPill(task.status)
      ]));
    }
    function renderGrowthTasks() {
      renderTable("growth-tasks", ["Task", "Agent", "Stage", "Status"], payload.growthTasks.map((task) => [
        escapeHtml(task.id), escapeHtml(task.agentSlug), escapeHtml(task.department), statusPill(task.status)
      ]));
    }
    function renderRevenueSnapshot() {
      renderTable("revenue-snapshot", ["Metric", "Value"], [
        ["Growth missions", escapeHtml(payload.revenueSnapshot.growthMissionCount)],
        ["Revenue outputs", escapeHtml(payload.revenueSnapshot.revenueTaskCount)],
        ["Marketing outputs", escapeHtml(payload.revenueSnapshot.marketingTaskCount)],
        ["Search outputs", escapeHtml(payload.revenueSnapshot.searchTaskCount)],
        ["Latest revenue mission", escapeHtml(payload.revenueSnapshot.latestRevenueMission || "None yet")],
      ]);
    }
    function renderGrowthAnalytics() {
      renderTable("growth-analytics", ["Metric", "Value"], [
        ["Mission template", escapeHtml(payload.growthPipeline?.templateId || "None")],
        ["Mission status", escapeHtml(payload.growthPipeline?.status || "N/A")],
        ["Growth stages", escapeHtml(payload.growthPipeline?.stages?.length || 0)],
        ["Approval queue size", escapeHtml(payload.approvalQueue.length)],
      ]);
    }
    function renderIntelligenceControl() {
      const target = document.getElementById("intelligence-control");
      const intelligence = payload.intelligenceSummary;
      if (!intelligence) {
        target.innerHTML = '<div class="mini">No intelligence summary generated yet.</div>';
        return;
      }
      target.innerHTML = '<div class="list">' +
        (intelligence.recommendations || []).slice(0, 3).map((item) => '<div class="mini">' + escapeHtml(item) + '</div>').join("") +
      '</div>';
    }
    function renderForecastView() {
      const target = document.getElementById("forecast-view");
      const intelligence = payload.intelligenceSummary;
      if (!intelligence) {
        target.innerHTML = '<div class="mini">No forecast data generated yet.</div>';
        return;
      }
      target.innerHTML = '<div class="list">' +
        '<div class="mini"><strong>Mission mix</strong><div>' + escapeHtml((intelligence.forecastedMissionMix || []).join(", ") || "None") + '</div></div>' +
        '<div class="mini"><strong>Execution pressure</strong><div>' + escapeHtml(intelligence.executionPressure || "None") + '</div></div>' +
        '<div class="mini"><strong>Planning note</strong><div class="subtle">' + escapeHtml(intelligence.planningNote || "None") + '</div></div>' +
      '</div>';
    }
    function renderCompanyPortfolio() {
      renderTable("company-portfolio", ["Company", "Slug", "Missions", "Health"], (payload.companyPortfolio || []).map((item) => [
        escapeHtml(item.name), escapeHtml(item.slug), escapeHtml(item.missions), escapeHtml(item.healthScore + "/10")
      ]));
    }
    function renderTenantBoundaries() {
      const target = document.getElementById("tenant-boundaries");
      target.innerHTML = '<div class="list"><div class="mini">Company-specific reports stay inside the owning company folder.</div><div class="mini">Shared intelligence must be de-identified before crossing company boundaries.</div><div class="mini">CRM, revenue, and client details remain tenant-scoped unless a human explicitly approves sharing.</div></div>';
    }
    taskSearch.addEventListener("input", renderTasks);
    taskStatus.addEventListener("change", renderTasks);
    renderTasks();
    renderApprovals();
    renderDepartmentQueue();
    renderMissionList();
    renderProductionControl();
    renderProductionTasks();
    renderGrowthControl();
    renderGrowthTasks();
    renderRevenueSnapshot();
    renderGrowthAnalytics();
    renderIntelligenceControl();
    renderForecastView();
    renderCompanyPortfolio();
    renderTenantBoundaries();
  </script>
</body>
</html>`;
}

function renderMetricCard(label, value) {
  return `<div class="card"><strong>${escapeHtml(label)}</strong><div class="metric">${escapeHtml(value)}</div></div>`;
}

function renderMissionCollectionCard(title, items) {
  return `<section class="card"><h2>${escapeHtml(title)}</h2><div class="list">${renderMissionMiniList(items)}</div></section>`;
}

function renderTaskCollectionCard(title, items) {
  return `<section class="card"><h2>${escapeHtml(title)}</h2><div class="list">${renderTaskMiniList(items)}</div></section>`;
}

function renderApprovalCollectionCard(title, items) {
  return `<section class="card"><h2>${escapeHtml(title)}</h2><div class="list">${renderApprovalMiniList(items)}</div></section>`;
}

function renderMissionMiniList(items) {
  if (!items.length) {
    return `<div class="mini">No missions in this collection yet.</div>`;
  }
  return items
    .map((mission) => `<div class="mini"><strong>${escapeHtml(mission.templateId)}</strong><div>${escapeHtml(mission.companyId)}</div><div class="subtle">${escapeHtml(mission.status)} · ${escapeHtml(mission.id)}</div></div>`)
    .join("");
}

function renderTaskMiniList(items) {
  if (!items.length) {
    return `<div class="mini">No tasks in this collection yet.</div>`;
  }
  return items
    .map((task) => `<div class="mini"><strong>${escapeHtml(task.id)}</strong><div>${escapeHtml(task.agentSlug)}</div><div class="subtle">${escapeHtml(task.status)} · ${escapeHtml(task.missionId)}</div></div>`)
    .join("");
}

function renderApprovalMiniList(items) {
  if (!items.length) {
    return `<div class="mini">No approval items pending.</div>`;
  }
  return items
    .map((item) => `<div class="mini"><strong>${escapeHtml(item.action)}</strong><div>${escapeHtml(item.agentSlug)}</div><div class="subtle">${escapeHtml(item.status)} Â· ${escapeHtml(item.id)}</div><div class="subtle">${escapeHtml(item.nextAction)}</div></div>`)
    .join("");
}

function buildDepartmentQueue(tasks, departments) {
  return departments.map((department) => {
    const departmentTasks = tasks.filter((task) => task.department === department);
    return {
      department,
      openTasks: departmentTasks.filter((task) => !["COMPLETED", "ARCHIVED"].includes(task.status)).length,
      blockedTasks: departmentTasks.filter((task) => task.status === "BLOCKED").length,
      waitingApprovalTasks: departmentTasks.filter((task) => task.status === "WAITING_APPROVAL").length,
    };
  });
}

function buildProductionPipeline(mission, tasks) {
  const stages = [
    { id: "discovery", label: "Discovery", agents: ["SALES_CONSULTANT_AGENT"] },
    { id: "strategy", label: "Strategy", agents: ["PRODUCT_STRATEGIST_AGENT"] },
    { id: "architecture", label: "Information Architecture", agents: ["UI_UX_DESIGN_AGENT"] },
    { id: "design", label: "Brand And Design", agents: ["BRAND_DESIGN_AGENT"] },
    { id: "motion", label: "Motion Planning", agents: ["MOTION_GRAPHICS_AGENT"] },
    { id: "development", label: "Engineering", agents: ["FRONTEND_ENGINEER_AGENT", "BACKEND_ENGINEER_AGENT"] },
    { id: "search", label: "SEO / AEO / GEO", agents: ["SEO_AGENT", "AEO_AGENT", "GEO_AGENT"] },
    { id: "quality", label: "Performance / Accessibility / QA", agents: ["PERFORMANCE_ENGINEER_AGENT", "ACCESSIBILITY_ENGINEER_AGENT", "QA_ENGINEER_AGENT"] },
    { id: "client", label: "Client Review", agents: ["CLIENT_SUCCESS_AGENT"] },
    { id: "launch", label: "Launch Prep", agents: ["DEPLOYMENT_ENGINEER_AGENT", "DOCUMENTATION_AGENT", "KNOWLEDGE_MANAGER_AGENT"] },
  ];

  return {
    missionId: mission.id,
    companyId: mission.companyId,
    status: mission.status,
    stages: stages.map((stage) => summarizeStage(stage, tasks)),
  };
}

function buildGrowthPipeline(mission, tasks) {
  const stages = [
    { id: "research", label: "Research And Audits", agents: ["MARKETING_STRATEGIST_AGENT", "LEAD_RESEARCH_AGENT", "WEBSITE_AUDIT_AGENT", "BUSINESS_INTELLIGENCE_AGENT"] },
    { id: "content", label: "Content And Publishing", agents: ["CONTENT_STRATEGIST_AGENT", "EDITORIAL_MANAGER_AGENT", "COPYWRITER_AGENT", "INTERNAL_LINKING_AGENT", "SOCIAL_MEDIA_AGENT"] },
    { id: "search", label: "SEO / AEO / GEO", agents: ["SEO_AGENT", "TECHNICAL_SEO_AGENT", "SCHEMA_AGENT", "AEO_AGENT", "GEO_AGENT"] },
    { id: "revenue", label: "Revenue And CRO", agents: ["ANALYTICS_AGENT", "CRO_AGENT", "REVENUE_OPERATIONS_AGENT", "ADSENSE_AGENT", "AFFILIATE_MANAGER_AGENT", "DIGITAL_PRODUCT_AGENT", "NEWSLETTER_AGENT"] },
    { id: "crm", label: "CRM And Outreach Prep", agents: ["CRM_AGENT", "OUTREACH_DRAFTING_AGENT", "FOLLOW_UP_AGENT"] },
    { id: "closeout", label: "QA / Knowledge / Documentation", agents: ["QA_ENGINEER_AGENT", "KNOWLEDGE_MANAGER_AGENT", "DOCUMENTATION_AGENT"] },
  ];

  return {
    missionId: mission.id,
    companyId: mission.companyId,
    templateId: mission.templateId,
    status: mission.status,
    stages: stages.map((stage) => summarizeStage(stage, tasks)),
  };
}

function summarizeStage(stage, tasks) {
  const stageTasks = tasks.filter((task) => stage.agents.includes(task.agentSlug));
  if (!stageTasks.length) {
    return { label: stage.label, status: "READY", summary: "Stage not routed in this mission." };
  }
  if (stageTasks.some((task) => task.status === "BLOCKED")) {
    return { label: stage.label, status: "BLOCKED", summary: `${stageTasks.filter((task) => task.status === "BLOCKED").length} blocked task(s).` };
  }
  if (stageTasks.some((task) => task.status === "WAITING_APPROVAL")) {
    return { label: stage.label, status: "WAITING_APPROVAL", summary: `${stageTasks.filter((task) => task.status === "WAITING_APPROVAL").length} approval-gated task(s).` };
  }
  if (stageTasks.every((task) => task.status === "COMPLETED")) {
    return { label: stage.label, status: "COMPLETED", summary: stageTasks.map((task) => task.expectedOutput).join(", ") };
  }
  return { label: stage.label, status: "IN_PROGRESS", summary: `${stageTasks.length} active task(s).` };
}

function buildRevenueSnapshot(growthMissions, latestGrowthTasks) {
  return {
    growthMissionCount: growthMissions.length,
    revenueTaskCount: latestGrowthTasks.filter((task) => task.department === "revenue").length,
    marketingTaskCount: latestGrowthTasks.filter((task) => task.department === "marketing").length,
    searchTaskCount: latestGrowthTasks.filter((task) => task.department === "search").length,
    latestRevenueMission: growthMissions.find((mission) => mission.templateId === "REVENUE_OPPORTUNITY_REVIEW")?.id ?? null,
  };
}

function unique(values) {
  return [...new Set(values)];
}

function serializeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
