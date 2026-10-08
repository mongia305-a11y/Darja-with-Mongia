/* A disclosure with ordinary links: usable by mouse, touch and keyboard. */
(() => {
  'use strict';

  document.querySelectorAll('[data-lesson-menu]').forEach(menu => {
    const toggle = menu.querySelector('.lesson-menu-toggle');
    const parentLink = menu.querySelector('.lesson-menu-link');
    const list = menu.querySelector('.lesson-menu-list');
    const links = Array.from(list.querySelectorAll('a'));
    let closeTimer;

    const clearCloseTimer = () => window.clearTimeout(closeTimer);
    const setOpen = open => {
      clearCloseTimer();
      list.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close Free Lessons topics' : 'Open Free Lessons topics');
    };

    toggle.addEventListener('click', () => setOpen(list.hidden));

    // Hover the label; keep the arrow an independent click/tap control.
    parentLink.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') setOpen(true);
    });
    menu.addEventListener('pointerenter', clearCloseTimer);
    menu.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      closeTimer = window.setTimeout(() => {
        if (!menu.contains(document.activeElement)) setOpen(false);
      }, 220);
    });

    menu.addEventListener('focusout', event => {
      if (!menu.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('pointerdown', event => {
      if (!menu.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || list.hidden) return;
      const focusWasInside = menu.contains(document.activeElement);
      setOpen(false);
      if (focusWasInside) {
        event.preventDefault();
        toggle.focus();
      }
    });

    menu.addEventListener('keydown', event => {
      const index = links.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setOpen(true);
        const next = index < 0 ? (direction === 1 ? 0 : links.length - 1)
          : (index + direction + links.length) % links.length;
        links[next].focus();
      } else if (index >= 0 && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault();
        links[event.key === 'Home' ? 0 : links.length - 1].focus();
      }
    });

    // A restored page must not retain an open menu from an earlier visit.
    window.addEventListener('pageshow', () => setOpen(false));
    menu.classList.add('is-ready');
    setOpen(false);
  });
})();

// Load the shared contact window on pages that use this navigation.
(() => {
  const script = document.createElement('script');
  script.src = new URL('contact.js?v=1', document.currentScript.src).href;
  document.head.appendChild(script);
})();
