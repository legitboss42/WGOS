import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getCapabilityState } from "../packages/integrations/src/capability-registry.mjs";
import { createControlledBrowserAdapter, createLighthouseAdapter, createSearchConsoleAdapter } from "../packages/integrations/src/read-only-adapters.mjs";
import { logIntegrationEvent } from "../packages/integrations/src/integration-logger.mjs";
import { renderLighthouseMarkdown } from "../packages/integrations/src/lighthouse-runner.mjs";

test("capability registry reports unavailable integrations truthfully", () => {
  const state = getCapabilityState("browser", {});

  assert.equal(state.status, "UNAVAILABLE");
  assert.equal(state.available, false);
  assert.match(state.reason, /No live connector/);
});

test("read-only adapters pause when capability is unavailable", async () => {
  const searchConsole = createSearchConsoleAdapter({ env: {} });
  const result = await searchConsole.readProperty("https://webgrowth.info/");

  assert.equal(result.status, "PAUSED");
  assert.equal(result.pause.status, "WAITING_CAPABILITY");
  assert.match(result.pause.requiredHumanAction, /Attach or configure/);
});

test("controlled browser adapter can run read-only local audit when explicitly enabled", async () => {
  const browser = createControlledBrowserAdapter({ env: { WGOS_BROWSER_CONTROL: "enabled" } });
  const result = await browser.inspectUrl("https://example.test/", {
    fetchFallback: true,
    fetchImpl: async () => ({
      status: 200,
      text: async () => "<html><head><title>Example</title></head><body><h1>Example</h1><img src='/x.jpg'></body></html>",
    }),
  });

  assert.equal(result.status, "SUCCESS");
  assert.equal(result.data.audit.title, "Example");
  assert.equal(result.data.audit.counts.imagesMissingAlt, 1);
});

test("integration logger writes jsonl audit records", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wgos-integration-log-"));
  await logIntegrationEvent(root, {
    integrationId: "browser",
    action: "capability_check",
    result: "UNAVAILABLE",
    approval: "WAITING_CAPABILITY",
  });

  const log = await fs.readFile(path.join(root, "logs", "integrations", "browser.jsonl"), "utf8");
  const record = JSON.parse(log.trim());
  assert.equal(record.integrationId, "browser");
  assert.equal(record.action, "capability_check");
  assert.equal(record.result, "UNAVAILABLE");
});

test("lighthouse adapter runs read-only audit when explicitly enabled", async () => {
  const lighthouse = createLighthouseAdapter({ env: { WGOS_LIGHTHOUSE_LOCAL: "enabled" } });
  const result = await lighthouse.inspectUrl("https://example.test/", {
    runner: async (url) => ({
      url,
      finalUrl: url,
      fetchTime: "2026-07-10T00:00:00.000Z",
      categories: {
        performance: { title: "Performance", score: 0.91 },
        seo: { title: "SEO", score: 1 },
      },
      audits: {
        "document-title": { title: "Document has a title", score: 1 },
      },
    }),
  });

  assert.equal(result.status, "SUCCESS");
  assert.equal(result.data.categories.performance.score, 0.91);
  assert.match(renderLighthouseMarkdown(result.data), /Lighthouse Read-Only Audit/);
});
