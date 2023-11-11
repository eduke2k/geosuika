import { flagSet } from "../config/flags";
import { getNumberInRange, randomIntFromInterval, shuffleArray } from "../functions/helper";
import GameScene from "../scenes/GameScene";
import { DroppableSet } from "../types";
import Droppable from "./Droppable";
import ScoreLabel from "./ScoreLabel";

export const GAME_OVER_TIME = 3000;

export type DropBocketOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
  scoreLabel: ScoreLabel,
  noBottom?: boolean,
  gameOverThreshold: number;
  lastTierDestroy?: boolean;
  maxTierToDrop?: number;
}

export default class DropBucket extends Phaser.Physics.Matter.Sprite {
  public nextDroppable: Droppable | null = null;
  public dropSensor: MatterJS.BodyType;
  public leftWall: MatterJS.BodyType;
  public rightWall: MatterJS.BodyType;
  public floor: MatterJS.BodyType;
  public droppables: Droppable[] = [];
  public droppableSet: DroppableSet | null = null;
  public scoreLabel: ScoreLabel;
  public lastTierDestroy: boolean;
  public maxTierToDrop: number | 'auto';

  public rotateInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  public highestDroppablePoint = this.scene.game.canvas.height;
  public lowestDroppablePoint = 0;

  public gameOverThreshold = 0;
  public isDanger = false;
  public dangerTime = GAME_OVER_TIME;
  public isGameOver = false;

  public constructor(options: DropBocketOptions) {
    super(options.scene.matter.world, options.x, options.y, '');
    this.scoreLabel = options.scoreLabel;
    this.gameOverThreshold = options.gameOverThreshold;
    this.lastTierDestroy = options.lastTierDestroy ?? false;
    this.maxTierToDrop = options.maxTierToDrop ?? 'auto';
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(options.scene).bodies;
    const Body = new Phaser.Physics.Matter.MatterPhysics(options.scene).body;

    // Create collision boxes
    this.leftWall = Bodies.rectangle((-options.width / 2) - (options.thickness / 2), 0, options.thickness, options.height, { chamfer: { radius: options.thickness / 2 } });
    this.rightWall = Bodies.rectangle((options.width / 2) + (options.thickness / 2), 0, options.thickness, options.height, { chamfer: { radius: options.thickness / 2 } });
    this.floor = Bodies.rectangle(0, (options.height / 2) + (options.thickness / 2), options.width + (options.thickness * 2), options.thickness, { mass: 0, isSensor: options.noBottom, chamfer: { radius: options.thickness / 2 } });
    this.dropSensor = Bodies.rectangle(0, (-options.height / 2) - options.thickness, options.width, 50, { mass: 0, isSensor: true });

    const parts = [this.leftWall, this.rightWall, this.floor, this.dropSensor];
    // if (!noBottom) parts.push(rectC);

    const compoundBody = Body.create({ parts });

    this.setExistingBody(compoundBody);
    this.setFrictionAir(0.001);
    this.setBounce(0);
    this.setPosition(options.x, options.y);
  
    options.scene.add.existing(this);

    // Add click listener that will only trigger if the click is within the body's bounds
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDanger) return;

      const rect = this.getBodyBounds();
      if (!rect) return;

      const x = pointer.worldX;
      const y = pointer.worldY;

