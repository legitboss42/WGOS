const envCapabilityMap = {
  browser: "WGOS_BROWSER_CONTROL",
  "search-console": "WGOS_SEARCH_CONSOLE_READONLY",
  ga4: "WGOS_GA4_READONLY",
  pagespeed: "WGOS_PAGESPEED_READONLY",
  lighthouse: "WGOS_LIGHTHOUSE_LOCAL",
};

export function getCapabilityState(integrationId, env = process.env) {
  const envKey = envCapabilityMap[integrationId];
  const raw = envKey ? String(env[envKey] ?? "").toLowerCase() : "";
  const available = ["1", "true", "enabled", "attached", "available"].includes(raw);

  return {
    integrationId,
    available,
    source: envKey ? `env:${envKey}` : "unregistered",
    status: available ? "AVAILABLE" : "UNAVAILABLE",
    reason: available
      ? "Capability was explicitly enabled for this process."
      : "No live connector or approved session capability is configured for this process.",
  };
}

export function getAllCapabilityStates(env = process.env) {
  return Object.keys(envCapabilityMap).map((integrationId) => getCapabilityState(integrationId, env));
}

export function requireReadOnlyCapability(integrationId, env = process.env) {
  const state = getCapabilityState(integrationId, env);
  if (!state.available) {
    return {
      ok: false,
      state,
      pause: {
        status: "WAITING_CAPABILITY",
        reason: state.reason,
        requiredHumanAction: "Attach or configure the read-only connector, then rerun the mission.",
      },
    };
  }

  return { ok: true, state, pause: null };
}
