import chroma from "chroma-js";
import { flagSet } from "../../config/flags";
import { tetrominosSet } from "../../config/tetrominos";
import { getNumberInRange, randomIntFromInterval, shuffleArray, syncTranslation } from "../../functions/helper";
import { scaleNumberRange } from '../../functions/numbers';
import { BackgroundMusic, BackgroundMusicConfig } from "../../models/BackgroundMusic";
import { SFX } from "../../models/SFX";
import { Instrument } from "../../models/Instrument";
import GameScene from "../../scenes/GameScene";
import { DroppableSet, FixedMatterCollisionData, FontName } from "../../types";
import BlinkingText from "../BlinkingText";
import Droppable from "./Droppable";
import ProgressCircle from "../ProgressCircle";
import ScoreLabel, { ScorePayload } from "./ScoreLabel";
import ScoreProgressBar from "./ScoreProgressBar";
import BlinkingScore from "../BlinkingScore";
import { japanFoodSet } from "../../config/japanFood";
import { CATEGORY_BUCKET, CATEGORY_DROPPABLES, CATEGORY_TERRAIN } from "../../const/collisions";
import { BGMConfigs } from "../../const/bgm";
import { Depths } from "../../const/depths";
import BucketMenu from "./BucketMenu";
import { Action } from "../../models/Input";
import { duckSet } from "../../config/ducks";
import { DropBucketShockwave } from "../../models/DropBucketShockwave";
import BaseScene from "../../scenes/BaseScene";
import HUDScene from "../../scenes/HUDScene";
import { easterEggSet } from "../../config/easterEggs";

export const GAME_OVER_TIME = 3000;
export const DANGER_SPARK_TIME = 100;
export const DROPPABLE_REMOVE_TIME = 500;
export const DROPPABLE_EXTRA_PADDING = 1;
export const DANGER_VISUALIZATION_START = 0.8;
export const COLLISION_SOUND_WAIT_TIME = 80;
export const MERGE_SOUND_WAIT_TIME = 80;
export const SCORE_BAR_WIDTH = 24;
export const NEXT_DROPPABLE_TIME = 1000;
const DROPPABLE_MOVE_ACCELERATION = 3;

export type DropBucketOptions = {
  scene: GameScene;
  x: number;
  y: number;
  name: string;
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
  bgmKey: string;
  elevatorDistance?: number;
}

export enum BucketPhase {
  DROP = 'drop',
  DESTROY = 'destroy'
}

/**
 * Drop Bucket in a classic suikagame style
 */
export default class DropBucket extends Phaser.Physics.Matter.Image {
  private options: DropBucketOptions;
	private endY: number;
  private endDroppablesLength = 0;
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
  public bgmKey: string;
  public droppables: Droppable[] = [];
  public droppableSet: DroppableSet;
  // public effectCircles: TilemapLayerEffectCircle[] = [];
  public dangerLine: Phaser.GameObjects.Sprite;
  public scoreLabel: ScoreLabel;
  public bucketMenu: BucketMenu;
  public scoreProgressBar: ScoreProgressBar;
  public progressCircle: ProgressCircle;
  public lastTierDestroy: boolean;
  public maxTierToDrop: number | 'auto';
  private mergeDisabled: boolean;
  // private targetZoom = 1;
  // private baseZoom = 1;
  private bucketMounted = false;
  private bucketActive = false;
  private bgmDataLoading = false;
  private collisionSoundWaitTime = 0;
  private mergeSoundWaitTime = 0;
  private nextDroppableTime = 100;
  private targetScore: number;
  private bucketImage: Phaser.GameObjects.Image;
  private bucketProgressRatio = 0;
  private shockwaveController = new DropBucketShockwave(this.scene);
  private shockSound = (this.scene as BaseScene).soundManager?.sound.add('sfx:shock');
  private droppableMoveSpeed = 0;

  public bgm: BackgroundMusic | null = null;
  private elevatorDistance: number;

  public highestDroppablePoint = this.scene.game.canvas.height;
  public lowestDroppablePoint = 0;
  // private totalDroppablesForDestruction = 0;

  public gameOverThreshold = 0;
  public isDanger = false;
  public dangerTime = GAME_OVER_TIME;
  public isGameOver = false;
  private dangerSparkTime = 0;

  // private droppableRemoveTime = DROPPABLE_REMOVE_TIME;

