/* ============================================================
   SWEET SNOW — sweetsnow.org
   ------------------------------------------------------------
   Everything on the page is rendered from menu-2026-august.js so
   that a price never exists in two places. Sections are numbered
   in one continuous run (bingsu, then hot) because that is how
   guests order at the counter.
   ============================================================ */

(function () {
  "use strict";

  const M = window.MENU || {};
  const ART = window.MENU_ART || {};
  const $ = (id) => document.getElementById(id);

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const BING = M.bingsu || {};
  const FLAV = BING.flavors || [];

  const HOT_START = FLAV.length + 1;

  /* -------------------------------------------------------------
     Menu rows
     ------------------------------------------------------------- */

  // One row: order number, illustration, name, dot leader, price.
  function row(o) {
    const tape = o.badge
      ? `<span class="tape${
          o.badge === "SPECIAL" ? " special"
          : o.badge === "SIGNATURE" ? " signature"
          : o.badge === "COMING SOON" ? " soon"
          : ""
        }">${esc(o.badge)}</span>`
      : "";
    return `<li class="item${o.badge === "COMING SOON" ? " is-soon" : ""}" data-kind="${esc(o.kind || "bingsu")}" data-name="${esc(o.name)}">
      <span class="item-no">${o.n}</span>
      <span class="item-art" style="--halo:${o.halo || "#F5EFDC"}">${o.art}</span>
      <div class="item-body">
        <p class="item-line">
          <span class="item-nm">${esc(o.name)}${o.ko ? `<i class="ko">${esc(o.ko)}</i>` : ""}</span>
          <span class="item-dots" aria-hidden="true"></span>
          <span class="item-pr${o.up ? " up" : ""}">${esc(o.price)}</span>
        </p>
        ${o.ing ? `<p class="item-ing">${esc(o.ing)}</p>` : ""}
        ${tape}
      </div>
    </li>`;
  }

  function renderBingsu() {
    const base = BING.price || "";
    if ($("bingsuPrice")) $("bingsuPrice").textContent = "$" + base;
    if ($("bingsuNote")) $("bingsuNote").textContent = BING.priceNote || "";
    if ($("bingsuQuality")) $("bingsuQuality").textContent = BING.qualityNote || "";
    if ($("bingsuMix")) $("bingsuMix").textContent = BING.mixNote || "";

    const list = $("bingsuList");
    if (!list) return;
    list.innerHTML = FLAV.map((f, i) =>
      row({
        n: i + 1,
        art: ART.bowl ? ART.bowl(f.name) : "",
        halo: ART.halo ? ART.halo(f.name) : "",
        name: f.name,
        ko: f.ko,
        ing: f.ing,
        price: "$" + (f.price || base),
        up: Boolean(f.price && f.price !== base),
        badge: f.badge,
        kind: "bingsu"
      })
    ).join("");
  }

  function renderToppings() {
    const T = M.toppings || {};
    if ($("topNote")) $("topNote").textContent = T.note || "";

    const wrap = $("tiers");
    if (!wrap) return;
    // One red line per choice, so "pick a flavor" reads as a list
    // rather than a run-on line.
    const opts = (o) =>
      o
        ? `<ul class="t-opts">${[]
            .concat(o)
            .map((v) => `<li>${esc(v)}</li>`)
            .join("")}</ul>`
        : "";

    wrap.innerHTML = (T.tiers || [])
      .map(
        (t) => `<div class="tier">
          ${t.label ? `<p class="tier-label">${esc(t.label)}</p>` : ""}
          <p class="tier-price">+$${esc(t.price)}<small>each</small></p>
          <ul class="tier-items">
            ${(t.items || [])
              .map(
                (it) => `<li>
                  <span class="t-row"><span class="t-nm">${esc(it.en)}</span>${
                    it.ko ? `<span class="ko">${esc(it.ko)}</span>` : ""
                  }</span>
                  ${opts(it.opts)}
                </li>`
              )
              .join("")}
          </ul>
        </div>`
      )
      .join("");
    if ($("fruitNote")) $("fruitNote").textContent = T.fruitNote || "";
  }

  function renderHot() {
    const list = $("hotList");
    if (!list) return;

    const TK = M.taiyaki || {};
    const IC = M.taiyakiIce || {};
    const DB = M.dubaiTaiyaki || {};
    const CK = M.cookie || {};

    const rows = [
      {
        n: HOT_START,
        art: ART.fish ? ART.fish() : "",
        halo: "#FDF0D4",
        name: TK.title,
        ko: TK.ko,
        ing: [TK.fillings, TK.note].filter(Boolean).join(" · "),
        price: "$" + (TK.price || ""),
        kind: "hot"
      },
      {
        n: HOT_START + 1,
        art: ART.iceFish ? ART.iceFish() : "",
        halo: "#FFF3DC",
        name: IC.title,
        ko: IC.ko,
        ing: IC.note,
        price: "$" + (IC.price || ""),
        kind: "hot"
      },
      {
        n: HOT_START + 2,
        art: ART.dubaiFish ? ART.dubaiFish() : "",
        halo: "#F0E3D2",
        name: DB.title,
        ko: DB.ko,
        ing: DB.note,
        price: "$" + (DB.price || ""),
        kind: "hot"
      },
      {
        n: HOT_START + 3,
        art: ART.cookie ? ART.cookie() : "",
        halo: "#EEF0DC",
        name: CK.title,
        ko: CK.ko,
        ing: [CK.sub, CK.warn].filter(Boolean).join(" · "),
        price: "$" + (CK.price || ""),
        kind: "hot"
      }
    ];

    list.innerHTML = rows.map(row).join("");

    const deals = $("deals");
    if (deals) {
      deals.innerHTML =
        (TK.deals || [])
          .map((d) => `<span class="deal">${esc(d.qty)} — $${esc(d.price)}</span>`)
          .join("") + (TK.dealNote ? `<span class="deal-note">${esc(TK.dealNote)}</span>` : "");
    }
  }

  /* -------------------------------------------------------------
     Masthead art + index bar
     ------------------------------------------------------------- */

  function renderMastArt() {
    const el = $("mastArt");
    if (!el || !ART.bowl) return;
    el.innerHTML = ["Strawberry", "Mango", "Injeolmi"]
      .map((f) => `<span>${ART.bowl(f)}</span>`)
      .join("");
  }

  // Deliberately short. The menu isn't long enough to need splitting up.
  //
  // `covers` lets one link stay highlighted across several sections, so
  // Menu stays lit for the whole menu.
  const NAV = [
    { href: "#menu", label: "Menu", pri: true, covers: ["menu", "bingsu", "toppings", "hot"] },
    { href: "#visit", label: "Visit", covers: ["visit"] },
    { href: "#vote", label: "Vote", act: true, covers: ["vote"] }
  ];

  function renderIndex() {
    const bar = $("indexBar");
    if (!bar) return;
    bar.innerHTML =
      `<div class="index-track">` +
      NAV.map((l) => {
        const cls = [l.pri && "pri", l.act && "act"].filter(Boolean).join(" ");
        return `<a class="${cls}" href="${l.href}">${esc(l.label)}</a>`;
      }).join("") +
      `</div>`;
  }

  /* -------------------------------------------------------------
     Hours + live open/closed
     ------------------------------------------------------------- */

  const DAY_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DAY_IX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const toMin = (hhmm) => {
    const [h, m] = String(hhmm).split(":").map(Number);
    return h * 60 + (m || 0);
  };

  // "21:30" -> "9:30pm" · "12:00" -> "12pm"
  function fmt12(hhmm) {
    const [h, m] = String(hhmm).split(":").map(Number);
    const suffix = h >= 12 ? "pm" : "am";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return hr + (m ? ":" + String(m).padStart(2, "0") : "") + suffix;
  }
  const fmtShort = (hhmm) => {
    const [h, m] = String(hhmm).split(":").map(Number);
    const hr = h % 12 === 0 ? 12 : h % 12;
    return hr + ":" + String(m || 0).padStart(2, "0");
  };

  // Read the clock in the shop's timezone, not the visitor's, so the
  // status is right for someone checking from out of state.
  function shopClock() {
    try {
      const p = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(new Date());
      const get = (t) => (p.find((x) => x.type === t) || {}).value;
      const day = DAY_IX[get("weekday")];
      const hour = parseInt(get("hour"), 10) % 24;
      return { day: day, min: hour * 60 + parseInt(get("minute"), 10) };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function statusText() {
    const S = M.schedule;
    if (!S) return null;
    const now = shopClock();
    const today = S[now.day];

    if (today) {
      const o = toMin(today.open);
      const c = toMin(today.close);
      if (now.min >= o && now.min < c) {
        return { open: true, text: "Open now · until " + fmt12(today.close) };
      }
      if (now.min < o) {
        return { open: false, text: "Closed · opens at " + fmt12(today.open) };
      }
    }

    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      if (S[d]) {
        const when = i === 1 ? "tomorrow" : DAY_NAME[d];
        return { open: false, text: "Closed · opens " + when + " at " + fmt12(S[d].open) };
      }
    }
    return null;
  }

  function renderHours() {
    const list = $("hours");
    const rows = M.hours || [];
    const S = M.schedule || {};
    const now = shopClock();
    const today = S[now.day];

    if (list) {
      list.innerHTML = rows
        .map((h) => {
          // Match today to a display row: no hours today means the
          // "closed" line, otherwise the row quoting today's close.
          const isToday = today
            ? Boolean(h.time) && h.time.indexOf(fmtShort(today.close)) !== -1
            : !h.time;
          return `<li${isToday ? ' class="is-today"' : ""}>
            <span class="h-day">${esc(h.days)}</span>
            ${h.time ? '<span class="h-dots" aria-hidden="true"></span>' : ""}
            ${h.time ? `<span class="h-time">${esc(h.time)}</span>` : ""}
          </li>`;
        })
        .join("");
    }

    const st = statusText();
    [$("status"), $("status2")].forEach((el) => {
      if (!el || !st) return;
      el.textContent = st.text;
      el.classList.add(st.open ? "is-open" : "is-closed");
    });
  }

  /* -------------------------------------------------------------
     The ballot
     ------------------------------------------------------------- */

  function chips(name, values) {
    return values
      .map(
        (v) => `<label class="chip">
          <input type="checkbox" name="${name}" value="${esc(v)}" />
          <span>${esc(v)}</span>
        </label>`
      )
      .join("");
  }

  function renderSurvey() {
    const S = M.survey || {};
    if ($("qCategories")) $("qCategories").innerHTML = chips("want", S.categories || []);
    if ($("qFlavors")) $("qFlavors").innerHTML = chips("flavors", S.flavors || []);
  }

  /* -------------------------------------------------------------
     Menu structured data for Google
     ------------------------------------------------------------- */

  function injectMenuSchema() {
    const base = BING.price;
    const section = (name, items) => ({
      "@type": "MenuSection",
      name: name,
      hasMenuItem: items
    });
    const item = (n, desc, price) => ({
      "@type": "MenuItem",
      name: n,
      description: desc || undefined,
      offers: { "@type": "Offer", price: price, priceCurrency: "USD" }
    });

    const sections = [
      section(
        "Premium Bingsu",
        FLAV.map((f) => item(f.name + " Bingsu", f.ing, f.price || base))
      ),
      section(
        "Hot & Fresh",
        [M.taiyaki, M.taiyakiIce, M.dubaiTaiyaki, M.cookie]
          .filter(Boolean)
          .map((x) => item(x.title, x.sub || x.note, x.price))
      )
    ];

    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "@id": "https://sweetsnow.org/#menu",
      name: "Sweet Snow Menu",
      inLanguage: "en",
      hasMenuSection: sections
    });
    document.head.appendChild(tag);
  }

  /* -------------------------------------------------------------
     Chrome: reveal on scroll, active section in the index bar
     ------------------------------------------------------------- */

  function wireReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
  }

  function wireIndexSpy() {
    const bar = $("indexBar");
    if (!bar || !("IntersectionObserver" in window)) return;
    const links = Array.prototype.slice.call(bar.querySelectorAll("a[href^='#']"));

    // section id -> the nav link that should light up for it
    const owner = {};
    NAV.forEach((l) => (l.covers || []).forEach((id) => (owner[id] = l.href)));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const href = owner[entry.target.id];
          if (!href) return;
          links.forEach((a) => a.classList.toggle("is-here", a.getAttribute("href") === href));
          const active = bar.querySelector("a.is-here");
          // Keep the current chip in view on narrow screens.
          if (active && bar.scrollWidth > bar.clientWidth) {
            bar.scrollTo({ left: active.offsetLeft - 16, behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    Object.keys(owner).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* -------------------------------------------------------------
     Live Square inventory
     ------------------------------------------------------------- */

  function normName(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/bingsu|bingsoo|premium|shaved ice|snow/g, " ")
      .replace(/[^a-z0-9가-힣]+/g, " ")
      .trim();
  }

  function stockScore(menuName, menuKind, sq) {
    const a = normName(menuName);
    const b = normName(sq.name).replace(/\bcup\b/g, " ").replace(/\s+/g, " ").trim();
    if (!a || !b) return 0;
    let s = 0;
    if (a === b) s = 90;
    else if (b.indexOf(a) !== -1 || a.indexOf(b) !== -1) s = 70;
    else return 0;
    if (sq.kind === menuKind) s += 20;
    else if (sq.kind && sq.kind !== menuKind) s -= 25;
    return s;
  }

  function markStock(el, status) {
    if (el.classList.contains("is-soon")) return;
    el.classList.remove("is-soldout", "is-low");
    el.querySelectorAll(".tape.soldout, .tape.few").forEach((n) => n.remove());
    const body = el.querySelector(".item-body");
    if (!body) return;
    if (status === "soldout") {
      el.classList.add("is-soldout");
      body.insertAdjacentHTML("beforeend", '<span class="tape soldout">SOLD OUT</span>');
    } else if (status === "low") {
      el.classList.add("is-low");
      body.insertAdjacentHTML("beforeend", '<span class="tape few">FEW LEFT</span>');
    }
  }

  async function applyInventory() {
    try {
      const res = await fetch("/api/inventory", { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const data = await res.json();
      const stock = data.items || [];
      if (!stock.length) return;
      document.querySelectorAll(".item[data-name]").forEach((el) => {
        const name = el.getAttribute("data-name") || "";
        const kind = el.getAttribute("data-kind") || "bingsu";
        let best = null;
        let bestScore = 50;
        stock.forEach((sq) => {
          const n = stockScore(name, kind, sq);
          if (n > bestScore) {
            bestScore = n;
            best = sq;
          }
        });
        if (best) markStock(el, best.status);
      });
    } catch (e) {
      /* Local preview and Square outages keep the menu as-is. */
    }
  }

  function init() {
    renderMastArt();
    renderIndex();
    renderBingsu();
    renderToppings();
    renderHot();
    renderSurvey();
    renderHours();
    injectMenuSchema();
    wireReveal();
    wireIndexSpy();
    applyInventory();

    if ($("year")) $("year").textContent = new Date().getFullYear();
    if ($("footNote")) {
      const F = M.footer || {};
      $("footNote").textContent = [F.left, F.disclaimer].filter(Boolean).join(" · ");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
