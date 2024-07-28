/**
 * Swaps two elements in a list by their indexes.
 *
 * @template T
 * @param {T[]} list
 * @param {number} index1
 * @param {number} index2
 * @returns {T[]}
 */
export const swap = (list, index1, index2) => {
  const result = [...list];
  const [removed] = result.splice(index1, 1);
  result.splice(index2, 0, removed);

  return result;
};

export const uniq = (array) => {
  const seen = {};

  return array.filter(function (item) {
    // eslint-disable-next-line no-prototype-builtins
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
};
