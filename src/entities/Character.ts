import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { StepSoundBehaviour } from "../behaviour/StepSoundBehaviour";
import { getOtherInteractableGameObjectsFromCollisionPairs } from "../functions/helper";
import { Action } from "../models/Input";
import { SFX } from "../models/SFX";
import GameScene from "../scenes/GameScene";
import InteractableGameObject from "./InteractableGameObject";

const JUMP_PRESS_TIME = 150;
const ON_GROUND_THRESHOLD = 150;
const JUMP_BUFFER_TIME = 150;
const BODY_LABELS_FOR_GROUND_CHECK = ['terrain', 'terrainObject', 'oneway-platform'];

export type CharacterStates = 'idle' | 'run' | 'stop' | 'turn' | 'lookup' | 'lookdown' | 'lookup' | 'jump' | 'fall' | 'floating'

export default class Character extends InteractableGameObject {
  protected shadow: Phaser.FX.Shadow;
  protected movementBehaviour?: MovementBehaviour;
  protected stepSoundBehaviour?: StepSoundBehaviour;
  protected playerControlled = false;
  protected freezeInputs = false;
  protected freezeInteract = false;
  public lastState: CharacterStates = 'idle';
  public state: CharacterStates = 'idle';
  public onGround = false;
  public wasOnGround = false;
  public justLanded = false;
  public justJumped = false;
  public justSlided = false;
  public maxJumpStrength = 16;
  public airControl = 0.1;
  public longPressJumpTime = 0;
  public jumpBufferTime = -1;
  public onGroundThresholdTime = 0;
  public groundNormal: Phaser.Math.Vector2 | undefined;
  public groundBody: MatterJS.BodyType | undefined;
  public interactableObjectsInReach: InteractableGameObject[] = [];
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
    this.shadow = this.postFX.addShadow(0.5, 0.5, 0.05, 0.8, 0x000000, 4);

    this.sfxBank = this.scene.registry.get(sfxKey) as SFX | undefined;

    this.scene.matter.world.on('beforeupdate', () => {
      this.wasOnGround = this.onGround;
      this.onGround = false;
      this.groundBody = undefined;
      this.justLanded = false;
      this.justSlided = false;
      this.justJumped = false;
    });