  public constructor(options: DropBucketOptions) {
    super(options.scene.matter.world, options.x, options.y, '');
    this.options = options;
    this.name = options.name;
    this.gameOverThreshold = options.gameOverThreshold;
    this.lastTierDestroy = options.lastTierDestroy ?? false;
    this.maxTierToDrop = options.maxTierToDrop ?? 'auto';
    this.mergeDisabled = options.disableMerge ?? false;
    this.targetScore = options.targetScore;
    this.elevatorDistance = options.elevatorDistance ?? 0;
    this.visible = false;
    this.bgmKey = options.bgmKey;

    this.bucketWidth = options.width;
    this.bucketHeight = options.height;
    this.bucketThickness = options.thickness;
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(options.scene).bodies;
    const Body = new Phaser.Physics.Matter.MatterPhysics(options.scene).body;

    // Create Score Label
		this.scoreLabel = new ScoreLabel(this.scene, 0, 0);
    this.scoreLabel.visible = true;
    this.setDepth(Depths.OBJECT_LAYER);

    // Create Bucket Menu
    this.bucketMenu = new BucketMenu(this, 0, 0);

    const collisionFilter = {
      group: 0,
      category: CATEGORY_BUCKET,
      mask: CATEGORY_TERRAIN | CATEGORY_DROPPABLES
    }

    // Create collision boxes
    this.leftWallBody = Bodies.rectangle((-options.width / 2) - (options.thickness / 2), 0, options.thickness, options.height, { collisionFilter });
    this.rightWallBody = Bodies.rectangle((options.width / 2) + (options.thickness / 2), 0, options.thickness, options.height, { collisionFilter });
    this.floorBody = Bodies.rectangle(0, (options.height / 2) + (options.thickness / 2), options.width + (options.thickness * 2), options.thickness, { isSensor: options.noBottom, collisionFilter });
    this.dropSensorBody = Bodies.rectangle(0, (-options.height / 2) - options.thickness, options.width, 50, { mass: 0, isSensor: true });
    this.dangerLineBody = Bodies.rectangle(0, this.leftWallBody.bounds.max.y - options.gameOverThreshold, options.width, 10, { isSensor: true, label: 'dangerLine' });

    const parts = [this.leftWallBody, this.rightWallBody, this.floorBody, this.dropSensorBody, this.dangerLineBody];

    const compoundBody = Body.create({ parts, isStatic: true, collisionFilter });

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
        this.drop();
      }
    });

    // Assign set
    this.droppableSet = JSON.parse(JSON.stringify(options.droppableSet)) as DroppableSet;
    if (this.droppableSet.randomizeOrder) {
      shuffleArray(this.droppableSet.droppableConfigs);
    }

    // Assign collision handler
    this.scene.matter.world.on('collisionstart', this.onCollisionStart, this);
    this.scene.matter.world.on('collisionactive', this.onCollisionActive, this);

    // Create progress circle
		this.progressCircle = new ProgressCircle(this.scene, this, 0, 0, this.floorBody.bounds.max.x - this.floorBody.bounds.min.x);
    this.progressCircle.visible = true;

    this.bucketImage.setDepth(0);
    this.scoreProgressBar.setDepth(1);
    this.scoreProgressBar.alpha = 0;
    this.progressCircle.setDepth(1);
    this.progressCircle.alpha = 0;
    this.dangerLine.setDepth(1);
    this.dangerLine.alpha = 0;
    this.scoreLabel.setDepth(2);
    this.scoreLabel.alpha = 0;
  }

  public isActive (): boolean {
    return this.bucketActive;
  }

  public isMounted (): boolean {
    return this.bucketMounted;
  }

  private onCollisionActive (event: Phaser.Physics.Matter.Events.CollisionActiveEvent): void {
    if (!this.bucketActive) return;
    event.pairs.forEach(c => { this.handleCollision(c, c.bodyA, c.bodyB) });
  }

  private onCollisionStart (event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
    if (!this.bucketActive) return;
    this.handleCollision(event.pairs[0], bodyA, bodyB);
  }
  
	private handleCollision (collisionData: Phaser.Types.Physics.Matter.MatterCollisionData, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		if (!this.isMounted() || !this.isActive()) return;
    if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
			const parentBucket = bodyB.gameObject.getParentBucket();
			parentBucket.tryMergeDroppables(bodyA.gameObject, bodyB.gameObject);
		}

		if (bodyA.gameObject instanceof Droppable || bodyB.gameObject instanceof Droppable) {
			// const droppable = bodyA.gameObject instanceof Droppable ? bodyA : bodyB;
			// const parentBucket = droppable.getParentBucket();
			const droppable = Droppable.getFirstDroppableFromBodies(bodyA, bodyB);
			if (!droppable) return;
			const parentBucket = droppable.getParentBucket();

			const v1 = new Phaser.Math.Vector2(bodyB.velocity).length();
			const v2 = new Phaser.Math.Vector2(bodyA.velocity).length();
			if ((!bodyA.isSensor && !bodyB.isSensor) && (v1 > 2 || v2 > 2)) {

				// Get contact point. Typings of MatterJS are broken.
				const contactVertex = (collisionData as FixedMatterCollisionData).contacts.filter(c => c !== undefined)[0].vertex;
				const maxV = Math.max(v1, v2);
				parentBucket.playCollisionSound(droppable, maxV, contactVertex);
			}
		}

    // if (this.isDanger && (bodyA.label === 'dangerLine' || bodyB.label === 'dangerLine') && (bodyA.gameObject instanceof Droppable || bodyB.gameObject instanceof Droppable)) {
    //   console.log('dangerEvent', (collisionData as FixedMatterCollisionData).contacts);
    //   (collisionData as FixedMatterCollisionData).contacts.forEach(c => {
    //     if (c.vertex.body.label !== 'dangerLine') this.triggerDangerParticle(c.vertex);
    //   });
    // }
	}

  public setBucketAssetVisibility (makeVisible: boolean): void {
    this.scene.tweens.addCounter({
      from: makeVisible ? 0 : 1,
      to: makeVisible ? 1 : 0,
      duration: 750,
      onUpdate: ((tween) => {
        this.scoreProgressBar.alpha = tween.getValue();
        this.progressCircle.alpha = tween.getValue();
        this.dangerLine.alpha = tween.getValue();
        this.scoreLabel.alpha = tween.getValue();
        this.bucketMenu.alpha = tween.getValue();
        if (this.nextDroppable) this.nextDroppable.alpha = tween.getValue();
      })
    })

  }

  public getGameScene (): GameScene {
    return this.scene as GameScene;
  }

  public getBucketPhase (): BucketPhase {
    return this.currentPhase;
  }

  public unmountBucket (): void {
    if (this.bgmDataLoading || !this.bucketMounted) return;
    this.resetEffects();
    this.moveToAbsoluteY(this.startY, 1000);
    this.bgm?.fadeOutAndStop(2000);
    this.bucketActive = false;
    this.setBucketAssetVisibility(false);

    // Unfreeze inputs of player character
    this.getGameScene()?.getPlayerCharacter()?.setFreezeInputs(false);

    if (this.nextDroppable) {
      this.explode(this.nextDroppable);
      this.nextDroppable = null;
    }

    this.droppables.slice(0).forEach(d => {
      this.explode(d);
    });

    const sfx = this.scene.registry.get('sfx:bucket') as SFX | undefined;
    if (sfx) sfx.playRandomSFXFromCategory(this.getScene(), 'in');

    const hide = this.bucketImage.postFX.addReveal(undefined, 0, 1);
    hide.progress = 1;
    this.scene.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 2000,
      ease: Phaser.Math.Easing.Quadratic.In,
      onUpdate: (tween => {
        hide.progress = tween.getValue();
      }),
      onComplete: (() => {
        this.bucketMounted = false;
        this.bucketImage.setVisible(false);
        this.bucketImage.clearFX();
      })
    })

    // Reset Camera Distortion for Minigames
    this.getGameScene()?.setChromaticEffect(1, 1000);

    const hudScene = this.scene.scene.get('hud-scene') as HUDScene | undefined;
    if (hudScene) hudScene.addBlinkingText('Memory Chamber disconncted', {x: this.scene.game.canvas.width / 2, y: this.scene.game.canvas.height / 2}, { fontFamily: FontName.LIGHT, fadeInTime: 250, movementY: 100, fontSize: this.getScene().scaled(64), duration: 1000 });

    // new BlinkingText(this.scene, 'Memory Chamber disconncted', this.x, this.y, { fadeInTime: 250, movementY: 100, fontSize: 24, duration: 1000 });
    this.getGameScene()?.bucketUnmountFinished(this);
  }

  public async mountBucket (): Promise<void> {
    const bgmConfig = this.getBGMConfig();

    if (this.bgmDataLoading || this.bucketMounted || !bgmConfig) return;
    this.bucketMounted = true;

    // Map camera to the bucket
    this.getGameScene()?.cameraFollowEntity({ object: this, offsetY: 50 });

    this.bucketImage.setVisible(true);
    const reveal = this.bucketImage.postFX.addReveal(undefined, 0, 1);

    // Init bgm
    if (!this.bgm) {
      this.bgm = new BackgroundMusic(this.getScene(), bgmConfig);
    }
    
    // Remove Camera Distortion for Minigames
    this.getGameScene()?.setChromaticEffect(0, 1000);

    // Start Music
    this.bgm.play();

    // Reset bucket completely
    this.restartBucket();

    const sfx = this.scene.registry.get('sfx:bucket') as SFX | undefined;
    if (sfx) sfx.playRandomSFXFromCategory(this.getScene(), 'out');

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      onUpdate: (tween => {
        reveal.progress = tween.getValue();
      })
    });

    const hudScene = this.scene.scene.get('hud-scene') as HUDScene | undefined;
    if (hudScene) hudScene.addBlinkingText('Memory Chamber ready', {x: this.scene.game.canvas.width / 2, y: this.scene.game.canvas.height / 2}, { fontFamily: FontName.LIGHT, fadeInTime: 250, movementY: 100, fontSize: this.getScene().scaled(64), duration: 2000 });

    // Make bucket playable
    this.bucketActive = true;

    // Make all bucket assets visible
    this.setBucketAssetVisibility(true);
  
    // Move bucket back to start
    this.y = this.startY;
  }

  public getDroppableSet (): DroppableSet {
    return this.droppableSet ?? flagSet;
  }

  // Trigger drop of next droppable
  public drop (): void {
    if (this.nextDroppable) {
      this.nextDroppable.untether();
      this.nextDroppableTime = NEXT_DROPPABLE_TIME;
    }
  }

  // Triggered by droppables once untethered
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
    if (this.nextDroppable || !this.droppableSet || !this.isActive() || !this.isMounted()) return;

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

    this.fadeInDroppable(droppable);

    // const droppable = new Droppable(this.scene, randomIndex, true, this, this.dropSensor.position.x, this.dropSensor.position.y, 'flags');
    this.nextDroppable = droppable;
  }

  private fadeInDroppable (droppable: Droppable, duration = 500): void {
    droppable.alpha = 0;
    const bokehFX = droppable.postFX.addBokeh(0, 0, 0);

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
      onUpdate: (tween) => {
        droppable.alpha = tween.getValue();
        bokehFX.radius = (1 - tween.getValue()) * 2;
      },
      onComplete: () => {
        if (droppable && droppable.postFX) droppable.postFX.remove(bokehFX);
        bokehFX.destroy();
      }
    });
  }

  public getMaxTier (): number {
    return this.getDroppableSet().droppableConfigs.length - 1;
  }

  public playMergeSound (score: ScorePayload, x: number): void {
    if (!this.bgm) return;

    if (this.mergeSoundWaitTime <= 0) {
      const instrument = this.scene.registry.get('instrument:merge') as Instrument | undefined;
      if (instrument) {
        const pan = (x - this.getBounds().centerX) / (this.bucketWidth / 2);
        const volume = scaleNumberRange(Math.min(score.scoreIncrement, 20), [0, 20], [0.5, 1]);
        instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.getScene(), pan, volume);
      }
      this.mergeSoundWaitTime = MERGE_SOUND_WAIT_TIME;
    }
  }

  public playCollisionSound (source: Droppable, force: number, contactVertex?: { x: number; y: number }): void {
    if (!this.bgm) return;

    if (!source.body || this.collisionSoundWaitTime > 0) return;
    const instrument = this.scene.registry.get('instrument:harp') as Instrument | undefined;
    if (!instrument) return;
    const pan = Phaser.Math.Clamp((source.body.position.x - this.getBounds().centerX) / (this.bucketWidth / 2), -1, 1);
    const volume = scaleNumberRange(Math.min(force, 17), [0, 20], [0, 1]);
    instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.getScene(), pan, volume);
    this.collisionSoundWaitTime = COLLISION_SOUND_WAIT_TIME;
    if (contactVertex) this.triggerSparkParticle(contactVertex);
  }

  public rankUp (): void {
    if (!this.bgm) return;

    this.getGameScene()?.petalEmitter.setIntesity(this.bucketProgressRatio);

    new BlinkingText(this.scene, "Memory fragment added", this.x, this.y - 128, { fontSize: 36, duration: 1500, fadeInTime: 500, flashingDuration: 750, movementY: 200 });
    // this.elevator.moveRelativeY(-(this.elevatorDistance / this.bgm.getTotalProgressLength()) * this.bgm.getProgress(progressLevel));
    this.moveToAbsoluteY(this.startY - (this.elevatorDistance * this.bucketProgressRatio));

    const instrument = this.scene.registry.get('instrument:gong') as Instrument | undefined;
    if (instrument) {
      const volume = 0.5 * this.bucketProgressRatio + 0.5;
      instrument.playRandomNoteInChord(this.bgm.getCurrentChord(), this.getScene(), 0, volume);
    }
  }

	public moveToAbsoluteY (targetY: number, duration = 15000): void {
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

  public getBGMConfig (): BackgroundMusicConfig | undefined {
    return BGMConfigs.find(c => c.key === this.bgmKey);
  }

  public getScene (): BaseScene {
    return this.scene as BaseScene;
  }

  // private moveRelativeY (relativeTargetY: number, duration = 15000): void {
	// 	this.scene.tweens.addCounter({
	// 		from: this.y,
	// 		to: this.y + relativeTargetY,
	// 		duration,
	// 		ease: Phaser.Math.Easing.Quadratic.InOut,
	// 		onUpdate: (_tween, target) => {
	// 			this.y = target.value;
	// 			if (this.getBucketPhase() === BucketPhase.DROP) {
	// 				this.endY = this.y;
	// 			}
	// 		}
	// 	})
	// }

  public tryMergeDroppables (a: Droppable, b: Droppable): void {
    // Early out
    if (this.mergeDisabled || !this.bgm || this.isGameOver || a.getTier() !== b.getTier()) return;

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

    // Camera Shake
    this.scene.cameras.main.shake(100, 0.005);

    // Add shockwave!
    this.shockwaveController.triggerOnMainCamera(spawnPosition, nextTier / this.getMaxTier());

    // Spawn new body, one tier higher!
    const droppable = Droppable.create({
      bucket: this,
      scene: this.scene,
      tethered: false,
      tierIndex: nextTier,
      x: spawnPosition.x,
      y: spawnPosition.y
    });

    // Assign the new Droppable a random angle, fun!
    droppable.setRotation(Phaser.Math.Angle.Random());

    this.droppables.push(droppable);

    // const droppable = new Droppable(this, tier + 1, false, parentBucket, spawnPosition.x, spawnPosition.y, 'flags');
    droppable.hasCollided = true;

    this.fadeInDroppable(droppable);

    // Do Score calculation
    const scoreObject = this.scoreLabel.grantScore(nextTier);

    // Rank up is only available in drop phase
    if (this.currentPhase === BucketPhase.DROP) {
      const scoreRatio = scoreObject.totalScore / this.targetScore;

      this.bucketProgressRatio = scoreRatio;
      const bgmLevelResult = this.bgm.setProgress(this.bucketProgressRatio);

      if (bgmLevelResult.rankUp) {
        this.rankUp();
      }
    }

    // Trigger Wind for petals
    this.getGameScene()?.petalEmitter.triggerWind(spawnPosition.x, spawnPosition.y, scaleNumberRange(Math.min(scoreObject.scoreIncrement, 20), [0, 20], [0, 1]));

    // Spawn tilemap layer wave effect circle
    // this.getGameScene()?.addEffectCircle(spawnPosition.x, spawnPosition.y, { effect: 1, toRadius: 720 })

    // Spawn score visualizer
    new BlinkingScore(this.scene, scoreObject.scoreIncrement, scoreObject.currentMultiplier, spawnPosition.x, spawnPosition.y);

    // Add particles explosion
    this.triggerExplodeParticles(droppable);

    // Increase score bar
    this.scoreProgressBar.setProgress(scoreObject.totalScore / this.targetScore);

    // Trigger Sound Effect
    this.playMergeSound(scoreObject, spawnPosition.x);

    if (this.currentPhase === BucketPhase.DESTROY) {
      // this.updateElevatorPosition();
      droppable.setDestroyable();
      // this.handleDestroyedPhaseProgress();
    }
  }

  public handleDestroyedPhaseProgress (): void {
    if (this.droppables.length === 0) {
      this.isGameOver = true;
      this.resetEffects();
      this.getGameScene()?.triggerGameOver(this.scoreLabel.getRoundedScore());
    }
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

    this.scene.time.delayedCall(5000, () => {
      emitter.destroy();
    });
  }

  private triggerDangerParticle (contactVertex: { x: number; y: number }): void {
    const emitter = this.scene.add.particles(contactVertex.x, contactVertex.y, 'flares', {
      frame: [9],
      lifespan: 500,
      speed: { min: 50, max: 75 },
      scale: { start: 0.3, end: 0 },
      gravityY: 0,
      rotate: { min: 0, max: 360 },
      emitting: false,
    });
    emitter.explode(1);

    this.scene.time.delayedCall(200, () => {
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
    this.shockSound?.play();
    this.dangerSparkTime = 0;
    // this.scene.cameras.main.zoomTo(1.1, 100, 'Power2');
  }

  public triggerSafe (): void {
    this.isDanger = false;
    this.dangerTime = GAME_OVER_TIME;
    this.dangerSparkTime = 0;
    this.shockSound?.stop();
    // this.scene.cameras.main.zoomTo(1, 100, 'Power2');
  }

  public setPhase (phase: BucketPhase): void {
    this.currentPhase = phase;
  }

  private triggerDestroyPhase (): void {
    if (!this.bgm) return;

    this.shockSound?.stop();
    this.isDanger = false;
    const bgm = this.bgm;
    this.endDroppablesLength = this.droppables.length;
    this.currentPhase = BucketPhase.DESTROY;
    // this.totalDroppablesForDestruction = this.droppables.length;
    new BlinkingText(this.getScene(), 'The memory\nfades...', this.x, this.y, { fontSize: 42, duration: 1500, fadeInTime: 500, flashingDuration: 750, movementY: 200 });
    
    this.getGameScene()?.getPlayerCharacter()?.sfxBank?.playRandomSFXFromCategory(this.getScene(), 'annoyed');

    if (this.nextDroppable) {
      this.explode(this.nextDroppable, { drum: 'drum:taiko' });
      this.nextDroppable = null;
    }

    const touchy = this.scene.registry.get('instrument:touchy') as Instrument | undefined;
    if (touchy) touchy.playRandomNote(this.getScene(), 0, 1);

    this.scene.time.delayedCall(1500, () => {
      this.scene.tweens.addCounter({
        from: 1,
        to: 0.7,
        duration: 2000,
        onUpdate: (tween => {
          bgm.setPlaybackRate(tween.getValue());
        })
      })
  
      this.setBucketTint(0xFF0000, 2000);
      this.getGameScene()?.petalEmitter.setTint(0xFF0000);
      this.scene.cameras.main.rotateTo(Phaser.Math.DegToRad(-180), undefined, 5000, Phaser.Math.Easing.Quadratic.InOut);

      this.scene.time.delayedCall(1500, () => {
        new BlinkingText(this.getScene(), '...but I am still\nin control', this.x, this.y, { fontSize: 42, duration: 1500, fadeInTime: 250, flashingDuration: 750, movementY: 100, rotation: Phaser.Math.DegToRad(-180)});
        if (touchy) touchy.playRandomNote(this.getScene(), 0, 1);
      });
  
      this.droppables.forEach(d => {
        d.setDestroyable();
      });
    });
  }

  public updateElevatorPosition (): void {
    const maxRelativeMovementPerDrop = (this.endY - this.startY) / (this.endDroppablesLength || 1);
    // const elevatorProgress = this.droppables.length / this.totalDroppablesForDestruction;
    // const targetY = ((this.endY - this.startY) * elevatorProgress) + this.startY;
    this.moveToAbsoluteY(this.y - Math.min(maxRelativeMovementPerDrop, 50), 2000);
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
				this.bucketImage.setTint(tint);
			}
    })
  }

  public rotateNextDroppable (direction: 1 | -1): void {
    if (!this.nextDroppable) return;
    this.nextDroppable.setRotation(this.nextDroppable.rotation + Phaser.Math.DegToRad(45 * direction));
  }

  public explode (droppable: Droppable, options?: { drum?: string }): void {
    if (options && options.drum && droppable.body) {
      const drum = this.scene.registry.get(options.drum) as SFX | undefined;
      if (drum) {
        const pan = (droppable.body.position.x - this.getBounds().centerX) / (this.bucketWidth / 2);
        const volume = 0.2 + (droppable.getTier() / this.options.droppableSet.droppableConfigs.length * 0.5)
        drum.playRandomNote(this.getScene(), pan, volume);
      }
    }

    const index = this.droppables.findIndex(d => d === droppable);
    if (index > -1) this.droppables.splice(index, 1);
    this.triggerExplodeParticles(droppable);
    droppable.destroy();
  }

  private resetEffects (): void {
    if (this.currentPhase === BucketPhase.DESTROY) {
      this.scene.cameras.main.rotateTo(Phaser.Math.DegToRad(0), undefined, 5000, Phaser.Math.Easing.Quadratic.InOut);
      this.setBucketTint(0xFFFFFF, 2500);
      this.bgm?.setPlaybackRate(1);
    }
  }

  public restartBucket (): void {
    this.getGameScene()?.getPlayerCharacter()?.sfxBank?.playRandomSFXFromCategory(this.getScene(), 'restart');

    this.resetEffects();
    this.bgm?.reset();
    this.scoreProgressBar.setProgress(0);
    this.getGameScene()?.petalEmitter.setIntesity(0);
    this.getGameScene()?.petalEmitter.resetTint();
    this.bucketProgressRatio = 0;
    this.endDroppablesLength = 0;
    this.currentPhase = BucketPhase.DROP;
    if (this.nextDroppable) {
      this.explode(this.nextDroppable);
      this.nextDroppable = null;
    }
    [...this.droppables].forEach(d => { this.explode(d); });
    this.droppables = [];
    this.nextDroppableTime = 100;
    this.scoreLabel.restart();
    this.isGameOver = false;
    this.moveToAbsoluteY(this.startY, 500);

    // Wait a tick before initializing first bucket. Otherwise, drop action might be still "justDown"
    this.scene.time.delayedCall(50, () => {
      // Init first drop
      console.log('waited 50ms to init droppable', this.getGameScene()?.inputController?.justDown(Action.DROP_PIECE));
      // this.initNextDroppable();
    })
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

  // public clearAllVisibleTiles (): void {
  //   this.getGameScene()?.getReveilableTilemapLayers().forEach(tl => {
  //     tl.forEachTile(t => {
  //       this.getGameScene()?.revealTile(t);
  //       this.getGameScene()?.updateTileProgress(t, '#FFFFFF', 0, 100);
  //     });  
  //   });
  // }

  // private getNearestCircle (t: Phaser.Tilemaps.Tile): { distance: number; circle: TilemapLayerEffectCircle } | undefined {
  //   const distances = this.effectCircles.map(c => ({
  //     distance: c.getDistance(t.getCenterX(), t.getCenterY()),
  //     circle: c
  //   })).sort((a, b) => a.distance - b.distance);
  //   return distances[0];
  // }

	public moveY (amount: number): void {
		this.y += amount;
	}

  protected handleInputs (delta: number): void {
    if (!this.isMounted() || !this.isActive()) return;

    const movementVector = this.getGameScene()?.inputController?.getMovementVector();
    if (movementVector) {
      if (movementVector.x !== 0 && this.nextDroppable) {
        if (this.droppableMoveSpeed !== 0 && Math.sign(movementVector.x) !== Math.sign(this.droppableMoveSpeed)) this.droppableMoveSpeed = 0;
        this.droppableMoveSpeed += DROPPABLE_MOVE_ACCELERATION  * movementVector.x / delta;
        this.nextDroppable.x += this.droppableMoveSpeed;
      } else {
        this.droppableMoveSpeed = 0;
      }
    }


    if (this.getGameScene()?.inputController?.justDown(Action.ROTATE_PIECE_CW)) {
      this.rotateNextDroppable(1);
    } else if (this.getGameScene()?.inputController?.justDown(Action.ROTATE_PIECE_CCW)) {
      this.rotateNextDroppable(-1);
    } else if (this.getGameScene()?.inputController?.justDown(Action.DROP_PIECE)) {
      this.drop();
    }
  }

  public destroy (): void {
    if (this.scene) {
      this.scene.matter.world.off('collisionstart', this.onCollisionStart, this);
      this.scene.matter.world.off('collisionactive', this.onCollisionActive, this);
    }
    if (this.dropSensorBody) this.scene.matter.world.remove(this.dropSensorBody);
    if (this.leftWallBody) this.scene.matter.world.remove(this.leftWallBody);
    if (this.rightWallBody) this.scene.matter.world.remove(this.rightWallBody);
    if (this.floorBody) this.scene.matter.world.remove(this.floorBody);
    if (this.dangerLineBody) this.scene.matter.world.remove(this.dangerLineBody);
    if (this.dangerLine) this.dangerLine.destroy();
    this.scoreLabel.destroy();
    this.bucketMenu.destroy();
    this.scoreProgressBar.destroy();
    this.progressCircle.destroy();
    this.bucketImage.destroy();
    super.destroy();
  }

  public update (_time: number, delta: number): void {
    if (!this.bucketMounted) return;
    const dangerPercentage = this.getDangerPercentage();

    // Reduce next droppable timer
    if (this.currentPhase === BucketPhase.DROP) {
      if (this.nextDroppableTime > 0) {
        this.nextDroppableTime -= delta;
      } else {
        if (!this.nextDroppable) {
          this.initNextDroppable();
        }
      }
    }

    // Handle Inputs
    this.handleInputs(delta);


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
    // if (Math.abs((this.targetZoom - this.scene.cameras.main.zoom)) > 0.001) {
    //   const currentZoom = this.scene.cameras.main.zoom;
    //   const increment = ((this.targetZoom - currentZoom) / 500 * delta);
    //   this.scene.cameras.main.setZoom(this.getGameScene().scaled(currentZoom + increment));
    // } else {
    //   this.scene.cameras.main.setZoom(this.getGameScene().scaled(this.targetZoom));
    // }

    // Set Score position
    syncTranslation(this.scoreLabel, this.dropSensorBody, this.getBody().angle, { x: (((this.dropSensorBody.bounds.max.x - this.dropSensorBody.bounds.min.x) / 2) + this.bucketThickness + 32), y: -(this.dropSensorBody.bounds.max.y - this.dropSensorBody.bounds.min.y) / 2 });

    // Set Bucket Menu position
    syncTranslation(this.bucketMenu, this.dropSensorBody, this.getBody().angle, { x: (((this.dropSensorBody.bounds.max.x - this.dropSensorBody.bounds.min.x) / 2) + this.bucketThickness + 32), y: 100 -(this.dropSensorBody.bounds.max.y - this.dropSensorBody.bounds.min.y) / 2 });
    
    // Set bucket image position
    syncTranslation(this.bucketImage, this.floorBody, this.getBody().angle);

    // Set score progress position
    syncTranslation(this.scoreProgressBar, this.leftWallBody, this.getBody().angle);

    // Set progress circle position
    syncTranslation(this.progressCircle, this.floorBody, this.getBody().angle);

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

    if (this.bucketActive) {
      // Handle next droppable position change with mouse position
      if (this.currentPhase === BucketPhase.DROP && this.nextDroppable && this.nextDroppable.isTethered()) {
        const mousePointer = this.scene.cameras.main.getWorldPoint(this.scene.input.mousePointer?.x, this.scene.input.mousePointer?.y);
        const rect = this.getBodyBounds();

        if (rect && Phaser.Geom.Rectangle.Contains(rect, mousePointer.x, mousePointer.y)) {
          // Apply position via mouse inputs IF the mouse is within the bucket
          this.nextDroppable.setX(getNumberInRange(this.dropSensorBody.bounds.min.x + DROPPABLE_EXTRA_PADDING + ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2), this.dropSensorBody.bounds.max.x - DROPPABLE_EXTRA_PADDING - ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2) , mousePointer.x));
          // this.nextDeroppable.setY(getNumberInRange(this.dropSensorBody.bounds.min.y, this.dropSensorBody.bounds.max.y, mousePointer.y));
        } else {
          // Apply position limites via controller inputs
          this.nextDroppable.setX(getNumberInRange(this.dropSensorBody.bounds.min.x + DROPPABLE_EXTRA_PADDING + ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2), this.dropSensorBody.bounds.max.x - DROPPABLE_EXTRA_PADDING - ((this.nextDroppable.getBodyBounds()?.width ?? 0) / 2) , this.nextDroppable.x));
        }
        this.nextDroppable.setY(this.dropSensorBody.position.y);
        this.nextDroppable.setVelocity(0, 0);
      }

      this.calculateHighestAndLowestPoint();

      if (this.currentPhase === BucketPhase.DROP && this.highestDroppablePoint > this.gameOverThreshold) {
        if (!this.isDanger) {
          this.triggerDanger();
        } else {
          this.dangerTime -= delta;
          this.dangerSparkTime -= delta;
          if (this.dangerTime <= 0 && !this.isGameOver) {
            this.triggerDestroyPhase();
          }
        }
      } else if (this.highestDroppablePoint <= this.gameOverThreshold && this.isDanger) {
        this.triggerSafe();
      }

      if (this.currentPhase === BucketPhase.DROP && this.isDanger && this.dangerSparkTime <= 0) {
        this.dangerSparkTime = DANGER_SPARK_TIME;
        const startX = this.dangerLine.getBounds().left;
        const endX = this.dangerLine.getBounds().right;
        const iterations = 40;
        const y = this.dangerLine.getCenter().y ?? 0;
        const length = endX - startX;
        const iterationLength = length / iterations;

        const matter = new Phaser.Physics.Matter.MatterPhysics(this.scene);
        const hits: number[] = [];
        for (let x = startX; x <= endX; x += iterationLength) {
          const r = matter.query.point(this.droppables.map(d => d.getBody()), { x, y });
          if (r.length > 0) {
            hits.push(x);
          }
        }

        hits.forEach(x => {
          this.triggerDangerParticle({ x, y })
        });
      }
    }
  }

  public static getDroppableSetfromName (setName: string): DroppableSet {
    switch(setName) {
      case 'flagSet': return flagSet;
      case 'tetrominos': return tetrominosSet;
      case 'japanFoodSet': return japanFoodSet;
      case 'duckSet': return duckSet;
      case 'easterEggSet': return easterEggSet;
      default: return flagSet;
    }
  }
}