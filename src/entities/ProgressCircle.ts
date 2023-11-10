import DropBucket from "./DropBucket";

export default class ProgressCircle extends Phaser.GameObjects.Container {
  private bucket: DropBucket;

  public constructor(
    scene: Phaser.Scene,
    bucket: DropBucket,
    x: number,
    y: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.bucket = bucket;

    const sprite = this.scene.add.sprite(0, 0, 'progressArrow');
    this.add(sprite);

    const circle = new Phaser.Geom.Circle(0, 0, (sprite.width / 2) - 20);
    const set = this.bucket.getDroppableSet();
    if (set) {
      const objects: Phaser.GameObjects.Sprite[] = [];
      set.droppableConfigs.forEach(d => {
        const s = this.scene.add.sprite(x, y, d.spriteKey);
        s.play({ key: d.animationKey, repeat: -1 });
        s.setScale(0.3);
        objects.push(s);
      });

      //  The starting angle
      const startAngle = Phaser.Math.DegToRad(-60);

      //  The end angle can overshoot 360 as required
      const endAngle = Phaser.Math.DegToRad(270);

      Phaser.Actions.PlaceOnCircle(objects, circle, startAngle, endAngle);
      this.add(objects);
    }
  }
}
