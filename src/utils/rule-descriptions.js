const cache = new Map();

// Selectors tried in order — first non-empty match wins.
const DESCRIPTION_SELECTORS = [
  "section.rule-description p",
  ".rule-description p",
  "article section p",
  "main article p",
  "article p",
];

export const fetchRuleDescription = async (rulePath) => {
  if (cache.has(rulePath)) return cache.get(rulePath);

  try {
    const res = await fetch(
      `https://tow.whfb.app/${rulePath}?minimal=true&utm_source=owb&utm_medium=referral`
    );
    if (!res.ok) {
      cache.set(rulePath, null);
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
    cache.set(rulePath, result);
    return result;
  } catch (error) {
    // CORS or network failure — visible in browser DevTools console
    console.error(`[OWB] Failed to fetch rule description for ${rulePath}:`, error);
    cache.set(rulePath, null);
    return null;
  }
};
