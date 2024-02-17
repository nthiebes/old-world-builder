export const normalizeRuleName = (string = "") => {
  return string
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/\*/g, "")
    .replace(/^[0-9]x /g, "")
    .replace(/“/g, '"')
    .replace(/”/g, '"');
};
