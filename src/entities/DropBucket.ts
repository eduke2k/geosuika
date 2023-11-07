import { randomIntFromInterval } from "../functions/helper";
import Droppable from "./Droppable";

export default class DropBucket extends Phaser.Physics.Matter.Sprite {
  public nextDroppable: Droppable | null = null;
  public dropSensor: MatterJS.BodyType;

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
    const rectA = Bodies.rectangle((-width / 2) + (thickness / 2), 0, thickness, height);
    const rectB = Bodies.rectangle((width / 2) - (thickness / 2), 0, thickness, height);
    const rectC = Bodies.rectangle(0, (height / 2) - (thickness / 2), width, thickness);

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
  }

  public handleDrop (): void {
    console.log('handle drop called');
    this.nextDroppable = new Droppable(this.scene, randomIntFromInterval(1, 3), true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'kirby');
    console.log('new droppable added', this.nextDroppable);
  }
}