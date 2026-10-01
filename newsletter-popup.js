(function () {
  'use strict';
  if (window.darjaNewsletterReady) return;
  window.darjaNewsletterReady = true;

  const uid = 'bcbed786bc';
  const key = 'darjaNewsletterPreference';
  const week = 7 * 24 * 60 * 60 * 1000;
  const selector = 'form[data-uid="' + uid + '"]';
  let timer, retry, dialog, slot, fallback, form, origin, nextSibling, previousFocus;
  let dismissed = false;
  let subscribed = false;
  let elapsed = false;
  let loading = false;
  let loadAttempts = 0;

  function suppressed() {
    if (dismissed || subscribed) return true;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return !!saved && (saved.subscribed === true || Number(saved.dismissedUntil) > Date.now());
    } catch (_) { return false; }
  }

  function remember(success) {
    subscribed = success || subscribed;
    dismissed = !success;
    try {
      localStorage.setItem(key, JSON.stringify(success ? { subscribed: true } : { dismissedUntil: Date.now() + week }));
    } catch (_) { /* The preference still applies for this page. */ }
    clearTimeout(timer);
    clearTimeout(retry);
  }

  function privacyReady() {
    const privacy = document.getElementById('cookieConsent');
    return !!privacy && privacy.hidden && !privacy.open;
  }

  function busy() {
    if (document.visibilityState === 'hidden') return true;
    if (document.querySelector('dialog[open]')) return true;
    if (document.activeElement && document.activeElement.matches('input, textarea, select, [contenteditable="true"]')) return true;
    return Array.from(document.querySelectorAll('audio, video')).some(media => !media.paused && !media.ended);
  }

  function closePopup(savePreference) {
    if (!dialog || !dialog.open) return;
    if (savePreference) remember(false);
    dialog.close();
    document.documentElement.classList.remove('darja-newsletter-open');
    if (form && origin) origin.insertBefore(form, nextSibling && nextSibling.parentNode === origin ? nextSibling : null);
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'darjaNewsletterDialog';
    dialog.className = 'darja-newsletter-dialog';
    dialog.setAttribute('aria-label', 'Keep learning Tunisian Arabic — email updates');
    dialog.innerHTML = '<div class="darja-newsletter-bar"><img src="/images/full-logo.png" width="150" height="63" alt="Darja with Mongia"><button type="button" class="darja-newsletter-close" aria-label="Close newsletter signup" autofocus><span aria-hidden="true">×</span></button></div><div class="darja-newsletter-slot"></div><div class="darja-newsletter-fallback"><h2>Keep learning Tunisian Arabic!</h2><p>Get email updates about new lessons.</p></div><p class="darja-newsletter-help"><a href="https://darja-with-mongia.kit.com/bcbed786bc" target="_blank" rel="noopener">Open the signup form in a new tab</a></p>';
    slot = dialog.querySelector('.darja-newsletter-slot');
    fallback = dialog.querySelector('.darja-newsletter-fallback');
    // Kit may finish initializing or replace its markup after the dialog opens.
    // Keep a useful signup route visible even when the embed is unavailable.
    new MutationObserver(updateFallback).observe(slot, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'data-format'] });
    dialog.querySelector('button').addEventListener('click', () => closePopup(true));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closePopup(true); });
    document.body.appendChild(dialog);
  }

  function usableForm(candidate) {
    return !!candidate && candidate.dataset.format === 'inline' &&
      !!candidate.querySelector('input[name="email_address"]') &&
      !!candidate.querySelector('button[type="submit"], button[data-element="submit"]') &&
      !candidate.hidden && getComputedStyle(candidate).display !== 'none';
  }

  function updateFallback() {
    const embedded = slot.querySelector(selector);
    const success = embedded && embedded.querySelector('.formkit-alert-success');
    const visible = usableForm(embedded) && embedded.getBoundingClientRect().height > 0 ||
      !!success && success.getBoundingClientRect().height > 0 && !!success.textContent.trim();
    if (fallback.hidden !== !!visible) fallback.hidden = !!visible;
  }

  function enhanceForm(candidate) {
    if (candidate.dataset.darjaEnhanced) return;
    candidate.dataset.darjaEnhanced = 'true';
    const input = candidate.querySelector('input[name="email_address"]');
    if (input) {
      input.type = 'email';
      input.autocomplete = 'email';
      input.inputMode = 'email';
    }
    const observer = new MutationObserver(() => {
      const success = candidate.querySelector('.formkit-alert-success');
      if (!success || !success.textContent.trim() || success.hidden || getComputedStyle(success).display === 'none') return;
      remember(true);
      observer.disconnect();
      // Let the visitor read Kit's confirmation before returning to the page.
      if (dialog && dialog.open) {
        const notice = document.createElement('p');
        notice.className = 'darja-newsletter-notice';
        notice.setAttribute('role', 'status');
        notice.textContent = 'Check your email to confirm your subscription. Thank you!';
        document.body.appendChild(notice);
        setTimeout(() => closePopup(false), 2500);
        setTimeout(() => notice.remove(), 12000);
      }
    });
    observer.observe(candidate, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  }

  function loadForm() {
    if (loading) return;
    loading = true;
    // The homepage already owns a Kit embed. Reuse it rather than duplicating fields.
    if (document.querySelector('script[data-uid="' + uid + '"]')) return;
    const host = document.createElement('div');
    host.hidden = true;
    host.id = 'darjaNewsletterSource';
    const script = document.createElement('script');
    script.async = true;
    script.dataset.uid = uid;
    script.src = 'https://darja-with-mongia.kit.com/' + uid + '/index.js?v=20261001';
    host.appendChild(script);
    document.body.appendChild(host);
  }

  function attemptOpen() {
    if (suppressed() || !privacyReady()) return;
    if (busy()) { retry = setTimeout(attemptOpen, 2000); return; }
    form = document.querySelector(selector);
    if (!usableForm(form)) {
      loadForm();
      if (loadAttempts++ < 20) { retry = setTimeout(attemptOpen, 1000); return; }
      // Never open a header-only popup if an embed is blocked, stale or incomplete.
      form = null;
    }
    if (form) enhanceForm(form);
    // Do not interrupt a visitor who has already reached the inline signup form.
    const bounds = form && form.getBoundingClientRect();
    if (bounds && bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0) return;
    if (!dialog) createDialog();
    origin = form && form.parentNode;
    nextSibling = form && form.nextSibling;
    previousFocus = document.activeElement;
    if (form) slot.appendChild(form);
    dialog.showModal();
    updateFallback();
    document.documentElement.classList.add('darja-newsletter-open');
  }

  function schedule() {
    clearTimeout(timer);
    clearTimeout(retry);
    if (!privacyReady()) {
      elapsed = false;
      closePopup(false);
      return;
    }
    if (suppressed() || /placement-test\.html$/.test(location.pathname)) return;
    timer = setTimeout(() => { elapsed = true; attemptOpen(); }, 15000);
  }

  function init() {
    const privacy = document.getElementById('cookieConsent');
    if (!privacy) return;
    new MutationObserver(schedule).observe(privacy, { attributes: true, attributeFilter: ['open', 'hidden'] });
    const forms = new MutationObserver(() => {
      const candidate = document.querySelector(selector);
      if (candidate) { enhanceForm(candidate); forms.disconnect(); }
    });
    forms.observe(document.body, { childList: true, subtree: true });
    const existing = document.querySelector(selector);
    if (existing) { enhanceForm(existing); forms.disconnect(); }
    document.addEventListener('visibilitychange', () => {
      if (elapsed && document.visibilityState === 'visible' && !(dialog && dialog.open)) {
        clearTimeout(retry);
        attemptOpen();
      }
    });
    window.addEventListener('storage', event => {
      if (event.key === key && suppressed()) closePopup(false);
    });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
