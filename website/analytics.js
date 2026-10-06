/* Sweet Snow website activity. In-store and kiosk purchases are not observable
   here, so this module never emits purchase or successful form-conversion events. */
(function () {
  "use strict";
  var config = window.SWEET_SNOW_ANALYTICS_CONFIG || {};
  var measurementId = config.measurementId;
  var adsId = config.adsId;
  var hasMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId || "");
  var hasAdsId = /^AW-[0-9]+$/.test(adsId || "");
  if (!hasMeasurementId && !hasAdsId) return;
  if (window.__sweetSnowAnalyticsStarted) return;
  if (!/^(www\.)?sweetsnow\.org$/.test(window.location.hostname)) return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;
  window.__sweetSnowAnalyticsStarted = true;

  var sections = {
    menu: "menu", bingsu: "bingsu", toppings: "toppings", hot: "hot_and_fresh",
    comingSoon: "coming_soon", cups: "cup_bingsu", vote: "vote", catering: "catering"
  };
  function referrerOrigin() {
    try { return document.referrer ? new URL(document.referrer).origin + "/" : ""; }
    catch (_) { return ""; }
  }
  // Do not send URL queries, hashes, form text, emails, or other customer details.
  var safePage = window.location.origin + window.location.pathname;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  var tagOptions = {
    page_location: safePage,
    page_referrer: referrerOrigin(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  };
  // The Ads base tag sends its normal page view. This does not create a
  // conversion; no conversion action has been confirmed for this site.
  if (hasAdsId) window.gtag("config", adsId, tagOptions);
  if (hasMeasurementId) {
    window.gtag("config", measurementId, Object.assign({}, tagOptions, { send_page_view: true }));
  }
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(hasAdsId ? adsId : measurementId);
  document.head.appendChild(script);

  function event(name, values) {
    // Engagement events are GA4-only so they cannot be interpreted as Ads
    // conversions when an Ads base tag is the only configured destination.
    if (!hasMeasurementId) return;
    window.gtag("event", name, Object.assign({ send_to: measurementId, page_location: safePage }, values));
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button > 0) return;
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (url.origin === window.location.origin) {
      var section = sections[url.hash.slice(1)];
      if (section) event("navigate_section", { section_name: section });
    } else if (/^(www\.)?instagram\.com$/.test(url.hostname)) {
      event("instagram_click", { destination: "instagram" });
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.defaultPrevented) return;
    // These are attempts only: the legacy forms do not have a confirmed backend.
    if (e.target.id === "voteForm") event("vote_submission_attempt", {});
    if (e.target.id === "ideaForm") event("idea_submission_attempt", {});
  });
  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    var seen = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        var id = entry.target.closest("section").id;
        if (!sections[id] || seen.has(id)) return;
        seen.add(id);
        event("view_menu_section", { section_name: sections[id] });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    Object.keys(sections).forEach(function (id) {
      var section = document.getElementById(id);
      var heading = section && section.querySelector("h2");
      if (heading && section.tagName === "SECTION") observer.observe(heading);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observeSections, { once: true });
  else observeSections();
})();
