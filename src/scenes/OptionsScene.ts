import { Action } from '../models/Input';
import BaseScene from './BaseScene';
import { MenuList } from '../models/Menu';
import { FontName } from '../types';

export default class OptionsScene extends BaseScene {
  private originalScene: BaseScene | undefined;
  private menu: MenuList | undefined;
  private background: Phaser.GameObjects.Graphics | undefined;

	constructor() {
		super({ key: 'options-scene' });
	}

	public create () {
    super.create();

    if (this.originalScene) this.originalScene.blur();

    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.6);
		this.background.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    this.add.text(64, 64, 'Options', { fontFamily: FontName.LIGHT, fontSize: 64, color: '#FFF' }).setOrigin(0, 0.5);

    this.menu = new MenuList(this, { x: 64, y: 146, fontSize: 28, textColor: '#888', activeTextColor: '#FFF', alignment: 'left' });
    this.menu.addSliderItem({ enabled: true, key: 'sfx-volume', label: 'Sound volume', increment: 10, initialValue: 100, maxValue: 100, minValue: 0, onUpdate: this.updateSFXVolume.bind(this) });
    this.menu.addSliderItem({ enabled: true, key: 'music-volume', label: 'Music volume', increment: 10, initialValue: 100, maxValue: 100, minValue: 0, onUpdate: this.updateMusicVolume.bind(this) });
    this.menu.addItem({ enabled: true, key: 'back', label: 'Back' });
    this.menu.onActivated = this.handleAction.bind(this);
  }

  private updateSFXVolume (value: number | string): void {
    if (typeof value !== 'number') return;
    this.soundManager?.sound.setVolume(value / 100);
  }

  private updateMusicVolume (value:  number | string): void {
    if (typeof value !== 'number') return;
    this.soundManager?.music.setVolume(value / 100);
  }

  private handleAction (key: string): void {
    switch (key) {
      case 'back': this.back(); break;
    }
  }

  private back (): void {
    if (this.originalScene) this.originalScene.focus();
    this.scene.stop();
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);
    if (!this.ignoreInputs) {
      if (this.inputController?.justDown(Action.BACK)) {
        this.back();
      } else if (this.inputController?.justDown(Action.DOWN)) {
        this.menu?.nextItem();
      } else if (this.inputController?.justDown(Action.UP)) {
        this.menu?.prevItem();
      } else if (this.inputController?.justDown(Action.RIGHT)) {
        this.menu?.increaseIncrement();
      } else if (this.inputController?.justDown(Action.LEFT)) {
        this.menu?.decreaseIncrement();
      } else if (this.inputController?.justDown(Action.CONFIRM)) {
        this.menu?.executeAction();
      }
    }
  }

  public init (originalScene: BaseScene) {
    this.originalScene = originalScene;
  }
}
