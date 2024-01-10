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

  public getDistanceVector (): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.abs(this.position.x - (this.reference?.getBody()?.position.x ?? 0)),
      Math.abs(this.position.y - (this.reference?.getBody()?.position.y ?? 0))
    );
  }

  public getRelativeDistance (distance: number): number {
    return (1 - distance / this.reach);
  }

  public getNormalizedPan (relativeDistance: number): number {
    return Math.max(Math.min((relativeDistance / this.reach), 1), 0);
  }

  public getNormalizedVolume (relativeDistance: number): number {
    return Math.max(Math.min(relativeDistance * this.volume, 1), 0);
  }

  public getSign (): number {
    return Math.sign(this.position.x - (this.reference?.getBody()?.position.x ?? 0));
  }

  public destroy (): void {
    this.source?.destroy();
    this.reference = undefined;
  }

  public update (_time: number, _delta: number): void {
    if (!this.source) return;
    const distanceVector = this.getDistanceVector();
    const relativeDistance = this.getRelativeDistance(distanceVector.length());

    const volume = this.getNormalizedVolume(relativeDistance);
    this.source.setVolume(volume);
    this.source.setPan(this.getSign() * this.getNormalizedPan(distanceVector.x));
  }
}