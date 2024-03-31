import { Chord } from "../const/scales";
import BaseScene from "../scenes/BaseScene";

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
  private scene: BaseScene;
  private audio: Phaser.Sound.WebAudioSound[];
  public config: BackgroundMusicConfig;
  private currentLevel = 0;

  public constructor(scene: BaseScene, config: BackgroundMusicConfig) {
    this.scene = scene;
    this.config = config;
    this.audio = config.audioKeys.map(k => scene.soundManager?.music.add(k.key, { loop: true, volume: 0 }) as Phaser.Sound.WebAudioSound)
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
    this.audio.forEach(a => {
      this.fadeSound(a, 0, duration);
    });

    this.scene.time.delayedCall(duration, () => {
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

  public static preloadByBGMKey (scene: Phaser.Scene, key: string, onProgress: (value: number) => void, onComplete: () => void, onError: () => void): void {
    switch (key) {
      case 'bgm01': {
        scene.load.audio('bgm01-drums', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/drums.ogg');
        scene.load.audio('bgm01-bass', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/bass.ogg');
        scene.load.audio('bgm01-pads', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/pads.ogg');
        scene.load.audio('bgm01-melody01', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/melody01.ogg');
        scene.load.audio('bgm01-melody02', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/melody02.ogg');
        scene.load.audio('bgm01-lofi01', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/lofi01.ogg');
        scene.load.audio('bgm01-lofi02', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/lofi02.ogg');
        scene.load.audio('bgm01-lofi03', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/lofi03.ogg');
        scene.load.audio('bgm01-lofi04', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/lofi04.ogg');
        scene.load.audio('bgm01-voice', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm01/vocals.ogg');
        break;
      }
      case 'bgm02': {
        scene.load.audio('bgm02-drums', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/drums.ogg');
        scene.load.audio('bgm02-bass', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/bass.ogg');
        scene.load.audio('bgm02-pads', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/pads.ogg');
        scene.load.audio('bgm02-melody', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/melody.ogg');
        scene.load.audio('bgm02-lofi01', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/lofi01.ogg');
        scene.load.audio('bgm02-lofi02', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/lofi02.ogg');
        scene.load.audio('bgm02-lofi03', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/lofi03.ogg');
        scene.load.audio('bgm02-lofi04', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/lofi04.ogg');
        scene.load.audio('bgm02-voice', 'https://geotastic.b-cdn.net/geosuika/bgm/bgm02/voice.ogg');
        break;
      }
      case 'lumia': {
        scene.load.audio('lumia-drums', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/drums.ogg');
        scene.load.audio('lumia-bass', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/bass.ogg');
        scene.load.audio('lumia-pads', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/pads.ogg');
        scene.load.audio('lumia-riff3', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/riff3.ogg');
        scene.load.audio('lumia-riff1', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/riff1.ogg');
        scene.load.audio('lumia-music-box', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/music-box.ogg');
        scene.load.audio('lumia-lead1', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/lead1.ogg');
        scene.load.audio('lumia-lead2', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/lead2.ogg');
        scene.load.audio('lumia-cello', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/cello.ogg');
        scene.load.audio('lumia-violin', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/violin.ogg');
        scene.load.audio('lumia-solo', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/solo.ogg');
        scene.load.audio('lumia-voice', 'https://geotastic.b-cdn.net/geosuika/bgm/lumia/voice.ogg');
        break;
      }
    }

    const progressCallback = (value: number) => { onProgress(value); }
    const completeCallback = () => {
      onComplete();
      scene.load.off('complete', completeCallback);
      scene.load.off('progress', progressCallback);
      scene.load.off('progress', errorCallback);
    }

    const errorCallback = () => {
      onError();
      scene.load.off('complete', completeCallback);
      scene.load.off('progress', progressCallback);
      scene.load.off('progress', errorCallback);
    };

    scene.load.on('complete', completeCallback);
    scene.load.on('progress', progressCallback);
    scene.load.on('loaderror', errorCallback);
    scene.load.start();
  }
}