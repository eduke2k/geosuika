import Phaser from 'phaser'
import { SoundManager } from '../models/SoundManager';
import { InputController } from '../models/Input';

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

  public update (_time: number, _delta: number): void {
    if (!this.ignoreInputs) {
      this.inputController?.update();
    }
  }
}
