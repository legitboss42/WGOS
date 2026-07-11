export async function runLocalLighthouseAudit(url, options = {}) {
  const lighthouseModule = await import("lighthouse");
  const chromeLauncher = await import("chrome-launcher");
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--disable-gpu", "--no-sandbox"],
  });

  try {
    const runnerResult = await lighthouseModule.default(
      url,
      {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: options.onlyCategories ?? ["performance", "accessibility", "best-practices", "seo"],
      },
      null
    );

    const lhr = runnerResult.lhr;
    return {
      url,
      finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl ?? url,
      fetchTime: lhr.fetchTime,
      categories: Object.fromEntries(
        Object.entries(lhr.categories ?? {}).map(([key, value]) => [
          key,
          {
            title: value.title,
            score: value.score,
          },
        ])
      ),
      audits: pickAudits(lhr.audits ?? {}, [
        "first-contentful-paint",
        "largest-contentful-paint",
        "cumulative-layout-shift",
        "total-blocking-time",
        "interactive",
        "document-title",
        "meta-description",
        "link-text",
        "image-alt",
        "canonical",
        "robots-txt",
      ]),
    };
  } finally {
    await chrome.kill();
  }
}

export function renderLighthouseMarkdown(result) {
  return `# Lighthouse Read-Only Audit

- URL: ${result.url}
- Final URL: ${result.finalUrl}
- Fetch Time: ${result.fetchTime}

## Category Scores

${Object.entries(result.categories).map(([key, value]) => `- ${key}: ${formatScore(value.score)} (${value.title})`).join("\n")}

## Key Audits

${Object.entries(result.audits).map(([key, value]) => `- ${key}: ${formatScore(value.score)} - ${value.title}`).join("\n")}
`;
}

function pickAudits(audits, keys) {
  return Object.fromEntries(
    keys
      .filter((key) => audits[key])
      .map((key) => [
        key,
        {
          title: audits[key].title,
          score: audits[key].score,
          displayValue: audits[key].displayValue ?? null,
        },
      ])
  );
}

function formatScore(score) {
  if (score === null || score === undefined) return "n/a";
  return `${Math.round(score * 100)}/100`;
}
