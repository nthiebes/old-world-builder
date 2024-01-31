export const removeParens = (string = "") => {
  return string.replace(/ *\([^)]*\) */g, "");
};
