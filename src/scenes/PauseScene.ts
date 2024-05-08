import Phaser from 'phaser'
import GameScene from './GameScene';
import { Action } from '../models/Input';
import BaseScene from './BaseScene';
import DropBucket from '../entities/DropBucket/DropBucket';
import { MenuList } from '../models/Menu';

export type PauseSceneInitData = {
  bucket?: DropBucket;
}

export default class PauseScene extends BaseScene {
  private bucket: DropBucket | undefined;
  private menu: MenuList | undefined;
  private background: Phaser.GameObjects.Graphics | undefined;

	constructor() {
		super({ key: 'pause-scene' });
	}

	public create () {
    super.create();

    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.6);
		this.background.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    this.menu = new MenuList(this, { x: this.game.canvas.width / 2, y: 0, fontSize: 28, alignment: 'center', textColor: '#888', activeTextColor: '#FFF' });
    this.menu.addItem({ enabled: true, key: 'continue', label: 'Continue' });
    if (this.bucket) {
      this.menu.addItem({ enabled: true, key: 'retry', label: 'Restart Arcade' });
      this.menu.addItem({ enabled: true, key: 'disconnect', label: 'Leave Arcade' });
    }
    // this.menu.addItem({ enabled: true, key: 'controls', label: 'Controls' });
    this.menu.addItem({ enabled: true, key: 'options', label: 'Options' });
    this.menu.addItem({ enabled: true, key: 'exit', label: 'Exit Game' });

    this.menu.onActivated = this.handleAction.bind(this);
    this.menu.y = this.game.canvas.height - this.menu.getBounds().height - 64 + 10;
  }

  private handleAction (key: string): void {
    switch (key) {
      case 'continue': this.continue(); break;
      case 'retry': this.retry(); break;
      case 'disconnect': this.disconnect(); break;
      case 'options': this.showOptions(); break;
      case 'controls': console.log('implement me'); break;
      case 'exit': this.exit(); break;
    }
  }

  public blur (): void {
    super.blur();
    this.menu?.setDisabled(true);
  }

  public focus (): void {
    super.focus();
    this.menu?.setDisabled(false);
  }

  private showOptions (): void {
    this.scene.launch('options-scene', this);
  }

  private continue (): void {
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    // this.scene.resume('game-scene');
    if (gameScene) gameScene.continue();
    this.scene.stop();
  }

  private exit (): void {
    this.menu?.setDisabled(true);
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    this.continue();
    gameScene?.exit();
    // if (gameScene && gameScene.gameMode === GameMode.NORMAL) LocalStorage.setSnapshot(gameScene.generateSnapshot());

    // this.cameras.main.fadeOut(1000);
    // this.time.delayedCall(1000, () => {
    //   this.scene.start('main-menu-scene').stop('game-scene').stop('pause-scene').stop('hud-scene');
    // });
  }

  private disconnect (): void {
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    gameScene?.unmountBucket();
    this.continue();
  }

  private retry (): void {
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    gameScene?.restartBucket();
    this.continue();
  }

  // private fadeOutToGameScene (): GameScene | undefined {
  //   const gameScene = this.scene.get('game-scene') as GameScene | undefined;
  //   if (!gameScene) return;

  //   gameScene.ignoreInputs = false;
  //   gameScene.setBokehEffect(0, 1000, Phaser.Math.Easing.Sine.InOut);

	// 	this.tweens.addCounter({
	// 		from: 1,
	// 		to: 0.2,
	// 		duration: 1000,
	// 		ease: Phaser.Math.Easing.Sine.InOut,
	// 		onUpdate: (tween) => {
  //       this.cameras.main.alpha = tween.getValue();
	// 		},
  //     onComplete: () => {
  //       this.scene.stop();
  //     }
	// 	})

  //   return gameScene;
  // }

  public update (time: number, delta: number): void {
    super.update(time, delta);
    if (!this.ignoreInputs) {
      if (this.inputController?.justDown(Action.PAUSE)) {
        this.continue();
      } else if (this.inputController?.justDown(Action.DOWN)) {
        this.menu?.nextItem();
      } else if (this.inputController?.justDown(Action.UP)) {
        this.menu?.prevItem();
      } else if (this.inputController?.justDown(Action.CONFIRM)) {
        this.menu?.executeAction();
      }
    }
  }

  public init (data: PauseSceneInitData) {
    this.scene.bringToTop();
    this.bucket = data.bucket;
  }
}
