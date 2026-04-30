// 62-char alphabet in ASCII order so index comparison and string comparison
// agree. Midpoints can only land on alphanumeric chars (no `[ \ ] ^ _ \``
// from the gaps between digits/uppercase/lowercase).
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const MIN_RANK = "000000";
const MAX_RANK = "zzzzzz";

const VALID_RANK = /^[0-9A-Za-z]+$/;
export const isValidRank = (rank) =>
  typeof rank === "string" && VALID_RANK.test(rank);

export function generateRank(prev, next) {
  const lower = prev || MIN_RANK;
  const upper = next || MAX_RANK;
  return midpoint(lower, upper);
}

function charToIndex(c) {
  const idx = ALPHABET.indexOf(c);
  return idx >= 0 ? idx : 0;
}

function midpoint(a, b) {
  let result = "";
  let i = 0;

  while (true) {
    const idxA = i < a.length ? charToIndex(a[i]) : 0;
    const idxB = i < b.length ? charToIndex(b[i]) : ALPHABET.length - 1;

    if (idxA === idxB) {
      result += ALPHABET[idxA];
      i++;
      continue;
    }

    const mid = Math.floor((idxA + idxB) / 2);
    if (mid === idxA) {
      result += ALPHABET[idxA];
      i++;
      continue;
    }

    return result + ALPHABET[mid];
  }
}
