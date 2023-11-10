import DropBucket from "./DropBucket";

export type SpawnDroppableOptions = {
  scene: Phaser.Scene,
  tierIndex: number;
  tethered: boolean;
  bucket: DropBucket,
  x: number;
  y: number;
}

export default class Droppable extends Phaser.Physics.Matter.Sprite {
  private tier: number;
  private tethered = false;
  private parentBucket: DropBucket;
  public hasCollided = false;

  constructor(options: SpawnDroppableOptions) {
    super(options.scene.matter.world, options.x, options.y, options.bucket.getDroppableSet().droppableConfigs[options.tierIndex].spriteKey);
    this.tier = options.tierIndex;
    this.parentBucket = options.bucket;
    this.tethered = options.tethered;

    // Setup physics
    this.setBody(options.bucket.getDroppableSet().droppableConfigs[options.tierIndex].bodyConfig);
		this.play({ key: options.bucket.getDroppableSet().droppableConfigs[options.tierIndex].animationKey, repeat: -1 });
		// this.setAngle(Math.random() * 180);
		this.setBounce(0.5);
    this.setFriction(0.1);

    if (this.tethered) {
      this.setCollidesWith(0);
    }

    // Setup size depending on tier (just for testing)
    this.setScale(options.bucket.getDroppableSet().tierScles[options.tierIndex]);

    // Add collide event to log first collision of this Droppable and init some Bucket logic (e.g. enable next Droppable)
    this.setOnCollide((event: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      if (!this.hasCollided && !event.bodyA.isSensor) {
        this.hasCollided = true;
        this.parentBucket.initNextDroppable();
      }
    });

    // Add to scene render list
    options.scene.add.existing(this);
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
    this.parentBucket.scoreLabel.resetMultiplier();
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
