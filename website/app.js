/* ============================================================
   SWEET SNOW — sweetsnow.org
   ------------------------------------------------------------
   Everything on the page is rendered from menu-2026-august.js so
   that a price never exists in two places. Menu items are grouped
   by Classic and Special and displayed without order numbers.
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
  const FLAV = (BING.flavors || []).filter(f => !f.hidden);
  const ICE = BING.ice || [];

  const HOT_START = M.hotStart || FLAV.length + 1;

  function cupSectionPrice(C) {
    const fallback = C.price || "";
    const prices = (C.flavors || [])
      .map((f) => f.price || fallback)
      .filter(Boolean);
    const uniq = [...new Set(prices)].sort(
      (a, b) => parseFloat(a) - parseFloat(b)
    );
    if (!uniq.length) return "";
    if (uniq.length === 1) return "$" + uniq[0];
    return "$" + uniq[0] + "–$" + uniq[uniq.length - 1];
  }

  /* -------------------------------------------------------------
     Menu rows
     ------------------------------------------------------------- */

  // One row: illustration, name, dot leader, price.
  function row(o) {
    const soon = o.badge === "COMING SOON" || o.soon;
    const tapeLabel = o.hint ? "" : (soon ? "COMING SOON" : o.badge === "SEASONAL" ? "SEASONAL" : "");
    const tape = tapeLabel
      ? `<span class="tape${
          soon ? " soon"
          : o.badge === "SPECIAL" ? " special"
          : o.badge === "CLASSIC" || o.badge === "SIGNATURE" ? " classic"
          : ""
        }">${esc(tapeLabel)}</span>`
      : "";
    return `<li class="item${soon ? " is-soon" : ""}${o.hint ? " is-hint" : ""}" data-kind="${esc(o.kind || "bingsu")}" data-name="${esc(o.name)}"${o.inventoryName ? ` data-inventory-name="${esc(o.inventoryName)}"` : ""}>
      <span class="item-art" style="--halo:${o.halo || "#F5EFDC"}">${o.art}</span>
      <div class="item-body">
        <p class="item-line">
          <span class="item-nm">${esc(o.name)}${o.brandLabel ? ` <small class="item-brand">${esc(o.brandLabel)}</small>` : ""}${o.ko ? `<i class="ko">${esc(o.ko)}</i>` : ""}</span>
          ${o.price ? `<span class="item-dots" aria-hidden="true"></span>
          <span class="item-pr${o.up ? " up" : ""}">${esc(o.price)}</span>` : ""}
        </p>
        ${o.subtitle ? `<p class="item-subtitle">${esc(o.subtitle)}</p>` : ""}
        ${o.ing ? `<p class="item-ing">${esc(o.ing)}</p>` : ""}
        ${o.extra || ""}
        ${tape}
      </div>
    </li>`;
  }

  function renderBingsu() {
    const base = BING.price || "";
    if ($("bingsuPrice")) $("bingsuPrice").textContent = "";
    if ($("bingsuNote")) $("bingsuNote").textContent = BING.priceNote || "";
    if ($("bingsuQuality")) $("bingsuQuality").textContent = BING.qualityNote || "";
    if ($("bingsuMix")) $("bingsuMix").textContent = BING.cupSoon || BING.mixNote || "";
    if ($("bingsuSeason")) $("bingsuSeason").textContent = BING.mixSeasonNote || "";
    if ($("marketNote")) $("marketNote").textContent = BING.marketNote || "";
    if ($("specialNote")) $("specialNote").textContent = BING.specialNote || "";

    if ($("iceBlurb")) $("iceBlurb").textContent = BING.iceBlurb || "";
    const iceBlock = $("shavedIce");
    if (iceBlock) iceBlock.hidden = !ICE.length;

    const flavorRow = (f, n) =>
      row({
        n: n,
        art: f.hint && ART.ghost ? ART.ghost() : ART.bowl ? ART.bowl(f.artName || f.name, esc(f.name)) : "",
        halo: f.hint ? "#EEF3F6" : ART.halo ? ART.halo(f.artName || f.name) : "",
        name: f.name,
        inventoryName: f.inventoryName,
        brandLabel: f.brandLabel,
        subtitle: f.subtitle,
        ko: f.ko,
        ing: f.ing,
        price: f.hint || f.price === null ? "" : "$" + (f.price || base),
        up: false,
        badge: f.badge,
        soon: f.soon,
        hint: f.hint,
        extra: (f.recipeNote ? `<p class="item-recipe-note">${esc(f.recipeNote)}</p>` : "") + (f.specialNote ? `<p class="item-special-note">${esc(f.specialNote)}</p>` : "") + (f.upgrade
          ? `<p class="item-upgrade">or ${esc(f.upgrade.ing)} — $${esc(f.upgrade.price)}</p>`
          : "") + (f.staffPicks?.length
          ? `<aside class="staff-picks" aria-label="Recommended toppings for ${esc(f.name)}">
              <p class="staff-picks-title">Recommended toppings</p>
              <ul>${f.staffPicks.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
            </aside>` : ""),
        kind: "bingsu"
      });

    let n = 1;
    const fill = (id, list) => {
      const el = $(id);
      if (!el) return;
      el.innerHTML = list
        .map((f) => {
          const html = flavorRow(f, n);
          if (!f.hint) n += 1;
          return html;
        })
        .join("");
    };
    const isSoon = (f) => f.badge === "COMING SOON" || f.soon;
    const available = FLAV.filter(f => !isSoon(f));
    const ordered = (items, names = []) => items.sort((a, b) => {
      const rank = f => names.includes(f.name) ? names.indexOf(f.name) : names.length;
      return rank(a) - rank(b);
    });
    const classics = ordered(available.filter(f => f.badge === "CLASSIC"), BING.classicOrder);
    const specials = ordered(available.filter(f => f.badge !== "CLASSIC"), BING.specialOrder);
    fill("bingsuList", classics);
    fill("bingsuSpecialList", specials);
    // Shared desktop rows keep each fruit special beside its original even
    // when one description or recommendation box wraps onto more lines.
    if ($("bingsuColumns")) $("bingsuColumns").style.setProperty("--bingsu-rows", Math.max(classics.length, specials.length) + 1);
    fill("bingsuIce", ICE.filter(f => !isSoon(f)));
    const upcoming = [...FLAV, ...ICE].filter(isSoon);
    fill("comingSoonList", upcoming);
    if ($("comingSoon")) $("comingSoon").hidden = !upcoming.length;
  }

  function renderCups() {
    const C = M.cupBingsu || {};
    const list = C.flavors || [];
    if ($("cups")) $("cups").hidden = C.enabled === false;
    if (C.enabled === false) return;
    if ($("cups")) $("cups").classList.toggle("is-coming-soon", !!C.soon);
    if ($("cupStatus")) $("cupStatus").hidden = !C.soon;
    if ($("cupBlurb")) $("cupBlurb").textContent = C.blurb || "Single serve.";
    if ($("cupPrice")) $("cupPrice").textContent = cupSectionPrice(C);
    if ($("cupNote")) $("cupNote").textContent = C.priceNote || "";
    const wrap = $("cupList");
    if (!wrap) return;
    wrap.innerHTML = list
      .map((f, i) => {
        const price = "$" + (f.price || C.price || "");
        return `<li class="cup-card item${C.soon ? " is-soon" : ""}" data-kind="cup" data-name="${esc(f.name)}">
          <span class="cup-art" style="--halo:${ART.halo ? ART.halo(f.name) : "#F5EFDC"}">${
            ART.cup ? ART.cup(f.name) : ""
          }</span>
          <p class="cup-nm">${esc(f.name)}${
            f.ko ? `<i class="ko">(${esc(f.ko)})</i>` : ""
          }</p>
          <p class="cup-pr">${esc(price)}</p>
          ${f.ing ? `<p class="cup-ing">${esc(f.ing)}</p>` : ""}
        </li>`;
      })
      .join("");
  }

  // One red line per choice, so "pick a flavor" reads as a list
  // rather than a run-on line.
  const optsHtml = (o) =>
    o
      ? `<ul class="t-opts">${[]
          .concat(o)
          .map((v) => `<li>${esc(v)}</li>`)
          .join("")}</ul>`
      : "";

  function tierHtml(t) {
    return `<div class="tier${t.tone ? " is-" + esc(t.tone) : ""}${(t.items || []).length > 8 ? " is-long" : ""}">
      ${
        t.price
          ? `<p class="tier-price">+$${esc(t.price)}${t.each === false ? "" : "<small>each</small>"}</p>`
          : t.label
            ? `<p class="tier-price">${esc(t.label)}</p>`
            : ""
      }
      ${t.note ? `<p class="t-note">${esc(t.note)}</p>` : ""}
      <ul class="tier-items">
        ${(t.items || [])
          .map(
            (it) => `<li>
              <span class="t-row"><span class="t-nm">${esc(it.en)}</span>${
                it.price ? `<span class="t-pr">+$${esc(it.price)}</span>` : ""
              }${
                it.ko ? `<span class="ko">${esc(it.ko)}</span>` : ""
              }</span>
              ${optsHtml(it.opts)}
              ${it.note ? `<p class="t-note">${esc(it.note)}</p>` : ""}
            </li>`
          )
          .join("")}
      </ul>
    </div>`;
  }

  function renderToppings() {
    const T = M.toppings || {};
    if ($("topNote")) $("topNote").textContent = [T.note, T.freeNote].filter(Boolean).join(" · ");
    if ($("toppingServingNote")) $("toppingServingNote").textContent = T.servingNote || "";

    const wrap = $("tiers");
    if (!wrap) return;
    wrap.innerHTML = (T.tiers || []).map(tierHtml).join("");
    if ($("fruitNote")) $("fruitNote").textContent = T.fruitNote || "";
  }

  function renderExtraFruit() {
    const F = M.extraFruit || {};
    const wrap = $("extraFruit");
    if (!wrap) return;
    if (!(F.items || []).length) {
      wrap.hidden = true;
      wrap.innerHTML = "";
      return;
    }
    wrap.hidden = false;
    wrap.innerHTML = tierHtml({
      label: F.title || "Extra fruit",
      note: F.note,
      items: F.items
    });
    const cream = M.creamTop;
    if (cream) wrap.innerHTML += `<section class="tier cream-top" aria-label="${esc(cream.title)}">
      <h3>${esc(cream.title)}</h3>
      <p class="cream-top-price">+$${esc(cream.price)}</p>
    </section>`;
  }

  function renderHot() {
    const list = $("hotList");
    if (!list) return;

    const TK = M.taiyaki || {};
    const IC = M.taiyakiIce || {};
    const DB = M.dubaiTaiyaki || {};
    const CK = M.cookie || {};

    // Bulk deals apply to regular taiyaki only, so they render inside that
    // row — not as a footer under all four hot items.
    const dealHtml =
      (TK.deals || [])
        .map((d) => `<span class="deal">${esc(d.qty)} — $${esc(d.price)}</span>`)
        .join("") + (TK.dealNote ? `<span class="deal-note">${esc(TK.dealNote)}</span>` : "");

    const rows = [
      {
        n: HOT_START,
        art: ART.fish ? ART.fish() : "",
        halo: "#FDF0D4",
        name: TK.title,
        ko: TK.ko,
        ing: [TK.fillings, TK.note].filter(Boolean).join(" · "),
        price: "$" + (TK.price || ""),
        kind: "hot",
        extra: dealHtml ? `<p class="deals deals-inline">${dealHtml}</p>` : ""
      },
      {
        n: HOT_START + 1,
        art: ART.iceFish ? ART.iceFish() : "",
        halo: "#FFF3DC",
        name: IC.title,
        enabled: IC.enabled,
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

    list.innerHTML = rows.filter(item => item.enabled !== false).map(row).join("");
    const deals = $("deals");
    if (deals) deals.innerHTML = "";
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
    { href: "#menu", label: "Menu", pri: true, covers: ["menu", "bingsu", "shavedIce", "extraFruit", "cups", "toppings", "hot", "comingSoon"] },
    { href: "#vote", label: "Vote", act: true, covers: ["vote"] },
    { href: "#catering", label: "Catering", soon: true, covers: ["catering"] }
  ];

  function renderIndex() {
    const bar = $("indexBar");
    if (!bar) return;
    bar.innerHTML =
      `<div class="index-track">` +
      NAV.map((l) => {
        const cls = [l.pri && "pri", l.act && "act"].filter(Boolean).join(" ");
        return `<a class="${cls}" href="${l.href}">${esc(l.label)}${l.soon ? '<small class="nav-soon">Coming soon</small>' : ""}</a>`;
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
    const now = shopClock();

    if (list) {
      list.innerHTML = rows
        .map((h) => {
          // Match today to a display row: no hours today means the
          // "closed" line, otherwise the row quoting today's close.
          const day = now.day;
          const isToday = (day >= 1 && day <= 4 && /mon/i.test(h.days) && /thu/i.test(h.days))
            || ((day === 0 || day === 5 || day === 6) && /fri/i.test(h.days) && /sun/i.test(h.days));
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
     Coming-soon vote — one pick, filled from the menu badges
     ------------------------------------------------------------- */

  function renderSurvey() {
    const wrap = $("qSoon");
    if (!wrap) return;
    const soon = FLAV.filter((f) => f.badge === "COMING SOON");
    const form = $("voteForm");
    const voteSec = $("vote");
    if (!soon.length) {
      if (form) form.hidden = true;
      if (voteSec) voteSec.classList.add("is-ideas-only");
      wrap.innerHTML = "";
      return;
    }
    if (form) form.hidden = false;
    if (voteSec) voteSec.classList.remove("is-ideas-only");
    wrap.innerHTML = soon
      .map(
        (f) => `<label class="soon-pick">
          <input type="radio" name="first" value="${esc(f.name)}" required />
          <span class="soon-nm">${esc(f.name)}${
            f.ko ? `<i class="ko">${esc(f.ko)}</i>` : ""
          }</span>
        </label>`
      )
      .join("");
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
    const item = (n, desc, price, soon = false) => ({
      "@type": "MenuItem",
      name: n,
      description: desc || undefined,
      offers: price && !soon ? { "@type": "Offer", price: price, priceCurrency: "USD" } : undefined
    });

    const sections = [
      section(
        BING.title || "Shaved Milk",
        FLAV.map(f => item(/bingsu$/i.test(f.name) ? f.name : f.name + " Bingsu", f.ing, f.price || base, f.soon || f.badge === "COMING SOON"))
      ),
      ...(ICE.filter((f) => !f.hint).length
        ? [section(
            BING.iceTitle || "Shaved Ice",
            ICE.filter((f) => !f.hint).map((f) => item(f.name, f.ing, f.price || base))
          )]
        : []),
      ...(M.cupBingsu?.enabled === false ? [] : [section(
        (M.cupBingsu || {}).title || "Cup Bingsu",
        ((M.cupBingsu || {}).flavors || []).map((f) =>
          item(f.name + " Cup", f.ing, f.price || (M.cupBingsu || {}).price, (M.cupBingsu || {}).soon)
        )
      )]),
      section(
        "Hot & Fresh",
        [M.taiyaki, M.taiyakiIce, M.dubaiTaiyaki, M.cookie]
          .filter(x => x && x.enabled !== false)
          .map((x) => item(x.title, x.sub || x.note, x.price))
      )
    ];

    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "@id": "https://www.sweetsnow.org/#menu",
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
        const inventoryName = el.getAttribute("data-inventory-name") || name;
        const kind = el.getAttribute("data-kind") || "bingsu";
        let best = null;
        let bestScore = 50;
        stock.forEach((sq) => {
          const n = Math.max(stockScore(name, kind, sq), stockScore(inventoryName, kind, sq));
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
    renderCups();
    renderExtraFruit();
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
