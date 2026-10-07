(() => {
 const addStory = () => {
  const main = document.querySelector('main');
  if (!main || document.getElementById('brand-story')) return;
  const section = document.createElement('section');
  section.id = 'brand-story'; section.className = 'brand-story shell';
  section.setAttribute('aria-labelledby', 'brand-story-title');
  section.innerHTML = `<div class="brand-story-art"><img src="/assets/sweet-snow-arched-logo.png" width="905" height="564" alt="Sweet Snow snowboard bunny" loading="lazy"></div><div class="brand-story-copy"><p class="eyebrow">our story</p><h2 id="brand-story-title">new flavors.<br>new experiences.</h2><p>We’re an immigrant family from South Korea, and Sweet Snow is our local small business—<strong>100% family owned and 100% family operated.</strong></p><p>We started Sweet Snow in the summer of 2025 after noticing the limited variety of Korean shaved ice flavors in the U.S. We wanted to bring something new to the community.</p><p>With quality ingredients and fresh flavor combinations, we’re creating a modern take on the desserts we love and a brand-new experience in every bowl.</p><p>Our story started in Garden Grove, and we’re excited to keep growing. <strong>New locations coming soon.</strong></p></div>`;
  const before = main.querySelector('#catering, #visit');
  main.insertBefore(section, before || null);
  const nav = document.querySelector('.main-nav');
  if (nav && !nav.querySelector('[href="#brand-story"]')) {
   const link = document.createElement('a'); link.href='#brand-story'; link.textContent='our story';
   nav.append(link);
  }
 };
 if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',addStory,{once:true});
 else addStory();
})();
