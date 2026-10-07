/* GET /api/inventory — live stock from Square, for the SOLD OUT / FEW LEFT badges.
 *
 * Vercel serverless function (Node). Reads these environment variables
 * (Vercel → Project → Settings → Environment Variables):
 *
 *   SQUARE_ACCESS_TOKEN   required. Without it the endpoint answers
 *                         { items: [], skipped: "no-token" } and the site shows no badges.
 *   SQUARE_LOCATION_ID    optional. Limit counts to one location.
 *   SQUARE_ENVIRONMENT    optional. "sandbox" to use the Square sandbox; default production.
 *   SQUARE_LOW_STOCK      optional. Quantity at or below which an item is "low". Default 3.
 *
 * Response: { items: [{ name, kind, status, quantity }] }
 *   status is "soldout" | "low" | "ok"; kind is "bingsu" | "cup" | "hot" when the
 *   Square category name makes it obvious, otherwise omitted. app.js and live.js
 *   match names loosely, so Square item names only need to resemble menu names.
 * Any Square failure answers { items: [], skipped: "square-error" } so the menu
 * is never blocked by the integration.
 */

const SQUARE_VERSION = "2025-01-23";

function squareBase() {
  return process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

async function square(path, init = {}) {
  const res = await fetch(squareBase() + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Square ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

function kindFromCategory(name) {
  const n = String(name || "").toLowerCase();
  if (!n) return undefined;
  if (/\bcup/.test(n)) return "cup";
  if (/taiyaki|cookie|hot|fresh|snack/.test(n)) return "hot";
  if (/bingsu|bingsoo|shaved|snow|ice/.test(n)) return "bingsu";
  return undefined;
}

async function listCatalog() {
  const categories = new Map();
  const items = [];
  let cursor;
  do {
    const q = new URLSearchParams({ types: "ITEM,CATEGORY" });
    if (cursor) q.set("cursor", cursor);
    const page = await square(`/v2/catalog/list?${q}`);
    for (const obj of page.objects || []) {
      if (obj.type === "CATEGORY") categories.set(obj.id, obj.category_data?.name);
      if (obj.type === "ITEM" && !obj.is_deleted) items.push(obj);
    }
    cursor = page.cursor;
  } while (cursor);
  return { categories, items };
}

async function inventoryCounts(variationIds, locationId) {
  const counts = new Map();
  for (let i = 0; i < variationIds.length; i += 100) {
    const body = {
      catalog_object_ids: variationIds.slice(i, i + 100),
      states: ["IN_STOCK"],
    };
    if (locationId) body.location_ids = [locationId];
    let cursor;
    do {
      const page = await square("/v2/inventory/counts/batch-retrieve", {
        method: "POST",
        body: JSON.stringify(cursor ? { ...body, cursor } : body),
      });
      for (const c of page.counts || []) {
        counts.set(c.catalog_object_id, (counts.get(c.catalog_object_id) || 0) + Number(c.quantity || 0));
      }
      cursor = page.cursor;
    } while (cursor);
  }
  return counts;
}

function statusFor(quantity, soldOutFlag, low) {
  if (soldOutFlag || quantity <= 0) return "soldout";
  if (quantity <= low) return "low";
  return "ok";
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=60");

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    return res.end(JSON.stringify({ error: "method-not-allowed" }));
  }
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return res.end(JSON.stringify({ items: [], skipped: "no-token" }));
  }

  try {
    const locationId = process.env.SQUARE_LOCATION_ID || undefined;
    const low = Number(process.env.SQUARE_LOW_STOCK) > 0 ? Number(process.env.SQUARE_LOW_STOCK) : 3;
    const { categories, items } = await listCatalog();

    const variationToItem = new Map();
    const kindByItem = new Map();
    const soldOutItems = new Set();
    for (const item of items) {
      const data = item.item_data || {};
      const categoryId = data.reporting_category?.id || data.categories?.[0]?.id || data.category_id;
      const kind = kindFromCategory(categories.get(categoryId));
      kindByItem.set(data.name, kind);
      for (const v of data.variations || []) {
        variationToItem.set(v.id, { name: data.name, kind });
        const overrides = v.item_variation_data?.location_overrides || [];
        if (overrides.some((o) => o.sold_out && (!locationId || o.location_id === locationId))) {
          soldOutItems.add(data.name);
        }
      }
    }

    const counts = await inventoryCounts([...variationToItem.keys()], locationId);

    const byItem = new Map();
    for (const [variationId, quantity] of counts) {
      const meta = variationToItem.get(variationId);
      if (!meta) continue;
      const cur = byItem.get(meta.name) || { name: meta.name, kind: meta.kind, quantity: 0 };
      cur.quantity += quantity;
      byItem.set(meta.name, cur);
    }
    for (const name of soldOutItems) {
      if (!byItem.has(name)) byItem.set(name, { name, kind: kindByItem.get(name), quantity: 0 });
    }

    const result = [...byItem.values()].map((it) => {
      const out = { name: it.name, status: statusFor(it.quantity, soldOutItems.has(it.name), low), quantity: it.quantity };
      if (it.kind) out.kind = it.kind;
      return out;
    });
    res.end(JSON.stringify({ items: result }));
  } catch (err) {
    console.error("inventory:", err.message);
    res.end(JSON.stringify({ items: [], skipped: "square-error" }));
  }
};
