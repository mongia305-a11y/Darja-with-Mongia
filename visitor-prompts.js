(function () {
  'use strict';
  if (window.darjaPromotions) return;

  const visitKey = 'darjaPromotionVisit';
  const seenKey = 'darjaPromotionSeen';
  const dismissKey = 'darjaBookOfferDismissedUntil';
  const week = 7 * 24 * 60 * 60 * 1000;
  function read(storage, key) {
    try { return JSON.parse(window[storage].getItem(key)); } catch (_) { return null; }
  }
  function write(storage, key, value) {
    try { window[storage].setItem(key, JSON.stringify(value)); } catch (_) { /* Keep the in-page state. */ }
  }
  let visit = read('sessionStorage', visitKey);
  if (!visit || typeof visit.returning !== 'boolean') {
    visit = { returning: !!read('localStorage', seenKey), shown: null };
    write('localStorage', seenKey, true);
    write('sessionStorage', visitKey, visit);
  }
  function claimed() {
    const saved = read('sessionStorage', visitKey);
    return visit.shown || saved && saved.shown;
  }
  function bookDismissed() { return Number(read('localStorage', dismissKey)) > Date.now(); }
  function newsletterSuppressed() {
    const preference = read('localStorage', 'darjaNewsletterPreference');
    return !!preference && (preference.subscribed === true || Number(preference.dismissedUntil) > Date.now());
  }
  // Keep the newsletter first on a new visitor's first visit. A returning
  // visitor gets the book opportunity when it is not in its dismissal period.
  function preferBook() { return visit.returning && !bookDismissed(); }
  window.darjaPromotions = {
    canShow(kind) { return !claimed() && (kind !== 'newsletter' || !preferBook()); },
    markShown(kind) {
      visit.shown = kind;
      write('sessionStorage', visitKey, visit);
      document.dispatchEvent(new CustomEvent('darja:promotion-shown', { detail: kind }));
    }
  };

  // These pages are tasks or already contain the complete book offer.
  if (/\/(?:survival-guide-audio|placement-test)\.html$/.test(location.pathname)) return;
  let card, timer, readySince = null, stopped = false;
  function privacyReady() {
    const privacy = document.getElementById('cookieConsent');
    return !!privacy && privacy.hidden && !privacy.open;
  }
  function busy() {
    return document.visibilityState === 'hidden' || !!document.querySelector('dialog[open]') ||
      !!(document.activeElement && document.activeElement.matches('input, textarea, select, [contenteditable="true"]')) ||
      Array.from(document.querySelectorAll('audio, video')).some(media => !media.paused && !media.ended);
  }
  function halfway() {
    const length = document.documentElement.scrollHeight - window.innerHeight;
    return length > 0 && window.scrollY >= length / 2;
  }
  function inlineOfferVisible() {
    const offer = document.getElementById('survival-guide');
    if (!offer) return false;
    const bounds = offer.getBoundingClientRect();
    return bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0;
  }
  function hide() {
    if (card && !card.hidden) {
      const focused = card.contains(document.activeElement);
      card.hidden = true;
      if (focused && document.activeElement) document.activeElement.blur();
    }
    stopped = true;
    clearTimeout(timer);
  }
  function dismiss() {
    write('localStorage', dismissKey, Date.now() + week);
    hide();
  }
  function createCard() {
    card = document.createElement('aside');
    card.className = 'darja-book-offer';
    card.id = 'darjaBookOffer';
    card.setAttribute('aria-labelledby', 'darja-book-offer-title');
    card.innerHTML = '<button class="darja-book-offer-close" type="button" aria-label="Close book offer"><span aria-hidden="true">×</span></button>' +
      '<img class="darja-book-offer-cover" src="https://darja-survival-guide-audio.crisptitan32.chatgpt.site/book-cover.jpg" width="1600" height="2560" alt="Tunisian Arabic Survival Guide cover">' +
      '<div class="darja-book-offer-copy"><p class="darja-book-offer-kicker">A little Darja for your trip</p>' +
      '<h2 id="darja-book-offer-title">Tunisian Arabic<br>Survival Guide</h2>' +
      '<p class="darja-book-offer-format">PDF + downloadable audio</p>' +
      '<p class="darja-book-offer-price"><strong>€5.99</strong> <del aria-label="Previously 10 euros">€10.00</del></p>' +
      '<a class="darja-book-offer-button" href="https://payhip.com/b/qpQJc" target="_blank" rel="noopener noreferrer">Get the PDF + Audio <span aria-hidden="true">↗</span></a></div>';
    card.querySelector('button').addEventListener('click', dismiss);
    card.querySelector('a').addEventListener('click', dismiss);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !card.hidden) dismiss(); });
    document.body.appendChild(card);
    window.darjaPromotions.markShown('book');
  }
  function attempt() {
    clearTimeout(timer);
    if (stopped || claimed() || bookDismissed()) return;
    if (!privacyReady()) { readySince = null; return; }
    if (readySince === null) readySince = Date.now();
    const remaining = 30000 - (Date.now() - readySince);
    if (remaining > 0) { timer = setTimeout(attempt, remaining); return; }
    if ((!visit.returning && !newsletterSuppressed()) || !halfway()) return;
    if (busy() || inlineOfferVisible()) { timer = setTimeout(attempt, 2000); return; }
    createCard();
  }
  function overlayChanged() {
    if (card && !card.hidden && (document.querySelector('dialog[open]') || !privacyReady())) hide();
    attempt();
  }
  function init() {
    // Observe both the existing cookie dialog and any later newsletter dialog.
    new MutationObserver(overlayChanged).observe(document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden']
    });
    window.addEventListener('scroll', attempt, { passive: true });
    window.addEventListener('resize', attempt, { passive: true });
    document.addEventListener('visibilitychange', overlayChanged);
    document.addEventListener('darja:promotion-shown', event => { if (event.detail !== 'book') hide(); });
    window.addEventListener('storage', event => {
      if ((event.key === dismissKey || event.key === null) && bookDismissed()) hide();
    });
    attempt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
