import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { StepSoundBehaviour } from "../behaviour/StepSoundBehaviour";
import { getOtherGameObjectsFromCollisionPairs } from "../functions/helper";
import { Action } from "../models/Input";
import { SFX } from "../models/SFX";
import GameScene from "../scenes/GameScene";
import HUDScene from "../scenes/HUDScene";
import GameObject from "./GameObject";

const JUMP_PRESS_TIME = 150;
const ON_GROUND_THRESHOLD = 150;

export type CharacterStates = 'idle' | 'run' | 'stop' | 'turn' | 'lookup' | 'lookdown' | 'lookup' | 'jump' | 'fall'

export default class Character extends GameObject {
  protected movementBehaviour?: MovementBehaviour;
  protected stepSoundBehaviour?: StepSoundBehaviour;
  protected playerControlled = false;
  protected freezeInputs = false;
  public lastState: CharacterStates = 'idle';
  public currentState: CharacterStates = 'idle';
  public onGround = false;
  public wasOnGround = false;
  public justLanded = false;
  public justJumped = false;
  public justSlided = false;
  public maxJumpStrength = 15;
  public airControl = 0.1;
  public longPressJumpTime = 0;
  public onGroundThresholdTime = 0;
  public objectsInReach: GameObject[] = [];
  public sfxBank: SFX | undefined;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    sprite: string,
    sfxKey: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, sprite, undefined, options);
    this.setBounce(0);
    this.setFriction(0);
    this.setPosition(x, y);
    this.setFixedRotation();
    this.sfxBank = this.scene.registry.get(sfxKey) as SFX | undefined;

    this.scene.matter.world.on('beforeupdate', () => {
      this.wasOnGround = this.onGround;
      this.onGround = false;
    });

    this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          this.objectsInReach.push(...gameObjects)
          gameObjects[0].onCollisionStart(this);
        }
      }
    });

    this.scene.matter.world.on('collisionend', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          gameObjects[0].onCollisionEnd(this);

          gameObjects.forEach(o => {
            const index = this.objectsInReach.findIndex(r => r === o)
            this.objectsInReach.splice(index, 1);
          });
        }
      }
    });

    this.scene.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // bodyA will always be terrain becuase that's added first in the GameScene
      // const collisions = event.pairs.filter(pair => pair.bodyA.gameObject === this || pair.bodyB.gameObject === this);
      const terrainCollisions = event.pairs.filter(pair => pair.bodyA.label === 'terrain' && pair.bodyB.gameObject === this);
      this.groundCheck(terrainCollisions);

      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          gameObjects[0].setHighlighted(true);
        }
      }
    });

    // Add to scene render list
    scene.add.existing(this);
  }

  public isPlayerControlled (): boolean {
    return this.playerControlled;
  }

  public setPlayerControlled (value: boolean) {
    this.playerControlled = value;
  }

  public setFreezeInputs (value: boolean): void {
    this.freezeInputs = value;
  }

  private getDeaccelerationMultiplier (): number {
    return this.onGround ? 1 : 0;
  }

  private getAccelerationMultiplier (): number {
    return this.onGround ? 1 : this.airControl;
  }

  protected handleInputs (delta: number): void {
    if (!this.movementBehaviour) return;
    const inputsDeactivated = (!this.playerControlled || this.freezeInputs);

    // Get movement vector depending on this characters control settings
    const movementVector = (!inputsDeactivated) ? (this.getGameScene()?.inputController?.getMovementVector() ?? new Phaser.Math.Vector2(0, 0)) : new Phaser.Math.Vector2(0, 0);

    // Looking
    if (movementVector.y !== 0 && movementVector.x === 0) {
      this.movementBehaviour.handleLooking(movementVector, this.onGround);
    }

    // Movement
    if (movementVector.x !== 0) {
      this.movementBehaviour.handleMovement(movementVector, this.getAccelerationMultiplier(), delta);
    } else {
      this.movementBehaviour.handleNoMovement(delta, this.getDeaccelerationMultiplier());
    }

    if (!inputsDeactivated) {
      // Jumping
      if (this.onGround || this.onGroundThresholdTime > 0) {
        if (this.getGameScene()?.inputController?.justDown(Action.JUMP)) {
          if (this.sfxBank) this.sfxBank.playRandomSFXFromCategory(this.scene, 'jump');
          this.setVelocityY(-this.maxJumpStrength);
          this.justJumped = true;
          this.longPressJumpTime = 0;
          this.onGroundThresholdTime = 0;
        }
      }

      // Interacting
      if (this.onGround && this.objectsInReach[0] && this.getGameScene()?.inputController?.justDown(Action.INTERACT)) {
        const targetObject = this.objectsInReach[0];
        targetObject.trigger();
      }

      // Singing
      if (this.onGround && this.getGameScene()?.inputController?.justDown(Action.SING)) {
        this.getGameScene()?.addEffectCircle(this.x, this.y, { effect: 2, toRadius: 300 });
      }
    }

    // State Changes
    const velocity = this.getVelocity();
    const vx = velocity.x ?? 0;
    const vy = velocity.y ?? 0;

    this.lastState = this.currentState;

    if (this.onGround) {
      if (movementVector.x !== 0) {
        if (Math.sign(movementVector.x) === Math.sign(vx)) {
          this.currentState = 'run';
        } else {
          this.currentState = 'turn';
        }
      } else {
        if (Math.abs(vx) > 2) {
          this.currentState = 'stop';
        } else {
          if (movementVector.y !== 0) {
            this.currentState = movementVector.y === 1 ? 'lookdown' : 'lookup';
          } else {
            this.currentState = 'idle';
          }
        }
      }
    } else {
      this.currentState = vy < 0 ? 'jump' : 'fall';
    }

    if (this.longPressJumpTime < JUMP_PRESS_TIME && this.getGameScene()?.inputController?.isDown(Action.JUMP)) {
      this.longPressJumpTime += delta;
    }

    // Apply jump break force for low jumps
    if (this.getGameScene()?.inputController?.justUp(Action.JUMP)) {
      const jumpingPowerMultiplier = Math.min(this.longPressJumpTime / JUMP_PRESS_TIME, 1);
      this.applyForce(new Phaser.Math.Vector2(0, (1 - jumpingPowerMultiplier) * 0.5));
    }

    // Set sprite flipping depending on movement vector
    if (movementVector.x !== 0) this.direction = movementVector.x > 0 ? 1 : -1;
  }

  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }

  private groundCheck (collisions: Phaser.Types.Physics.Matter.MatterCollisionData[]): void {
    let onGround = false;
    const groundNormal = new Phaser.Math.Vector2(0, 0);
    collisions.forEach(pair => {
      const normal = (pair as any).collision.normal;
      if (normal.y > 0.5) {
        onGround = true;
        this.onGroundThresholdTime = ON_GROUND_THRESHOLD;
        groundNormal.set(normal.x, normal.y);
      }
    });
    
    this.onGround = onGround;
    this.justLanded = !this.wasOnGround && onGround;
  }

  private updateAnimations (): void {
    const velocity = this.getVelocity();
    // const vx = velocity.x ?? 0;
    // const maxSpeed = this.movementBehaviour?.maxSpeed ?? 5;
    const absoluteVelocity = new Phaser.Math.Vector2(velocity ?? {x: 0, y: 0}).length();

    // per update cycle
    switch (this.currentState) {
      case 'run': {
        this.stepSoundBehaviour?.update(this.anims.currentFrame?.index ?? 0);
        this.anims.timeScale = 1;
        // this.anims.timeScale = Math.max(Math.abs(vx / maxSpeed), 0.5);
        break;
      }
      case 'jump':
      case 'fall': {
        this.anims.timeScale = absoluteVelocity / 30;
        break;
      }
      default: this.anims.timeScale = 1;
    }

    // Per state change
    if (this.currentState !== this.lastState) {
      switch(this.currentState) {
        case 'jump': {
          this.play({ key: 'jump', repeat: -1 }, true);
          break;
        }
        case 'fall': {
          this.play({ key: 'fall', repeat: -1 }, true);
          break;
        }
        case 'run': {
          if (absoluteVelocity < 1) {
            this.play({ key: 'prerun' }, true);
            this.chain({ key: 'run', repeat: -1 });
          } else {
            this.play({ key: 'run', repeat: -1 }, true);
            this.chain();
          }
          break;
        }
        case 'idle': {
          this.play({ key: 'idle', repeat: -1 }, true);
          break;
        }
        case 'stop': {
          this.stepSoundBehaviour?.triggerSlide();
          this.play({ key: 'stop', repeat: -1 }, true);
          break;
        }
        case 'turn': {
          this.stepSoundBehaviour?.triggerSlide();
          this.play({ key: 'turn', repeat: -1 }, true);
          break;
        }
        case 'lookdown': {
          this.play({ key: 'lookdown', repeat: -1 }, true);
          break;
        }
        case 'lookup': {
          this.play({ key: 'lookup', repeat: -1 }, true);
          break;
        }
      }
    }
  }

  public update (time: number, delta: number) {
    super.update(time, delta);

    // resets
    this.justJumped = false;

    if (!this.onGround && this.onGroundThresholdTime > 0) {
      this.onGroundThresholdTime -= delta;
    }

    // Handle Inputs
    this.handleInputs(delta);

    if (this.justLanded) {
      this.stepSoundBehaviour?.justLanded();
    }

    this.updateAnimations();

    const hudScene = this.scene.scene.get('hud-scene') as HUDScene | undefined;
    if (hudScene) hudScene.addDebugText(this.currentState);
  }
}
