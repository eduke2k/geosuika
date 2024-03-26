import Phaser from 'phaser'
import Arcade from '../entities/Arcade';
import BaseScene from './BaseScene';
import { ArcadeInfo } from '../entities/HUD/ArcadeInfo';
import BlinkingText, { BlinkingTextOptions } from '../entities/BlinkingText';
import { FontName } from '../types';
import Character from '../entities/Character';
import { SpeechBubble } from '../entities/HUD/SpeechBubble';

export default class HUDScene extends BaseScene {
	public debugText!: Phaser.GameObjects.Text;
	public fpsText!: Phaser.GameObjects.Text;
	private arcadeInfos: ArcadeInfo[] = [];
	private blinkingTexts: BlinkingText[] = [];
	public interactionLabel!: Phaser.GameObjects.Text;
	public collectiblesLabel!: Phaser.GameObjects.Text;
	public collectiblesValue!: Phaser.GameObjects.Text;
	public speechBubble!: SpeechBubble;

	constructor() {
		super({ key: 'hud-scene' })
	}

	public async create () {
		super.create();
		this.debugText = this.add.text(0, 0, 'Early Preview', { font: "12px Courier", align: "left" });
		this.fpsText = this.add.text(this.game.canvas.width, 0, '45456456 fps', { font: "12px Courier", align: "right" }).setOrigin(1, 0);
		this.interactionLabel = this.add.text(this.game.canvas.width / 2, this.game.canvas.height - this.scaled(24), 'Press E to interact', { align: "center" }).setOrigin(0.5, 1);
    this.interactionLabel.setFontFamily(FontName.REGULAR);
    this.interactionLabel.setFontSize(`${this.scaled(20)}px`);
    this.interactionLabel.alpha = 1;

		this.collectiblesLabel = this.add.text(this.scaled(20), this.scaled(20), 'Collectibles', { align: "left", color: '#8c8c8c' }).setOrigin(0, 0);
    this.collectiblesLabel.setFontFamily(FontName.REGULAR);
    this.collectiblesLabel.setFontSize(`${this.scaled(20)}px`);

		this.collectiblesValue = this.add.text(this.scaled(20), this.collectiblesLabel.y + this.collectiblesLabel.height, '0 / 10', { align: "left" }).setOrigin(0, 0);
    this.collectiblesValue.setFontFamily(FontName.REGULAR);
    this.collectiblesValue.setFontSize(`${this.scaled(30)}px`);

		this.speechBubble = new SpeechBubble(this);

    this.scene.bringToTop();
  }

	public updateCollectiblesAmount (amount: number, total: number): void {
		this.collectiblesValue.text = `${amount} / ${total}`;
	}

	public triggerSpeechBubble (referenceObject: Character, text: string): void {
		this.speechBubble.trigger(referenceObject, text);
	}

	public addDebugText (text: string): void {
		this.debugText.setText(text);
	}

	public addBlinkingText (text: string, position: Phaser.Types.Math.Vector2Like, options: BlinkingTextOptions): void {
		const blinkingText = new BlinkingText(this, text, position.x ?? 0, position.y ?? 0, options);
		this.blinkingTexts.push(blinkingText);
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
		this.arcadeInfos.forEach(a => a.update(time, delta));
		this.speechBubble.update(time, delta);
	}
}
