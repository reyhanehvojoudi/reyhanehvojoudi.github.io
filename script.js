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
 research:[['about','دربارهٔ من'],['research','پژوهش و مقالات'],['journey','تجربه‌ها و مهارت‌ها']],
 science:[['stories','ویدئوها'],['teaching','تدریس'],['beyond','FilYc و TR']],
 business:[['vellum-house','ولوم هاوس']],
 contact:[['contact','تماس']]
}:{
  research:[['about','About'],['research','Research & Papers'],['journey','Experience & Skills']],
  science:[['stories','Videos'],['teaching','Teaching'],['beyond','FilYc & TR']],
  business:[['vellum-house','Vellum House']],
  contact:[['contact','Contact']]
};
function showView(moveFocus=false){
  const id=location.hash.slice(1)||'home';
  const target=sections.find(section=>section.id===id);
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
    if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  closeMenu();
  if(moveFocus){
    const element=target||home;
    const heading=element.querySelector('h1,h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    requestAnimationFrame(()=>{
      if(target){target.scrollIntoView({block:'start',behavior:'instant'});}
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
