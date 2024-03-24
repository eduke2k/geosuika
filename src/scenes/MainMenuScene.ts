import Phaser from 'phaser'
import { MenuList } from '../models/Menu';
import { Action, ControllerType, InputController } from '../models/Input';
// import LensFlareFX from '../shaders/LensFlareFX';
import PlanetFX from '../shaders/PlanetFX';
import BaseScene from './BaseScene';
import { FontName } from '../types';
import { SFX } from '../models/SFX';
import { Instrument } from '../models/Instrument';
// import GlowRingFX from '../shaders/GlowRingFX';
import { GamepadType } from '../models/GamepadInput';
import ScalePostFX from '../shaders/ScalePostFX';
import { scaleNumberRange } from '../functions/numbers';
import { OPTION_KEYS } from '../const/const';

const skipAnimation = false;

export default class MainMenuScene extends BaseScene {
  // private lensFlareFX: LensFlareFX | undefined;
  private planetFX: PlanetFX | undefined;
  // private glowRingFX: GlowRingFX | undefined;
  private anyKeyText: Phaser.GameObjects.Text | undefined;
  private bgm: Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | undefined;
  private menu: MenuList | undefined;
  private logo: Phaser.GameObjects.Image | undefined;
  private logoScale = 1;
  private state: 'preMenu' | 'menu' = 'preMenu'
  
  // private menuItems: MenuItem[] = [
  //   { label: 'Play', key: 'play' },
  //   { label: 'Controls', key: 'controls' },
  //   { label: 'Options', key: 'options' },
  //   { label: 'Credits', key: 'credits' },
  // ];

	constructor() {
		super({ key: 'main-menu-scene' });
	}

  private handleMenuAction (key: string): void {
    switch (key) {
      case 'play-story': this.startGame(); break;
      case 'play-arcade': this.startGame(); break;
      case 'controls': console.log('implement me'); break;
      case 'options': this.showOptions(); break;
      case 'credits': console.log('implement me'); break;
    }
  }

  private showOptions (): void {
    this.scene.launch('options-scene', this);
  }

