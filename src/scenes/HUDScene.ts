import Phaser from 'phaser'

export default class HUDScene extends Phaser.Scene {
	public debugText!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: 'hud-scene' })
	}

	public async create () {
		this.debugText = this.add.text(0, 0, 'Early Preview', { font: "12px Courier", align: "left" });
    this.scene.bringToTop();
  }

	public addDebugText (text: string): void {
		this.debugText.setText(text);
	}
}
