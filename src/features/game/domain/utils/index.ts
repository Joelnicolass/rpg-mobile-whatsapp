export const intInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const namesRandomAttacks = [
  "Soul Eater",
  "Death's Scythe",
  "Death's Touch",
  "Soul Annihilator",
  "Darkness Hand of Death",
];

export const randomItemInArray = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];
