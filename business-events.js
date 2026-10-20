(function () {
  "use strict";
  if (window.darjaBusinessEventsReady) return;
  window.darjaBusinessEventsReady = true;

  var measurementId = "G-QS53JJHV3J";
  var consentKey = "darjaAnalyticsConsent";
  var consentLifetime = 180 * 24 * 60 * 60 * 1000;
  var disableKey = "ga-disable-" + measurementId;
  var ownsAnalytics = false;
  var hasConsentManager = !!document.querySelector('script[src*="cookie-consent.js"]');

  function hasConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem(consentKey));
      var savedAt = saved && Number(saved.savedAt);
      return !!(saved && saved.choice === "accepted" && savedAt > 0 &&
        Date.now() >= savedAt && Date.now() - savedAt <= consentLifetime);
    } catch (_) { return false; }
  }

  // The existing consent manager owns analytics on normal lesson pages.
  // On the book wrapper, reuse an accepted choice without adding any popup.
  function prepareStandaloneAnalytics() {
    if (hasConsentManager || !hasConsent() || window[disableKey] === true) return;
    if (typeof window.gtag === "function") return;
    ownsAnalytics = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: ""
    });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  function classify(link) {
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return null; }
    if (url.protocol !== "https:") return null;
    var host = url.hostname.toLowerCase();
    var path = url.pathname.replace(/\/$/, "");
    if (host === "payhip.com" && path === "/b/qpQJc") {
      return { name: "guide_purchase_click", destination: "payhip" };
    }
    if ((host === "darjawithmongia.com" || host === "darja-survival-guide-audio.crisptitan32.chatgpt.site") &&
        /\/Tunisian_Arabic_Survival_Guide_Free_Preview\.pdf$/i.test(path)) {
      return { name: "guide_preview_click", destination: "free_preview" };
    }
    if ((host === "preply.com" && /^\/en\/tutor\/2654132(?:\/|$)/.test(path)) ||
        (host === "preply.in" && path === "/MONGIA6EN878583110") ||
        (host === "calendar.app.google" && path === "/GkbisCahaud7S7mD7")) {
      return { name: "lesson_booking_click", destination: host === "calendar.app.google" ? "google_calendar" : "preply" };
    }
    return null;
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || (typeof event.button === "number" && event.button !== 0)) return;
    var target = event.target;
    if (target && target.nodeType === 3) target = target.parentElement;
    var link = target && typeof target.closest === "function" ? target.closest("a[href]") : null;
    if (!link || link.getAttribute("aria-disabled") === "true") return;
    var action = classify(link);
    if (!action || !hasConsent() || window[disableKey] === true) return;
    prepareStandaloneAnalytics();
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", action.name, {
        send_to: measurementId,
        destination: action.destination,
        page_location: location.origin + location.pathname,
        page_referrer: "",
        transport_type: "beacon"
      });
    } catch (_) { /* Analytics must never interrupt the original click. */ }
  }, { passive: true });

  window.addEventListener("storage", function (event) {
    if (event.key !== consentKey && event.key !== null) return;
    if (!hasConsent() && ownsAnalytics) {
      window[disableKey] = true;
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "denied" });
      }
    }
  });

  prepareStandaloneAnalytics();
})();
