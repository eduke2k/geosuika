import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_TERRAIN } from "../const/collisions";
import { Depths } from "../const/depths";
import GameScene from "../scenes/GameScene";

export default class GameObject extends Phaser.Physics.Matter.Sprite {
  protected direction = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    spriteKey: string,
    frame?: string | number | undefined,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, spriteKey, frame, options);
    this.direction = 1;
    this.name = name;

    this.setDepth(Depths.OBJECT_LAYER);

    this.setCollisionCategory(CATEGORY_OBJECT)
    this.setCollidesWith([CATEGORY_TERRAIN, CATEGORY_PLAYER]);

    // Add to scene render list
    scene.add.existing(this);
  }

  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }

  public update (_time: number, _delta: number): void {
    this.flipX = this.direction === -1;
  }
}
