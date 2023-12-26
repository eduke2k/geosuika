import BaseScene from "../../scenes/BaseScene";
import Character from "../Character";

export type SoundSource2dOptions = {
  source?: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  audioKey: string;
  reach: number;
  volume: number;
}

export class SoundSource2d {
  public scene: BaseScene;
  private source: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | undefined;
  private position: Phaser.Math.Vector2;
  private reach: number;
  private volume: number;
  private reference: Character | undefined;

  public constructor(scene: BaseScene, x: number, y: number, referenceCharacter: Character, options: SoundSource2dOptions) {
    this.scene = scene;
    this.reach = options.reach;
    this.volume = options.volume;
    this.position = new Phaser.Math.Vector2(x, y);
    this.reference = referenceCharacter;

    if (options.source) {
      this.source = options.source;
    } else {
      this.source = scene.soundManager?.sound.add(options.audioKey, { volume: 0 });
    }
    this.source?.play({ loop: true });
  }

  public getDistance (): number {
    return this.position.distance(new Phaser.Math.Vector2(this.reference?.getBody()?.position.x, this.reference?.getBody()?.position.y));
  }

  public getNormalizedVolume (): number {
    return Math.max(Math.min((1 - this.getDistance() / this.reach) * this.volume, 1), 0);
  }

  public getSign (): number {
    return Math.sign((this.reference?.getBody()?.position.x ?? 0) - this.position.x);
  }

  public destroy (): void {
    this.source?.destroy();
    this.reference = undefined;
  }

  public update (_time: number, _delta: number): void {
    if (!this.source) return;
    const volume = this.getNormalizedVolume();
    this.source.setVolume(volume);
    this.source.setPan(this.getSign() * (volume - 1));
  }
}