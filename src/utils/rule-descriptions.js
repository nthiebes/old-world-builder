// Cache is keyed by OWB version so it auto-invalidates on each release.
const CACHE_STORAGE_KEY = `owb-rule-descriptions-v${import.meta.env.VITE_VERSION}`;
// Shares the localStorage quota with owb.lists, so keep it bounded.
const MAX_CACHE_ENTRIES = 150;

// Selectors tried in order — first non-empty match wins.
const DESCRIPTION_SELECTORS = [
  "section.rule-description p",
  ".rule-description p",
  "article section p",
  "main article p",
  "article p",
];

const loadCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    const entries = stored ? JSON.parse(stored) : [];
    return new Map(entries.slice(-MAX_CACHE_ENTRIES));
  } catch {
    return new Map();
  }
};

const purgeOldCaches = () => {
  try {
    Object.keys(localStorage)
      .filter(
        (k) =>
          k.startsWith("owb-rule-descriptions-") && k !== CACHE_STORAGE_KEY
      )
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
};

const cache = loadCache();
purgeOldCaches();

// Map keeps insertion order, so the first key is the least recently used.
const setCacheEntry = (rulePath, value) => {
  cache.delete(rulePath);
  cache.set(rulePath, value);

  while (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
};

const persistCache = () => {
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify(
        Array.from(cache.entries()).filter(([, value]) => value !== null)
      )
    );
  } catch {
    // Quota exceeded — drop the persisted cache rather than compete with lists.
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch {}
  }
};

// Frees localStorage space, e.g. when saving lists hits the quota.
export const clearRuleDescriptionCache = () => {
  cache.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("owb-rule-descriptions-"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
};

export const fetchRuleDescription = async (rulePath) => {
  if (cache.has(rulePath)) {
    const cached = cache.get(rulePath);
    setCacheEntry(rulePath, cached);
    return cached;
  }

  try {
    const res = await fetch(
      `https://tow.whfb.app/${rulePath}?minimal=true&utm_source=owb&utm_medium=referral`
    );
    if (!res.ok) {
      setCacheEntry(rulePath, null);
      return null;
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    let paragraphs = [];
    for (const selector of DESCRIPTION_SELECTORS) {
      const elements = Array.from(doc.querySelectorAll(selector)).filter(
        (p) =>
          !p.closest("nav") &&
          !p.closest("footer") &&
          !p.closest(".metadata") &&
          p.textContent.trim().length > 20
      );
      if (elements.length > 0) {
        paragraphs = elements;
        break;
      }
    }

    const text = paragraphs.map((p) => p.textContent.trim()).join(" ");
    const result = text || null;
    setCacheEntry(rulePath, result);
    persistCache();
    return result;
  } catch (error) {
    // CORS or network failure — visible in browser DevTools console
    console.error(`[OWB] Failed to fetch rule description for ${rulePath}:`, error);
    setCacheEntry(rulePath, null);
    return null;
  }
};
