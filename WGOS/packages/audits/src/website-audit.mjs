import * as cheerio from "cheerio";

export async function auditWebsiteUrl(url, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(url);
  const html = await response.text();
  return auditWebsiteHtml({ url, html, status: response.status });
}

export function auditWebsiteHtml({ url = "local-html", html, status = 200 }) {
  const $ = cheerio.load(html);
  const title = normalize($("title").first().text());
  const description = normalize($('meta[name="description"]').attr("content") ?? "");
  const h1 = $("h1").map((_, element) => normalize($(element).text())).get().filter(Boolean);
  const h2 = $("h2").map((_, element) => normalize($(element).text())).get().filter(Boolean);
  const links = $("a[href]").map((_, element) => $(element).attr("href")).get().filter(Boolean);
  const images = $("img").map((_, element) => ({
    src: $(element).attr("src") ?? "",
    alt: $(element).attr("alt") ?? "",
  })).get();
  const forms = $("form").length;

  const issues = [];
  if (!title) issues.push(issue("Missing title", "SEO", "HIGH", "Add a specific page title."));
  if (title.length > 65) issues.push(issue("Long title", "SEO", "MEDIUM", "Keep title near 50-60 characters when possible."));
  if (!description) issues.push(issue("Missing meta description", "SEO", "HIGH", "Add a clear meta description."));
  if (h1.length !== 1) issues.push(issue("H1 count issue", "Accessibility", "MEDIUM", "Use exactly one clear H1 on the audited page."));
  if (images.some((image) => image.src && !image.alt)) {
    issues.push(issue("Images without alt text", "Accessibility", "MEDIUM", "Add descriptive alt text or empty alt for decorative images."));
  }
  if (!forms && /contact|book|quote|lead|consult/i.test(html)) {
    issues.push(issue("Conversion path unclear", "CRO", "LOW", "Confirm the page has a clear contact, booking, or inquiry path."));
  }

  return {
    url,
    status,
    title,
    description,
    h1,
    h2,
    counts: {
      links: links.length,
      images: images.length,
      imagesMissingAlt: images.filter((image) => image.src && !image.alt).length,
      forms,
    },
    issues,
    score: scoreFromIssues(issues),
  };
}

export function renderWebsiteAuditMarkdown(audit) {
  return `# Website Audit

- URL: ${audit.url}
- HTTP Status: ${audit.status}
- Score: ${audit.score}/100
- Title: ${audit.title || "missing"}
- Description: ${audit.description || "missing"}
- H1 Count: ${audit.h1.length}
- Links: ${audit.counts.links}
- Images: ${audit.counts.images}
- Images Missing Alt: ${audit.counts.imagesMissingAlt}
- Forms: ${audit.counts.forms}

## Issues

${audit.issues.length ? audit.issues.map((item) => `- ${item.priority}: ${item.title} (${item.category}) - ${item.recommendation}`).join("\n") : "- No issues found by the local audit engine."}
`;
}

function issue(title, category, priority, recommendation) {
  return { title, category, priority, recommendation };
}

function scoreFromIssues(issues) {
  const penalty = issues.reduce((sum, item) => {
    if (item.priority === "HIGH") return sum + 20;
    if (item.priority === "MEDIUM") return sum + 10;
    return sum + 5;
  }, 0);
  return Math.max(0, 100 - penalty);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}
