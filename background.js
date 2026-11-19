const DEFAULT_CONFIG = {
  enabled: false,
  host: "",
  port: 1080,
  username: "",
  password: "",
  bypassList: ["<local>"]
};

async function getConfig() {
  const data = await chrome.storage.local.get("proxyConfig");
  return { ...DEFAULT_CONFIG, ...(data.proxyConfig || {}) };
}

async function applyProxyConfig(cfg) {
  if (!cfg.enabled || !cfg.host || !cfg.port) {
    await chrome.proxy.settings.clear({ scope: "regular" });
    return;
  }

  const config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "socks5",
        host: cfg.host.trim(),
        port: Number(cfg.port)
      },
      bypassList: cfg.bypassList || ["<local>"]
    }
  };

  await chrome.proxy.settings.set({ value: config, scope: "regular" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await getConfig();
  await chrome.storage.local.set({ proxyConfig: current });
  await applyProxyConfig(current);
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.proxyConfig) {
    await applyProxyConfig({ ...DEFAULT_CONFIG, ...changes.proxyConfig.newValue });
  }
});

chrome.webRequest.onAuthRequired.addListener(
  async (_details, callback) => {
    const cfg = await getConfig();
    if (cfg.enabled && cfg.username) {
      callback({
        authCredentials: {
          username: cfg.username,
          password: cfg.password || ""
        }
      });
      return;
    }
    callback({});
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);
