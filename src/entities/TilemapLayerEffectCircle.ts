import chroma from "chroma-js";
import GameScene from "../scenes/GameScene";

export type EffectCircleOptions = {
  toRadius?: number;
  effect: number;
}

export class TilemapLayerEffectCircle extends Phaser.GameObjects.Arc {
  private endRadius = 720;
  private effect = 1;
  private color = chroma.random().hex();

  public constructor (scene: GameScene, x: number, y: number, options?: EffectCircleOptions) {
    super(scene, x, y, 0);

    if (options) {
      if (options.toRadius) this.endRadius = options.toRadius;
      if (options.effect) this.effect = options.effect;
    }
  
    this.scene.tweens.add({
      targets: this,
      radius: this.endRadius,
      ease: Phaser.Math.Easing.Cubic.Out,
      duration: 2000,
      onComplete: () => {
        scene.destroyEffectCircle(this);
      }
    });
  }

  public getColor (): string {
    return this.color;
  }

  public getEffect (): number {
    return this.effect;
  }

  public getDistance (x: number, y: number): number {
    return Math.abs(Phaser.Math.Distance.BetweenPoints({ x: this.x, y: this.y }, { x, y }) - this.radius);
  }
  
  public getProgress (): number {
    return this.radius / this.endRadius;
  }

  public getInverseProgress (): number {
    return 1 - this.getProgress()
  }
}