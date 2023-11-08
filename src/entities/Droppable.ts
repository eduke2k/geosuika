import DropBucket from "./DropBucket";

export default class Droppable extends Phaser.Physics.Matter.Sprite {
  private tier: number;
  private tethered = false;
  private parentBucket: DropBucket;
  public hasCollided = false;

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
		// this.setAngle(Math.random() * 180);
		this.setBounce(0.5);
    this.setFriction(0.1);

    if (this.tethered) {
      this.setCollidesWith(0);
    }

    // Setup size depending on tier (just for testing)
    this.setScale(0.1 + 0.5 * tier);

    // Add collide event to log first collision of this Droppable and init some Bucket logic (e.g. enable next Droppable)
    this.setOnCollide((event: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      if (!this.hasCollided && !event.bodyA.isSensor) {
        this.hasCollided = true;
        this.parentBucket.initNextDroppable();
      }
    });

    // Add to scene render list
    scene.add.existing(this);
  }

  /** Typescript is kinda dumb in this case. Let's force the return type */
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

  public isTethered (): boolean {
    return this.tethered;
  }
}
