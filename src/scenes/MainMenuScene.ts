import Phaser from 'phaser'
import { MenuList } from '../models/Menu';
import { Action } from '../models/Input';
// import LensFlareFX from '../shaders/LensFlareFX';
import PlanetFX from '../shaders/PlanetFX';
import BaseScene from './BaseScene';
import { FontName } from '../types';

export default class MainMenuScene extends BaseScene {
  // private lensFlareFX: LensFlareFX | undefined;
  private planetFX: PlanetFX | undefined;
  private anyKeyText: Phaser.GameObjects.Text | undefined;
  private bgm: Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | undefined;
  private menu: MenuList | undefined;
  private state: 'preMenu' | 'menu' = 'preMenu'
  // private menuItems: MenuItem[] = [
  //   { label: 'Play', key: 'play' },
  //   { label: 'Controls', key: 'controls' },
  //   { label: 'Options', key: 'options' },
  //   { label: 'Credits', key: 'credits' },
  // ];

	constructor() {
		super({ key: 'main-menu' });
	}

  private handleMenuAction (key: string): void {
    console.log('handleAction', key);
    switch (key) {
      case 'play': this.startGame(); break;
      case 'controls': console.log('implement me'); break;
      case 'options': console.log('implement me'); break;
      case 'credits': console.log('implement me'); break;
    }
  }

  private startGame (): void {
    this.ignoreInputs = true;
    const duration = 3500;

    this.time.delayedCall(duration / 2, () => {
      this.cameras.main.fadeOut(duration / 2);
    });

    this.tweens.add({
      targets: this.menu,
      alpha: 0,
      y: (this.menu?.y ?? 0) + 10,
      duration: duration / 5,
      ease: Phaser.Math.Easing.Quadratic.Out,
    }),

    this.tweens.add({
      targets: this.bgm,
      volume: 0,
      duration: duration / 4,
      ease: Phaser.Math.Easing.Quadratic.Out,
    })

    this.soundManager?.sound.play('sfx:drone-rise');

    this.tweens.addCounter({
      from: this.planetFX?.getPlanetSize() ?? 0.1,
      to: 1,
      duration,
      ease: Phaser.Math.Easing.Quadratic.In,
      onUpdate: (tween) => {
        this.planetFX?.setPlanetSize(tween.getValue())
      },
      onComplete: () => {
        this.bgm?.stop();
        this.scene.launch('game-scene').launch('hud-scene').remove();
      }
    })
  }

  private handleMenuChange (_key: string): void {
    const initial = this.planetFX?.getPlanetSize();
    if (!initial) return;
    this.tweens.addCounter({
      from: initial + 0.03,
      to: initial,
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.Out,
      onUpdate: (tween) => {
        this.planetFX?.setPlanetSize(tween.getValue());
      }
    })
  }

  public showMenu (): void {
    if (this.state !== 'preMenu') return;
    const duration = 3000;
    this.ignoreInputs = true;

    if (this.anyKeyText) {
      this.tweens.add({
        targets: this.anyKeyText,
        alpha: 0,
        duration: duration / 2,
        ease: Phaser.Math.Easing.Quadratic.Out
      });
    }

    this.tweens.addCounter({
      from: this.planetFX?.getPlanetSize() ?? 0,
      to: 0.5,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        this.planetFX?.setPlanetSize(tween.getValue())
      }
    });

    this.time.delayedCall(duration / 2, () => {
      this.tweens.add({
        targets: this.menu,
        alpha: 1,
        y: (this.menu?.y ?? 0) - 10,
        duration: duration / 4,
        ease: Phaser.Math.Easing.Quadratic.Out,
        onComplete: () => {
          this.ignoreInputs = false;
          this.state = 'menu'
        }
      });
    });
  }

	public async create () {
    super.create();
    // this.cameras.main.postFX.addBlur(0, 2, 2, 10, 0xffffff, 2);
    const duration = 2000;
    this.cameras.main.fadeIn(duration);

    this.menu = new MenuList(this, { x: this.game.canvas.width / 2, y: 0, fontSize: 28, textColor: '#888', activeTextColor: '#FFF' });
    this.menu.addItem({ enabled: true, key: 'play', label: 'Play' });
    this.menu.addItem({ enabled: true, key: 'controls', label: 'Controls' });
    this.menu.addItem({ enabled: true, key: 'options', label: 'Options' });
    this.menu.addItem({ enabled: true, key: 'credits', label: 'Credits' });
    this.menu.onActivated = this.handleMenuAction.bind(this);
    this.menu.onChange = this.handleMenuChange.bind(this);
    this.menu.alpha = 0;
    this.menu.y = this.game.canvas.height - this.menu.getBounds().height - 64 + 10;

    this.anyKeyText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height - 128, 'Press any button to start', { fontFamily: FontName.LIGHT, fontSize: 28, color: '#FFF' } ).setOrigin(0.5, 0.5);
    this.anyKeyText.alpha = 0;

    this.time.delayedCall(duration / 2, () => {
      this.tweens.add({
        targets: this.anyKeyText,
        alpha: 1,
        y: (this.anyKeyText?.y ?? 0) - 10,
        duration: duration / 4,
        ease: Phaser.Math.Easing.Quadratic.Out,
        onComplete: () => {
          this.ignoreInputs = false;
        }
      });
    });

    // Start music
    this.bgm = this.soundManager?.music.add('bgm:menu', { loop: true });
    this.bgm?.play();

    // this.lensFlareFX = new LensFlareFX(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
    // this.lensFlareFX.createShaderImage();

    this.planetFX = new PlanetFX(this, .3, 1280, 720);
    const image = this.planetFX.createShaderImage();
    image.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
    image.setDisplaySize(this.game.canvas.width, this.game.canvas.width / (16/9));

    const targetSize = this.planetFX?.getPlanetSize() ?? 1;

    this.tweens.addCounter({
      from: targetSize - 0.2,
      to: targetSize,
      duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
      onUpdate: (tween) => {
        this.planetFX?.setPlanetSize(tween.getValue())
      }
    });
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);
    if (!this.ignoreInputs) {

      if (this.state === 'preMenu') {
        if (this.inputController?.justDown(Action.CONFIRM)) {
          this.showMenu();
        }
      } else if (this.state === 'menu') {
        if (this.inputController?.justDown(Action.DOWN)) {
          this.menu?.nextItem();
        } else if (this.inputController?.justDown(Action.UP)) {
          this.menu?.prevItem();
        } else if (this.inputController?.justDown(Action.CONFIRM)) {
          this.menu?.executeAction();
        }
      }
    }
  }
}
