import { flagSet } from "../config/flags";
import { tetrominosSet } from "../config/tetrominos";
import { allTheDucksBGMConfig } from "../const/bgm";
import { getNumberInRange, pickRandom, randomIntFromInterval, scaleNumberRange, shuffleArray } from "../functions/helper";
import { BackgroundMusic } from "../models/BackgroundMusic";
import { Instrument } from "../models/Instrument";
import GameScene from "../scenes/GameScene";
import { DroppableSet } from "../types";
import Droppable from "./Droppable";
import MergeScore from "./MergeScore";
import ProgressCircle from "./ProgressCircle";
import ScoreLabel from "./ScoreLabel";

export const GAME_OVER_TIME = 3000;
export const DROPPABLE_REMOVE_TIME = 250;
export const DROPPABLE_EXTRA_PADDING = 1;
export const DANGER_VISUALIZATION_START = 0.8;
export const COLLISION_SOUND_WAIT_TIME = 80;

export type DropBucketOptions = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  thickness: number;
  droppableSet: DroppableSet;
  active: boolean;
  noBottom?: boolean;
  gameOverThreshold: number;
  lastTierDestroy?: boolean;
  maxTierToDrop?: number;
  disableMerge?: boolean;
  targetScore: number;
}

export default class DropBucket extends Phaser.Physics.Matter.Image {
  public nextDroppable: Droppable | null = null;
  private bucketWidth: number;
  private bucketHeight: number;
  private bucketThickness: number;
  public dropSensorBody: MatterJS.BodyType;
  public leftWallBody: MatterJS.BodyType;
  public rightWallBody: MatterJS.BodyType;
  public floorBody: MatterJS.BodyType;
  public dangerLineBody: MatterJS.BodyType;
  public droppables: Droppable[] = [];
  public droppableSet: DroppableSet;
  public dangerLine: Phaser.Physics.Matter.Sprite;
  public scoreLabel: ScoreLabel;
  public progressCircle: ProgressCircle;
  public lastTierDestroy: boolean;
  public maxTierToDrop: number | 'auto';
  private mergeDisabled: boolean;
  private targetZoom = 1;
  private baseZoom = 1;
  private bucketActive = false;
  private collisionSoundWaitTime = 0;
  private targetScore: number;

  private bgm: BackgroundMusic;

  public rotateInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  public highestDroppablePoint = this.scene.game.canvas.height;
  public lowestDroppablePoint = 0;

  public gameOverThreshold = 0;
  public isDanger = false;
  public dangerTime = GAME_OVER_TIME;
  public isGameOver = false;

  private droppableRemoveTime = DROPPABLE_REMOVE_TIME;

