/* A message form in the site's soft pink palette. No automatic pop-up. */
(() => {
  'use strict';
  if (document.getElementById('darja-contact-dialog')) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('contact.css?v=dark1', document.currentScript.src).href;
  document.head.appendChild(stylesheet);
  const dialog = document.createElement('dialog');
  dialog.id = 'darja-contact-dialog';
  dialog.className = 'darja-contact-dialog';
  dialog.setAttribute('aria-labelledby', 'darja-contact-title');
  dialog.setAttribute('aria-describedby', 'darja-contact-intro');
  dialog.innerHTML = `
    <button type="button" class="darja-contact-close" aria-label="Close contact window">×</button>
    <h2 class="darja-contact-heading" id="darja-contact-title">Contact Mongia</h2>
    <p class="darja-contact-intro" id="darja-contact-intro">Have a question about Tunisian Arabic, a lesson, or the website? Send me a message — I’d love to hear from you!</p>
    <p class="darja-contact-reply-time">I usually reply within 2 business days (Monday–Friday).</p>
    <form action="https://formsubmit.co/contact@darjawithmongia.com" method="post">
      <label for="darja-contact-name">Your name
        <input id="darja-contact-name" name="name" type="text" autocomplete="name" placeholder="Your name" maxlength="100" required autofocus>
      </label>
      <label for="darja-contact-email">Your email
        <input id="darja-contact-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="254" required>
      </label>
      <label for="darja-contact-message">Your message
        <textarea id="darja-contact-message" name="message" rows="5" placeholder="What would you like to ask or share?" aria-describedby="darja-contact-word-count" required></textarea>
      </label>
      <p class="darja-contact-word-count" id="darja-contact-word-count" aria-live="polite">0 / 500 words</p>
      <input type="hidden" name="_subject" value="New message — Darja with Mongia">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input class="darja-contact-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="darja-contact-status" role="status" aria-live="polite" hidden></p>
      <button class="darja-contact-send" type="submit">Send message →</button>
      <p class="darja-contact-note">Your email is used to reply to your message.</p>
    </form>
    <p class="darja-contact-email">Prefer email? <a href="mailto:contact@darjawithmongia.com">contact@darjawithmongia.com</a></p>
  `;
  document.body.appendChild(dialog);
  document.querySelectorAll('[data-lesson-menu-nav]').forEach(nav => {
    const about = Array.from(nav.querySelectorAll('a')).find(link => /#about$/.test(link.getAttribute('href') || ''));
    if (!about || nav.querySelector('[data-contact-open]')) return;
    const link = document.createElement('a');
    link.href = 'mailto:contact@darjawithmongia.com';
    link.textContent = 'Contact';
    link.setAttribute('data-contact-open', '');
    about.insertAdjacentElement('afterend', link);
  });
  const triggers = document.querySelectorAll('[data-contact-open]');
  triggers.forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);
  });
  let previousFocus;
  let previousOverflow;
  function openDialog(trigger) {
    if (dialog.open) return;
    previousFocus = trigger || document.activeElement;
    previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  triggers.forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    openDialog(trigger);
  }));
  dialog.querySelector('.darja-contact-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow || '';
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  });
  if (window.location.hash === '#contact') openDialog(triggers[0]);
  const form = dialog.querySelector('form');
  const send = dialog.querySelector('.darja-contact-send');
  const status = dialog.querySelector('.darja-contact-status');
  const messageField = form.elements.message;
  const wordCounter = dialog.querySelector('.darja-contact-word-count');
  const maxWords = 500;
  function updateWordCount() {
    // Whitespace-separated words; support Arabic and Latin spelling with numbers.
    const words = messageField.value.match(/\S+/gu) || [];
    const count = words.filter(word => /[\p{L}\p{N}]/u.test(word)).length;
    const over = count > maxWords;
    const counterText = count + ' / ' + maxWords + ' words'
      + (over ? ' — Please shorten your message.' : '');
    if (wordCounter.textContent !== counterText) wordCounter.textContent = counterText;
    wordCounter.dataset.state = over ? 'error' : 'normal';
    messageField.setCustomValidity(over ? 'Please keep your message to 500 words or fewer.'
      : (messageField.value.trim() ? '' : 'Please fill in this field.'));
    if (over) messageField.setAttribute('aria-invalid', 'true');
    else messageField.removeAttribute('aria-invalid');
    return count;
  }
  messageField.addEventListener('input', updateWordCount);
  updateWordCount();
  let sending = false;
  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  }
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    ['name', 'message'].forEach(name => {
      const field = form.elements[name];
      field.setCustomValidity(field.value.trim() ? '' : 'Please fill in this field.');
    });
    updateWordCount();
    if (!form.reportValidity()) return;
    if (form.elements._honey.value) return;
    sending = true;
    send.disabled = true;
    send.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    setStatus('Sending your message…', 'pending');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.name = payload.name.trim();
      payload.message = payload.message.trim();
      payload._replyto = payload.email;
      payload._url = window.location.href;
      const response = await fetch('https://formsubmit.co/ajax/contact@darjawithmongia.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (/activat|confirm/i.test(result.message || '')) {
        setStatus('The contact form is being activated. Please use the email link below to reach Mongia for now.', 'error');
      } else if (response.ok && (result.success === true || result.success === 'true')) {
        setStatus('Thank you! Your message has been submitted. I usually reply to your email within 2 business days.', 'success');
        form.reset();
        updateWordCount();
      } else {
        throw new Error('The service did not accept the message.');
      }
    } catch (error) {
      setStatus('We couldn’t confirm that your message was sent. Your text is still here — please try again or use the email link below.', 'error');
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      send.disabled = false;
      send.textContent = 'Send message →';
      form.removeAttribute('aria-busy');
    }
  });
})();

