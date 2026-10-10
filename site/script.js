const isPersian=document.documentElement.lang==='fa';
const menuLabel=isPersian?'منو':'Menu';
const closeLabel=isPersian?'بستن':'Close';
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent=menuLabel;}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?closeLabel:menuLabel;});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();toggle.focus();}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected));});document.querySelectorAll('.paper').forEach(paper=>{paper.hidden=button.dataset.filter!=='all'&&paper.dataset.status!==button.dataset.filter;});}));

// Hash navigation keeps each of the three main paths focused and linkable.
const sections=[...document.querySelectorAll('main>section[data-view]')];
const home=document.querySelector('#home');
const toolbar=document.querySelector('.view-toolbar');
const viewLinks=document.querySelector('.view-links');
const groups=isPersian?{
 about:[['about','دربارهٔ من']],
 research:[['research','حوزه‌های پژوهشی'],['publications','مقالات'],['journey','سوابق پژوهشی'],['achievements','دستاوردها'],['skills','مهارت‌ها']],
 science:[['stories','ویدئوهای علمی'],['filyc','فیلم و فیزیک | FilYc'],['tr-bookclub','باشگاه کتاب TR']],
 teaching:[['teaching','آموزش آنلاین'],['teaching-approach','تجربه و رویکرد آموزشی'],['teaching-consultation','ارزیابی و مشاوره']],
 business:[['vellum-house','آشنایی با ولوم هاوس'],['vh-services','خدمات'],['vh-roadmap','مسیر همکاری'],['vh-consultation','مشاورهٔ اولیه']],
 contact:[['contact','تماس']]
}:{
 about:[['about','About Me']],
 research:[['research','Research Areas'],['publications','Publications'],['journey','Research Experience'],['achievements','Achievements'],['skills','Skills']],
 science:[['stories','Science Videos'],['filyc','Film & Physics · FilYc'],['tr-bookclub','TR Book Club']],
 teaching:[['teaching','Online Teaching'],['teaching-approach','Experience & Approach'],['teaching-consultation','Assessment & Consultation']],
 business:[['vellum-house','Overview'],['vh-services','Services'],['vh-roadmap','The Roadmap'],['vh-consultation','Initial Consultation']],
 contact:[['contact','Contact']]
};
function showView(moveFocus=false){
  const id=location.hash.slice(1)||'home';
  const anchor=document.getElementById(id);
  const target=anchor?.closest('main>section[data-view]');
  const view=target?.dataset.view;
  home.hidden=Boolean(view);
  sections.forEach(section=>{section.hidden=section.dataset.view!==view;});
  toolbar.hidden=!view;
  document.body.classList.toggle('home-view',!view);
  viewLinks.replaceChildren();
  (groups[view]||[]).forEach(([anchor,label])=>{
    const link=document.createElement('a');link.href='#'+anchor;link.textContent=label;
    if(anchor===id)link.setAttribute('aria-current','location');
    viewLinks.append(link);
  });
  nav.querySelectorAll('a[href^="#"]').forEach(link=>{
    const linkedSection=document.getElementById(link.hash.slice(1))?.closest('main>section[data-view]');
    if(view && linkedSection?.dataset.view===view)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  closeMenu();
  if(moveFocus){
    const element=(target && anchor)||home;
    const heading=element.matches('h1,h2,h3,h4')?element:element.querySelector('h1,h2,h3,h4');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    requestAnimationFrame(()=>{
      if(target){element.scrollIntoView({block:'start',behavior:'instant'});}
      else window.scrollTo({top:0,behavior:'instant'});
    });
  }
}
window.addEventListener('hashchange',()=>showView(true));
showView(Boolean(location.hash));

// Keep the current section when changing language; both pages also work without JavaScript.
function syncLanguageLinks(){document.querySelectorAll('[data-language]').forEach(link=>{link.href=(link.dataset.language==='fa'?'fa.html':'index.html')+location.hash;});}
window.addEventListener('hashchange',syncLanguageLinks);
syncLanguageLinks();

// Quick, accessible return to the top without changing the current category.
(() => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.hidden = true;
  const label = isPersian ? 'بازگشت به بالای صفحه' : 'Back to top';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 4h14M6 12l6-6 6 6M12 6v14"/></svg>';
  document.body.append(button);
  let frame = 0;
  let running = false;
  const update = () => { button.hidden = window.scrollY < 320 && !running; };
  const cancel = () => {
    cancelAnimationFrame(frame);
    running = false;
    update();
  };
  const finish = () => {
    running = false;
    // Move focus before hiding the activated button, including for keyboard users.
    const destination = document.querySelector('.site-header a');
    if (document.activeElement === button && destination) destination.focus({preventScroll:true});
    update();
  };
  button.addEventListener('click', () => {
    cancelAnimationFrame(frame);
    const startY = window.scrollY;
    const startTime = performance.now();
    running = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({top:0, behavior:'instant'});
      finish();
      return;
    }
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / 280);
      window.scrollTo({top:startY * Math.pow(1 - progress, 3), behavior:'instant'});
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
  });
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('wheel', cancel, {passive:true});
  window.addEventListener('touchstart', cancel, {passive:true});
  window.addEventListener('hashchange', cancel);
  window.addEventListener('keydown', event => {
    if (['Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) cancel();
  });
  update();
})();
