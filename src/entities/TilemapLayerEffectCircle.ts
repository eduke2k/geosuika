import DropBucket from "./DropBucket";

export class TilemapLayerEffectCircle extends Phaser.GameObjects.Arc {
  private endRadius: number;

  public constructor (bucket: DropBucket, x: number, y: number, toRadius = 720) {
    super(bucket.scene, x, y, 0);
    this.endRadius = toRadius;
  
    this.scene.tweens.add({
      targets: this,
      radius: 720,
      ease: Phaser.Math.Easing.Cubic.Out,
      duration: 2000,
      onComplete: () => {
        bucket.destroyEffectCircle(this);
      }
    });
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