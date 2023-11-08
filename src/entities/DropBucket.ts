import { getNumberInRange, randomIntFromInterval } from "../functions/helper";
import GameScene from "../scenes/GameScene";
import Droppable from "./Droppable";

export default class DropBucket extends Phaser.Physics.Matter.Sprite {
  public nextDroppable: Droppable | null = null;
  public dropSensor: MatterJS.BodyType;
  public droppables: Droppable[] = [];

  public highestDroppablePoint = this.scene.game.canvas.height;
  public lowestDroppablePoint = 0;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    thickness: number
  ) {
    super(scene.matter.world, x, y, '');

    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const Body = new Phaser.Physics.Matter.MatterPhysics(scene).body;

    // Create collision boxes
    const rectA = Bodies.rectangle((-width / 2) + (thickness / 2), 0, thickness, height, { chamfer: { radius: thickness / 2 } });
    const rectB = Bodies.rectangle((width / 2) - (thickness / 2), 0, thickness, height, { chamfer: { radius: thickness / 2 } });
    const rectC = Bodies.rectangle(0, (height / 2) - (thickness / 2), width, thickness, { chamfer: { radius: thickness / 2 } });

    this.dropSensor = Bodies.rectangle(0, (-height / 2) - (thickness / 2), width - (thickness * 2), 10, { isSensor: true });

    // const rectC = Bodies.rectangle(width, 0, thickness, height);

    const compoundBody = Body.create({
      parts: [ rectA, rectB, rectC, this.dropSensor ]
    });

    this.setExistingBody(compoundBody);
    this.setFrictionAir(0.001);
    this.setBounce(0);
    this.setPosition(x, y);
  
    this.nextDroppable = new Droppable(this.scene, randomIntFromInterval(1, 3), true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'kirby');

		// scene.input.on('pointerdown', (pointer: PointerEvent) => {
		// 	new Droppable(this, 1, pointer.x, pointer.y, 'kirby');
		// }, this);

    scene.add.existing(this);
    this.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', this.handlePointerOver);
    this.on('pointerout', this.handlePointerOut);
    this.on('pointerdown', this.handlePointerDown);
    this.on('pointerup', this.handlePointerUp);

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }

  public handlePointerOver (): void {
  }

  public handlePointerOut (): void {
  }

  public handlePointerDown (): void {
  }

  public handlePointerUp (): void {
    if (this.nextDroppable) this.nextDroppable.untether();
  }

  public handleDrop (): void {
    if (this.nextDroppable) {
      this.droppables.push(this.nextDroppable);
      console.log('droppable has been dropped', this.nextDroppable);
    }
    this.nextDroppable = null;
  }

  public initNextDroppable (): void {
    if (this.nextDroppable) return;

    // Calculate highest and lowest point of dropables in this bucket
    this.highestDroppablePoint = this.getBody().bounds.max.y;
    this.lowestDroppablePoint = this.getBody().bounds.min.y;

    this.droppables.forEach(d => {
      const bodyBounds = d.getBodyBounds();
      if (bodyBounds && d.hasCollided) {
        this.highestDroppablePoint = Math.min(bodyBounds.top, this.highestDroppablePoint);
        this.lowestDroppablePoint = Math.max(bodyBounds.bottom, this.lowestDroppablePoint);
      }
    });

    const droppable = new Droppable(this.scene, randomIntFromInterval(1, 3), true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'kirby');
    this.nextDroppable = droppable;
    // if (this.highestDroppablePoint < 200) {
    //   this.scene.cameras.main.zoomTo(0.8, 500);
    // } else {
    //   this.scene.cameras.main.zoomTo(1, 500);
    //   this.scene.cameras.main.zoomTo
    // }
    // this.scene.cameras.main.setVi
    // this.scene.cameras.main.zoomTo(Phaser.Math.Clamp(this.scene.cameras.main.zoom, this.highestDroppablePoint, this.lowestDroppablePoint));
  }

  public getBody (): MatterJS.BodyType {
    return this.body as MatterJS.BodyType;
  }

  public getBodyBounds (): Phaser.Geom.Rectangle | undefined {
    const body = this.getBody();
    if (!body) return;
    return new Phaser.Geom.Rectangle(
      body.bounds.min.x,
      body.bounds.min.y,
      body.bounds.max.x - body.bounds.min.x,
      body.bounds.max.y - body.bounds.min.y,
    );
  }

  public update (_time: number, _delta: number): void {
    // Handle next droppable position change with mouse position
    if (this.nextDroppable && this.nextDroppable.isTethered()) {
      const x = this.scene.game.input.mousePointer?.worldX;
      if (!x) {
        this.nextDroppable.setX(this.dropSensor.position.x);
      } else {
        this.nextDroppable.setX(getNumberInRange(this.dropSensor.bounds.min.x + ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2), this.dropSensor.bounds.max.x - ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2) , x));
      }
      // this.nextDroppable.setY(this.dropSensor.position.y);
      this.nextDroppable.setY(Math.min(this.dropSensor.position.y, this.highestDroppablePoint - 100));
      this.nextDroppable.setVelocity(0, 0);
    }

    (this.scene as GameScene).debugText.text = `${this.highestDroppablePoint}\n${this.lowestDroppablePoint}`;

    // move dropSensor
    // this.dropSensor. = this.highestDroppablePoint - 100;
  }
}