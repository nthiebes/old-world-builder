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
 * Picks out the various localized names of a unit or item object
 * and puts them in a nice object for easy attribute spreading
 */
export const namesForSpread = (obj) => ({
  name_en: obj.name_en,
  name_de: obj.name_de,
  name_fr: obj.name_fr,
  name_cn: obj.name_cn,
  name_es: obj.name_es,
  name_it: obj.name_it,
  name_pl: obj.name_pl,
});