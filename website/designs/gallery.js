/* Header behaviour shared by every page of the gallery theme:
   the phone drawer and the "current section" weight on nav links. */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('drawer');
  if (toggle && drawer) {
    const open = () => { drawer.hidden = false; toggle.setAttribute('aria-expanded', 'true'); document.body.classList.add('drawer-open'); drawer.querySelector('a, button')?.focus(); };
    const close = () => { drawer.hidden = true; toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('drawer-open'); toggle.focus(); };
    toggle.addEventListener('click', () => (drawer.hidden ? open() : close()));
    drawer.addEventListener('click', ev => { const t = ev.target instanceof Element ? ev.target : null; if (t && t.closest('a, .drawer-close, .drawer-backdrop')) close(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !drawer.hidden) close(); });
    // The drawer is a phone pattern; if the viewport grows past it, make sure the page is scrollable again.
    matchMedia('(min-width: 761px)').addEventListener('change', ev => { if (ev.matches && !drawer.hidden) close(); });
  }

  const links = [...document.querySelectorAll('.main-nav a[href^="#"], .drawer-nav a[href^="#"]')];
  const targets = [...new Set(links.map(a => a.getAttribute('href').slice(1)))].map(id => document.getElementById(id)).filter(Boolean);
  if (!targets.length || !('IntersectionObserver' in window)) return;
  const setCurrent = id => links.forEach(a => { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  const visible = new Map();
  const io = new IntersectionObserver(entries => {
    for (const en of entries) visible.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0);
    let best = null, ratio = 0;
    for (const [id, r] of visible) if (r > ratio) { best = id; ratio = r; }
    if (best) setCurrent(best); else links.forEach(a => a.removeAttribute('aria-current'));
  }, { rootMargin: '-35% 0px -45% 0px', threshold: [0, .1, .25, .5] });
  targets.forEach(t => io.observe(t));
})();
