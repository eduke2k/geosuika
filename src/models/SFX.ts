import { pickRandom } from "../functions/helper";

export type SFXAutoConfig = {
  notes: number;
  audioMarkerDuration: number
}

export type SFXConfig = {
  audioMarkerConfig: Phaser.Types.Sound.SoundMarker[];
  audioMarkerMapping: Record<string, number[]>;
}

export class SFX {
  private key: string;
  private audioMarkerConfig: Phaser.Types.Sound.SoundMarker[];
  private audioMarkerMapping: Record<string, number[]> = {};

  public constructor(key: string, autoconfig?: SFXAutoConfig, config?: SFXConfig) {
    this.key = key;

    if (autoconfig) {
      this.audioMarkerConfig = Array(autoconfig.notes).fill(0).map((_n, i) => ({
        name: i.toString(),
        duration: autoconfig.audioMarkerDuration,
        start: autoconfig.audioMarkerDuration * i
      }));
    } else if (config) {
      this.audioMarkerConfig = config.audioMarkerConfig;
      this.audioMarkerMapping = config.audioMarkerMapping;
    } else {
      throw new Error('Could not create SFX bank because no config was provided');
    }
    console.log(`-----registered new sfx bank: ${this.key}-----`, this);
  }

  private playFromConfig (scene: Phaser.Scene, c: Phaser.Types.Sound.SoundMarker, pan?: number, volume?: number): void {
    this.play(scene, { ...c, config: { pan: pan ?? 0, volume: volume ?? 1 }});
  }

  public playIndex (scene: Phaser.Scene, index: number, pan: number, volume: number): void {
    const markerConfig = this.audioMarkerConfig[index];
    this.playFromConfig(scene, markerConfig, pan, volume);
  }

  public playRandomNote (scene: Phaser.Scene, pan?: number, volume?: number): void {
    const markerConfig = pickRandom(this.audioMarkerConfig);
    this.playFromConfig(scene, markerConfig, pan, volume);
  }

  public playRandomSFXFromCategory (scene: Phaser.Scene, category: string, pan?: number, volume?: number): void {
    const indices = this.audioMarkerMapping[category];
    if (indices === undefined) {
      console.warn(`could not find audio category ${category} in sound bank ${this.key}. Ignoring`);
      return;
    }

    if (indices.length === 0) {
      console.warn(`No sound marker config indices provided Ignoring`);
      return;
    }

    const index = pickRandom(indices);

    const config = this.audioMarkerConfig[index];

    if (!config) {
      console.warn(`could not find audio marker config on index ${index} in sound bank ${this.key}. Ignoring`);
      return;
    }

    this.playFromConfig(scene, config, pan, volume);
  }

  private play (scene: Phaser.Scene, config: Phaser.Types.Sound.SoundMarker): void {
    scene.sound.play(this.key, config);
  }
}