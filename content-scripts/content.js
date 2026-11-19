(() => {
  "use strict";

  const TARGET_DOMAINS = [
    "lifepointspanel.com",
    "lifepoints.com"
  ];

  const host = window.location.hostname;
  const matched = TARGET_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );

  if (!matched) {
    return;
  }

  try {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
      configurable: true
    });
  } catch (_) {}

  const markReady = () => {
    if (document.documentElement) {
      document.documentElement.dataset.lpHelperActive = "1";
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markReady, { once: true });
  } else {
    markReady();
  }
})();
