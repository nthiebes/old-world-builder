/**
 * Sum the items of a list by some item value.
 *
 * @template T
 * @param {Array<T>} list
 * @param {(item: T) => number | undefined} getValue
 *
 * @example
 * ```js
 * const list = [{ points: 10 }, { points: 20 }, { points: 30 }];
 * sum(list, (item) => item.points); // 60
 * ```
 */
export const sum = (list, getValue) =>
  list.reduce((subTotal, item) => subTotal + (getValue(item) ?? 0), 0);