  private startGame (): void {
    this.ignoreInputs = true;
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
      ease: Phaser.Math.Easing.Sine.InOut,
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
        this.scene.launch('game-scene').launch('hud-scene').stop();
      }
    })

    this.tweens.addCounter({
      from: (this.planetFX?.getIntensity() ?? 1) + 1,
      to: this.planetFX?.getIntensity(),
      duration,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: (tween) => {
        this.planetFX?.setIntensity(tween.getValue())
      }
    });

  }

  private handleMenuChange (_key: string): void {
    const initial = this.planetFX?.getPlanetSize();
    if (initial) {
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


    const center = this.planetFX?.getCenter();
    if (center) {
      // const initialX = center.x;
      // const initialY = center.y;

      const targetX = Math.random();
      const targetY = Math.random();

      this.planetFX?.setCenter(targetX, targetY);

      console.log(targetX, targetY);

      // this.tweens.addCounter({
      //   from: 0,
      //   to: 1,
      //   duration: 1500,
      //   ease: Phaser.Math.Easing.Quadratic.Out,
      //   onUpdate: (tween) => {
      //     const valX = (initialX ?? 0) + ((targetX - (initialX ?? 0)) * tween.getValue());
      //     const valY = (initialY ?? 0) + ((targetY - (initialY ?? 0)) * tween.getValue());
      //     this.planetFX?.setCenter(valX, valY);
      //   }
      // })
    }
  }

  public showMenu (): void {
    if (this.state !== 'preMenu') return;
    const duration = 3000;
    this.ignoreInputs = true;

    this.logo?.setPostPipeline(ScalePostFX);
    const pipe = this.logo?.getPostPipeline(ScalePostFX) as ScalePostFX;
    if (pipe && pipe instanceof ScalePostFX) {
      pipe.setAmount(0.8);
      pipe.setAlpha(1);
    }

    (this.registry.get('sfx:gong-effect') as SFX | undefined)?.playRandomSFXFromCategory(this, 'deep');
    (this.registry.get('instrument:piano') as Instrument | undefined)?.playRandomNote(this, 0, 1);

    if (this.anyKeyText) {
      this.tweens.add({
        targets: this.anyKeyText,
        alpha: 0,
        duration: duration / 2,
        ease: Phaser.Math.Easing.Quadratic.Out
      });
    }

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
      targets: this.logo,
      alpha: 1,
      scale: this.logoScale,
      y: this.game.canvas.height / 3,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
    });

    this.tweens.addCounter({
      from: this.planetFX?.getPlanetSize() ?? 0,
      to: 0.5,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        this.planetFX?.setPlanetSize(tween.getValue())
      }
    });

    this.tweens.addCounter({
      from: (this.planetFX?.getIntensity() ?? 1) + 2,
      to: this.planetFX?.getIntensity(),
      duration,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: (tween) => {
        this.planetFX?.setIntensity(tween.getValue())
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

  public focus (): void {
    super.focus();
    this.menu?.setAlpha(1);
    this.logo?.setAlpha(1);
  }

  public blur (): void {
    super.blur();
    this.menu?.setAlpha(0);
    this.logo?.setAlpha(0);
  }

	public async create () {
    super.create();

    // this.cameras.main.postFX.addBlur(0, 2, 2, 10, 0xffffff, 2);
    const duration = 2000;

    this.cameras.main.fadeIn(duration);

    this.menu = new MenuList(this, { x: this.game.canvas.width / 2, y: 0, fontSize: this.scaled(28), textColor: '#888', activeTextColor: '#FFF', alignment: 'center' });
    this.menu.addItem({ enabled: true, key: 'play-story', label: 'Play Story' });
    this.menu.addItem({ enabled: true, key: 'play-arcade', label: 'Play Arcades' });
    this.menu.addItem({ enabled: true, key: 'controls', label: 'Controls', padding: 20 });
    this.menu.addItem({ enabled: true, key: 'options', label: 'Options' });
    this.menu.addItem({ enabled: true, key: 'credits', label: 'Credits' });
    this.menu.onActivated = this.handleMenuAction.bind(this);
    this.menu.onChange = this.handleMenuChange.bind(this);
    this.menu.alpha = 0;
    this.menu.y = this.game.canvas.height - this.menu.getBounds().height - this.scaled(64) + this.scaled(10);

    this.anyKeyText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height - 128, '???', { fontFamily: FontName.REGULAR, fontSize: this.scaled(22), color: '#FFF' } ).setOrigin(0.5, 0.5);
    if (this.inputController) this.updateAnyKeyText(this.inputController);
    this.anyKeyText.alpha = 0;

    // Start music
    this.bgm = this.soundManager?.music.add('bgm:menu', { loop: true });
    this.bgm?.play();

    // this.lensFlareFX = new LensFlareFX(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
    // this.lensFlareFX.createShaderImage();

    const postFXResolution = parseFloat(localStorage.getItem(OPTION_KEYS.POSTFX_RESOLUTION) ?? '1');
    this.planetFX = new PlanetFX(this, .3, 1, { x: 0.5, y: 0.5 }, this.game.canvas.width * postFXResolution, this.game.canvas.height * postFXResolution);
    const image = this.planetFX.createShaderImage();
    image.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
    image.setDisplaySize(this.game.canvas.width, this.game.canvas.height);

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

    this.logo = this.add.image(this.game.canvas.width / 2, (this.game.canvas.height / 2) - 20, 'logo').setOrigin(0.5, 0.5).setAlpha(0);
    this.logoScale = (this.game.canvas.width - (this.game.canvas.width / 3)) / this.logo.width;
    this.logo.setScale(this.logoScale * 0.9);

    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      scale: this.logoScale,
      duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    // this.glowRingFX =  new GlowRingFX(this, 2.0, 1280, 720);
    // const image2 = this.glowRingFX.createShaderImage();
    // image2.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
    // image2.setDisplaySize(this.game.canvas.width, this.game.canvas.width / (16/9));

    if (skipAnimation) {
      this.showMenu();
      return;
    } else {
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
    }
  }

  private updateAnyKeyText (input: InputController): void {
    if (!this.anyKeyText) return;
    switch(input.activeControllerType) {
      case ControllerType.KEYBOARD: this.anyKeyText.text = 'Press Enter key'.toUpperCase(); break;
      case ControllerType.GAMEPAD: this.anyKeyText.text = `Press ${input.getActiveGamepadType() === GamepadType.PLAYSTATIOIN ? 'X' : 'A'} button`.toUpperCase(); break;
    }
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);

    if (this.inputController && this.inputController?.justChangedType) {
      this.updateAnyKeyText(this.inputController);
    }

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
