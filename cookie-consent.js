(function () {
  "use strict";

  const measurementId = "G-QS53JJHV3J";
  const storageKey = "darjaAnalyticsConsent";
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  let analyticsLoaded = false;

  window["ga-disable-" + measurementId] = true;

  function loadAnalytics() {
    window["ga-disable-" + measurementId] = false;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  function disableAnalytics() {
    window["ga-disable-" + measurementId] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  }

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !saved.choice || !saved.savedAt) return null;
      if (Date.now() - saved.savedAt > consentLifetime) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return saved.choice;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(choice) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        choice: choice,
        savedAt: Date.now()
      }));
    } catch (error) {
      // The choice still applies for the current page if storage is unavailable.
    }
  }

  function createControls() {
    const banner = document.createElement("dialog");
    banner.className = "cookie-consent";
    banner.id = "cookieConsent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "cookieConsentTitle");
    banner.hidden = true;
    banner.innerHTML =
      '<h2 id="cookieConsentTitle">Your privacy choices</h2>' +
      '<p>We use optional Google Analytics cookies to understand visits, lesson views and downloads, so we can improve Darja with Mongia. You can accept or reject analytics. The website works either way.</p>' +
      '<div class="cookie-consent__actions">' +
      '<button type="button" class="cookie-consent__accept" data-cookie-choice="accepted">Accept analytics</button>' +
      '<button type="button" class="cookie-consent__reject" data-cookie-choice="rejected">Reject analytics</button>' +
      '</div>';

    const settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "cookie-settings-button";
    settingsButton.textContent = "Privacy & cookies";
    settingsButton.setAttribute("aria-controls", "cookieConsent");
    settingsButton.hidden = true;

    document.body.appendChild(banner);
    const privacyBar = document.createElement("div");
    privacyBar.className = "cookie-privacy-bar";
    privacyBar.appendChild(settingsButton);
    const footers = document.querySelectorAll("footer");
    let footer = footers[footers.length - 1];
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "darja-privacy-footer";
      document.body.appendChild(footer);
    }
    footer.appendChild(privacyBar);

    function showBanner() {
      banner.hidden = false;
      if (!banner.open) banner.showModal();
      settingsButton.hidden = true;
      banner.querySelector("button").focus();
    }

    function hideBanner() {
      banner.close();
      banner.hidden = true;
      settingsButton.hidden = false;
    }

    banner.addEventListener("click", function (event) {
      const button = event.target.closest("[data-cookie-choice]");
      if (!button) return;

      const choice = button.dataset.cookieChoice;
      saveConsent(choice);
      if (choice === "accepted") {
        loadAnalytics();
      } else {
        disableAnalytics();
      }
      hideBanner();
    });

    banner.addEventListener("cancel", function (event) {
      event.preventDefault();
    });
    settingsButton.addEventListener("click", showBanner);

    const consent = readConsent();
    const openPrivacy = new URLSearchParams(window.location.search).get("privacy") === "open";
    if (consent === "accepted") {
      loadAnalytics();
      settingsButton.hidden = false;
    } else if (consent === "rejected") {
      settingsButton.hidden = false;
    } else {
      showBanner();
    }
    if (openPrivacy) showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createControls);
  } else {
    createControls();
  }
})();
