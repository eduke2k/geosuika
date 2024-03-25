// import BaseScene from "../scenes/BaseScene";
import GameScene from "../scenes/GameScene";
// import WaterFX from "../shaders/WaterFX";

export class WaterRectangle {
  // private scene: GameScene;
  private graphics: Phaser.GameObjects.Graphics;

  public constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
    this.graphics = scene.add.graphics();
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(x, y, w, h);
  }
}