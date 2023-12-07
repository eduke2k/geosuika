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
  key: string;
  title: string;
  songTitle: string;
  artist: string;
  year?: number,
  ytLink?: string;
  url?: string;
  audioKeys: AudioKeyConfig[];
  chordProgression: ChordProgressionMarker[];
}

export type BGMPatternConfig = {
  repeatablePattern: {
    duration: number;
    chord: Chord;
  }[];
  plays: number;
}[];

export class BackgroundMusic {
  private scene: Phaser.Scene;
  private audio: Phaser.Sound.WebAudioSound[];
  public config: BackgroundMusicConfig;
  private currentLevel = 0;

  public constructor(scene: Phaser.Scene, config: BackgroundMusicConfig) {
    this.scene = scene;
    this.config = config;
    this.audio = config.audioKeys.map(k => scene.sound.add(k.key, { loop: true, volume: 0 }) as Phaser.Sound.WebAudioSound)
    this.audio[0].on('looped', this.handleLoop, this);
  }

  public setPlaybackRate (rate: number): void {
    this.audio.forEach(a => {
      if (a.source && a.source.playbackRate) {
        a.source.playbackRate.value = rate;
      }
    });
  }

  private handleLoop (): void {
    // Tracks might get out of sync after a while. Let's at least sync them once the first track loops
    this.audio.forEach(a => {
      a.setSeek(0);
    });
  }

  public play (): void {
    this.audio.forEach(a => a.play());
  }

  public stop (): void {
    console.log('audio stopped');
    this.audio.forEach(a => a.stop());
  }

  public getCurrentChord (): Chord {
    // Return type of `getCurrentTime()` is wrong. It returns a number, not void
    const currentTime: number = this.audio[0].getCurrentTime() as unknown as number;
    const chordMarker = this.config.chordProgression.find(c => currentTime >= c.start && currentTime < c.start + c.duration);
    return chordMarker?.chord ?? Chord.C_MAJOR;
  }

  public getTotalProgressLength () : number {
    return this.config.audioKeys.length;
  }

  public getProgress(level: number): number {
    return level / this.config.audioKeys.length;
  }

  public getCurrentProgressLevel (scoreRatio: number): number {
    let level = 0;
    this.config.audioKeys.forEach((k, i) => {
      if (scoreRatio > k.minScoreRatio) {
        level = i + 1;
      }
    });
    return level;
  }

  public setProgress (scoreRatio: number): { rankUp: boolean; level: number } {
    const targetLevel = this.getCurrentProgressLevel(scoreRatio);

    if (targetLevel > this.currentLevel) {
      this.config.audioKeys.forEach(k => {
        const audio = this.audio.find(a => a.key === k.key);
        if (audio && audio.volume === 0 && k.minScoreRatio <= scoreRatio) {
          this.fadeSound(audio, 1, 5000)
        } else if (audio && audio.volume === 1 && k.minScoreRatio > scoreRatio) {
          this.fadeSound(audio, 0, 5000)
        }
      });

      this.currentLevel = targetLevel;
      return {
        rankUp: true,
        level: targetLevel
      };
    }

    return {
      rankUp: false,
      level: targetLevel
    };
  }

  private fadeSound (audio: Phaser.Sound.WebAudioSound, volume: number, duration: number) {
    this.scene.tweens.add({
      targets: audio,
      volume,
      duration
    });
  }

  public fadeOutAndStop (duration: number): void {
    this.audio.forEach(a => {
      this.fadeSound(a, 0, duration);
    });

    this.scene.time.delayedCall(duration, () => {
      this.stop();
    });
  }

  public reset (duration = 5000): void {
    console.log('reset called');
    this.audio.forEach(a => {
      this.fadeSound(a, 0, duration);
    });

    this.scene.time.delayedCall(duration, () => {
      console.log('delayed reset call');
      this.setPlaybackRate(1);
      this.handleLoop();
    });

    this.currentLevel = 0;
  }

  // public static removePreloadCallbacks (scene: Phaser.Scene): void {
  //   scene.load.off('complete', () => {
  //     onComplete();
  //   });

  //   scene.load.on('progress', (value: number) => {
  //     onProgress(value);
  //   });
  // }

  public static preloadByBGMKey (scene: Phaser.Scene, key: string, onProgress: (value: number) => void, onComplete: () => void): void {
    switch (key) {
      case 'bgm01': {
        scene.load.audio('bgm01-drums', '/bgm/bgm01/drums.ogg');
        scene.load.audio('bgm01-bass', '/bgm/bgm01/bass.ogg');
        scene.load.audio('bgm01-pads', '/bgm/bgm01/pads.ogg');
        scene.load.audio('bgm01-melody01', '/bgm/bgm01/melody01.ogg');
        scene.load.audio('bgm01-melody02', '/bgm/bgm01/melody02.ogg');
        scene.load.audio('bgm01-lofi01', '/bgm/bgm01/lofi01.ogg');
        scene.load.audio('bgm01-lofi02', '/bgm/bgm01/lofi02.ogg');
        scene.load.audio('bgm01-lofi03', '/bgm/bgm01/lofi03.ogg');
        scene.load.audio('bgm01-lofi04', '/bgm/bgm01/lofi04.ogg');
        scene.load.audio('bgm01-voice', '/bgm/bgm01/vocals.ogg');
        break;
      }
      case 'bgm02': {
        scene.load.audio('bgm02-drums', '/bgm/bgm02/drums.ogg');
        scene.load.audio('bgm02-bass', '/bgm/bgm02/bass.ogg');
        scene.load.audio('bgm02-pads', '/bgm/bgm02/pads.ogg');
        scene.load.audio('bgm02-melody', '/bgm/bgm02/melody.ogg');
        scene.load.audio('bgm02-lofi01', '/bgm/bgm02/lofi01.ogg');
        scene.load.audio('bgm02-lofi02', '/bgm/bgm02/lofi02.ogg');
        scene.load.audio('bgm02-lofi03', '/bgm/bgm02/lofi03.ogg');
        scene.load.audio('bgm02-lofi04', '/bgm/bgm02/lofi04.ogg');
        scene.load.audio('bgm02-voice', '/bgm/bgm02/voice.ogg');
        break;
      }
    }

    const progressCallback = (value: number) => { onProgress(value); }
    const completeCallback = () => {
      onComplete();
      scene.load.off('complete', completeCallback);
      scene.load.off('progress', progressCallback);
    }

    scene.load.on('complete', completeCallback);
    scene.load.on('progress', progressCallback);
    scene.load.start();
  }
}