import Phaser from 'phaser'
import Arcade from '../entities/Arcade';
import BaseScene from './BaseScene';
import { ArcadeInfo } from '../entities/HUD/ArcadeInfo';

export default class HUDScene extends BaseScene {
	public debugText!: Phaser.GameObjects.Text;
	public fpsText!: Phaser.GameObjects.Text;
	private arcadeInfos: ArcadeInfo[] = [];

	constructor() {
		super({ key: 'hud-scene' })
	}

	public async create () {
		super.create();
		this.debugText = this.add.text(0, 0, 'Early Preview', { font: "12px Courier", align: "left" });
		this.fpsText = this.add.text(this.game.canvas.width, 0, '45456456 fps', { font: "12px Courier", align: "right" }).setOrigin(1, 0);
    this.scene.bringToTop();
  }

	public addDebugText (text: string): void {
		this.debugText.setText(text);
	}

	public getArcadeInfo (arcade: Arcade): ArcadeInfo {
		const arcadeInfo = this.arcadeInfos.find(a => a.arcade === arcade);
		if (arcadeInfo) {
			return arcadeInfo;
		} else {
			const newAcadeInfo = new ArcadeInfo(this, arcade);
			this.arcadeInfos.push(newAcadeInfo);
			return newAcadeInfo;
		}
	}

	public update (time: number, delta: number): void {
		this.fpsText.text = `${Math.round(this.game.loop.actualFps)} (${this.game.loop.fpsLimit}) fps\nFrame ${this.game.loop.frame}`;
		this.arcadeInfos.forEach(a => a.update(time, delta))
	}
}
