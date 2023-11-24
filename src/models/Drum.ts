import { pickRandom } from "../functions/helper";

export type DrumConfig = {
  key: string;
  notes: number;
  audioMarkerDuration: number
}

export class Drum {
  private key: string;
  private notes: number;
  private audioMarkerDuration: number;
  private audioMarkerConfig: Phaser.Types.Sound.SoundMarker[];

  public constructor(config: DrumConfig) {
    this.key = config.key;
    this.notes = config.notes;
    this.audioMarkerDuration = config.audioMarkerDuration;
    // this.audioMarkerIndices = this.generateNoteIndices();
    this.audioMarkerConfig = Array(this.notes).fill(0).map((_n, i) => ({
      name: i.toString(),
      duration: this.audioMarkerDuration,
      start: this.audioMarkerDuration * i
    }))
    console.log(`-----registered new drum: ${this.key}-----`);
  }

  public playRandomNote (scene: Phaser.Scene, pan: number, volume: number): void {
    const markerConfig = pickRandom(this.audioMarkerConfig);

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