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
 * Turns an array of strings into a single string joined with commas and 'and'. Does not use the Oxford comma.
 * For example given ['a', 'b', 'c'] it returns "a, b and c".
 * 
 * @param {string[]} words Array of strings to join
 * @param {string} conjunction Conjunction word joining the last two words. Defaults to 'and'
 * @returns {string} Joined string with commas and conjunction
 */
export const humanReadableList = (words, conjunction) => {
  conjunction = conjunction || 'and';
  if (!words || words.length === 0)
    return '';
  if (words.length < 2)
    return words.join(` ${conjunction} `);
  const allButLast = words.slice(0, -1).join(', ');
  return `${allButLast} ${conjunction} ${words[words.length - 1]}`;
}
