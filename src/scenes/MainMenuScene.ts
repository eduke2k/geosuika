import Phaser from 'phaser'
import { Action } from '../models/Input';
// import LensFlareFX from '../shaders/LensFlareFX';
import BaseScene from './BaseScene';
import { SFX } from '../models/SFX';
import { Instrument } from '../models/Instrument';
// import GlowRingFX from '../shaders/GlowRingFX';
import ScalePostFX from '../shaders/ScalePostFX';
import { scaleNumberRange } from '../functions/numbers';
import { MenuList } from '../models/Menu';
import { LocalStorage } from '../models/LocalStorage';
import { GameMode } from './GameScene';

const skipAnimation = false;

export default class MainMenuScene extends BaseScene {
  // private anyKeyText: Phaser.GameObjects.Text | undefined;
  private bgm: Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | undefined;
  private menu: MenuList | undefined;
  private logo: Phaser.GameObjects.Image | undefined;
  private logoScale = 1;
  private background: Phaser.GameObjects.Image | undefined;
  private backgroundScale = 1;

	constructor() {
		super({ key: 'main-menu-scene' });
	}

  private handleMenuAction (key: string): void {
    switch (key) {
      case 'continue': this.continueGame(); break;
      case 'new-game': this.newGame(); break;
      case 'arcades': this.gotoArcades(); break;
      case 'options': this.showOptions(); break;
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

  private continueGame (): void {
    this.startGame(GameMode.NORMAL);
  }

  private gotoArcades (): void {
    this.startGame(GameMode.ARCADE); 
  }

  private newGame (): void {
    LocalStorage.resetSnapshot();
    this.startGame(GameMode.NORMAL);
  }

  private startGame (gameMode: GameMode): void {
    this.ignoreInputs = true;
    this.menu?.setDisabled(true);
    const duration = 3500;

    this.logo?.setPostPipeline(ScalePostFX);
    const pipe = this.logo?.getPostPipeline(ScalePostFX) as ScalePostFX;
    if (pipe && pipe instanceof ScalePostFX) {
      pipe.setAmount(0.8);
      pipe.setAlpha(1);
    }

    (this.registry.get('sfx:gong-effect') as SFX | undefined)?.playRandomSFXFromCategory(this, 'deep');
    (this.registry.get('instrument:piano') as Instrument | undefined)?.playRandomNote(this, 0, 1);

    this.time.delayedCall(duration / 2, () => {
      this.cameras.main.fadeOut(duration / 2);
    });

    this.tweens.add({
      targets: this.logo,
      scale: this.logoScale * 1.2,
      duration,
      ease: Phaser.Math.Easing.Sine.In,
    })

    this.tweens.add({
      targets: this.background,
      scale: this.backgroundScale * 0.5,
      duration,
      ease: Phaser.Math.Easing.Sine.In,
    })

    if (pipe && pipe instanceof ScalePostFX) {
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: Phaser.Math.Easing.Sine.InOut,
        onUpdate: (tween) => {
          pipe.setAmount(scaleNumberRange(tween.getValue(), [0, 1], [0.8, 1]) );
          pipe.setAlpha(1 - tween.getValue());
        },
        onComplete: () => {
          this.logo?.clearFX();
        }
      });
    }

    this.tweens.add({
      targets: this.bgm,
      volume: 0,
      duration: duration / 4,
      ease: Phaser.Math.Easing.Quadratic.Out,
    })

    this.soundManager?.sound.play('sfx:drone-rise');

    this.time.delayedCall(duration, () => {
      this.scene.launch('hud-scene').launch('game-scene', { gameMode }).stop();
    });
  }

  private handleMenuChange (_key: string): void {
    // nothing
  }

