/* Apply a saved choice before the page renders; keep the existing light default. */
(() => {
  'use strict';
  const key = 'darja-color-theme';
  const root = document.documentElement;
  function savedTheme() {
    try { return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; }
    catch (_) { return 'light'; }
  }
  function apply(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    document.querySelectorAll('.darja-theme-toggle').forEach(button => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      button.querySelector('span').textContent = dark ? 'Light mode' : 'Dark mode';
      button.querySelector('[data-theme-moon]').style.display = dark ? 'none' : '';
      button.querySelector('[data-theme-sun]').style.display = dark ? '' : 'none';
    });
    let meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#17151d' : '#f9f7ff';
  }
  apply(savedTheme());
  function mount() {
    const header = document.querySelector('body > .navbar, body > .site-header');
    if (!header || header.querySelector('.darja-theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'darja-theme-toggle';
    button.innerHTML = '<svg data-theme-moon aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z"/></svg><svg data-theme-sun aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg><span></span>';
    button.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(theme);
      try { localStorage.setItem(key, theme); } catch (_) { /* Works even when storage is unavailable. */ }
    });
    header.appendChild(button);
    apply(root.dataset.theme);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) apply(savedTheme()); });
})();
