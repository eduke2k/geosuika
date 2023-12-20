import { BaseNote, Chord, chordNotes } from "../const/scales";
import { pickRandom } from "../functions/helper";
import BaseScene from "../scenes/BaseScene";

export type InstrumentConfig = {
  key: string;
  octaves: number;
  notes?: BaseNote[];
  audioMarkerDuration: number
}

export class Instrument {
  private key: string;
  private octaves: number;
  private notes: BaseNote[];
  private audioMarkerIndices: Record<string, number[]>
  private audioMarkerDuration: number;
  private audioMarkerConfig: Phaser.Types.Sound.SoundMarker[];

  public constructor(config: InstrumentConfig) {
    this.key = config.key;
    this.octaves = config.octaves;
    this.notes = config.notes ?? [];
    this.audioMarkerDuration = config.audioMarkerDuration;
    this.audioMarkerIndices = this.generateChordIndices();

    // Auto config via octaves only
    if (!config.notes) {
      this.audioMarkerConfig = Array(this.octaves * 12).fill(0).map((_n, i) => ({
        name: i.toString(),
        duration: this.audioMarkerDuration,
        start: this.audioMarkerDuration * i
      }));
    } else {
      // Special config via specific notes
      this.audioMarkerConfig = config.notes.map((note, i) => ({
        name: note.toString(),
        duration: this.audioMarkerDuration,
        start: this.audioMarkerDuration * i
      }));
    }
    console.log(`-----registered new instrument: ${this.key}-----`);
  }

  private generateChordIndices (): Record<string, number[]> {
    const obj: Record<string, number[]> = {};
    Object.values(Chord).forEach(c => {
      const notes: number[] = [];
      for (let i = 0; i < this.octaves; i++) {
        if (this.notes.length === 0) {
          notes.push(...chordNotes[c].map(n => n + (i * 12)));
        }
      }
      obj[c] = notes;
    });
    return obj;
  }

  private playFromConfig (scene: BaseScene, c: Phaser.Types.Sound.SoundMarker, pan: number, volume: number): void {
    this.play(scene, { ...c, config: { pan, volume }});
  }

  public playChord (scene: BaseScene, chord: Chord, pan: number, volume: number): void {
    const indices = this.audioMarkerIndices[chord];

    indices.forEach(i => {
      const markerConfig = this.audioMarkerConfig[i];
      this.playFromConfig(scene, markerConfig, pan, volume);
    });
  }

  public playIndex (scene: BaseScene, index: number, pan: number, volume: number): void {
    const markerConfig = this.audioMarkerConfig[index];
    this.playFromConfig(scene, markerConfig, pan, volume);
  }

  public playRandomNote (scene: BaseScene, pan: number, volume: number): void {
    const markerConfig = pickRandom(this.audioMarkerConfig);
    this.playFromConfig(scene, markerConfig, pan, volume);
  }

  public playRandomNoteInChord (chord: Chord, scene: BaseScene, pan: number, volume: number): void {
    const randomIndex = pickRandom(this.audioMarkerIndices[chord]);
    const markerConfig = this.audioMarkerConfig[randomIndex];
    this.playFromConfig(scene, markerConfig, pan, volume);
  }

  private play (scene: BaseScene, config: Phaser.Types.Sound.SoundMarker): void {
    scene.soundManager?.sound.play(this.key, config);
  }
}