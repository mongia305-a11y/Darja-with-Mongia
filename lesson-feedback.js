/* Draft: submissions require Mongia's approval before this is included on live lessons. */
(() => {
  'use strict';
  function approvedReviews(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.filter(item => item && item.approved === true && item.publishConsent === true
      && typeof item.nickname === 'string' && item.nickname.trim().length > 0 && item.nickname.length <= 60
      && (item.rating === null || (Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5))
      && typeof item.comment === 'string' && item.comment.length <= 1500
      && (item.rating !== null || item.comment.trim().length > 0)
      && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
      && (!item.reply || (typeof item.reply === 'string' && item.reply.length <= 1500)));
  }
  function feedbackPayload(form, lesson, title) {
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
      lesson_url:'https://darjawithmongia.com/' + lesson,
      _subject:'Lesson feedback — ' + title + ' — Darja with Mongia',
      _template:'table',
      _captcha:'false',
      _honey:form.elements._honey.value
    };
  }

  document.querySelectorAll('[data-dwm-feedback]').forEach(section => {
    if (section.dataset.dwmFeedbackReady) return;
    section.dataset.dwmFeedbackReady = 'true';
    const form = section.querySelector('form');
    const submit = form.querySelector('[type="submit"]');
    const status = section.querySelector('[data-dwm-feedback-status]');
    const summary = section.querySelector('[data-dwm-rating-summary]');
    const comments = section.querySelector('[data-dwm-comments]');
    const commentsWrap = section.querySelector('[data-dwm-comments-wrap]');
    const lesson = section.dataset.dwmLesson;
    const title = section.dataset.dwmTitle;
    let sending = false;
    function announce(message, state) {
      status.hidden = false;
      status.textContent = message;
      status.dataset.state = state;
    }
    function validate() {
      form.elements.nickname.setCustomValidity(form.elements.nickname.value.trim() ? '' : 'Please enter your first name or a nickname.');
      form.elements.comment.setCustomValidity(!form.elements.comment.value.trim() && !form.elements.rating.value
        ? 'Please choose a star rating or write a comment or question.' : '');
    }
    form.elements.nickname.addEventListener('input', validate);
    form.elements.comment.addEventListener('input', validate);
    form.querySelectorAll('[name="rating"]').forEach(radio => radio.addEventListener('change', () => {
      validate();
      const selected = Number(form.elements.rating.value);
      form.querySelectorAll('[data-dwm-star]').forEach(star => {
        star.dataset.selected = Number(star.dataset.dwmStar) <= selected ? 'true' : 'false';
      });
    }));
    form.querySelector('[data-dwm-clear-rating]').addEventListener('click', () => {
      form.querySelectorAll('[name="rating"]').forEach(radio => { radio.checked = false; });
      form.querySelectorAll('[data-dwm-star]').forEach(star => { star.dataset.selected = 'false'; });
      validate();
    });
    // Validation runs at submit time so native required fields remain usable.
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || form.elements._honey.value) return;
      validate();
      if (!form.reportValidity()) return;
      const payload = feedbackPayload(form, lesson, title);
      if (!payload) return;
      sending = true;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      form.setAttribute('aria-busy','true');
      announce('Sending your feedback…','pending');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(),20000);
      try {
        const response = await fetch('https://formsubmit.co/ajax/contact@darjawithmongia.com', {
          method:'POST',
          headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
          body:JSON.stringify(payload),
          signal:controller.signal,
          credentials:'omit'
        });
        const result = await response.json();
        if (/activat|confirm/i.test(result.message || '')) {
          announce('Feedback is awaiting activation. Your text is still here; please try again later.','error');
        } else if (response.ok && (result.success === true || result.success === 'true')) {
          announce('Thank you! Your feedback was submitted for review. Public reviews appear after approval.','success');
          form.reset();
          form.querySelectorAll('[data-dwm-star]').forEach(star => { star.dataset.selected = 'false'; });
          form.elements.nickname.setCustomValidity('');
          form.elements.comment.setCustomValidity('');
        } else throw new Error('Feedback was not accepted.');
      } catch (error) {
        announce('We couldn’t confirm submission. Your text is still here; please try again later.','error');
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        submit.disabled = false;
        submit.textContent = 'Submit feedback';
        form.removeAttribute('aria-busy');
      }
    });
    fetch('lesson-feedback-approved.json', { cache:'no-cache', credentials:'omit' })
      .then(response => {
        if (!response.ok) throw new Error('Reviews unavailable');
        return response.json();
      })
      .then(data => {
        const reviews = approvedReviews(data.lessons && data.lessons[lesson]);
        const ratings = reviews.filter(review => review.rating !== null);
        if (ratings.length) {
          const average = ratings.reduce((total,item) => total + item.rating,0) / ratings.length;
          summary.textContent = average.toFixed(1) + ' / 5 · ' + ratings.length + (ratings.length === 1 ? ' approved rating' : ' approved ratings');
          summary.hidden = false;
        }
        reviews.forEach(review => {
          const article = document.createElement('article');
          article.className = 'dwm-published-review';
          const author = document.createElement('strong');
          author.textContent = review.nickname;
          const date = document.createElement('time');
          date.dateTime = review.date;
          date.textContent = review.date;
          const heading = document.createElement('div');
          heading.className = 'dwm-review-meta';
          heading.append(author,date);
          article.append(heading);
          if (review.rating !== null) {
            const stars = document.createElement('p');
            stars.className = 'dwm-review-rating';
            stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5-review.rating);
            stars.setAttribute('aria-label',review.rating + ' out of 5 stars');
            article.append(stars);
          }
          if (review.comment.trim()) {
            const comment = document.createElement('p');
            comment.textContent = review.comment;
            article.append(comment);
          }
          if (review.reply) {
            const reply = document.createElement('div');
            reply.className = 'dwm-review-reply';
            const label = document.createElement('strong');
            label.textContent = 'Mongia’s reply';
            const text = document.createElement('p');
            text.textContent = review.reply;
            reply.append(label,text);
            article.append(reply);
          }
          comments.append(article);
        });
        commentsWrap.hidden = !reviews.length;
      })
      .catch(() => {
        const notice = section.querySelector('[data-dwm-reviews-notice]');
        notice.hidden = false;
        notice.textContent = 'Published reviews are temporarily unavailable. You can still send feedback.';
      });
  });
})();