  public constructor(options: DropBucketOptions) {
    super(options.scene.matter.world, options.x, options.y, 'bucket:osaka-castle');
    this.bucketActive = options.active;
    this.gameOverThreshold = options.gameOverThreshold;
    this.lastTierDestroy = options.lastTierDestroy ?? false;
    this.maxTierToDrop = options.maxTierToDrop ?? 'auto';
    this.mergeDisabled = options.disableMerge ?? false;
    this.targetScore = options.targetScore;

    // Scale the bucket sprite to specifications before adding a body. We need the scale factor later for adjusting origin offsets
    const targetPixelWidth = options.width + (options.thickness * 2);
    const sourcePixelWidth = this.width;
    this.setScale(targetPixelWidth / sourcePixelWidth);

    this.bucketWidth = options.width;
    this.bucketHeight = options.height;
    this.bucketThickness = options.thickness;

    const Bodies = new Phaser.Physics.Matter.MatterPhysics(options.scene).bodies;
    const Body = new Phaser.Physics.Matter.MatterPhysics(options.scene).body;

    // Init bgm
    this.bgm = new BackgroundMusic(this.scene, allTheDucksBGMConfig);

    // Create Score Label
		this.scoreLabel = new ScoreLabel(this.scene, 50, 50);
		this.scoreLabel.setScrollFactor(0, 0);
    this.scoreLabel.visible = true;

    // Create progress circle
		this.progressCircle = new ProgressCircle(this.scene, this, 1100, 500);
		this.progressCircle.setScrollFactor(0, 0);
    this.progressCircle.visible = true;

    // Create collision boxes
    this.leftWallBody = Bodies.rectangle((-options.width / 2) - (options.thickness / 2), 0, options.thickness, options.height);
    this.rightWallBody = Bodies.rectangle((options.width / 2) + (options.thickness / 2), 0, options.thickness, options.height);
    this.floorBody = Bodies.rectangle(0, (options.height / 2) + (options.thickness / 2), options.width + (options.thickness * 2), options.thickness, { isSensor: options.noBottom });
    this.dropSensorBody = Bodies.rectangle(0, (-options.height / 2) - options.thickness, options.width, 50, { mass: 0, isSensor: true });
    this.dangerLineBody = Bodies.rectangle(0, this.leftWallBody.bounds.min.y, options.width, 10, { isSensor: true, isStatic: true });

    const parts = [this.leftWallBody, this.rightWallBody, this.floorBody, this.dropSensorBody, this.dangerLineBody];
    // if (!noBottom) parts.push(rectC);

    const compoundBody = Body.create({ parts });

    // this.setDisplaySize(options.width + (options.thickness * 2), options.height);

    this.setExistingBody(compoundBody);
    this.setFrictionAir(0.001);
    this.setBounce(0);

    /**
     * Move bucket sprite to correct position within the body bounds. Since center of mass
     * can be drastically different from bucket design to bucket design, we need to take everything
     * into account and calculate the new relative y origin to move the sprite to the bottom of the body perfectly.
     */
    const bodyHeight = compoundBody.bounds.max.y - compoundBody.bounds.min.y;
    console.log(bodyHeight);
    const relativeYOffset = this.centerOfMass.y - (1 - (this.height / bodyHeight * this.scale)) / 2;
    this.setOrigin(0.5, relativeYOffset);

    
    // Set position from tilemap. Since the body origin is always the center of mass, putting the bottom of
    // the bucket the coordinates of the tilemap object, we need to calculate the actual body bottom position
    // ourself.
    const bottomY = options.y - ((compoundBody.bounds.max.y - compoundBody.bounds.min.y) / 2) + compoundBody.centerOffset.y;
    this.setPosition(options.x, bottomY);
  
    options.scene.add.existing(this);

    // Add click listener that will only trigger if the click is within the body's bounds
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.bucketActive || this.isDanger) return;

      const rect = this.getBodyBounds();
      if (!rect) return;

      const x = pointer.worldX;
      const y = pointer.worldY;

