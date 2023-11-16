import { Chord } from "../const/scales";

export type ChordProgressionMarker = {
  start: number;
  duration: number;
  chord: Chord;
}

export type BackgroundMusicConfig = {
  audioKey: string;
  audioKeys: string[];
  chordProgression: ChordProgressionMarker[];
}

export type BGMPatternConfig = {
  repeatablePattern: {
    duration: number;
    chord: Chord;
  }[];
  repeats: number;
}[];

export class BackgroundMusic {
  // private scene: Phaser.Scene;
  private audio: Phaser.Sound.WebAudioSound[];
  private config: BackgroundMusicConfig;

  public constructor(scene: Phaser.Scene, config: BackgroundMusicConfig) {
    // this.scene = scene;
    this.config = config;
    this.audio = config.audioKeys.map(k => scene.sound.add(k, { loop: true }) as Phaser.Sound.WebAudioSound) 
  }

  public play (): void {
    this.audio.forEach(a => a.play());
  }

  public stop (): void {
    this.audio.forEach(a => a.stop());
  }

  public getCurrentChord (): Chord {
    // Return type of `getCurrentTime()` is wrong. It returns a number, not void
    const currentTime: number = this.audio[0].getCurrentTime() as unknown as number;
    const chordMarker = this.config.chordProgression.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
    return chordMarker?.chord ?? Chord.C_MAJOR;
  }
}