(()=>{'use strict';
const M=window.MENU;if(!M)return;
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=p=>p===null||p===undefined||p===''?'Price to be announced':'$'+Number(p).toFixed(2);
const line=f=>`<article class="upcoming-card"><h3>${e(f.name)}</h3><p>${e(f.ing)}</p><small>${e(price(f.price))}</small></article>`;
const upcoming=M.bingsu.flavors.filter(f=>f.hidden&&f.badge==='COMING SOON');
const cups=M.cupBingsu;let extra='';
if(upcoming.length)extra+=`<section class="launch-section shell" id="coming-soon"><p class="eyebrow">In the works</p><h2>More to look forward to.</h2><p>Coming soon. Not available to order yet.</p><div class="upcoming-grid">${upcoming.map(line).join('')}</div></section>`;
if(cups&&(cups.enabled||cups.soon))extra+=`<section class="launch-section shell" id="cups"><p class="eyebrow">${cups.enabled?'Single serve':'Coming soon · Single serve'}</p><h2>${e(cups.title)}</h2><p>${cups.enabled?e(cups.blurb):'Smaller bowls, on the way. Not available to order yet.'}</p><div class="upcoming-grid">${cups.flavors.map(line).join('')}</div></section>`;
extra+=`<section class="launch-section shell idea-section" id="ideas"><div><p class="eyebrow">Made together</p><h2>Your next favorite starts with an idea.</h2><p>A flavor from home. A taste from a trip. Tell us what we should make next.</p></div><a class="button" href="/community#vote">Share a flavor idea ↗</a></section>`;
document.querySelector('#layers')?.insertAdjacentHTML('beforebegin',extra);
const map='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(M.brand.name+' '+M.brand.street+' '+M.brand.city);
document.querySelector('.site-header')?.insertAdjacentHTML('beforebegin',`<div class="address-bar"><a href="${map}" target="_blank" rel="noopener">${e(M.brand.street)} · ${e(M.brand.city)} · ${e(M.brand.venue)} ↗</a></div>`);
const cards=[...document.querySelectorAll('.product-card')];
const items=[...M.bingsu.flavors,{name:M.taiyaki.title,kind:'hot'},{name:M.dubaiTaiyaki.title,kind:'hot'},{name:M.cookie.title,kind:'hot'}];
function normName(s){return String(s||'').toLowerCase().replace(/bingsu|bingsoo|premium|shaved ice|snow/g,' ').replace(/[^a-z0-9가-힣]+/g,' ').trim()}
function score(name,kind,sq){const a=normName(name),b=normName(sq.name).replace(/\bcup\b/g,' ').replace(/\s+/g,' ').trim();if(!a||!b)return 0;let n=a===b?90:(b.includes(a)||a.includes(b)?70:0);if(!n)return 0;return n+(sq.kind===kind?20:(sq.kind&&sq.kind!==kind?-25:0))}
async function inventory(){try{const r=await fetch('/api/inventory',{headers:{Accept:'application/json'}});if(!r.ok)return;const data=await r.json();if(!Array.isArray(data.items))return;for(const card of cards){const name=card.querySelector('[data-item]')?.dataset.item,f=items.find(x=>x.name===name);if(!f)continue;let best=null,n=50;for(const sq of data.items){const s=Math.max(score(f.name,f.kind||'bingsu',sq),score(f.inventoryName||f.name,f.kind||'bingsu',sq));if(s>n){n=s;best=sq}}if(!best)continue;card.querySelector('.stock-label')?.remove();card.classList.toggle('is-soldout',best.status==='soldout');card.dataset.stock=best.status;if(best.status==='soldout'||best.status==='low')card.querySelector('.product-meta')?.insertAdjacentHTML('beforeend',`<span class="stock-label">${best.status==='soldout'?'Sold out':'Few left'}</span>`)}}catch(_){}}
inventory();
document.addEventListener('click',event=>{const b=event.target.closest('[data-item]');if(!b)return;const card=b.closest('.product-card');if(card?.dataset.stock==='soldout')document.querySelector('.dialog-price')?.insertAdjacentHTML('afterend','<p class="stock-label">Currently sold out</p>')});
if(location.hash==='#vote')location.replace('/community#vote');
if(location.hash==='#bingsu')document.getElementById('menu')?.scrollIntoView();
if(location.hash==='#hours')document.getElementById('visit')?.scrollIntoView();
})();