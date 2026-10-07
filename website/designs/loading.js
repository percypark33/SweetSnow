(() => {
 const loader = document.getElementById('brand-loader');
 if (!loader) return;
 loader.hidden=true;
 loader.querySelector('.loader-label').textContent='';
 const logo=new Image();logo.src='/assets/sweet-snow-arched-logo.png';
 let timer; let fadeTimer;
 document.addEventListener('click', event => {
  const target=event.target instanceof Element?event.target:null;
  const control=target?.closest('a, button, summary, input[type="radio"], input[type="checkbox"]');
  if(!control || control.disabled) return;
  clearTimeout(timer);clearTimeout(fadeTimer);
  loader.classList.remove('is-finished');loader.hidden=false;
  loader.setAttribute('aria-label','Loading Sweet Snow');
  // Native actions run normally. Move the overlay into an open dialog if needed.
  requestAnimationFrame(()=>{
   const host=document.querySelector('dialog[open]') || document.body;
   host.append(loader);
  });
  timer=setTimeout(()=>{
   loader.classList.add('is-finished');
   fadeTimer=setTimeout(()=>{loader.hidden=true;document.body.append(loader)},180);
  },1000);
 },{capture:true,passive:true});
 window.addEventListener('pageshow',()=>{clearTimeout(timer);clearTimeout(fadeTimer);loader.hidden=true;document.body.append(loader)});
})();
