export const normalizeRuleName = (string = "") => {
  return string
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/\*/g, "")
    .replace(/“/g, '"')
    .replace(/”/g, '"');
};
