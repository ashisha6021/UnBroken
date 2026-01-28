// games/helpers.js
export const shuffle = arr => arr.sort(() => Math.random() - 0.5);
export const rand = (a, b) =>
  Math.floor(Math.random() * (b - a + 1)) + a;

export function uniqueRandomNumbers(count, min, max) {
  const set = new Set();

  while (set.size < count) {
    set.add(rand(min, max));
  }

  return Array.from(set);
}