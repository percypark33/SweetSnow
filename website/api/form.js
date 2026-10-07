/* POST /api/form — receives the two ballots in the Vote section of the home page (menu-idea, coming-soon-vote).
 *
 * The site runs on Vercel, which does not have Netlify Forms, so this function
 * is the form backend. It delivers each submission to whichever of these is
 * configured (Vercel → Project → Settings → Environment Variables); set at least one:
 *
 *   RESEND_API_KEY + FORM_TO_EMAIL   email every submission with Resend (https://resend.com).
 *   FORM_FROM_EMAIL                  optional sender for Resend; must be on a domain you
 *                                    verified there. Default: Sweet Snow <onboarding@resend.dev>
 *                                    (Resend's test sender — fine for low volume).
 *   FORM_WEBHOOK_URL                 optional. Also POST the submission as JSON to this URL
 *                                    (Zapier / Make / Google Apps Script → spreadsheet, etc.).
 *
 * Every submission is also written to the function log as one JSON line.
 * If nothing is configured the visitor sees a plain "not connected yet" page
 * instead of a false success, so a misconfiguration is visible immediately.
 *
 * On success the browser is redirected to /thanks (or gets { ok: true } for
 * fetch() callers that send Accept: application/json).
 */

const MAX_FIELD = 2000;
const KNOWN_FORMS = {
  "menu-idea": { required: ["idea"], label: "New flavor idea" },
  "coming-soon-vote": { required: ["first"], label: "Coming-soon vote" },
};

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body !== undefined) return resolve(req.body);
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 64 * 1024) req.destroy(); });
    req.on("end", () => resolve(raw));
    req.on("error", () => resolve(""));
  });
}

function toFields(body, contentType) {
  let entries;
  if (body && typeof body === "object") entries = Object.entries(body);
  else if (/json/.test(contentType)) {
    try { entries = Object.entries(JSON.parse(body || "{}")); } catch { entries = []; }
  } else entries = [...new URLSearchParams(String(body || ""))];
  const fields = {};
  for (const [k, v] of entries) {
    const key = String(k).slice(0, 64);
    const val = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    fields[key] = fields[key] ? `${fields[key]}, ${val}` : val.slice(0, MAX_FIELD).trim();
  }
  return fields;
}

function wantsJson(req) {
  return /application\/json/.test(req.headers.accept || "") && !/text\/html/.test(req.headers.accept || "");
}

function page(res, status, title, text) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Sweet Snow</title><link rel="icon" href="/assets/icon-32.png"><link rel="stylesheet" href="/designs/base.css"><link rel="stylesheet" href="/designs/showcase.css"></head><body class="theme-showcase"><main class="shell" style="padding-block:80px 60px;max-width:620px"><p class="eyebrow">Sweet Snow</p><h1 style="font-size:clamp(34px,5vw,52px);letter-spacing:-2px;line-height:1.05">${title}</h1><p style="font-size:16px;line-height:1.7;color:#656565">${text}</p><p style="margin-top:28px"><a class="button" href="/#vote">Back to the idea box</a></p></main></body></html>`);
}

async function sendResend(subject, text) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FORM_FROM_EMAIL || "Sweet Snow <onboarding@resend.dev>",
      to: process.env.FORM_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendWebhook(payload) {
  const res = await fetch(process.env.FORM_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return page(res, 405, "Nothing to see here", "This address only accepts form submissions from the Sweet Snow website.");
  }

  const fields = toFields(await readBody(req), req.headers["content-type"] || "");
  const formName = fields["form-name"] || "menu-idea";
  const spec = KNOWN_FORMS[formName];
  const json = wantsJson(req);

  // Honeypot: bots fill the hidden field. Pretend it worked and drop it.
  if (fields["bot-field"]) {
    if (json) { res.setHeader("Content-Type", "application/json"); return res.end('{"ok":true}'); }
    res.statusCode = 303; res.setHeader("Location", "/thanks"); return res.end();
  }
  if (!spec) return page(res, 400, "Unknown form", "That form is not one we know. Please go back and try again.");
  const missing = spec.required.filter((k) => !fields[k]);
  if (missing.length) {
    if (json) { res.statusCode = 400; res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify({ ok: false, missing })); }
    return page(res, 400, "Something's missing", `Please go back and fill in: ${missing.join(", ")}.`);
  }

  const submittedAt = new Date().toISOString();
  const data = Object.fromEntries(Object.entries(fields).filter(([k]) => k !== "form-name" && k !== "bot-field"));
  const payload = { form: formName, label: spec.label, submittedAt, fields: data, userAgent: req.headers["user-agent"] || "" };
  console.log(JSON.stringify({ type: "form-submission", ...payload }));

  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.FORM_TO_EMAIL);
  const hasWebhook = Boolean(process.env.FORM_WEBHOOK_URL);
  if (!hasResend && !hasWebhook) {
    console.error("form: no delivery configured (set RESEND_API_KEY + FORM_TO_EMAIL and/or FORM_WEBHOOK_URL)");
    if (json) { res.statusCode = 503; res.setHeader("Content-Type", "application/json"); return res.end('{"ok":false,"error":"not-configured"}'); }
    return page(res, 503, "Our idea box isn't connected yet", "Sorry — we couldn't save your message. Please send it to us on Instagram <a href=\"https://www.instagram.com/sweetsnow_oc/\" rel=\"noopener\">@sweetsnow_oc</a> or tell us in store.");
  }

  const text = [
    `${spec.label} from sweetsnow.org`,
    `When: ${submittedAt}`,
    "",
    ...Object.entries(data).map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const results = await Promise.allSettled([
    hasResend ? sendResend(`[sweetsnow.org] ${spec.label}`, text) : Promise.resolve(),
    hasWebhook ? sendWebhook(payload) : Promise.resolve(),
  ]);
  const failures = results.filter((r) => r.status === "rejected");
  failures.forEach((f) => console.error("form delivery:", f.reason?.message || f.reason));
  if (failures.length === results.length) {
    if (json) { res.statusCode = 502; res.setHeader("Content-Type", "application/json"); return res.end('{"ok":false,"error":"delivery-failed"}'); }
    return page(res, 502, "That didn't go through", "Sorry — something went wrong on our side. Please try again in a minute, or message us on Instagram <a href=\"https://www.instagram.com/sweetsnow_oc/\" rel=\"noopener\">@sweetsnow_oc</a>.");
  }

  if (json) { res.setHeader("Content-Type", "application/json"); return res.end('{"ok":true}'); }
  res.statusCode = 303;
  res.setHeader("Location", "/thanks");
  res.end();
};
