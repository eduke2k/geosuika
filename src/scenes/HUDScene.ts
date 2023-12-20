import Phaser from 'phaser'

export default class HUDScene extends Phaser.Scene {
	public debugText!: Phaser.GameObjects.Text;
	public fpsText!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: 'hud-scene' })
	}

	public async create () {
		this.debugText = this.add.text(0, 0, 'Early Preview', { font: "12px Courier", align: "left" });
		this.fpsText = this.add.text(this.game.canvas.width, 0, '45456456 fps', { font: "12px Courier", align: "right" }).setOrigin(1, 0);
    this.scene.bringToTop();
  }

	public addDebugText (text: string): void {
		this.debugText.setText(text);
	}

	public update (): void {
		this.fpsText.text = `${Math.round(this.game.loop.actualFps)} (${this.game.loop.fpsLimit}) fps\nFrame ${this.game.loop.frame}`;
	}
}
