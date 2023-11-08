export default class Dog extends Phaser.Physics.Matter.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame?: string | number | undefined,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, 'flags', frame, options);
    // Setup physics

    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 179, 290, { chamfer: { radius: 25 }, render: { sprite: { xOffset: 0, yOffset: 0.18 }} });

    this.setExistingBody(rect);
		this.setBounce(0);
    this.setFriction(0.1);
    this.setPosition(x, y);

    // this.flipX = true;

    // Setup size depending on tier (just for testing)
    this.setScale(0.5);

    // Add to scene render list
    scene.add.existing(this);
  }
}
