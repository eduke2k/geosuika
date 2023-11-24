import chroma from "chroma-js";
import { flagSet } from "../config/flags";
import { tetrominosSet } from "../config/tetrominos";
import { bgm02BGMConfig } from "../const/bgm02";
import { getNumberInRange, randomIntFromInterval, scaleNumberRange, shuffleArray } from "../functions/helper";
import { BackgroundMusic } from "../models/BackgroundMusic";
import { Drum } from "../models/Drum";
import { Instrument } from "../models/Instrument";
import GameScene from "../scenes/GameScene";
import { DroppableSet } from "../types";
import BlinkingText from "./BlinkingText";
// import BucketElevator from "./BucketElevator";
import Droppable from "./Droppable";
// import MergeScore from "./MergeScore";
import ProgressCircle from "./ProgressCircle";
import ScoreLabel, { ScorePayload } from "./ScoreLabel";
import ScoreProgressBar from "./ScoreProgressBar";
import { EffectCircleOptions, TilemapLayerEffectCircle } from "./TilemapLayerEffectCircle";
// import { Depths } from "../const/depths";
import BlinkingScore from "./BlinkingScore";

export const GAME_OVER_TIME = 3000;
export const DROPPABLE_REMOVE_TIME = 500;
export const DROPPABLE_EXTRA_PADDING = 1;
export const DANGER_VISUALIZATION_START = 0.8;
export const COLLISION_SOUND_WAIT_TIME = 80;
export const MERGE_SOUND_WAIT_TIME = 80;
export const SCORE_BAR_WIDTH = 24;

export type DropBucketOptions = {
  scene: GameScene;
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
  image: string;
  elevatorBody?: MatterJS.BodyType,
  elevatorDistance?: number;
}

export enum BucketPhase {
  DROP = 'drop',
  DESTROY = 'destroy'
}

export default class DropBucket extends Phaser.Physics.Matter.Image {
  private options: DropBucketOptions;
	private endY: number;
  private startY: number;
  public nextDroppable: Droppable | null = null;
  private currentPhase: BucketPhase = BucketPhase.DROP;
  private bucketWidth: number;
  private bucketHeight: number;
  private bucketThickness: number;
  public dropSensorBody: MatterJS.BodyType;
  public leftWallBody: MatterJS.BodyType;
  public rightWallBody: MatterJS.BodyType;
  public floorBody: MatterJS.BodyType;
  public dangerLineBody: MatterJS.BodyType;
  // public elevator: BucketElevator;
  public droppables: Droppable[] = [];
  public droppableSet: DroppableSet;
  public effectCircles: TilemapLayerEffectCircle[] = [];
  public dangerLine: Phaser.GameObjects.Sprite;
  public scoreLabel: ScoreLabel;
  public scoreProgressBar: ScoreProgressBar;
  public progressCircle: ProgressCircle;
  public lastTierDestroy: boolean;
  public maxTierToDrop: number | 'auto';
  private mergeDisabled: boolean;
  private targetZoom = 0.9;
  // private baseZoom = 1;
  private bucketActive = false;
  private collisionSoundWaitTime = 0;
  private mergeSoundWaitTime = 0;
  private targetScore: number;
  private bucketImage: Phaser.GameObjects.Image;
  private bucketProgress = 0;

  private bgm: BackgroundMusic;
  private elevatorDistance: number;

  public rotateInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  public chordInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  public visibleTilesInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  public rankUpInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  public clearTiles = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  public moveElevatorUpInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  public moveElevatorDownInput = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

  public highestDroppablePoint = this.scene.game.canvas.height;
  public lowestDroppablePoint = 0;
  private totalDroppablesForDestruction = 0;

  public gameOverThreshold = 0;
  public isDanger = false;
  public dangerTime = GAME_OVER_TIME;
  public isGameOver = false;

  private droppableRemoveTime = DROPPABLE_REMOVE_TIME;

