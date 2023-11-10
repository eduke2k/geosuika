export function randomIntFromInterval (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getNumberInRange (min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

export function shuffleArray<T> (array: T[]): T[] { 
  return array.sort(() => Math.random() - 0.5); 
}

export function tiledVertsToMatterVert (verts: Phaser.Types.Math.Vector2Like[]): string {
  return verts.reduce((accumulator, currentValue) => accumulator + ` ${currentValue.x} ${currentValue.y}`, '');
}
