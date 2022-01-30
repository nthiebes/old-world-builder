export const getRandomId = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");
