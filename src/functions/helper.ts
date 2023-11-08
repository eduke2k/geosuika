export function randomIntFromInterval (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getNumberInRange (min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}