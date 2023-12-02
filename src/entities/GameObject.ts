import { CATEGORY_OBJECT, CATEGORY_TERRAIN } from "../const/collisions";
import { Depths } from "../const/depths";
import GameScene from "../scenes/GameScene";
import Character from "./Character";

export default class GameObject extends Phaser.Physics.Matter.Sprite {
  protected direction = 1;
  protected interactable = false;
  protected highlighted = false;
  protected glow = this.postFX.addGlow(0xFFFFFF, 0, 0, false, 0.4, 5);
  protected sensor: MatterJS.BodyType | undefined;

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
    this.setCollidesWith([CATEGORY_TERRAIN]);

    // Add to scene render list
    scene.add.existing(this);
  }

  public trigger (): void {
    console.log('nothing implemented');
  }

  public isInteractable (): boolean {
    return this.interactable;
  }

  public onCollisionStart (_other: Character): void {
    if (this.isInteractable()) {
      this.scene.tweens.add({ targets: this.glow, outerStrength: 10, ease: 'sine.inout', duration: 250 });
    }
  }

  public onCollisionEnd (_other: Character): void {
    if (this.isInteractable()) {
      this.scene.tweens.add({ targets: this.glow, outerStrength: 0, ease: 'sine.inout', startDelay: 500, duration: 500 });
    }
  }

  public setHighlighted (highlighted: boolean): void {
    this.highlighted = highlighted;
  }

  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }

  public update (_time: number, _delta: number): void {
    this.flipX = this.direction === -1;

    // if (this.glow) {
    //   this.glow.setActive(this.highlighted);
    //   this.glow.outerStrength = randomIntFromInterval(1, 20);
    // }

    if (this.sensor && this.body) {
      this.scene.matter.alignBody(this.sensor, this.body.position.x, this.body.position.y, Phaser.Display.Align.CENTER);
    }
  }
}
