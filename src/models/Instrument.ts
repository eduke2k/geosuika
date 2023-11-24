import { Chord, chordNotes } from "../const/scales";
import { pickRandom } from "../functions/helper";

export type InstrumentConfig = {
  key: string;
  octaves: number;
  audioMarkerDuration: number
}

export class Instrument {
  private key: string;
  private octaves: number;
  private audioMarkerIndices: Record<string, number[]>
  private audioMarkerDuration: number;
  private audioMarkerConfig: Phaser.Types.Sound.SoundMarker[];

  public constructor(config: InstrumentConfig) {
    this.key = config.key;
    this.octaves = config.octaves;
    this.audioMarkerDuration = config.audioMarkerDuration;
    this.audioMarkerIndices = this.generateChordIndices();
    this.audioMarkerConfig = Array(this.octaves * 12).fill(0).map((_n, i) => ({
      name: i.toString(),
      duration: this.audioMarkerDuration,
      start: this.audioMarkerDuration * i
    }))
    console.log(`-----registered new instrument: ${this.key}-----`);
  }

  private generateChordIndices (): Record<string, number[]> {
    const obj: Record<string, number[]> = {};
    Object.values(Chord).forEach(c => {
      const notes: number[] = [];
      for (let i = 0; i < this.octaves; i++) {
        notes.push(...chordNotes[c].map(n => n + (i * 12)));
      }
      obj[c] = notes;
    });
    return obj;
  }

  public playRandomNoteInChord (chord: Chord, scene: Phaser.Scene, pan: number, volume: number): void {
    const randomIndex = pickRandom(this.audioMarkerIndices[chord]);
    const markerConfig = this.audioMarkerConfig[randomIndex];

    const config: Phaser.Types.Sound.SoundMarker = {
      ...markerConfig,
      config: { pan, volume }
    };

    this.play(scene, config);
  }

  private play (scene: Phaser.Scene, config: Phaser.Types.Sound.SoundMarker): void {
    scene.sound.play(this.key, config);
  }
}