      if (Phaser.Geom.Rectangle.Contains(rect, x, y)) {
        this.handleLeftClick();
      }
    });

    // Add bucket sprite
    // const sprite = this.scene.matter.scene.add.image(0, 0, 'bucket:osaka-castle');
    // console.log(sprite);

    // Add Danger Line
    this.dangerLine = this.scene.matter.add.sprite(0, 0, 'dangerLine', undefined);
    this.dangerLine.play({ key: 'danger:idle', repeat: -1 });
    this.dangerLine.setExistingBody(this.dangerLineBody);
    this.dangerLine.setCollidesWith(0);

    // Assign set
    this.droppableSet = JSON.parse(JSON.stringify(options.droppableSet)) as DroppableSet;
    if (this.droppableSet.randomizeOrder) {
      shuffleArray(this.droppableSet.droppableConfigs);
    }

    if (options.active) {
      this.activateBucket();
    }

    // Call internal update function if scene updates. Extended classes not update automatically
    options.scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }

  public activateBucket (): void {
    // Start Music
    this.bgm.play();
    // this.scene.sound.play('bgm01-chello-chord', { loop: true })

    // Init first drop
    this.initNextDroppable();

    // Map camera to the bucket
    this.scene.cameras.main.startFollow(this, true, 0.05, 0.05);

    this.bucketActive = true;
  }

  public getDroppableSet (): DroppableSet {
    return this.droppableSet ?? flagSet;
  }

  public handleLeftClick (): void {
    if (this.nextDroppable) this.nextDroppable.untether();
  }

  public handleDrop (): void {
    if (this.nextDroppable) this.droppables.push(this.nextDroppable);
    this.scoreLabel.resetMultiplier();
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

    this.highestDroppablePoint = Math.abs(this.highestDroppablePoint - this.leftWallBody.bounds.max.y);
    this.lowestDroppablePoint = this.lowestDroppablePoint - this.leftWallBody.bounds.max.y;
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
      x: this.dropSensorBody.position.x,
      y: this.dropSensorBody.position.y
    });

    // const droppable = new Droppable(this.scene, randomIndex, true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'flags');
    this.nextDroppable = droppable;
  }

  public getMaxTier (): number {
    return this.getDroppableSet().droppableConfigs.length - 1;
  }

  public playCollisionSound (source: Droppable, force: number): void {
    if (!source.body || this.collisionSoundWaitTime > 0) return;
    const instrument = this.scene.registry.get('instument:harp') as Instrument | undefined;
    if (!instrument) return;
    const pan = (source.body.position.x - this.getBounds().centerX) / (this.bucketWidth / 2);
    const volume = scaleNumberRange(Math.min(force, 17), [0, 20], [0, 1]);
    instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.scene, pan, volume);
    this.collisionSoundWaitTime = COLLISION_SOUND_WAIT_TIME;
  }

  public tryMergeDroppables (a: Droppable, b: Droppable): void {
    // Early out
    if (this.mergeDisabled || this.isGameOver || a.getTier() !== b.getTier()) return;

    if (!a.getBody() && !b.getBody()) {
      console.log('body a AND b are undefined. skipping');
      return;
    }

    if (!this.droppableSet) return;

    // Collect data for new spawn before destroying both bodies
    const tier = b.getTier();

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

    const bodyB = b.getBody();
    const bodyA = a.getBody();
  
    const spawnPosition = bodyB ? bodyB.position : (bodyA.position ?? { x: this.dropSensorBody.position.x, y: this.dropSensorBody.position.y });

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
    const scoreObject = this.scoreLabel.grantScore(nextTier);

    // Send score change to background music model
    this.bgm.handleScoreChange(scoreObject.totalScore / this.targetScore);

    // Spawn score visualizer
    new MergeScore(this.scene, scoreObject.scoreIncrement, scoreObject.currentMultiplier, spawnPosition.x, spawnPosition.y);

    // Add particles explosion
    this.triggerExplodeParticles(droppable);

    // Trigger Sound Effect
    const instrument = this.scene.registry.get('instument:bass') as Instrument | undefined;
    if (instrument) {
      const pan = (spawnPosition.x - this.getBounds().centerX) / (this.bucketWidth / 2);
      const volume = scaleNumberRange(Math.min(scoreObject.scoreIncrement, 20), [0, 20], [0, 1]);
      instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.scene, pan, volume);
    }
  }

  private triggerExplodeParticles (droppable: Droppable): void {
    const body = droppable.body;
    if (!body) return;

    const quantity = (droppable.getTier() + 1) * 10;
    const emitter = this.scene.add.particles(droppable.getBody().position.x, droppable.getBody().position.y, 'flares', {
      frame: [0,1,2,3],
      lifespan: 1000,
      speed: { min: (droppable.getTier() * 10), max: (droppable.getTier() * 30) },
      scale: { start: (droppable.getTier() * 0.1) + 0.5, end: 0 },
      gravityY: 200,
      rotate: { min: 0, max: 360 },
      blendMode: 'ADD',
      emitting: false,
    });

    const droppableConfig = droppable.getConfig();
    if (droppableConfig.bodyType === 'circle') {
      emitter.addEmitZone({ type: 'edge', source: new Phaser.Geom.Circle(0, 0, (droppableConfig.radius ?? 1) * (droppable.scale ?? 1)), quantity, total: 1 })
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
    console.log('triggeringGameOver', this.droppables.length);
    this.targetZoom = 1;
    this.scene.cameras.main.setFollowOffset(0, 0);
    this.isGameOver = true;
    this.bgm.reset();
  }

  private rotateNextDroppable (): void {
    if (!this.nextDroppable) return;

    this.nextDroppable.setRotation(this.nextDroppable.rotation + Phaser.Math.DegToRad(90));
  }

  private explode (droppable: Droppable): void {
    const index = this.droppables.findIndex(d => d === droppable);
    if (index > -1) this.droppables.splice(index, 1);
    this.triggerExplodeParticles(droppable);
    droppable.destroy();
  }

  public restartBucket (): void {
    this.nextDroppable = null;
    this.droppables.forEach(d => { d.destroy(); });
    this.droppables = [];
    this.scoreLabel.restart();
    this.isGameOver = false;
    this.initNextDroppable();
  }

  public getDangerPercentage (): number {
    return Math.max(scaleNumberRange(this.highestDroppablePoint / this.gameOverThreshold, [DANGER_VISUALIZATION_START, 1], [0, 1]), 0);
  }

  public getDangerLineTint (dangerPercentage: number): number {
    if (dangerPercentage <= 0.3) return 0x61eb17;
    if (dangerPercentage <= 0.6) return 0xc4eb17;
    if (dangerPercentage <= 0.9) return 0xe0b422;
    return 0xe31010;
  }

  public update (_time: number, delta: number): void {
    if (!this.bucketActive) return;
    const dangerPercentage = this.getDangerPercentage();

    // Set danger visualization
    if (!this.isGameOver) {
      this.targetZoom = 1 + dangerPercentage * 0.3;
      this.scene.cameras.main.setFollowOffset(0, dangerPercentage * 100)
    }

    // Reduce collision sound wait time
    if (this.collisionSoundWaitTime > 0) {
      this.collisionSoundWaitTime -= delta;
    }

    // Handle automatic zoom
    if (Math.abs((this.targetZoom - this.scene.cameras.main.zoom)) > 0.001) {
      const currentZoom = this.scene.cameras.main.zoom;
      const increment = ((this.targetZoom - currentZoom) / 500 * delta);
      this.scene.cameras.main.setZoom(currentZoom + increment);
    } else {
      this.scene.cameras.main.setZoom(this.targetZoom);
    }

    // Handle Input
    if (Phaser.Input.Keyboard.JustDown(this.rotateInput)) {
      this.rotateNextDroppable();
    }

    // Remove droppables on game over
    if (this.isGameOver && this.droppables.length > 0) {
      if (this.droppableRemoveTime <= 0) {

        if (this.nextDroppable) {
          this.explode(this.nextDroppable);
          this.nextDroppable = null;
        } else {
          const randomDroppable = pickRandom(this.droppables);
          this.explode(randomDroppable);
        }

        if (this.droppables.length > 0) {
          this.droppableRemoveTime = DROPPABLE_REMOVE_TIME;
        }
      } else {
        this.droppableRemoveTime -= delta;
      }
    } else if (this.isGameOver && this.droppables.length === 0) {
      // Clean up finished, do something!
      this.restartBucket();
    }

    // Set danger line position and appearneace
    this.dangerLine.setX(this.dropSensorBody.position.x);
    this.dangerLine.setY(this.leftWallBody.bounds.min.y);
    this.dangerLine.alpha = dangerPercentage;
    this.dangerLine.setTint(this.getDangerLineTint(dangerPercentage));

    // Handle next droppable position change with mouse position
    if (!this.isGameOver && this.nextDroppable && this.nextDroppable.isTethered()) {
      const x = this.scene.game.input.mousePointer?.worldX;
      const y = this.scene.game.input.mousePointer?.worldY;

      if (x == undefined || y == undefined) {
        this.nextDroppable.setX(this.dropSensorBody.position.x);
        this.nextDroppable.setY(this.dropSensorBody.position.y);
      } else {
        this.nextDroppable.setX(getNumberInRange(this.dropSensorBody.bounds.min.x + DROPPABLE_EXTRA_PADDING + ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2), this.dropSensorBody.bounds.max.x - DROPPABLE_EXTRA_PADDING - ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2) , x));
        this.nextDroppable.setY(getNumberInRange(this.dropSensorBody.bounds.min.y, this.dropSensorBody.bounds.max.y, y));
      }
      this.nextDroppable.setVelocity(0, 0);
    }

    this.calculateHighestAndLowestPoint();
    (this.scene as GameScene).debugText.text = `
      Highest: ${this.highestDroppablePoint}
      Lowest:  ${this.lowestDroppablePoint}
      Danger-Percentage: ${this.getDangerPercentage()}
      Next Droppable x: ${this.nextDroppable?.body?.position.x}
      Next Droppable y: ${this.nextDroppable?.body?.position.y}
    `;

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

  public static getDroppableSetfromName (setName: string): DroppableSet {
    switch(setName) {
      case 'flagSet': return flagSet;
      case 'tetrominos': return tetrominosSet;
      default: return flagSet;
    }
  }
}