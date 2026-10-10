(() => {
  'use strict';
  const fa = document.documentElement.lang === 'fa';
  const t = fa ? {
    title:'شروع یک گفت‌وگو',intro:'برای شروع، کمی دربارهٔ درخواستتان بنویسید.',
    name:'نام و نام خانوادگی',email:'آدرس ایمیل',phone:'شمارهٔ تماس با کد کشور',topic:'موضوع درخواست',
    message:'توضیحات شما',zone:'شهر / منطقهٔ زمانی (اختیاری)',close:'بستن',send:'ارسال درخواست',sending:'در حال ارسال…',
    success:'سپاسگزارم، درخواست شما ثبت شد. برای هماهنگی با شما تماس می‌گیرم.',
    error:'دریافت درخواست شما تأیید نشد. لطفاً دوباره روی «ارسال درخواست» بزنید یا از طریق تلگرام تماس بگیرید.',
    setup:'فرم در حال حاضر در دسترس نیست. لطفاً از طریق تلگرام تماس بگیرید.',telegram:'تماس در تلگرام',
    invalid:'لطفاً شمارهٔ تماس را همراه با کد کشور وارد کنید.',
    types:{general:'سایر درخواست‌ها',teaching:'کلاس آنلاین / ارزیابی اولیه',vellum:'مشاورهٔ ولوم هاوس',collaboration:'همکاری / رویداد علمی'},
    hints:{general:'در چند جمله بنویسید چه کمکی از من برمی‌آید.',teaching:'درس یا زبان موردنظر، سطح فعلی، هدف و زمان‌های مناسب برای کلاس را بنویسید.',vellum:'مقطع تحصیلی، هدف و مهلت‌های مهم را بنویسید. اگر برای شخص دیگری درخواست می‌دهید، نسبت خود را با او ذکر کنید.',collaboration:'نوع همکاری، موضوع و تاریخ یا مهلت پیشنهادی را بنویسید.'}
  } : {
    title:'Let’s start a conversation',intro:'Share a few details about how I can help.',
    name:'Full name',email:'Email address',phone:'Phone number (with country code)',topic:'Enquiry type',
    message:'Your message',zone:'City / time zone (optional)',close:'Close',send:'Send enquiry',sending:'Sending…',
    success:'Thank you—your enquiry has been received. I’ll be in touch to discuss the next steps.',
    error:'We couldn’t confirm your submission. Please click “Send enquiry” again or contact me on Telegram.',
    setup:'The form is currently unavailable. Please contact me on Telegram.',telegram:'Contact on Telegram',
    invalid:'Please enter a phone number including your country code.',
    types:{general:'General enquiry',teaching:'Online classes / initial assessment',vellum:'Vellum House consultation',collaboration:'Collaboration / science event'},
    hints:{general:'Briefly tell me what you have in mind.',teaching:'Which subject or language? Include your current level, learning goal and preferred class times.',vellum:'Share the student’s education stage, goals and any deadlines. If enquiring for someone else, mention your relationship.',collaboration:'Briefly describe your project or event and include any proposed dates or deadlines.'}
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'enquiry-dialog';
  dialog.setAttribute('aria-labelledby','enquiry-title');
  dialog.innerHTML = `<button type="button" class="enquiry-close" aria-label="${t.close}">×</button>
    <h2 id="enquiry-title">${t.title}</h2><p>${t.intro}</p>
    <form class="enquiry-form">
      <div class="enquiry-grid">
        <label>${t.name}<input name="name" autocomplete="name" required maxlength="100"></label>
        <label>${t.email}<input name="email" type="email" autocomplete="email" dir="ltr" required maxlength="180"></label>
        <label>${t.phone}<input name="phone" type="tel" autocomplete="tel" dir="ltr" required maxlength="40" placeholder="+98 …"></label>
        <label>${t.zone}<input name="zone" autocomplete="address-level2" maxlength="100"></label>
      </div>
      <label>${t.topic}<select name="topic">${Object.entries(t.types).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
      <label>${t.message}<textarea name="message" rows="3" required maxlength="2500" aria-describedby="enquiry-hint"></textarea></label>
      <p id="enquiry-hint" class="small"></p>
      <div class="enquiry-trap" aria-hidden="true"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="button primary" type="submit">${t.send}</button>
    </form><p class="enquiry-status" role="status" aria-live="polite" tabindex="-1"></p>
    <a class="enquiry-fallback text-link" href="https://t.me/Reysics" target="_blank" rel="noopener noreferrer" hidden>${t.telegram}</a>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.enquiry-status');
  const fallback = dialog.querySelector('.enquiry-fallback');
  const submit = form.querySelector('[type=submit]');
  let trigger, busy=false, submitted=false, requestId='', pendingPayload=null;
  const freshId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const hint = () => { dialog.querySelector('#enquiry-hint').textContent=t.hints[form.elements.topic.value]; };
  const validEndpoint = () => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(window.REY_FORM_ENDPOINT || '');
  form.elements.topic.addEventListener('change',hint);
  form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
  document.querySelectorAll('[data-enquiry]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault(); trigger=link;
    if(submitted){form.reset();submitted=false;requestId='';pendingPayload=null;}
    form.hidden=false;
    if(!pendingPayload){form.elements.topic.value=link.dataset.enquiry; hint();}
    status.textContent=validEndpoint()?'':t.setup;
    fallback.hidden=validEndpoint();submit.disabled=!validEndpoint() || busy;
    dialog.showModal();document.body.classList.add('enquiry-open');
    form.elements.name.focus();
  }));
  dialog.querySelector('.enquiry-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('enquiry-open');trigger?.focus({preventScroll:true});});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy || !validEndpoint())return;
    const phone=form.elements.phone.value.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632));
    if(!/^\+?[\d\s().-]{7,40}$/.test(phone) || phone.replace(/\D/g,'').length<7){form.elements.phone.setCustomValidity(t.invalid);form.elements.phone.reportValidity();return;}
    if(!form.reportValidity())return;
    const current={...Object.fromEntries(new FormData(form)),phone,language:fa?'fa':'en',source:location.origin+location.pathname+location.hash};
    // Freeze an uncertain request for retries; one ID always represents the same enquiry.
    if(!pendingPayload){requestId=freshId();pendingPayload={...current,id:requestId};}
    busy=true; submit.disabled=true;submit.textContent=t.sending;status.textContent='';fallback.hidden=true;
    [...form.elements].forEach(el=>{el.disabled=true;});
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
    try {
      const response=await fetch(window.REY_FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(pendingPayload),redirect:'follow',credentials:'omit',signal:controller.signal});
      if(!response.ok)throw new Error('HTTP');
      const result=await response.json();
      if(!result.ok){
        if(['validation','rate','busy'].includes(result.code))pendingPayload=null;
        throw new Error('Unconfirmed');
      }
      if(result.id!==requestId)throw new Error('Unconfirmed');
      submitted=true;pendingPayload=null;form.hidden=true;status.textContent=t.success;status.focus();
    } catch(error) {
      status.textContent=t.error;fallback.hidden=false;
    } finally {
      clearTimeout(timer);busy=false;[...form.elements].forEach(el=>{el.disabled=false;});submit.textContent=t.send;
      // Keep uncertain payload fields fixed so retry cannot silently discard edits.
      if(pendingPayload){[...form.elements].forEach(el=>{if(el!==submit)el.disabled=true;});}
    }
  });
})();
