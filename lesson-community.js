/* Compact lesson sharing and moderated feedback. No lesson state or analytics settings are changed. */
(() => {
  'use strict';
function approvedReviews(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(item => item && item.approved === true && item.publishConsent === true
    && typeof item.nickname === 'string' && item.nickname.trim().length > 0 && item.nickname.length <= 60
    && (item.rating === null || (Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5))
    && typeof item.comment === 'string' && item.comment.length <= 1500
    && (item.rating !== null || item.comment.trim().length > 0)
    && typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && Number.isFinite(Date.parse(item.date))
    && (!item.reply || (typeof item.reply === 'string' && item.reply.length <= 1500)));
}
function feedbackPayload(form, lesson, title, url) {
  const nickname = form.elements.nickname.value.trim();
  const comment = form.elements.comment.value.trim();
  const rawRating = form.elements.rating.value;
  const rating = /^[1-5]$/.test(rawRating) ? Number(rawRating) : null;
  if (!nickname || nickname.length > 60 || comment.length > 1500 || (!rating && !comment)) return null;
  return {
    nickname,
    rating:rating || 'No rating — comment only',
    comment:comment || '(No comment)',
    publish_consent:form.elements.publish_consent.checked ? 'Yes — may publish after moderation' : 'No — private feedback only',
    lesson:title,
    lesson_path:lesson,
    lesson_url:url,
    _subject:'Lesson feedback — ' + title + ' — Darja with Mongia',
    _template:'table',
    _captcha:'false',
    _honey:form.elements._honey.value
  };
}

  document.querySelectorAll('[data-dwm-community]').forEach(section => {
    if (section.dataset.dwmReady) return;
    section.dataset.dwmReady = 'true';
    const dialog=section.querySelector('[data-c-dialog]');
    const form=section.querySelector('form');
    const status=section.querySelector('[data-c-form-status]');
    const shareStatus=section.querySelector('[data-c-share-status]');
    const copyFallback=section.querySelector('[data-c-copy-fallback]');
    const linkInput=section.querySelector('[data-c-copy-url]');
    const submit=form.querySelector('[type="submit"]');
    const quickStars=Array.from(section.querySelectorAll('[data-c-rating]'));
    const radios=Array.from(form.querySelectorAll('[name="rating"]'));
    const lesson=section.dataset.lesson;
    const title=section.dataset.lessonTitle;
    const url=section.dataset.lessonUrl;
    let previousFocus;
    let sending=false;
    function paintStars() {
      const selected=Number(form.elements.rating.value)||0;
      radios.forEach(radio => {
        radio.parentElement.dataset.selected=Number(radio.value)<=selected?'true':'false';
      });
      quickStars.forEach(button => {
        button.querySelector('span').textContent=Number(button.dataset.cRating)<=selected?'★':'☆';
      });
    }
    function validate() {
      form.elements.nickname.setCustomValidity(form.elements.nickname.value.trim()?'':'Please enter a first name or nickname.');
      form.elements.comment.setCustomValidity(!form.elements.rating.value&&!form.elements.comment.value.trim()
        ?'Please choose a rating or write a comment or question.':'');
    }
    function openFeedback(trigger,rating) {
      previousFocus=trigger;
      if(rating&&!sending) {
        const radio=radios.find(item=>item.value===String(rating));
        if(radio)radio.checked=true;
      }
      paintStars();
      validate();
      if(typeof dialog.showModal==='function') {
        if(!dialog.open)dialog.showModal();
      } else {
        // Inline fallback keeps the form usable on browsers without dialog support.
        dialog.setAttribute('open','');
        dialog.classList.add('dwm-c-dialog-fallback');
        form.elements.nickname.focus();
      }
    }
    function closeFeedback() {
      if(typeof dialog.close==='function')dialog.close();
      else {
        dialog.removeAttribute('open');
        if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
      }
    }
    quickStars.forEach(button=>button.addEventListener('click',()=>openFeedback(button,button.dataset.cRating)));
    section.querySelector('[data-c-comment]').addEventListener('click',event=>openFeedback(event.currentTarget));
    section.querySelector('[data-c-close]').addEventListener('click',closeFeedback);
    dialog.addEventListener('close',()=>{if(previousFocus&&previousFocus.isConnected)previousFocus.focus();});
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const box=dialog.getBoundingClientRect();
      if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeFeedback();
    });
    radios.forEach(radio=>radio.addEventListener('change',()=>{paintStars();validate();}));
    form.elements.nickname.addEventListener('input',validate);
    form.elements.comment.addEventListener('input',validate);
    section.querySelector('[data-c-clear-rating]').addEventListener('click',()=>{
      radios.forEach(radio=>{radio.checked=false;});
      paintStars();validate();
    });
    function sayShare(message) {
      shareStatus.hidden=false;
      shareStatus.textContent=message;
    }
    function manualCopy() {
      copyFallback.hidden=false;
      linkInput.focus();linkInput.select();
      linkInput.setSelectionRange(0,linkInput.value.length);
      sayShare('Copy the selected lesson link.');
    }
    section.querySelector('[data-c-copy]').addEventListener('click',async()=>{
      try {
        if(!navigator.clipboard||!navigator.clipboard.writeText){manualCopy();return;}
        await navigator.clipboard.writeText(url);
        sayShare('Lesson link copied!');
      } catch(error){manualCopy();}
    });
    const nativeShare=section.querySelector('[data-c-native-share]');
    if(typeof navigator.share==='function') {
      const data={title,text:'Learn Tunisian Arabic with Darja with Mongia: '+title,url};
      let supported=true;
      try {if(typeof navigator.canShare==='function')supported=navigator.canShare(data);}
      catch(error){supported=false;}
      if(supported) {
        nativeShare.hidden=false;
        nativeShare.addEventListener('click',async()=>{
          try {await navigator.share(data);}
          catch(error) {
            if(error&&error.name==='AbortError')return;
            sayShare('Choose WhatsApp or Facebook, or copy the lesson link.');
          }
        });
      }
    }
    function sayForm(message,state) {
      status.hidden=false;status.textContent=message;status.dataset.state=state;
    }
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(sending||form.elements._honey.value)return;
      validate();
      if(!form.reportValidity())return;
      const payload=feedbackPayload(form,lesson,title,url);
      if(!payload)return;
      sending=true;submit.disabled=true;submit.textContent='Sending…';
      form.setAttribute('aria-busy','true');
      sayForm('Sending your feedback…','pending');
      const controller=new AbortController();
      const timeout=window.setTimeout(()=>controller.abort(),20000);
      try {
        const response=await fetch('https://formsubmit.co/ajax/contact@darjawithmongia.com',{
          method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(payload),signal:controller.signal,credentials:'omit'
        });
        const result=await response.json();
        if(/activat|confirm/i.test(result.message||'')) {
          sayForm('Feedback is awaiting activation. Your text is still here. Please use the email link below for now.','error');
        } else if(response.ok&&(result.success===true||result.success==='true')) {
          sayForm('Thank you! Your feedback was submitted to Mongia for review. Public reviews appear after approval and publication.','success');
          form.reset();paintStars();
          form.elements.nickname.setCustomValidity('');
          form.elements.comment.setCustomValidity('');
        } else throw Error('Feedback was not accepted.');
      } catch(error) {
        sayForm('We couldn’t confirm submission. Your text is still here. Please try again or use the email link below.','error');
      } finally {
        window.clearTimeout(timeout);sending=false;submit.disabled=false;
        submit.textContent='Send feedback ↗';form.removeAttribute('aria-busy');
      }
    });
    // Only explicitly approved, consented public entries are fetched. Raw submissions are never published.
    fetch('lesson-feedback-approved.json',{cache:'no-cache',credentials:'omit'})
      .then(response=>{if(!response.ok)throw Error('Reviews unavailable');return response.json();})
      .then(data=>{
        const reviews=approvedReviews(data.lessons&&data.lessons[lesson]);
        if(!reviews.length)return;
        const ratings=reviews.filter(review=>review.rating!==null);
        const summary=section.querySelector('[data-c-summary]');
        if(ratings.length) {
          const average=ratings.reduce((total,review)=>total+review.rating,0)/ratings.length;
          summary.textContent=average.toFixed(1)+' / 5 · '+ratings.length+(ratings.length===1?' approved rating':' approved ratings');
          summary.hidden=false;
        }
        const list=section.querySelector('[data-c-review-list]');
        reviews.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach(review=>{
          const article=document.createElement('article');article.className='dwm-c-review';
          const meta=document.createElement('div');meta.className='dwm-c-review-meta';
          const author=document.createElement('strong');author.textContent=review.nickname;
          const date=document.createElement('time');date.dateTime=review.date;date.textContent=review.date;
          meta.append(author,date);article.append(meta);
          if(review.rating!==null) {
            const rating=document.createElement('p');rating.className='dwm-c-review-stars';
            rating.textContent='★'.repeat(review.rating)+'☆'.repeat(5-review.rating);
            rating.setAttribute('aria-label',review.rating+' out of 5 stars');article.append(rating);
          }
          if(review.comment.trim()) {
            const text=document.createElement('p');text.textContent=review.comment;article.append(text);
          }
          if(review.reply) {
            const reply=document.createElement('div');reply.className='dwm-c-reply';
            const label=document.createElement('strong');label.textContent='Mongia’s reply';
            const text=document.createElement('p');text.textContent=review.reply;
            reply.append(label,text);article.append(reply);
          }
          list.append(article);
        });
        section.querySelector('[data-c-reviews]').hidden=false;
      })
      .catch(()=>{
        const notice=section.querySelector('[data-c-review-notice]');
        notice.hidden=false;notice.textContent='Published reviews are temporarily unavailable. You can still leave feedback.';
      });
  });
})();
