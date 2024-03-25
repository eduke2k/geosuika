import { Action } from '../models/Input';
import BaseScene from './BaseScene';
import { MenuList } from '../models/Menu';
import { FontName } from '../types';
import { OPTION_KEYS } from '../const/const';

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

    this.add.text(this.scaled(64), this.scaled(64), 'Options', { fontFamily: FontName.LIGHT, fontSize: this.scaled(64), color: '#FFF' }).setOrigin(0, 0.5);

    const initialSoundVolume = parseFloat(window.localStorage.getItem(OPTION_KEYS.SFX_VOLUME) as string);
    const initialMusicVolume = parseFloat(window.localStorage.getItem(OPTION_KEYS.MUSIC_VOLUME) as string);
    // const initialResolution = parseInt(window.localStorage.getItem(OPTION_KEYS.RESOLUTION) as string);
    const initialPostFXResolution = parseFloat(window.localStorage.getItem(OPTION_KEYS.POSTFX_RESOLUTION) as string);

    this.menu = new MenuList(this, { x: this.scaled(64), y: this.scaled(146), fontSize: this.scaled(28), textColor: '#888', activeTextColor: '#FFF', alignment: 'left' });
    this.menu.addSubheadline('separator-sound', 'Sound');
    this.menu.addSliderItem({ enabled: true, suffix: '%', key: 'sfx-volume', label: 'Sound volume', increment: 10, initialValue: initialSoundVolume * 100, maxValue: 100, minValue: 0, onUpdate: this.updateSFXVolume.bind(this) });
    this.menu.addSliderItem({ enabled: true, suffix: '%', key: 'music-volume', label: 'Music volume', increment: 10, initialValue: initialMusicVolume * 100, maxValue: 100, minValue: 0, onUpdate: this.updateMusicVolume.bind(this) });
    this.menu.addSubheadline('separator-gfx', 'Graphics');
    // this.menu.addSelectorItem({ enabled: true, key: 'resolution', label: 'Rendering Resolution', currentIndex: initialResolution, options: RESOLUTIONS, onUpdate: this.updateResolution.bind(this) });
    this.menu.addSliderItem({ enabled: true, suffix: '%', key: 'postfx-resolution', label: 'PostFX Resolution', increment: 25, initialValue: initialPostFXResolution * 100, maxValue: 100, minValue: 25, onUpdate: this.updatePostFXResolution.bind(this) });
    this.menu.addItem({ enabled: true, key: 'toggle-fullscreen', label: 'Toggle Fullscreen' });
    this.menu.addItem({ enabled: true, key: 'back', label: 'Back', padding: 30 });
    this.menu.onActivated = this.handleAction.bind(this);
  }

  private updatePostFXResolution (value: number | string): void {
    if (typeof value !== 'number') return;
    window.localStorage.setItem(OPTION_KEYS.POSTFX_RESOLUTION, (value / 100).toString());
  }

  private updateSFXVolume (value: number | string): void {
    if (typeof value !== 'number') return;
    this.soundManager?.sound.setVolume(value / 100);
    window.localStorage.setItem(OPTION_KEYS.SFX_VOLUME, (value / 100).toString());
  }

  private updateMusicVolume (value:  number | string): void {
    if (typeof value !== 'number') return;
    this.soundManager?.music.setVolume(value / 100);
    window.localStorage.setItem(OPTION_KEYS.MUSIC_VOLUME, (value / 100).toString());
  }

  // private updateResolution (value: number): void {
  //   window.localStorage.setItem(OPTION_KEYS.RESOLUTION, value.toString())
  // }

  private toggleFullScreen () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  private handleAction (key: string): void {
    switch (key) {
      case 'back': this.back(); break;
      case 'toggle-fullscreen': this.toggleFullScreen();
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
