export function scaleNumberRange (value: number, [inMin, inMax]: number[], [outMin, outMax]: number[]): number {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}
