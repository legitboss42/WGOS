import { auditWebsiteUrl } from "../../audits/src/website-audit.mjs";
import { getCapabilityState, requireReadOnlyCapability } from "./capability-registry.mjs";
import { runLocalLighthouseAudit } from "./lighthouse-runner.mjs";

export function createControlledBrowserAdapter({ env = process.env } = {}) {
  return {
    id: "browser",
    capability: () => getCapabilityState("browser", env),
    async inspectUrl(url, options = {}) {
      const capability = requireReadOnlyCapability("browser", env);
      if (!capability.ok) {
        return pausedResult("browser", "inspect_url", capability.pause);
      }

      if (options.fetchFallback) {
        const audit = await auditWebsiteUrl(url, { fetchImpl: options.fetchImpl ?? fetch });
        return successResult("browser", "inspect_url", { url, audit, evidence: "http_fetch_fallback" });
      }

      return pausedResult("browser", "inspect_url", {
        status: "WAITING_BROWSER_IMPLEMENTATION",
        reason: "Browser capability is marked available, but no attached browser command surface was passed to this adapter.",
        requiredHumanAction: "Run through an attached Browser or Chrome control surface before live navigation.",
      });
    },
  };
}

export function createSearchConsoleAdapter({ env = process.env } = {}) {
  return {
    id: "search-console",
    capability: () => getCapabilityState("search-console", env),
    async readProperty(propertyUrl) {
      const capability = requireReadOnlyCapability("search-console", env);
      if (!capability.ok) {
        return pausedResult("search-console", "read_property", capability.pause);
      }

      return successResult("search-console", "read_property", {
        propertyUrl,
        note: "Read-only Search Console connector is available. Provider-specific API read implementation is the next adapter step.",
      });
    },
  };
}

export function createGa4Adapter({ env = process.env } = {}) {
  return {
    id: "ga4",
    capability: () => getCapabilityState("ga4", env),
    async readProperty(propertyId) {
      const capability = requireReadOnlyCapability("ga4", env);
      if (!capability.ok) {
        return pausedResult("ga4", "read_property", capability.pause);
      }

      return successResult("ga4", "read_property", {
        propertyId,
        note: "Read-only GA4 connector is available. Provider-specific API read implementation is the next adapter step.",
      });
    },
  };
}

export function createPageSpeedAdapter({ env = process.env } = {}) {
  return {
    id: "pagespeed",
    capability: () => getCapabilityState("pagespeed", env),
    async inspectUrl(url) {
      const capability = requireReadOnlyCapability("pagespeed", env);
      if (!capability.ok) {
        return pausedResult("pagespeed", "inspect_url", capability.pause);
      }

      const apiKey = env.PAGESPEED_API_KEY;
      const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
      endpoint.searchParams.set("url", url);
      endpoint.searchParams.append("category", "performance");
      endpoint.searchParams.append("category", "seo");
      if (apiKey) endpoint.searchParams.set("key", apiKey);

      const response = await fetch(endpoint);
      const body = await response.json();
      return successResult("pagespeed", "inspect_url", {
        url,
        status: response.status,
        categories: body.lighthouseResult?.categories ?? {},
      });
    },
  };
}

export function createLighthouseAdapter({ env = process.env } = {}) {
  return {
    id: "lighthouse",
    capability: () => getCapabilityState("lighthouse", env),
    async inspectUrl(url, options = {}) {
      const capability = requireReadOnlyCapability("lighthouse", env);
      if (!capability.ok) {
        return pausedResult("lighthouse", "inspect_url", capability.pause);
      }

      const audit = await (options.runner ?? runLocalLighthouseAudit)(url);
      return successResult("lighthouse", "inspect_url", audit);
    },
  };
}

export function createReadOnlyIntegrationAdapters(options = {}) {
  return {
    browser: createControlledBrowserAdapter(options),
    searchConsole: createSearchConsoleAdapter(options),
    ga4: createGa4Adapter(options),
    pagespeed: createPageSpeedAdapter(options),
    lighthouse: createLighthouseAdapter(options),
  };
}

function pausedResult(integrationId, action, pause) {
  return {
    integrationId,
    action,
    status: "PAUSED",
    data: null,
    pause,
  };
}

function successResult(integrationId, action, data) {
  return {
    integrationId,
    action,
    status: "SUCCESS",
    data,
    pause: null,
  };
}
