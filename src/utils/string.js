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

/** 
 * Given a list of strings, combines them with commas, 
 * except for the last one, which is combined with "or".
 * 
 * TODO: Localize "or"
 */
export function joinWithOr(arr) {
  if (arr.length === 0) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else {
    return `${arr.slice(0, -1).join(", ")} or ${arr[arr.length - 1]}`;
  }
}

/** 
 * Given a list of strings, combines them with commas, 
 * except for the last one, which is combined with "and"
 * and no comma.
 * 
 * TODO: Localize "and"
 */
export function joinWithAnd(arr) {
  if (arr.length === 0) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else {
    return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
  }
}