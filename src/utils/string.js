export const normalizeRuleName = (string = "") => {
  return string
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/\{/g, "")
    .replace(/\}/g, "")
    .replace(/\*/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/^[0-9]x /g, "")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .trim();
};

/**
 * Given an object that is either a string or an array of strings
 * and a target string, checks whether the target is equal to the
 * string or is in the array. Useful for armyComposition checks.
 */
export const equalsOrIncludes = (strOrArray, x) => (
  x === strOrArray ||
  (Array.isArray(strOrArray) && strOrArray.includes(x))
);