  public constructor(options: DropBucketOptions) {
    super(options.scene.matter.world, options.x, options.y, '');
    this.options = options;
    this.bucketActive = options.active;
    this.gameOverThreshold = options.gameOverThreshold;
    this.lastTierDestroy = options.lastTierDestroy ?? false;
    this.maxTierToDrop = options.maxTierToDrop ?? 'auto';
    this.mergeDisabled = options.disableMerge ?? false;
    this.targetScore = options.targetScore;
    this.elevatorDistance = options.elevatorDistance ?? 1000;
    this.visible = false;

    // Scale the bucket sprite to specifications before adding a body. We need the scale factor later for adjusting origin offsets
    // const targetPixelWidth = options.width + (options.thickness * 2);
    // const sourcePixelWidth = this.width;
    // this.setScale(targetPixelWidth / sourcePixelWidth);

    this.bucketWidth = options.width;
    this.bucketHeight = options.height;
    this.bucketThickness = options.thickness;
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(options.scene).bodies;
    const Body = new Phaser.Physics.Matter.MatterPhysics(options.scene).body;

    // Init bgm
    this.bgm = new BackgroundMusic(this.scene, bgm02BGMConfig);

    // Add Elevator
    // this.elevator = new BucketElevator(this, options.x, options.y, options.width + (options.thickness * 2), '');

    // Create Score Label
		this.scoreLabel = new ScoreLabel(this.scene, 0, 0);
    this.scoreLabel.visible = true;
    this.setDepth(0);

    // Create collision boxes
    this.leftWallBody = Bodies.rectangle((-options.width / 2) - (options.thickness / 2), 0, options.thickness, options.height);
    this.rightWallBody = Bodies.rectangle((options.width / 2) + (options.thickness / 2), 0, options.thickness, options.height);
    this.floorBody = Bodies.rectangle(0, (options.height / 2) + (options.thickness / 2), options.width + (options.thickness * 2), options.thickness, { isSensor: options.noBottom });
    this.dropSensorBody = Bodies.rectangle(0, (-options.height / 2) - options.thickness, options.width, 50, { mass: 0, isSensor: true });
    this.dangerLineBody = Bodies.rectangle(0, this.leftWallBody.bounds.max.y - options.gameOverThreshold, options.width, 10, { isSensor: true });

    const parts = [this.leftWallBody, this.rightWallBody, this.floorBody, this.dropSensorBody, this.dangerLineBody];

    const compoundBody = Body.create({ parts, isStatic: true });

    this.setExistingBody(compoundBody);
    this.setFrictionAir(0.001);
    this.setBounce(0);

    // Create bucket image and tweak origin to make sure it is placed at the bottom of the bucket and translates well
    this.bucketImage = this.scene.add.image(0, 0, options.image);
    this.bucketImage.setOrigin(0.5, (this.bucketImage.height - (this.bucketThickness / 2)) / this.bucketImage.height);
    this.bucketImage.setTint(0xFFFFFF);

    // Create Score Progress
    this.scoreProgressBar = new ScoreProgressBar(this.scene, 0, 0, this.bucketHeight, this.bucketThickness);

    // Add Danger Line
    this.dangerLine = this.scene.add.sprite(0, 0, 'dangerLine', undefined);
    this.dangerLine.name = 'dangerLine';
    this.dangerLine.play({ key: 'danger:idle', repeat: -1 });

    this.scene.matter.alignBody(compoundBody, options.x, options.y, Phaser.Display.Align.BOTTOM_CENTER);

    // this.setPosition(options.x, bottomY);
    this.endY = this.y;
    this.startY = this.y;

    options.scene.add.existing(this);

    // Add click listener that will only trigger if the click is within the body's bounds
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.bucketActive || this.isDanger || this.currentPhase !== BucketPhase.DROP) return;

      const rect = this.bucketImage.getBounds();
      if (!rect) return;

      const x = pointer.worldX;
      const y = pointer.worldY;