      if (Phaser.Geom.Rectangle.Contains(rect, x, y)) {
        this.handleLeftClick();
      }
    });

    // Call internal update function if scene updates. Extended classes not update automatically
    options.scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }

  /**
   * Assigns a droppable set (as deep clone) to the bucket. The next droppable will be initialized
   * immeditely afterwards and the bucket will be ready to play.
   * @param set the target DroppableSet config
   */
  public assignDroppableSet (set: DroppableSet): void {
    this.droppableSet = JSON.parse(JSON.stringify(set)) as DroppableSet;
    if (this.droppableSet.randomizeOrder) {
      shuffleArray(this.droppableSet.droppableConfigs);
    }

    this.initNextDroppable();
  }

  public getDroppableSet (): DroppableSet {
    return this.droppableSet ?? flagSet;
  }

  public handleLeftClick (): void {
    if (this.nextDroppable) this.nextDroppable.untether();
  }

  public handleDrop (): void {
    if (this.nextDroppable) this.droppables.push(this.nextDroppable);
    this.nextDroppable = null;
  }

  private calculateHighestAndLowestPoint (): void {
    this.highestDroppablePoint = this.getBody().bounds.max.y;
    this.lowestDroppablePoint = this.getBody().bounds.min.y;

    this.droppables.forEach(d => {
      const bodyBounds = d.getBodyBounds();
      if (bodyBounds && d.hasCollided) {
        this.highestDroppablePoint = Math.min(bodyBounds.top, this.highestDroppablePoint);
        this.lowestDroppablePoint = Math.max(bodyBounds.bottom, this.lowestDroppablePoint);
      }
    });

    this.highestDroppablePoint = Math.abs(this.highestDroppablePoint - this.leftWall.bounds.max.y);
    this.lowestDroppablePoint = this.lowestDroppablePoint - this.leftWall.bounds.max.y;
  }

  public initNextDroppable (): void {
    if (this.nextDroppable || !this.droppableSet) return;

    const maxTierToDrop = this.maxTierToDrop === 'auto' ? Math.round(this.getDroppableSet().droppableConfigs.length * 0.28) : this.maxTierToDrop;
    const randomIndex = randomIntFromInterval(0, maxTierToDrop);
    const droppable = Droppable.create({
      bucket: this,
      scene: this.scene,
      tethered: true,
      tierIndex: randomIndex,
      x: this.dropSensor.position.x,
      y: this.dropSensor.position.y
    });

    // const droppable = new Droppable(this.scene, randomIndex, true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'flags');
    this.nextDroppable = droppable;
  }

  public getMaxTier (): number {
    return this.getDroppableSet().droppableConfigs.length - 1;
  }

  public tryMergeDroppables (a: Droppable, b: Droppable): void {
    // Early out
    if (a.getTier() !== b.getTier()) return;

    if (!a.getBody() && !b.getBody()) {
      console.log('body a AND b are undefined. skipping');
      return;
    }

    if (!this.droppableSet) return;

    // Collect data for new spawn before destroying both bodies
    const tier = b.getTier();
    console.log('current tier', tier);

    // Early out on last tier. Nothing happens
    if (this.getMaxTier() === tier && !this.lastTierDestroy) return;

    if (this.getMaxTier() === tier && this.lastTierDestroy) {
      this.droppables.splice(this.droppables.findIndex(d => d === a), 1);
      this.droppables.splice(this.droppables.findIndex(d => d === b), 1);
      a.destroy();
      b.destroy();
      return;
    }

    const nextTier = tier + 1;
    console.log('next tier', nextTier);

    const nextDroppableConfig = this.droppableSet.droppableConfigs[nextTier];
    const nextDroppableScale = this.droppableSet.tierScles[nextTier] ?? 1;
    if (!nextDroppableConfig) return;

    const bodyB = b.getBody();
    const bodyA = a.getBody();

    console.log('try to get position from body b', bodyB);
    console.log('try to get position from body b', bodyA);
  
    const spawnPosition = bodyB ? bodyB.position : (bodyA.position ?? { x: this.dropSensor.position.x, y: this.dropSensor.position.y });
    console.log('spawnPosition', spawnPosition);

    // Get rid of them
    this.droppables.splice(this.droppables.findIndex(d => d === a), 1);
    this.droppables.splice(this.droppables.findIndex(d => d === b), 1);
    a.destroy();
    b.destroy();

    // Add a explosion!
    // Too buggy yet
    // new ExplosionForce('', this, spawnPosition.x, spawnPosition.y, 1, 0.0001, 10);
    this.scene.cameras.main.shake(100, 0.005);

    // Spawn new body, one tier higher!
    const droppable = Droppable.create({
      bucket: this,
      scene: this.scene,
      tethered: false,
      tierIndex: nextTier,
      x: spawnPosition.x,
      y: spawnPosition.y
    });

    this.droppables.push(droppable);

    // const droppable = new Droppable(this, tier + 1, false, parentBucket, spawnPosition.x, spawnPosition.y, 'flags');
    droppable.hasCollided = true;

    // Do Score calculation
    this.scoreLabel.grantScore(nextTier);

    // Add particles explosion
    const quantity = nextTier * 10;
    const emitter = this.scene.add.particles(spawnPosition.x, spawnPosition.y, 'flares', {
      frame: [0,1,2,3],
      lifespan: 1000,
      speed: { min: (nextTier * 10), max: (nextTier * 30) },
      scale: { start: (nextTier * 0.1) + 0.5, end: 0 },
      gravityY: 200,
      rotate: { min: 0, max: 360 },
      blendMode: 'ADD',
      emitting: false,
    });

    if (nextDroppableConfig.bodyType === 'circle') {
      emitter.addEmitZone({ type: 'edge', source: new Phaser.Geom.Circle(0, 0, (nextDroppableConfig.radius ?? 1) * nextDroppableScale), quantity, total: 1 })
    }

    emitter.particleBringToTop = true;
    emitter.explode(quantity);

    this.scene.time.delayedCall(5000, function() {
      emitter.destroy();
    });
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

  public triggerDanger (): void {
    console.log('triggering danger');
    this.isDanger = true;
    // this.scene.cameras.main.zoomTo(1.1, 100, 'Power2');
  }

  public triggerSafe (): void {
    console.log('triggering Safe');
    this.isDanger = false;
    this.dangerTime = GAME_OVER_TIME;
    // this.scene.cameras.main.zoomTo(1, 100, 'Power2');
  }

  public triggerGameOver (): void {
    console.log('triggeringGameOver');
    this.isGameOver = true;
  }

  private rotateNextDroppable (): void {
    if (!this.nextDroppable) return;

    this.nextDroppable.setRotation(this.nextDroppable.rotation + Phaser.Math.DegToRad(90));
  }

  public update (_time: number, delta: number): void {
    // Handle Input
    if (Phaser.Input.Keyboard.JustDown(this.rotateInput)) {
      this.rotateNextDroppable();
    }

    // Handle next droppable position change with mouse position
    if (!this.isGameOver && this.nextDroppable && this.nextDroppable.isTethered()) {

      // const Body = new Phaser.Physics.Matter.MatterPhysics(this.scene).body;
      // Body.translate(this.dropSensor, { x: 0, y: 1 });
      // this.dropSensor. = { x: 0, y: 1 };
      // console.log(this.dropSensor.position);

      const x = this.scene.game.input.mousePointer?.worldX;
      const y = this.scene.game.input.mousePointer?.worldY;

      if (!x || !y) {
        this.nextDroppable.setX(this.dropSensor.position.x);
        this.nextDroppable.setY(this.dropSensor.position.y);
      } else {
        this.nextDroppable.setX(getNumberInRange(this.dropSensor.bounds.min.x + ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2), this.dropSensor.bounds.max.x - ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2) , x));
        // this.nextDroppable.setX(getNumberInRange(this.dropSensor.bounds.min.x, this.dropSensor.bounds.max.x, x));
        this.nextDroppable.setY(getNumberInRange(this.dropSensor.bounds.min.y, this.dropSensor.bounds.max.y, y));
      }
      // this.nextDroppable.setY(this.dropSensor.position.y);
      // this.nextDroppable.setY(Math.min(this.dropSensor.position.y, this.highestDroppablePoint - 100));
      this.nextDroppable.setVelocity(0, 0);
    }

    this.calculateHighestAndLowestPoint();
    (this.scene as GameScene).debugText.text = `Highest: ${this.highestDroppablePoint}\nLowest:  ${this.lowestDroppablePoint}\nNext Droppable x: ${this.nextDroppable?.body?.position.x}\nNext Droppable y: ${this.nextDroppable?.body?.position.y}`;

    if (this.highestDroppablePoint > this.gameOverThreshold) {
      if (!this.isDanger) {
        this.triggerDanger();
      } else {
        this.dangerTime -= delta;
        if (this.dangerTime <= 0) {
          this.triggerGameOver();
        }
      }
    } else if (this.highestDroppablePoint <= this.gameOverThreshold && this.isDanger) {
      this.triggerSafe();
    }
  }
}