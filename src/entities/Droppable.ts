import { CATEGORY_BUCKET, CATEGORY_DROPPABLES, CATEGORY_TERRAIN } from "../const/collisions";
import { SingleDroppableConfig } from "../types";
import DropBucket from "./DropBucket";

export type DroppableParams = {
  scene: Phaser.Scene,
  tierIndex: number;
  tethered: boolean;
  bucket: DropBucket;
  x: number;
  y: number;
}

export default class Droppable extends Phaser.Physics.Matter.Sprite {
  private tier: number;
  private config: SingleDroppableConfig;
  private tethered = false;
  private parentBucket: DropBucket;
  public hasCollided = false;
  public birthTime: number;

  private static generateBody (droppableConfig: SingleDroppableConfig, scene: Phaser.Scene, x: number, y: number): MatterJS.BodyType {
    const collisionFilter = {
      group: 0,
      category: CATEGORY_DROPPABLES,
      mask: CATEGORY_BUCKET | CATEGORY_TERRAIN
    }

    switch (droppableConfig.bodyType) {
      case 'circle': {
        return scene.matter.add.circle(x, y, droppableConfig.radius, { collisionFilter, label: 'circle-droppable' });
      }
      case 'rectangle': {
        return scene.matter.add.rectangle(x, y, droppableConfig.width, droppableConfig.height, {
          collisionFilter,
          chamfer: {
            radius: droppableConfig.chamfer
          },
          render: { sprite: { xOffset: droppableConfig.offsetX / droppableConfig.width, yOffset: droppableConfig.offsetY / droppableConfig.height }},
          label: 'rect-droppable'
        });
      }
      case 'fromVerts': {
        const verts = droppableConfig.verts;
        return scene.matter.add.fromVertices(x, y, verts, { collisionFilter, label: 'verts-droppable' });
      }
    }
  }

  public static create (options: DroppableParams): Droppable {
    const droppableConfig = options.bucket.getDroppableSet().droppableConfigs[options.tierIndex];
    if (!droppableConfig) throw new Error(`can not create droppable since droppableConfig for '${options.tierIndex}' does not exist`);

    // Generate Body
    const body = Droppable.generateBody(droppableConfig, options.scene, options.x, options.y);

    // Setup sprite (as Droppable)
    return new Droppable(options, droppableConfig, body);
  }

  constructor(params: DroppableParams, droppableConfig: SingleDroppableConfig, body: MatterJS.BodyType) {
    super(params.scene.matter.world, params.x, params.y, params.bucket.getDroppableSet().droppableConfigs[params.tierIndex].spriteKey);
    this.setExistingBody(body);
    this.tier = params.tierIndex;
    this.parentBucket = params.bucket;
    this.tethered = params.tethered;
    this.config = droppableConfig;
    this.birthTime = this.scene.time.now;

    // Trigger animation in sprite
    this.play({ key: params.bucket.getDroppableSet().droppableConfigs[params.tierIndex].animationKey, repeat: -1 });

		this.setBounce(0.5);
    this.setFriction(1);
    this.setMass(params.bucket.getDroppableSet().tierScales[params.tierIndex]);

    // If the droppable is tethered, remove collision
    if (this.tethered) this.setCollidesWith(-1);

    // Setup size depending on tier (just for testing)
    // this.setScale(params.bucket.getDroppableSet().tierScales[params.tierIndex]);
    const config = params.bucket.getDroppableSet().droppableConfigs[params.tierIndex];

    let offsetRatio = 0;
    if (config.bodyType === 'circle') {
      offsetRatio = config.offset / (config.radius * 2);
    }

    const absoluteOffset = Math.round(offsetRatio * params.bucket.getDroppableSet().tierScales[params.tierIndex]);

    const ratio = this.width / this.height;
    // console.log(this.width);
    // console.log(params.bucket.getDroppableSet().tierScales[params.tierIndex]);
    this.setDisplaySize(
      (params.bucket.getDroppableSet().tierScales[params.tierIndex] + (absoluteOffset * 2)) * (config.scaleMultiplier ?? 1),
      (params.bucket.getDroppableSet().tierScales[params.tierIndex] + (absoluteOffset * 2)) * (config.scaleMultiplier ?? 1) * ratio
    );

    // Add collide event to log first collision of this Droppable and init some Bucket logic (e.g. enable next Droppable)
    this.initCollideCallbacks(body);

    // Add to scene render list
    params.scene.add.existing(this);
  }

  public setDestroyable (): void {
    const config: Phaser.Types.Input.InputConfiguration = {
      useHandCursor: true,
      pixelPerfect: true
    }

    this.setInteractive(config);
    this.on('pointerover', () => { this.setTint(0x7878ff); });
    this.on('pointerout', () => { this.clearTint(); });
    this.on('pointerdown', () => { this.setTint(0xff0000); });
    this.on('pointerup', () => {
      this.clearTint();
      this.parentBucket.addEffectCircle(this.x, this.y, { effect: -2, toRadius: 960 })
      this.parentBucket.explode(this, { drum: 'drum:taiko' });
      this.parentBucket.updateElevatorPosition();
      this.parentBucket.handleDestroyedPhaseProgress();
    });
  }

  public getConfig (): SingleDroppableConfig {
    return this.config;
  }

  private initCollideCallbacks (body: MatterJS.BodyType): void {
    if (body.parts.length > 1) {
      body.parts.forEach(p => {
        p.onCollideCallback  = this.handleCollision.bind(this);
      })
    } else {
      this.setOnCollide(this.handleCollision.bind(this));
    }
  }

  private handleCollision (event: Phaser.Types.Physics.Matter.MatterCollisionData): void {
    if (!this.hasCollided && !event.bodyA.isSensor) {
      this.hasCollided = true;
      this.parentBucket.initNextDroppable();
    }
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
    this.setCollisionGroup(0);

    // Update birth time when untethered
    this.birthTime = this.scene.time.now;
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

  public static getFirstDroppableFromBodies (...bodies: MatterJS.BodyType[]): Droppable | undefined {
    for (let i = 0; i < bodies.length; i++) {
      if (bodies[i].gameObject instanceof Droppable) return bodies[i].gameObject;
    }
    return;
  }
}
