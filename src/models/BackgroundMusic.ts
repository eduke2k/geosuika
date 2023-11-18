import { Chord } from "../const/scales";

export type ChordProgressionMarker = {
  start: number;
  duration: number;
  chord: Chord;
}

export type AudioKeyConfig = {
  key: string;
  minScoreRatio: number;
}

export type BackgroundMusicConfig = {
  audioKeys: AudioKeyConfig[];
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
  private scene: Phaser.Scene;
  private audio: Phaser.Sound.WebAudioSound[];
  private config: BackgroundMusicConfig;

  public constructor(scene: Phaser.Scene, config: BackgroundMusicConfig) {
    this.scene = scene;
    this.config = config;
    this.audio = config.audioKeys.map(k => scene.sound.add(k.key, { loop: true, volume: 0 }) as Phaser.Sound.WebAudioSound)
    this.audio[0].on('looped', this.handleLoop, this);
  }

  private handleLoop (): void {
    console.log('on looped triggered');
    // Tracks might get out of sync after a while. Let's at least sync them once the first track loops
    this.audio.forEach(a => {
      a.setSeek(0);
    });
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

  public handleScoreChange (newScoreRatio: number) {
    this.config.audioKeys.forEach(k => {
      const audio = this.audio.find(a => a.key === k.key);
      if (audio && audio.volume === 0 && k.minScoreRatio <= newScoreRatio) {
        this.fadeSound(audio, 1, 5000)
      } else if (audio && audio.volume === 1 && k.minScoreRatio > newScoreRatio) {
        this.fadeSound(audio, 0, 5000)
      }
    });
  }

  private fadeSound (audio: Phaser.Sound.WebAudioSound, volume: number, duration: number) {
    this.scene.tweens.add({
      targets: audio,
      volume,
      duration
    });
  }

  public reset (): void {
    this.audio.forEach(a => {
      this.fadeSound(a, 0, 5000);
    });
  }
}