    this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherInteractableGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          
          this.interactableObjectsInReach.push(...gameObjects.filter(o => o.active));
          gameObjects[0].onCollisionStart(this);
        }
      }
    });

    this.scene.matter.world.on('collisionend', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // console.log('collisionend', event);
      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherInteractableGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          gameObjects.filter(o => o.active)[0]?.onCollisionEnd(this);

          gameObjects.forEach(o => {
            const index = this.interactableObjectsInReach.findIndex(r => r === o)
            this.interactableObjectsInReach.splice(index, 1);
          });
        }
      }
    });

    this.scene.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      // console.log('collisionactive', event);
      const terrainCollisions = event.pairs.filter(pair => 
        (BODY_LABELS_FOR_GROUND_CHECK.includes(pair.bodyA.label) && !pair.bodyA.isSensor && pair.bodyB.gameObject === this) ||
        (BODY_LABELS_FOR_GROUND_CHECK.includes(pair.bodyB.label) && !pair.bodyB.isSensor && pair.bodyA.gameObject === this)
      );
      this.groundCheck(terrainCollisions);

      // Check if player is within reach of interactbale game objects
      if (this.playerControlled) {
        const gameObjects = getOtherInteractableGameObjectsFromCollisionPairs<this>(this, event.pairs);
        if (gameObjects.length > 0) {
          gameObjects[0].setHighlighted(true);
        }
      }
    });

    // Add to scene render list
    scene.add.existing(this);
  }

  public getBody (): MatterJS.BodyType | null {
    return this.body as MatterJS.BodyType | null;
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

  public setFreezeInteract (value: boolean): void {
    this.freezeInteract = value;
  }

  private getDeaccelerationMultiplier (): number {
    return this.onGround ? 1 : 0;
  }

  private getAccelerationMultiplier (): number {
    return this.onGround ? 1 : this.airControl;
  }

  public setFloating (floating: boolean): void {
    if (floating) {
      this.setStatic(true);
    } else {
      this.setStatic(false);
    }
  }

  protected jump (): void {
    // Regular on ground jump
    if (this.onGround || this.onGroundThresholdTime > 0) {
      if (this.getGameScene()?.inputController?.isDown(Action.DOWN) && this.groundBody?.label === 'oneway-platform') {
        // Drop down one way platform
        this.getGameScene()?.dropDownOnewayPlatform(this.groundBody.id);
      } else {
        // Regualar jump
        if (this.sfxBank) this.sfxBank.playRandomSFXFromCategory(this.scene as GameScene, 'jump');
        this.setVelocityY(-this.maxJumpStrength);
        this.justJumped = true;
        this.longPressJumpTime = 0;
        this.onGroundThresholdTime = 0;
      }
    } else if (this.jumpBufferTime < 0) {
      // Buffer Jump inputs to immediately jump once on ground to make precise jumping inputs a bit easier
      this.jumpBufferTime = JUMP_BUFFER_TIME;
    }
  }

  protected handleInputs (delta: number): void {
    if (!this.movementBehaviour) return;
    const inputsDeactivated = (!this.playerControlled || this.freezeInputs || this.getGameScene()?.ignoreInputs || this.getGameScene()?.getState() !== 'play');

    // Get movement vector depending on this characters control settings
    const movementVector = (!inputsDeactivated) ? (this.getGameScene()?.inputController?.getMovementVector() ?? new Phaser.Math.Vector2(0, 0)) : new Phaser.Math.Vector2(0, 0);

    // Movement
    if (movementVector.x !== 0) {
      this.movementBehaviour.handleMovement(movementVector, this.getAccelerationMultiplier(), delta);
    } else {
      this.movementBehaviour.handleNoMovement(delta, this.getDeaccelerationMultiplier());
    }

    if (!inputsDeactivated) {
      // Jumping
      if (this.getGameScene()?.inputController?.justDown(Action.JUMP) || this.jumpBufferTime >= 0) {
        this.jump();
      }

      // Interacting
      if (!this.freezeInteract && this.onGround && this.interactableObjectsInReach[0] && this.getGameScene()?.inputController?.justDown(Action.INTERACT)) {
        const targetObject = this.interactableObjectsInReach[0];
        targetObject.trigger(this);
      }

      // Map layer changing mode
      if (!this.freezeInteract && this.getGameScene()?.inputController?.justDown(Action.LAYER_CHANGE)) {
        this.getGameScene()?.startLayerChange();
      }
    }

    // State Changes
    const velocity = this.getVelocity();
    const vx = velocity.x ?? 0;
    const vy = velocity.y ?? 0;

    this.lastState = this.state;

    if (this.onGround) {
      if (movementVector.x !== 0) {
        if (Math.sign(movementVector.x) === Math.sign(vx)) {
          this.state = 'run';
        } else {
          this.state = 'turn';
        }
      } else {
        if (Math.abs(vx) > 2) {
          this.state = 'stop';
        } else {
          if (movementVector.y !== 0) {
            this.state = movementVector.y === 1 ? 'lookdown' : 'lookup';
          } else {
            this.state = 'idle';
          }
        }
      }
    } else {
      this.state = vy < 0 ? 'jump' : 'fall';
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

  private groundCheck (collisions: Phaser.Types.Physics.Matter.MatterCollisionData[]): void {
    let onGround = false;
    const groundNormal = new Phaser.Math.Vector2(0, 0);
    collisions.forEach(pair => {
      const inverseNormals = !BODY_LABELS_FOR_GROUND_CHECK.includes(pair.bodyA.label);

      const normal = new Phaser.Math.Vector2((pair as any).collision.normal);
      if (inverseNormals) normal.multiply({ x: -1, y: -1 });
      if (normal.y > 0.5) {
        onGround = true;
        this.groundBody = inverseNormals ? pair.bodyB : pair.bodyA;
        this.onGroundThresholdTime = ON_GROUND_THRESHOLD;
        groundNormal.set(normal.x, normal.y);
      }
    });
    
    this.groundNormal = groundNormal;
    this.onGround = onGround;
    this.justLanded = !this.wasOnGround && onGround;
  }

  private updateAnimations (): void {
    const velocity = this.getVelocity();
    // const vx = velocity.x ?? 0;
    // const maxSpeed = this.movementBehaviour?.maxSpeed ?? 5;
    const absoluteVelocity = new Phaser.Math.Vector2(velocity ?? {x: 0, y: 0}).length();

    // per update cycle
    switch (this.state) {
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
    if (this.state !== this.lastState) {
      switch(this.state) {
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

    if (this.jumpBufferTime >= 0 && !this.onGround) {
      this.jumpBufferTime -= delta;
    }

    // Handle Inputs
    this.handleInputs(delta);

    if (this.justLanded) {
      this.stepSoundBehaviour?.justLanded();
    }

    // Handle falling
    if (this.state === 'fall') this.movementBehaviour?.handleFall();

    this.updateAnimations();
  }
}
