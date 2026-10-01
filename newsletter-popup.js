(function () {
  'use strict';
  if (window.darjaNewsletterReady) return;
  window.darjaNewsletterReady = true;

  const uid = 'bcbed786bc';
  const key = 'darjaNewsletterPreference';
  const week = 7 * 24 * 60 * 60 * 1000;
  const selector = 'form[data-darja-signup]';
  // Local markup remains visible even if Kit's scripts are blocked by a browser.
  const formHTML = "<form class=\"darja-signup\" data-darja-signup data-sv-form=\"9978820\" data-uid=\"bcbed786bc\" data-format=\"inline\" data-version=\"5\" data-options='{\"settings\":{\"after_subscribe\":{\"action\":\"message\",\"success_message\":\"Success! Now check your email to confirm your subscription.\"},\"recaptcha\":{\"enabled\":false},\"return_visitor\":{\"action\":\"show\"}}}' action=\"https://app.kit.com/forms/9978820/subscriptions\" method=\"post\">\n  <div class=\"darja-signup-layout\">\n    <div class=\"darja-signup-picture\" aria-hidden=\"true\"></div>\n    <div class=\"darja-signup-content\">\n      <h2>Keep learning Tunisian Arabic!</h2>\n      <ul class=\"darja-signup-errors\" data-element=\"errors\" role=\"alert\"></ul>\n      <div class=\"darja-signup-fields\" data-element=\"fields\">\n        <label>Email Address\n          <input name=\"email_address\" type=\"email\" autocomplete=\"email\" inputmode=\"email\" placeholder=\"Email Address\" required>\n        </label>\n        <button type=\"submit\" data-element=\"submit\"><span>Keep me updated</span></button>\n      </div>\n      <p>Get email updates from Darja with Mongia about new lessons.</p>\n      <p>We respect your privacy. Unsubscribe at any time.</p>\n      <a class=\"darja-signup-provider\" href=\"https://kit.com/\" target=\"_blank\" rel=\"noopener\">Built with Kit</a>\n    </div>\n  </div>\n</form>";
  let clientLoading = false;
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
    return !privacy || privacy.hidden && !privacy.open;
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
    if (document.querySelector(selector)) return;
    const host = document.createElement('div');
    host.hidden = true;
    host.id = 'darjaNewsletterSource';
    host.innerHTML = formHTML;
    document.body.appendChild(host);
  }

  function loadClient() {
    if (clientLoading || !document.querySelector(selector)) return;
    clientLoading = true;
    // Optional enhancement handles Kit's confirmations. HTML POST still works
    // without this script; the script never creates or controls the form layout.
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
    document.body.appendChild(script);
  }

  function attemptOpen(manual) {
    if ((!manual && suppressed()) || !privacyReady()) return false;
    if (dialog && dialog.open) return true;
    if (typeof HTMLDialogElement === 'undefined') return false;
    if (busy()) {
      if (!manual) retry = setTimeout(() => attemptOpen(false), 2000);
      return false;
    }
    form = document.querySelector(selector);
    if (!usableForm(form)) {
      loadForm();
      form = document.querySelector(selector);
    }
    if (!usableForm(form)) {
      if (loadAttempts++ < 20) { retry = setTimeout(() => attemptOpen(manual), 1000); return false; }
      // Never open a header-only popup if an embed is blocked, stale or incomplete.
      form = null;
    }
    if (form) enhanceForm(form);
    // Do not interrupt a visitor who has already reached the inline signup form.
    const bounds = form && form.getBoundingClientRect();
    if (!manual && bounds && bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0) return false;
    if (!dialog) createDialog();
    origin = form && form.parentNode;
    nextSibling = form && form.nextSibling;
    previousFocus = document.activeElement;
    if (form) slot.appendChild(form);
    dialog.showModal();
    updateFallback();
    document.documentElement.classList.add('darja-newsletter-open');
    loadClient();
    return true;
  }

  function schedule() {
    clearTimeout(timer);
    clearTimeout(retry);
    if (!privacyReady()) {
      elapsed = false;
      closePopup(false);
      return;
    }
    loadClient();
    if (suppressed() || /placement-test\.html$/.test(location.pathname)) return;
    timer = setTimeout(() => { elapsed = true; attemptOpen(); }, 15000);
  }

  function init() {
    const privacy = document.getElementById('cookieConsent');
    if (privacy) new MutationObserver(schedule).observe(privacy, { attributes: true, attributeFilter: ['open', 'hidden'] });
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.hash !== '#newsletter' || !privacyReady()) return;
      if (attemptOpen(true)) event.preventDefault();
    });
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
        attemptOpen(false);
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
