import Phaser from 'phaser'
import GameScene from './GameScene';
import { Action } from '../models/Input';
import BaseScene from './BaseScene';

export default class PauseScene extends BaseScene {
	constructor() {
		super({ key: 'pause-scene' });
	}

	public create () {
    super.create();
  }

  // private handleAction (item: { label: string, key: string, url?: string }): void {
  //   switch (item.key) {
  //     case 'continue': this.continue(); break;
  //     case 'retry': this.retry(); break;
  //     case 'disconnect': this.disconnect(); break;
  //     case 'exit': this.exit(); break;
  //   }
  // }

  private continue (): void {
    const gameScene = this.scene.get('game-scene') as GameScene | undefined;
    this.scene.resume('game-scene');
    if (gameScene) gameScene.continue();
    this.scene.stop();
  }

  private exit (): void {
    console.log('exit');
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
			},
      onComplete: () => {
        this.scene.stop();
      }
		})

    return gameScene;
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);
    if (this.inputController?.justDown(Action.PAUSE)) {
      this.continue();
    }
  }
}
