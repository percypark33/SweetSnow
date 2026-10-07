(() => {
'use strict';
const M=window.MENU, theme=document.body.dataset.theme || 'showcase';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoMap={'Mango':'mango','Strawberry':'strawberry','Mango & Strawberry':'half-half','Injeolmi':'injeolmi','Black Sesame':'black-sesame','Matcha Strawberry':'matcha-strawberry','Cookies and Cream':'cookies-cream','Blueberry Yogurt Cheesecake':'blueberry','Mango Special':'mango-special','Strawberry Special':'strawberry-special','Cereal Killer':'cereal-killer','Strawnana Pie':'strawnana','Hojicha Tiramisu':'hojicha-syrup','Matcha Banana Cream':'matcha-banana','Lychee Heaven':'lychee','Açaí':'acai'};
const choices={showcase:{num:'01',label:'The Photo Studio',eyebrow:'Korean shaved ice · Garden Grove',headline:'Coming to you<br><em>with better quality and new flavors.</em>',description:'Meet Lychee Heaven—our newest menu addition and our modern take on Asian dessert.',hero:'lychee',caption:'Lychee Heaven',price:'18.50'},editorial:{num:'02',label:'The Snow Journal',eyebrow:'Sweet Snow · Korean bingsu',headline:'Something<br><em>sweet</em><br>to share.',description:'A bowl of soft milk snow, layered with flavor and finished with the things you love. Made to order in Garden Grove.',hero:'half-half',caption:'Mango & Strawberry',price:'15.50'},catalog:{num:'03',label:'The Everyday Menu',eyebrow:'Made to order · Garden Grove, CA',headline:'Find your<br>favorite snow.',description:'From fruit classics to loaded specials. Explore the menu, pick your bowl, and visit us in store.',hero:'strawberry-special',caption:'Strawberry Special',price:'18.50'}};
const c=choices[theme];
const money=p=>'$'+Number(p).toFixed(2);
const img=(key,alt,hero=false)=>`<img src="/designs/photos/${key}-${hero?1200:640}.webp" srcset="/designs/photos/${key}-640.webp 640w, /designs/photos/${key}-1200.webp 1200w" sizes="${hero?'(max-width: 700px) 100vw, 50vw':'(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 400px'}" width="1200" height="1200" alt="${e(alt)}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
const all=[];
for(const [category,order] of [['classic',M.bingsu.classicOrder],['special',M.bingsu.specialOrder]]) for(const name of order){const f=M.bingsu.flavors.find(x=>x.name===name&&!x.hidden&&!x.soon&&x.badge!=='COMING SOON');if(f)all.push({...f,category,photo:photoMap[name]});}
all.push({name:M.taiyaki.title,price:M.taiyaki.price,ing:M.taiyaki.fillings,category:'hot',photo:'taiyaki',detail:M.taiyaki.deals.map(d=>`${d.qty} ${money(d.price)}`).join(' · ')+' · '+M.taiyaki.dealNote},{name:M.dubaiTaiyaki.title,price:M.dubaiTaiyaki.price,ing:M.dubaiTaiyaki.note,category:'hot',photo:'dubai-taiyaki'},{name:M.cookie.title,price:M.cookie.price,ing:M.cookie.sub,category:'hot',photo:'dubai-cookie',recipeNote:M.cookie.warn});
const groupNames={classic:'Classic',special:'Special',hot:'Hot & fresh'};
const card=(f)=>`<article class="product-card" data-name="${e(f.name)}" data-inventory-name="${e(f.inventoryName||f.name)}" data-kind="${f.category==='hot'?'hot':'bingsu'}" data-category="${f.category}" data-search="${e((f.name+' '+f.ing).toLowerCase())}"><div class="product-photo">${img(f.photo,f.name)}</div><div class="product-info"><div class="product-heading"><h4>${e(f.name)}</h4><span class="price">${money(f.price)}${f.name==='Taiyaki'?'<small> / 2 pieces</small>':''}</span></div><p class="product-description">${e(f.ing)}</p><div class="product-meta">${f.brandLabel?`<span class="brand-tag">${e(f.brandLabel)}</span>`:f.subtitle?`<span class="brand-tag">${e(f.subtitle)}</span>`:f.category==='hot'&&f.detail?`<span class="brand-tag">5 pieces ${money(M.taiyaki.deals[1].price)}</span>`:''}</div></div></article>`;
const layerArt=`<svg class="layer-drawing" viewBox="0 0 560 560" role="img" aria-labelledby="layer-title layer-desc"><title id="layer-title">A little look inside a mango bingsu</title><desc id="layer-desc">An illustrative cross-section of a bowl with milk snow, syrup layers, mango and mochi on top. Each flavor has its own toppings.</desc><defs><clipPath id="bowl-clip"><path d="M126 269 Q137 450 213 471 Q282 496 350 471 Q425 450 437 269Z"/></clipPath><pattern id="snow-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="5" cy="6" r="1.5" fill="#c2dce4"/><circle cx="13" cy="14" r="1" fill="#dcebf0"/></pattern></defs><ellipse cx="282" cy="494" rx="150" ry="10" fill="#e1e7e8"/><g stroke="#2b383a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M126 269 Q157 156 279 151 Q392 157 437 269" fill="#fbfdfd"/><path d="M126 269 Q137 450 213 471 Q282 496 350 471 Q425 450 437 269Z" fill="#f7fbfc"/><g clip-path="url(#bowl-clip)" stroke="none"><rect x="120" y="270" width="322" height="213" fill="url(#snow-dots)"/><path d="M124 321 Q180 309 248 331 T440 320 L439 344 Q369 364 282 350 T125 344Z" fill="#f8c856"/><path d="M142 412 Q211 400 280 418 T422 414 L417 434 Q350 453 280 438 T147 433Z" fill="#f8c856"/></g><path d="M126 269 Q137 450 213 471 Q282 496 350 471 Q425 450 437 269Z" fill="none"/><path d="M119 268 Q281 287 444 268" fill="none"/><path d="M124 277 Q281 298 441 277" fill="none"/><g fill="#ffc643" stroke="#c58d25" stroke-width="2.5"><rect x="180" y="205" width="42" height="36" rx="9" transform="rotate(-13 200 220)"/><rect x="249" y="169" width="43" height="37" rx="8" transform="rotate(9 270 188)"/><rect x="312" y="202" width="42" height="37" rx="8" transform="rotate(15 330 218)"/><rect x="240" y="230" width="38" height="32" rx="8"/><rect x="367" y="240" width="34" height="30" rx="8"/><rect x="158" y="245" width="31" height="26" rx="7"/></g><g fill="#fffaf0" stroke="#b6aca0" stroke-width="2"><rect x="220" y="190" width="23" height="22" rx="7" transform="rotate(-12 230 200)"/><rect x="301" y="244" width="24" height="22" rx="7"/><rect x="308" y="153" width="23" height="22" rx="7" transform="rotate(15 319 164)"/></g><g fill="none" stroke="#eab73f" stroke-width="8"><path d="M193 192 Q235 219 279 213 T365 242"/><path d="M207 232 Q240 221 293 247"/></g><path d="M153 302 Q160 365 172 388" fill="none" stroke="#fff" stroke-width="7"/></g><g fill="#43545a" font-family="Arial, Helvetica, sans-serif" font-size="15"><text x="28" y="101">Fruit &amp; toppings</text><text x="348" y="110">House-made syrup</text><text x="17" y="372">Milk snow</text><text x="360" y="391">Flavor in layers</text></g><g fill="none" stroke="#7c9097" stroke-width="1.3"><path d="M117 110 L183 179"/><path d="M411 120 L336 231"/><path d="M77 380 L169 369"/><path d="M423 399 L372 425"/></g><text x="280" y="537" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" fill="#6f7d81">A little look inside. Each flavor has its own finish.</text></svg>`;
// Opening hours come from M.schedule (24-hour; also drives the open/closed status) so the page,
// the TV boards and the JSON-LD share one source. Consecutive days with the same hours are grouped.
const DAY_NAME=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const clock=t=>{const [h,m]=String(t).split(':').map(Number);const ap=h>=12?'pm':'am';const hh=h%12||12;return m?`${hh}:${String(m).padStart(2,'0')} ${ap}`:`${hh} ${ap}`};
const hoursHtml=(()=>{const S=M.schedule||{};const groups=[];for(const d of [1,2,3,4,5,6,0]){const s=S[d];const key=s?`${s.open}–${s.close}`:'closed';const g=groups[groups.length-1];if(g&&g.key===key)g.to=d;else groups.push({key,from:d,to:d,s})}return groups.map(g=>`${DAY_NAME[g.from]}${g.to!==g.from?'–'+DAY_NAME[g.to]:''}<br>${g.s?`${clock(g.s.open)} – ${clock(g.s.close)}`:'Closed'}`).join('<br><br>')})();
const mapLink='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Sweet Snow '+M.brand.street+' '+M.brand.city);
document.getElementById('app').innerHTML=`<a class="skip-link" href="#menu">Skip to menu</a><div class="location-bar shell"><a href="#visit">${e(M.brand.street)} · Garden Grove</a><span id="status" aria-live="polite"></span></div><header class="site-header shell"><a class="brand" href="#" aria-label="Sweet Snow home"><img class="logo" src="/assets/sweet-snow-arched-logo.png" alt="Sweet Snow" width="905" height="564"><span class="brand-word" aria-hidden="true">Sweet Snow</span></a><nav class="main-nav" aria-label="Main navigation"><a href="#menu">Menu</a><a href="#catering">Catering</a><a href="#visit">Visit us</a><a href="#brand-story">Our story</a></nav></header><main><section class="hero shell"><div class="hero-copy"><p class="eyebrow">${c.eyebrow}</p><h1>${c.headline}</h1><p class="hero-description">${c.description}</p><div class="hero-actions"><a class="button" href="#menu">Explore the menu <span aria-hidden="true">&nbsp;↗</span></a><a class="text-link" href="#visit">Find us</a></div></div><div class="hero-image">${img(c.hero,c.caption,true)}</div></section><section class="menu-section shell" id="menu"><div class="section-heading"><h2 style="font-weight:900">Menu</h2></div><div class="menu-groups">${Object.entries(groupNames).map(([key,name])=>`<section class="menu-group" aria-label="${name}"><h3 class="menu-category-title">${name}</h3><div class="product-grid">${all.filter(f=>f.category===key).map(card).join('')}</div></section>`).join('')}</div></section><section class="catering-section shell" id="catering" aria-labelledby="catering-title"><div class="catering-card"><div><p class="eyebrow">Sweet Snow gatherings</p><h2 id="catering-title">Catering</h2><p>Something sweet for your next gathering.</p></div><span class="coming-soon">Coming soon</span></div></section><section class="visit-section shell" id="visit"><div><p class="eyebrow">Come for a little snow</p><h2>See you in<br>Garden Grove.</h2><p>${e(M.brand.venue)}<br>${e(M.brand.street)}<br>${e(M.brand.city)}</p><a class="button" href="${mapLink}" target="_blank" rel="noopener">Get directions ↗</a></div><div class="visit-details"><div><h3>Opening hours</h3><p>${hoursHtml}</p></div><div><a style="font-size:clamp(28px,3vw,40px);font-weight:900" class="text-link" href="https://www.instagram.com/${e(M.brand.instagram)}/" target="_blank" rel="noopener">@${e(M.brand.instagram)} ↗</a></div></div></section></main><footer class="site-footer shell"><a class="brand-word" href="#">Sweet Snow</a><p>${e(M.footer.disclaimer)}</p><div><a href="#vote">Share an idea</a><a href="/privacy">Privacy</a></div></footer><dialog class="product-dialog" aria-labelledby="dialog-title"><button class="close-dialog" aria-label="Close ingredients">×</button><div class="dialog-content"></div></dialog>`;
const dialog=document.querySelector('dialog');let previousFocus;
const close=()=>dialog.close();dialog.querySelector('.close-dialog').addEventListener('click',close);dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)close()}});dialog.addEventListener('close',()=>{document.body.classList.remove('body-modal-open');previousFocus?.focus()});
document.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>{const f=all.find(i=>i.name===b.dataset.item);previousFocus=b;dialog.querySelector('.dialog-content').innerHTML=`${img(f.photo,f.name,true)}<div class="dialog-copy">${f.brandLabel?`<p class="eyebrow">${e(f.brandLabel)}</p>`:''}<h2 id="dialog-title">${e(f.name)}</h2><p class="dialog-price">${money(f.price)}</p><p>${e(f.ing)}</p>${f.specialNote?`<p>${e(f.specialNote)}</p>`:''}<small>${f.category==='hot'?e(f.detail||''):e((M.bingsu.priceNote||'').replace(/\s*[·•]?\s*serves\s*2[–~—-]3\s*people\.?/gi,''))}${f.recipeNote?'<br>'+e(f.recipeNote):''}</small><a class="button dialog-visit" href="#visit">Visit Sweet Snow ↗</a></div>`;dialog.querySelector('.dialog-visit').addEventListener('click',close);dialog.showModal();document.body.classList.add('body-modal-open')}));