      if (Phaser.Geom.Rectangle.Contains(rect, x, y)) {
        this.handleLeftClick();
      }
    });

    // Assign set
    this.droppableSet = JSON.parse(JSON.stringify(options.droppableSet)) as DroppableSet;
    if (this.droppableSet.randomizeOrder) {
      shuffleArray(this.droppableSet.droppableConfigs);
    }

    // Create progress circle
		this.progressCircle = new ProgressCircle(this.scene, this, 0, 0, this.floorBody.bounds.max.x - this.floorBody.bounds.min.x);
    this.progressCircle.visible = true;

    if (options.active) {
      this.activateBucket();
    }

    this.bucketImage.setDepth(0);
    this.scoreProgressBar.setDepth(1)
    this.progressCircle.setDepth(1);
    this.dangerLine.setDepth(1);
    this.scoreLabel.setDepth(2);

    // Call internal update function if scene updates. Extended classes not update automatically
    options.scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }
  
  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }

  public getBucketPhase (): BucketPhase {
    return this.currentPhase;
  }

  public activateBucket (): void {
    // Start Music
    this.bgm.play();

    // this.scene.sound.play('bgm01-chello-chord', { loop: true })

    // Init first drop
    this.initNextDroppable();

    // Map camera to the bucket
    this.scene.cameras.main.startFollow(this, true, 0.05, 0.05);
    this.scene.cameras.main.setFollowOffset(0, 50)

    this.bucketActive = true;
  }

  public getDroppableSet (): DroppableSet {
    return this.droppableSet ?? flagSet;
  }

  public handleLeftClick (): void {
    if (this.nextDroppable) {
      this.nextDroppable.untether();
    }
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

  public playMergeSound (score: ScorePayload, x: number): void {
    if (this.mergeSoundWaitTime <= 0) {
      const instrument = this.scene.registry.get('instument:merge') as Instrument | undefined;
      if (instrument) {
        const pan = (x - this.getBounds().centerX) / (this.bucketWidth / 2);
        const volume = scaleNumberRange(Math.min(score.scoreIncrement, 20), [0, 20], [0, 1]);
        instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.scene, pan, volume);
      }
      this.mergeSoundWaitTime = MERGE_SOUND_WAIT_TIME;
    }
  }

  public playCollisionSound (source: Droppable, force: number, contactVertex?: { x: number; y: number }): void {
    if (!source.body || this.collisionSoundWaitTime > 0) return;
    const instrument = this.scene.registry.get('instument:harp') as Instrument | undefined;
    if (!instrument) return;
    const pan = (source.body.position.x - this.getBounds().centerX) / (this.bucketWidth / 2);
    const volume = scaleNumberRange(Math.min(force, 17), [0, 50], [0, 1]);
    instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.scene, pan, volume);
    this.collisionSoundWaitTime = COLLISION_SOUND_WAIT_TIME;
    if (contactVertex) this.triggerSparkParticle(contactVertex);
  }

  private rankUp (progressLevel: number): void {
    this.bucketProgress = progressLevel;
    this.getGameScene()?.petalEmitter.setIntesity(this.bgm.getProgress(progressLevel));

    new BlinkingText(this.scene, "Memory unveiled", this.x, this.y - 128, { fontSize: 48, duration: 1500, fadeInTime: 500, flashingDuration: 750, movementY: 200 });
    // this.elevator.moveRelativeY(-(this.elevatorDistance / this.bgm.getTotalProgressLength()) * this.bgm.getProgress(progressLevel));
    this.moveRelativeY(-(this.elevatorDistance / this.bgm.getTotalProgressLength()) * this.bgm.getProgress(progressLevel));

    this.bgm.setProgress(progressLevel);

    const instrument = this.scene.registry.get('instument:gong') as Instrument | undefined;
    if (instrument) {
      const volume = 0.5 * this.bgm.getProgress(progressLevel) + 0.5;
      instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.scene, 0, volume);
    }
  }

	public moveToAbsoluteY (targetY: number, duration: number): void {
		this.scene.tweens.addCounter({
			from: this.y,
			to: targetY,
			duration,
			ease: Phaser.Math.Easing.Quadratic.InOut,
			onUpdate: (_tween, target) => {
				this.y = target.value;
				if (this.getBucketPhase() === BucketPhase.DROP) {
					this.endY = this.y;
				}
			}
		})
	}

  private moveRelativeY (relativeTargetY: number): void {
		this.scene.tweens.addCounter({
			from: this.y,
			to: this.y + relativeTargetY,
			duration: 15000,
			ease: Phaser.Math.Easing.Quadratic.InOut,
			onUpdate: (_tween, target) => {
				this.y = target.value;
				if (this.getBucketPhase() === BucketPhase.DROP) {
					this.endY = this.y;
				}
			}
		})
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

    const olderDroppable = a.birthTime > b.birthTime ? b : a;
    const spawnPosition = olderDroppable.body ? olderDroppable.body.position : { x: this.dropSensorBody.position.x, y: this.dropSensorBody.position.y };

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

    // Rank up is only available in drop phase
    if (this.currentPhase === BucketPhase.DROP) {
      const progressLevel = this.bgm.getCurrentProgressLevel(scoreObject.totalScore / this.targetScore);
      if (progressLevel > this.bucketProgress) {
        this.rankUp(progressLevel);
      }
    }

    // Trigger Wind for petals
    this.getGameScene()?.petalEmitter.triggerWind(spawnPosition.x, spawnPosition.y, scaleNumberRange(Math.min(scoreObject.scoreIncrement, 20), [0, 20], [0, 1]));

    // Spawn tilemap layer wave effect circle
    this.addEffectCircle(spawnPosition.x, spawnPosition.y, { effect: 1, toRadius: 720 })

    // Spawn score visualizer
    new BlinkingScore(this.scene, scoreObject.scoreIncrement, scoreObject.currentMultiplier, spawnPosition.x, spawnPosition.y);

    // Add particles explosion
    this.triggerExplodeParticles(droppable);

    // Increase score bar
    this.scoreProgressBar.setProgress(scoreObject.totalScore / this.targetScore);

    // Trigger Sound Effect
    this.playMergeSound(scoreObject, spawnPosition.x);

    if (this.currentPhase === BucketPhase.DESTROY) {
      this.updateElevatorPosition();
      droppable.setDestroyable();
      this.handleDestroyedPhaseProgress();
    }
  }

  public handleDestroyedPhaseProgress (): void {
    if (this.droppables.length === 0) {
      this.isGameOver = true;
      this.restartBucket();
    }
  }

  public destroyEffectCircle (circle: TilemapLayerEffectCircle): void {
    const index = this.effectCircles.findIndex(c => c === circle);
    if (index > -1) this.effectCircles.splice(index, 1);
    circle.destroy();
  }

  public addEffectCircle (x: number, y: number, options?: EffectCircleOptions): void {
    const circle = new TilemapLayerEffectCircle(this, x, y, options);
    this.effectCircles.push(circle);
  }

  private triggerSparkParticle (contactVertex: { x: number; y: number }): void {
    const emitter = this.scene.add.particles(contactVertex.x, contactVertex.y, 'flares', {
      frame: [0,1,2,3],
      lifespan: 1000,
      speed: { min: 25, max: 50 },
      scale: { start: 0.5, end: 0 },
      gravityY: 50,
      rotate: { min: 0, max: 360 },
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.explode(1);

    this.scene.time.delayedCall(5000, function() {
      emitter.destroy();
    });
  }

  private triggerExplodeParticles (droppable: Droppable): void {
    const body = droppable.body;
    if (!body) return;

    const quantity = (droppable.getTier() + 1) * 10;
    const emitter = this.scene.add.particles(droppable.getBody().position.x, droppable.getBody().position.y, 'flares', {
      frame: [4,5,6,7,8],
      lifespan: 1000,
      speed: { min: (droppable.getTier() * 10), max: (droppable.getTier() * 30) },
      scale: { start: (droppable.getTier() * 0.05) + 0.1, end: 0 },
      gravityY: 100,
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
    this.isDanger = true;
    // this.scene.cameras.main.zoomTo(1.1, 100, 'Power2');
  }

  public triggerSafe (): void {
    this.isDanger = false;
    this.dangerTime = GAME_OVER_TIME;
    // this.scene.cameras.main.zoomTo(1, 100, 'Power2');
  }

  public setPhase (phase: BucketPhase): void {
    this.currentPhase = phase;
  }

  private triggerDestroyPhase (): void {
    this.currentPhase = BucketPhase.DESTROY;
    this.totalDroppablesForDestruction = this.droppables.length;
    new BlinkingText(this.scene, 'The memory fades...', this.x, this.y, { fontSize: 48, duration: 1500, fadeInTime: 500, flashingDuration: 750, movementY: 200 });
    
    this.scene.time.delayedCall(1500, () => {
      if (this.nextDroppable) {
        this.explode(this.nextDroppable, { drum: 'drum:taiko' });
        this.nextDroppable = null;
      }

      this.scene.tweens.addCounter({
        from: 1,
        to: 0.7,
        duration: 2000,
        onUpdate: (tween => {
          this.bgm.setPlaybackRate(tween.getValue());
        })
      })
  
      this.setBucketTint(0xFF0000, 2000);
      this.scene.cameras.main.rotateTo(Phaser.Math.DegToRad(-180), undefined, 5000, Phaser.Math.Easing.Quadratic.InOut);
  
      this.droppables.forEach(d => {
        d.setDestroyable();
      });
    });
  }

  public updateElevatorPosition (): void {
    const elevatorProgress = this.droppables.length / this.totalDroppablesForDestruction;
    const targetY = ((this.endY - this.startY) * elevatorProgress) + this.startY;
    // this.elevator.moveToAbsoluteY(targetY, 1000);
    this.moveToAbsoluteY(targetY, 1000);
  }

  private setBucketTint(targetTint: number, duration: number) {
    const baseColor = Phaser.Display.Color.IntegerToColor(this.bucketImage.tintTopLeft);
    const targetColor = Phaser.Display.Color.IntegerToColor(targetTint);

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
			onUpdate: (tween) => {
        const tint = Phaser.Display.Color.HexStringToColor(chroma.mix(baseColor.rgba, targetColor.rgba, tween.getValue()).hex()).color;
        // console.log('color', chroma.mix(baseColor.rgba, targetColor.rgba, tween.getValue()).hex());
				this.bucketImage.setTint(tint);
			}
    })
  }

  private rotateNextDroppable (): void {
    if (!this.nextDroppable) return;
    this.nextDroppable.setRotation(this.nextDroppable.rotation + Phaser.Math.DegToRad(90));
  }

  public explode (droppable: Droppable, options?: { drum?: string }): void {
    if (options && options.drum && droppable.body) {
      const drum = this.scene.registry.get(options.drum) as Drum | undefined;
      if (drum) {
        const pan = (droppable.body.position.x - this.getBounds().centerX) / (this.bucketWidth / 2);
        const volume = 0.2 + (droppable.getTier() / this.options.droppableSet.droppableConfigs.length * 0.5)
        drum.playRandomNote(this.scene, pan, volume);
      }
    }

    const index = this.droppables.findIndex(d => d === droppable);
    if (index > -1) this.droppables.splice(index, 1);
    this.triggerExplodeParticles(droppable);
    droppable.destroy();
  }

  // public triggerGameOver (): void {
  //   this.isGameOver = true;
  //   this.bgm.reset();
  //   this.scoreProgressBar.setProgress(0);
  //   this.getGameScene()?.petalEmitter.setIntesity(0);
  //   this.bucketProgress = 0;
  //   new BlinkingText(this.scene, 'The memory fades...', this.x, this.y, { fontSize: 48, duration: 7000, fadeInTime: 500, flashingDuration: 750, movementY: -500 });
  //   this.elevator.backToStart(7000);
  // }


  public restartBucket (): void {
    if (this.currentPhase === BucketPhase.DESTROY) {
      this.scene.cameras.main.rotateTo(Phaser.Math.DegToRad(0), undefined, 5000, Phaser.Math.Easing.Quadratic.InOut);
      this.setBucketTint(0xFFFFFF, 2500);
    }

    this.bgm.reset();
    this.scoreProgressBar.setProgress(0);
    this.getGameScene()?.petalEmitter.setIntesity(0);
    this.bucketProgress = 0;
    this.currentPhase = BucketPhase.DROP;
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

  private syncTranslation (target: Phaser.GameObjects.Container | Phaser.GameObjects.Image, reference: MatterJS.BodyType, angle?: number, offset?: { x: number, y: number }): void {
    target.setX(reference.position.x + (offset?.x ?? 0));
    target.setY(reference.position.y + (offset?.y ?? 0));
    target.rotation = angle ?? reference.angle;
  }

  private clearAllVisibleTiles (): void {
    this.getGameScene()?.getTilemapLayers().forEach(tl => {
      tl.forEachTile(t => {
        this.getGameScene()?.revealTile(t);
        this.getGameScene()?.updateTileProgress(t, '#FFFFFF', 0, 100);
      });  
    });
  }

  private getNearestCircle (t: Phaser.Tilemaps.Tile): { distance: number; circle: TilemapLayerEffectCircle } | undefined {
    const distances = this.effectCircles.map(c => ({
      distance: c.getDistance(t.getCenterX(), t.getCenterY()),
      circle: c
    })).sort((a, b) => a.distance - b.distance);
    return distances[0];
  }

  // private getEffectCircleAffection (t: Phaser.Tilemaps.Tile): number {
  //   const distances = this.effectCircles.map(c => ({
  //     distance: c.getDistance(t.getCenterX(), t.getCenterY()),
  //     circle: c
  //   })).sort((a, b) => a.distance - b.distance);

  //   const nearest = distances[0];

  //   if (!nearest) return 0;
  //   return Math.max(scaleNumberRange(nearest.distance, [128, 0], [0, 1]) * nearest.circle.getInverseProgress(), 0) * nearest.circle.getEffect();
  // }


	public moveY (amount: number): void {
		this.y += amount;
	}

  public update (_time: number, delta: number): void {
    if (!this.bucketActive) return;
    const dangerPercentage = this.getDangerPercentage();

    // Effect circles
    if (this.effectCircles.length > 0) {
      this.getGameScene()?.getTilemapLayers().forEach(tl => {
        tl.getTilesWithinWorldXY(this.scene.cameras.main.worldView.left, this.scene.cameras.main.worldView.top, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height).forEach(t => {
          const nearest = this.getNearestCircle(t);
          if (nearest) {
            const affection = Math.max(scaleNumberRange(nearest.distance, [128, 0], [0, 1]) * nearest.circle.getInverseProgress(), 0) * nearest.circle.getEffect();
            this.getGameScene()?.updateTileProgress(t, nearest.circle.getColor(), affection, delta);
          }
        });  
      });
    }

    // Set danger visualization
    // if (!this.isGameOver) {
    //   this.targetZoom = 1 + dangerPercentage * 0.3;
    //   this.scene.cameras.main.setFollowOffset(0, dangerPercentage * 100)
    // }

    // Lock buckets x position so it doesn't slide around
    this.setX(this.options.x);

    // Reduce collision sound wait time
    if (this.collisionSoundWaitTime > 0) {
      this.collisionSoundWaitTime -= delta;
    }

    // Reduce merge sound wait time
    if (this.mergeSoundWaitTime > 0) {
      this.mergeSoundWaitTime -= delta;
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

    if (Phaser.Input.Keyboard.JustDown(this.visibleTilesInput)) {
      this.getGameScene()?.getTilemapLayers().forEach(tl => {
        tl.getTilesWithinWorldXY(this.scene.cameras.main.worldView.left, this.scene.cameras.main.worldView.top, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height).forEach(t => {
          t.rotation = Math.random() * Math.PI;
          const scaleFactor = (Math.random() - 0.5) * 16;
          t.width = scaleFactor + t.baseWidth;
          t.height = scaleFactor + t.baseHeight
          t.properties.alpha = 1;
        });  
      });
    }

    if (Phaser.Input.Keyboard.JustDown(this.rankUpInput)) {
      this.rankUp(this.bucketProgress + 1);
    }

    if (this.moveElevatorUpInput.isDown) {
      // this.elevator.moveY(-100 / delta);
      this.moveY(-100 / delta);

    }

    if (this.moveElevatorDownInput.isDown) {
      // this.elevator.moveY(100 / delta);
      this.moveY(100 / delta);
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.clearTiles)) {
      this.clearAllVisibleTiles();
    } 

    if (Phaser.Input.Keyboard.JustDown(this.chordInput)) {
      const instrument = this.scene.registry.get('instument:harp') as Instrument | undefined;
      if (instrument) {
        const chord = this.bgm.getCurrentChord();
        new BlinkingText(this.scene, chord, this.x, this.y, { fontSize: 16, movementY: 100, duration: 1000 });
        instrument.playRandomNoteInChord(chord, this.scene, 0, 1);
      }
    }

    // Remove droppables on game over
    // if (this.isGameOver && this.droppables.length > 0) {
    //   if (this.droppableRemoveTime <= 0) {

    //     if (this.nextDroppable) {
    //       this.explode(this.nextDroppable, { drum: 'drum:taiko'});
    //       this.nextDroppable = null;
    //     } else {
    //       const randomDroppable = pickRandom(this.droppables);
    //       this.effectCircles.push(new TilemapLayerEffectCircle(this, randomDroppable.x, randomDroppable.y, { effect: -1, toRadius: 720 }));
    //       this.explode(randomDroppable, { drum: 'drum:taiko' });
    //     }

    //     if (this.droppables.length > 0) {
    //       this.droppableRemoveTime = DROPPABLE_REMOVE_TIME;
    //     }
    //   } else {
    //     this.droppableRemoveTime -= delta;
    //   }
    // } else if (this.isGameOver && this.droppables.length === 0) {
    //   // Clean up finished, do something!
    //   this.restartBucket();
    // }

    // Set Score position
    this.syncTranslation(this.scoreLabel, this.dropSensorBody, this.getBody().angle, { x: -(((this.dropSensorBody.bounds.max.x - this.dropSensorBody.bounds.min.x) / 2) - 18), y: -(this.dropSensorBody.bounds.max.y - this.dropSensorBody.bounds.min.y + 18) });

    // Set bucket image position
    this.syncTranslation(this.bucketImage, this.floorBody, this.getBody().angle);

    // Set score progress position
    this.syncTranslation(this.scoreProgressBar, this.leftWallBody, this.getBody().angle);

    // Set progress circle position
    this.syncTranslation(this.progressCircle, this.floorBody, this.getBody().angle);

    // Set danger line position and appearneace
    this.dangerLine.setX(this.dangerLineBody.position.x);
    this.dangerLine.setY(this.dangerLineBody.position.y);
    this.dangerLine.rotation = this.getBody().angle;

    if (this.currentPhase === BucketPhase.DROP) {
      this.dangerLine.alpha = dangerPercentage;
      this.dangerLine.setTint(this.getDangerLineTint(dangerPercentage));
    } else {
      this.dangerLine.alpha = 0;
    }

    // Handle next droppable position change with mouse position
    if (this.currentPhase === BucketPhase.DROP && this.nextDroppable && this.nextDroppable.isTethered()) {
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
    // (this.scene as GameScene).debugText.text = `
    //   Highest: ${this.highestDroppablePoint}
    //   Lowest:  ${this.lowestDroppablePoint}
    //   Danger-Percentage: ${this.getDangerPercentage()}
    //   Next Droppable x: ${this.nextDroppable?.body?.position.x}
    //   Next Droppable y: ${this.nextDroppable?.body?.position.y}
    // `;

    if (this.currentPhase === BucketPhase.DROP && this.highestDroppablePoint > this.gameOverThreshold) {
      if (!this.isDanger) {
        this.triggerDanger();
      } else {
        this.dangerTime -= delta;
        if (this.dangerTime <= 0 && !this.isGameOver) {
          this.triggerDestroyPhase();
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