import Phaser from 'phaser'
import { SoundManager } from '../models/SoundManager';
import { InputController } from '../models/Input';
import { NATIVE_HEIGHT } from '../const/const';

export default class BaseScene extends Phaser.Scene {
  public soundManager: SoundManager | undefined;
  public inputController: InputController | undefined;
  public ignoreInputs = false;

	constructor(config?: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
		super(config);
	}

	public create () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.soundManager = new SoundManager(this.game.sound, this.game.music);
    this.inputController = this.registry.get('input-controller');
  }

  public blur (): void {
    this.ignoreInputs = true;
  }

  public focus (): void {
    this.ignoreInputs = false;
  }

  public scaled (baseSize: number): number {
    const ratio = this.game.canvas.height / NATIVE_HEIGHT;
    return baseSize * ratio;
  }

  public update (time: number, delta: number): void {
    if (!this.ignoreInputs) {
      this.inputController?.update(time, delta);
    }
  }
}