	public async create () {
    super.create();

    // this.cameras.main.postFX.addBlur(0, 2, 2, 10, 0xffffff, 2);
    const duration = 2000;

    this.cameras.main.fadeIn(duration);

    // Setup menu
    this.menu = new MenuList(this, { x: this.game.canvas.width / 2, y: 0, fontSize: this.scaled(28), textColor: '#888', activeTextColor: '#FFF', alignment: 'center' });
    if (LocalStorage.getSnapshot()) this.menu.addItem({ enabled: true, key: 'continue', label: 'Continue' });
    this.menu.addItem({ enabled: true, key: 'new-game', label: 'New Game' });
    this.menu.addItem({ enabled: true, key: 'arcades', label: 'Arcade Mode' });
    this.menu.addItem({ enabled: true, key: 'options', label: 'Options', padding: this.scaled(12) });

    this.menu.onActivated = this.handleMenuAction.bind(this);
    this.menu.onChange = this.handleMenuChange.bind(this);
    this.menu.alpha = 0;
    this.menu.y = this.game.canvas.height - this.menu.getBounds().height - this.scaled(128);

    // Start music
    this.bgm = this.soundManager?.music.add('bgm:menu', { loop: true });
    this.bgm?.play();

    this.background = this.add.image(this.game.canvas.width / 2, (this.game.canvas.height / 2) - 20, 'menu-background').setOrigin(0.5, 0.5).setAlpha(0);
    this.backgroundScale = (this.game.canvas.width - (this.game.canvas.width / 3)) / this.background.width;
    this.background.setScale(this.backgroundScale * 0.9);
    this.background.setDepth(-1);

    this.logo = this.add.image(this.game.canvas.width / 2, (this.game.canvas.height / 2) - 20, 'logo').setOrigin(0.5, 0.5).setAlpha(0);
    this.logoScale = (this.game.canvas.width - (this.game.canvas.width / 3)) / this.logo.width;
    this.logo.setScale(this.logoScale * 0.95);

    // this.anyKeyText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height - 128, '???', { fontFamily: FontName.REGULAR, fontSize: this.scaled(22), color: '#FFF' } ).setOrigin(0.5, 0.5);
    // if (this.inputController) this.updateAnyKeyText(this.inputController);
    // this.anyKeyText.alpha = 0;

    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      scale: this.logoScale,
      duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    this.tweens.add({
      targets: this.background,
      alpha: 0.5,
      scale: this.backgroundScale,
      duration: duration * 2,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    // this.glowRingFX =  new GlowRingFX(this, 2.0, 1280, 720);
    // const image2 = this.glowRingFX.createShaderImage();
    // image2.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
    // image2.setDisplaySize(this.game.canvas.width, this.game.canvas.width / (16/9));

    if (skipAnimation) {
      this.continueGame();
      return;
    } else {
      this.time.delayedCall(duration / 2, () => {
        this.tweens.add({
          targets: this.menu,
          alpha: 1,
          y: (this.menu?.y ?? 0) - 10,
          duration: duration / 4,
          ease: Phaser.Math.Easing.Quadratic.Out,
          onComplete: () => {
            this.ignoreInputs = false;
          }
        });
      });
    }
  }

  // private updateAnyKeyText (input: InputController): void {
  //   if (!this.anyKeyText) return;
  //   switch(input.activeControllerType) {
  //     case ControllerType.KEYBOARD: this.anyKeyText.text = 'Press Enter to play'.toUpperCase(); break;
  //     case ControllerType.GAMEPAD: this.anyKeyText.text = `Press ${input.getActiveGamepadType() === GamepadType.PLAYSTATIOIN ? 'X' : 'A'} button to play`.toUpperCase(); break;
  //   }
  // }

  public update (time: number, delta: number): void {
    super.update(time, delta);

    // if (this.inputController && this.inputController?.justChangedType) {
    //   this.updateAnyKeyText(this.inputController);
    // }

    if (!this.ignoreInputs) {
      if (this.inputController?.justDown(Action.DOWN)) {
        this.menu?.nextItem();
      } else if (this.inputController?.justDown(Action.UP)) {
        this.menu?.prevItem();
      } else if (this.inputController?.justDown(Action.CONFIRM)) {
        this.menu?.executeAction();
        // this.startGame();
      }
    }
  }
}
