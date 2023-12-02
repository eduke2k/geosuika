import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { getOtherGameObjectsFromCollisionPairs } from "../functions/helper";
import { Action } from "../models/Input";
import GameScene from "../scenes/GameScene";
import GameObject from "./GameObject";

export default class Character extends GameObject {
  protected movementBehaviour?: MovementBehaviour;
  private playerControlled = false;
  private freezeInputs = false;
  public onGround = false;
  public maxJumpStrength = 15;
  public airControl = 0.1;
  public objectsInReach: GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    sprite: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, sprite, undefined, options);
    this.setBounce(0);
    this.setFriction(0);
    this.setPosition(x, y);
    this.setFixedRotation();

    this.scene.matter.world.on('beforeupdate', () => {
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

    // if (value) {
    //   this.setCollisionCategory(CATEGORY_PLAYER)
    //   this.setCollidesWith(CATEGORY_TERRAIN | CATEGORY_SENSOR);
    //   if (this.sensorBody) {
    //     this.setCollisionCategory(CATEGORY_SENSOR)
    //     this.setCollidesWith(CATEGORY_SENSOR);
    //   }
    // } else {
    //   this.setCollisionCategory(CATEGORY_OBJECT)
    //   this.setCollidesWith(CATEGORY_TERRAIN);
    //   if (this.sensorBody) {
    //     this.setCollisionCategory(CATEGORY_SENSOR)
    //     this.setCollidesWith(CATEGORY_PLAYER);
    //   }
    // }
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
    if (!this.playerControlled || this.freezeInputs || !this.movementBehaviour) return;

    // Movement
    const movementVector = this.getGameScene()?.inputController?.getMovementVector() ?? new Phaser.Math.Vector2(0, 0);
    if (movementVector.x !== 0) {
      this.movementBehaviour.handleMovement(movementVector, this.getAccelerationMultiplier(), delta);
    } else {
      this.movementBehaviour.handleNoMovement(delta, this.getDeaccelerationMultiplier());
    }

    // Jumping
    if (this.onGround) {
      if (this.getGameScene()?.inputController?.justDown(Action.JUMP)) {
        this.setVelocityY(-this.maxJumpStrength);
      }
    }

    // Interacting
    if (this.onGround && this.objectsInReach[0] && this.getGameScene()?.inputController?.justDown(Action.INTERACT)) {
      const targetObject = this.objectsInReach[0];
      targetObject.trigger();
    }

    // if (this.jumpFrameCounter > 0 && this.getGameScene()?.inputController?.justUp(Action.JUMP)) {
      // this.applyForce(new Phaser.Math.Vector2(0, -0.1));
      // this.setVelocityY((this.getVelocity().y ?? 0) - (this.maxJumpStrength / this.jumpFrames));
      // this.jumpFrameCounter++;
    // }

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
        groundNormal.set(normal.x, normal.y);
      }
    });
    
    this.onGround = onGround;
  }

  public update (time: number, delta: number) {
    super.update(time, delta);

    // Handle Inputs
    this.handleInputs(delta);
  }
}