const $=id=>document.getElementById(id), esc=e;
const BING=M.bingsu||{}, FLAV=(BING.flavors||[]).filter(f=>!f.hidden), ICE=BING.ice||[];
const upcoming=[...FLAV,...ICE].filter(f=>f.soon||f.badge==='COMING SOON');
const visit=document.getElementById('visit');
if(upcoming.length){
 const section=document.createElement('section');section.className='coming-section shell';section.id='comingSoon';
 section.innerHTML=`<div class="section-heading"><div><p class="eyebrow">A taste of what’s next</p><h2>Coming soon.</h2></div></div><div class="coming-grid">${upcoming.map(f=>`<article><span class="coming-tag">Coming soon</span><h3>${e(f.name)}</h3><p>${e(f.ing)}</p></article>`).join('')}</div>`;
 visit.before(section);
}
const community=document.getElementById('community-template');
if(community){visit.before(community.content.cloneNode(true));community.remove();}
const soon=FLAV.filter(f=>f.badge==='COMING SOON');
const voteForm=$('voteForm'),qSoon=$('qSoon');
if(voteForm&&qSoon){voteForm.hidden=!soon.length;qSoon.innerHTML=soon.map(f=>`<label class="soon-pick"><input type="radio" name="first" value="${e(f.name)}" required><span>${e(f.name)}</span></label>`).join('');}

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
    const open = !!(today && now.min >= toMin(today.open) && now.min < toMin(today.close));
    let next = '';
    for (let i = 0; i <= 7; i++) {
      const day = (now.day + i) % 7;
      const hours = S[day];
      if (!hours || (i === 0 && now.min >= toMin(hours.open))) continue;
      const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_NAME[day];
      next = 'Next open ' + when + ' ' + fmt12(hours.open) + '–' + fmt12(hours.close);
      break;
    }
    return { open, text: (open ? 'Open now · until ' + fmt12(today.close) : 'Closed now') + (next ? ' · ' + next : '') };
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
      el.innerHTML = '<span class="status-dot" aria-hidden="true"></span><span>' + esc(st.text) + '</span>';
      el.classList.remove("is-open", "is-closed");
      el.classList.add(st.open ? "is-open" : "is-closed");
    });
  }


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
    const body = el.querySelector(".product-meta");
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
      document.querySelectorAll(".product-card[data-name]").forEach((el) => {
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


renderHours();setInterval(renderHours, 60000);applyInventory();injectMenuSchema();
})();
