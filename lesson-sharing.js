/* Progressive enhancement only; existing lesson state is never changed. */
(() => {
  'use strict';
  document.querySelectorAll('[data-dwm-share]').forEach(section => {
    if (section.dataset.dwmReady) return;
    section.dataset.dwmReady = 'true';
    const input = section.querySelector('[data-dwm-share-url]');
    const copy = section.querySelector('[data-dwm-copy]');
    const more = section.querySelector('[data-dwm-native-share]');
    const details = section.querySelector('details');
    const status = section.querySelector('[role="status"]');
    const url = input.value;
    const title = section.dataset.dwmTitle;
    function announce(message) {
      status.hidden = false;
      status.textContent = message;
    }
    function manualCopy() {
      details.open = true;
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      announce('The lesson link is selected. Copy it using your device’s copy command.');
    }
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          manualCopy();
          return;
        }
        await navigator.clipboard.writeText(url);
        announce('Link copied! You can paste it into a message or post.');
      } catch (error) {
        manualCopy();
      }
    });
    if (typeof navigator.share === 'function') {
      const data = { title, text:'Learn Tunisian Arabic with Darja with Mongia: ' + title, url };
      let supported = true;
      try { if (typeof navigator.canShare === 'function') supported = navigator.canShare(data); }
      catch (error) { supported = false; }
      if (supported) {
        more.hidden = false;
        more.addEventListener('click', async () => {
          try { await navigator.share(data); }
          catch (error) {
            if (error && error.name === 'AbortError') return;
            details.open = true;
            announce('Sharing is unavailable here. Copy the lesson link or choose WhatsApp or Facebook.');
          }
        });
      }
    }
    input.addEventListener('click', () => input.select());
  });
})();
