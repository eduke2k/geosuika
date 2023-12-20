import Phaser from 'phaser'
import GameScene from './GameScene';
import { LocalStorage } from '../models/LocalStorage';
import { BackgroundMusicConfig } from '../models/BackgroundMusic';
import BaseScene from './BaseScene';
const MENU_ITEM_GAP = 0;

export default class GameOverScene extends BaseScene {
  public container!: Phaser.GameObjects.Container;
	public gameOverText!: Phaser.GameObjects.Text;
  public scoreHeadlineText!: Phaser.GameObjects.Text;
  public scoreText!: Phaser.GameObjects.Text;
	public bokehEffect!: Phaser.FX.Bokeh;
  private score = 0;
  private bucketKey: string | undefined = undefined;
  private bgmConfig: BackgroundMusicConfig | undefined = undefined;
  private baseMenuItems: { label: string, key: string, url?: string }[] = [
    { label: 'Try again', key: 'retry' },
    { label: 'Leave Cabinet', key: 'disconnect' },
  ];

	constructor() {
		super({ key: 'gameover-scene' })
	}

	public async create () {
    super.create();
    this.cameras.main.alpha = 0;
		this.bokehEffect = this.cameras.main.postFX.addBokeh(0, 0, 0);
    this.container = this.add.container(0, 0);

    this.gameOverText = this.add.text(0, 0, 'The Memory faded...', { font: "48px Kumar One", align: "center" });
    this.gameOverText.setOrigin(0.5, 0.5);
    this.container.add(this.gameOverText);

    // const rect = this.add.rectangle(0, this.gameOverText.y +  this.gameOverText.height + 50, 500, 100, 0x000000).setOrigin(0.5, 0.5);
    // this.container.add(rect);

    this.scoreHeadlineText = this.add.text(0, this.gameOverText.y + this.gameOverText.height + 50 , 'FINAL SCORE', { font: "18px Kumar One", align: "center" });
    this.scoreHeadlineText.setOrigin(0.5, 0.5);
    this.container.add(this.scoreHeadlineText);

    this.scoreText = this.add.text(0, this.scoreHeadlineText.y + this.scoreHeadlineText.height + 10, this.score.toLocaleString(), { font: "48px Kumar One", align: "center" });
    this.scoreText.setOrigin(0.5, 0.5);
    this.container.add(this.scoreText);

    if (this.bucketKey) {
      const highscore = LocalStorage.getHighscore(this.bucketKey);
      if (this.score > highscore) {
        LocalStorage.setHighscore(this.bucketKey, this.score);
      }
    }

    let y = this.scoreText.y + 100;

    const menuItems = [...this.baseMenuItems];

    if (this.bgmConfig) {
      if (this.bgmConfig.ytLink) {
        menuItems.unshift({
          key: 'yt',
          label: 'Full Song on Youtube',
          url: this.bgmConfig.ytLink
        });
      }
    }

    menuItems.forEach((item) => {
      const text = item;
      const t = this.add.text(0, y, text.label.toUpperCase(), { font: "32px Kumar One", align: "center" });
      t.setOrigin(0.5, 0.5);

      this.container.add(t);
      const hitbox = new Phaser.Geom.Rectangle(0, 0, t.getBounds().width, t.getBounds().height);

      const config: Phaser.Types.Input.InputConfiguration = {
        hitArea: hitbox,
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      }

      t.setInteractive(config);
      t.on('pointerover', () => { t.setTint(0x7878ff); });
      t.on('pointerout', () => { t.clearTint(); });
      t.on('pointerdown', () => { t.setTint(0xff0000); });
      t.on('pointerup', () => { t.clearTint(); this.handleAction(item) });
      y += t.getBounds().height + MENU_ITEM_GAP;
    });

    this.container.setX((this.game.canvas.width / 2));
    this.container.setY((this.game.canvas.height / 2) - this.container.getBounds().height / 2);

		this.tweens.addCounter({
			from: 0,
			to: 1,
			duration: 1000,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (tween) => {
        this.cameras.main.alpha = tween.getValue();
				this.bokehEffect.radius = (1 - tween.getValue()) * 2;
			},
      onComplete: () => {
        this.cameras.main.postFX.remove(this.bokehEffect);
      }
		})
  }

  private handleAction (item: { label: string, key: string, url?: string }): void {
    switch (item.key) {
      case 'retry': this.retry(); break;
      case 'disconnect': this.disconnect(); break;
      case 'yt': if (item.url) window.open(item.url); break;
    }
  }

  private disconnect (): void {
    const gameScene =  this.fadeOutToGameScene();
    gameScene?.unmountBucket();
  }

  private retry (): void {
    const gameScene = this.fadeOutToGameScene();
    gameScene?.restartBucket();
  }

  private fadeOutToGameScene (): GameScene | undefined {
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    if (!gameScene) return;

    gameScene.ignoreInputs = false;
    gameScene.setBokehEffect(0, 1000, Phaser.Math.Easing.Sine.InOut);

		this.tweens.addCounter({
			from: 1,
			to: 0.2,
			duration: 1000,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (tween) => {
        this.cameras.main.alpha = tween.getValue();
				this.bokehEffect.radius = (1 - tween.getValue()) * 2;
			},
      onComplete: () => {
        this.scene.stop();
      }
		})

    return gameScene;
  }

  public init (data: Record<string, any>)  {
    this.score = data?.score ?? 0;
    this.bgmConfig = data?.bgmConfig;
    this.bucketKey = data?.bucketKey ?? undefined;
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
