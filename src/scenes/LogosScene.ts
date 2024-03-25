import { Action } from '../models/Input';
import { FontName } from '../types';
import BaseScene from './BaseScene';

enum State {
  Init,
  Logo,
  Headphones,
  NextScene
}

const FADE_IN_DELAY = 500;
const FADE_IN_DURATION = 250;
const FADE_OUT_DURATION = 250;
const SHOW_DURATION = 4000;

export default class LogosScene extends BaseScene {
  private state = State.Init;
  private logoContainer: Phaser.GameObjects.Container | undefined;
  private headphonesContainer: Phaser.GameObjects.Container | undefined;
  // private triangleSFX: SFX | undefined;
  private skippableDelayedCall: Phaser.Time.TimerEvent | undefined = undefined;

	constructor() {
		super({ key: 'logos-scene' });
	}

	public async create () {
    super.create();
    this.cameras.main.fade(0);

    // const triangleSFX = this.registry.get('sfx:triangle') as SFX | undefined;
    // if (triangleSFX) this.triangleSFX = triangleSFX;

    const text1 = this.add.text(0, 0, 'a game made with love by', { fontFamily: FontName.LIGHT, fontSize: this.scaled(18), color: '#888' }).setOrigin(0.5, 0);
    const logo = this.add.image(0, text1.displayHeight + this.scaled(28), 'logo-edutastic').setOrigin(0.5, 0);
    const edutasticLogoScaleFactor = this.game.canvas.height / logo.height;
    logo.setScale(edutasticLogoScaleFactor / 4);
    const text2 = this.add.text(0, (logo.getBottomCenter().y ?? 0) + this.scaled(28), 'Edutastic Games', { fontFamily: FontName.LIGHT, fontSize: this.scaled(24), color: '#888' }).setOrigin(0.5, 0);
    this.logoContainer = this.add.container(this.game.canvas.width / 2, 0, [logo, text1, text2]).setAlpha(0)
    this.logoContainer.setY((this.game.canvas.height / 2) - this.logoContainer.getBounds().height / 2);


    // this.edutasticLogo.setPostPipeline(ScalePostFX);
    const headphonesIcon = this.add.image(0, 0, 'icon-headphones').setOrigin(0.5, 0);
    const headphonesIconScaleFactor = this.game.canvas.height / headphonesIcon.height;
    headphonesIcon.setScale(headphonesIconScaleFactor / 3);
    const text3 = this.add.text(0, (headphonesIcon.getBottomCenter().y ?? 0) + this.scaled(28), 'Best experienced with headphones', { fontFamily: FontName.LIGHT, fontSize: this.scaled(24), color: '#888' }).setOrigin(0.5, 0);

    this.headphonesContainer = this.add.container(this.game.canvas.width / 2, 0, [headphonesIcon, text3]).setAlpha(0)
    this.headphonesContainer.setY((this.game.canvas.height / 2) - this.headphonesContainer.getBounds().height / 2);

    this.nextState();
  }

  private nextState (): void {
    this.state++;

    switch(this.state) {
      case State.Logo: this.showLogo(); break;
      case State.Headphones: this.showHeadphones(); break;
      case State.NextScene: this.toNextScene(); break;
      // case State.LogoOut: this.fadeOutLogo(); break;
      // case State.LogoIn: this.HeadphonesIn(); break;
      // case State.LogoActive: this.HeadphonesActive(); break;
      // case State.LogoOut: this.HeadphonesOut(); break;
    }
  }

  private toNextScene (): void {
    this.scene.start('main-menu-scene').remove();
  }

  private showHeadphones (): void {
    this.logoContainer?.setAlpha(0);
    this.headphonesContainer?.setAlpha(1);

    this.cameras.main.fadeIn(FADE_IN_DURATION);
    this.skippableDelayedCall = this.time.delayedCall(SHOW_DURATION, () => {
      this.cameras.main.fadeOut(FADE_OUT_DURATION);
      this.time.delayedCall(FADE_OUT_DURATION, () => {
        this.nextState();
      });
    });
  }

  private showLogo (): void {
    this.logoContainer?.setAlpha(1);
    this.headphonesContainer?.setAlpha(0);

    // const pipe = this.edutasticLogo?.getPostPipeline(ScalePostFX) as ScalePostFX;
    // pipe.setAmount(0.8);
    // pipe.setAlpha(1);

    // this.triangleSFX?.playIndex(this, 1, 0, 1);

    this.time.delayedCall(FADE_IN_DELAY, () => {
      this.cameras.main.fadeIn(FADE_IN_DURATION);
      this.skippableDelayedCall = this.time.delayedCall(SHOW_DURATION, () => {
        this.cameras.main.fadeOut(FADE_OUT_DURATION);
        this.time.delayedCall(FADE_OUT_DURATION, () => {
          this.nextState();
        });
      });
    });
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);

    if (this.inputController?.justDown(Action.CONFIRM)) {
      this.skippableDelayedCall?.callback();
      this.skippableDelayedCall?.remove();
      this.skippableDelayedCall = undefined;
    }
  }
}
