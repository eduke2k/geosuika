import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import GameScene from "../scenes/GameScene";

export default class Character extends Phaser.Physics.Matter.Sprite {
  protected movementBehaviour?: MovementBehaviour;
  private playerControlled = true;
  private ignoreInputs = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sprite: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, sprite, undefined, options);
	this.setBounce(0);
    this.setFriction(0.1);
    this.setPosition(x, y);
    this.setFixedRotation();

    // Add to scene render list
    scene.add.existing(this);
  }

  public setPlayerControlled (value: boolean) {
    this.playerControlled = value;
  }

  public setIgnoreInputs (value: boolean): void {
    this.ignoreInputs = value;
  }

  protected handleInputs (delta: number): void {
    if (!this.playerControlled || this.ignoreInputs || !this.movementBehaviour) return;
    const movementVector = this.getGameScene()?.inputController?.getMovementVector() ?? new Phaser.Math.Vector2(0, 0);
    this.movementBehaviour.handleMovement(movementVector, delta);
  }

  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }
}
