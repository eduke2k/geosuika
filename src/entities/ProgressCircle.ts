import DropBucket from "./DropBucket/DropBucket";

export default class ProgressCircle extends Phaser.GameObjects.Container {
  private bucket: DropBucket;
  private padding = 164;

  public constructor(
    scene: Phaser.Scene,
    bucket: DropBucket,
    x: number,
    y: number,
    width: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.bucket = bucket;

    // const sprite = this.scene.add.sprite(0, 0, 'progressArrow');
    // this.add(sprite);

    // const circle = new Phaser.Geom.Circle(0, 0, (sprite.width / 2) - 20);

    const line = new Phaser.Geom.Line((width - this.padding) / -2, 0, (width - this.padding) /2, 0);

    const set = this.bucket.getDroppableSet();
    if (set && set.droppableConfigs.length > 1) {
      const objects: Phaser.GameObjects.Sprite[] = [];

      const points = line.getPoints(set.droppableConfigs.length - 1);
      points.push(new Phaser.Geom.Point((width - this.padding) / 2, 0))

      set.droppableConfigs.forEach((d, i) => {
        const s = this.scene.add.sprite(x, y, d.spriteKey);
        s.play({ key: d.animationKey, repeat: -1 });
        s.setDisplaySize(25, 25);
        s.setX(points[i].x);
        s.setY(points[i].y);
        objects.push(s);
      });

      //  The starting angle
      // const startAngle = Phaser.Math.DegToRad(-60);

      //  The end angle can overshoot 360 as required
      // const endAngle = Phaser.Math.DegToRad(270);

      // Phaser.Actions.PlaceOnLine(objects, line);
      this.add(objects);
    }
  }
}
