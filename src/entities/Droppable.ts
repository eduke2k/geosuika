import DropBucket from "./DropBucket";

export default class Droppable extends Phaser.Physics.Matter.Sprite {
  private tier: number;
  private tethered = false;
  private parentBucket: DropBucket;

  constructor(
    scene: Phaser.Scene,
    tier: number,
    tethered: boolean,
    bucket: DropBucket,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, texture, frame, options);
    this.tier = tier;
    this.parentBucket = bucket;
    this.tethered = tethered;

    // Setup physics
    this.setBody({ type: 'circle', radius: 24	});
		// this.play({ key: 'idle', repeat: -1 });
		this.setAngle(Math.random() * 180);
		this.setBounce(0);
    this.setFriction(0.1);


    if (this.tethered) {
      this.setCollidesWith(0);
    }

    // Setup size depending on tier (just for testing)
    this.setScale(0.1 + 0.5 * tier);

    // Add to scene render list
    scene.add.existing(this);

    this.setInteractive(this.body, Phaser.Geom.Circle.Contains);

    this.on('pointerover', this.handlePointerOver);
    this.on('pointerout', this.handlePointerOut);
    this.on('pointerdown', this.handlePointerDown);
    this.on('pointerup', this.handlePointerUp);

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }

  public handlePointerOver (): void {
    if (!this.tethered) return;
    this.setTint(0x7878ff);
  }

  public handlePointerOut (): void {
    if (!this.tethered) return;
    this.clearTint();
  }

  public handlePointerDown (): void {
    if (!this.tethered) return;
    this.setTint(0xff0000);
  }

  public handlePointerUp (): void {
    if (!this.tethered) return;
    this.clearTint();
    this.untether();
  }

  public untether (): void {
    if (!this.tethered) return;
    this.tethered = false;
    this.setCollidesWith(1);
    this.parentBucket.handleDrop();
  }

  public getParentBucket (): DropBucket {
    return this.parentBucket;
  }

  public setTier (tier: number): void {
    this.tier = tier;
  }

  public getTier (): number {
    return this.tier;
  }

  public update (_time: number, _delta: number): void {
    // Make sure the droppable is tied to to top sensor of the bucket each frame
    if (this.tethered) {
      this.setVelocity(0, 0);
      this.setY(this.parentBucket.dropSensor.position.y);
      this.setX(this.parentBucket.dropSensor.position.x);
    }
  }
}
