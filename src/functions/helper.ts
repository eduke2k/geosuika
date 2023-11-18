import { BGMPatternConfig, ChordProgressionMarker } from "../models/BackgroundMusic";
import { TiledPropertiesNative, TiledPropertiesParsed } from "../types";

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

export function pickRandom<T> (array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function scaleNumberRange (value: number, [inMin, inMax]: number[], [outMin, outMax]: number[]): number {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

export function sizeFromVertices (polygon: Phaser.Types.Math.Vector2Like[]): { width: number, height: number } {
  let minx = 0;
  let miny = 0;
  let maxx = 0;
  let maxy = 0;

  polygon.forEach(p => {
    if (p.x && p.y) {
      if (p.x < minx) minx = p.x;
      if (p.x > maxx) maxx = p.x;
      if (p.y < miny) miny = p.y;
      if (p.y > maxy) maxy = p.y;
    }
  });

  return {
    width: maxx - minx,
    height: maxy - miny
  }
}

export function parseTiledProperties (properties?: TiledPropertiesNative): TiledPropertiesParsed {
  const output: TiledPropertiesParsed = {};
  if (properties) {
    properties.forEach(p => {
      output[p.name] = p.value;
    });
  }
  return output;
}

export function round (value: number, precision: number) {
  return parseFloat(value.toFixed(precision));
}

export const generateChordProgressionFromPattern = (pattern: BGMPatternConfig): ChordProgressionMarker[] => {
  let marker = 0;
  const chordProgression: ChordProgressionMarker[] = [];

  pattern.forEach(part => {
    for(let i = 0; i <= part.repeats; i++) {
      part.repeatablePattern.forEach(p => {
        chordProgression.push({
          chord: p.chord,
          duration: p.duration,
          start: marker
        });
        marker = round(marker + p.duration, 2);
      });
    }
  });
  return chordProgression;
}