import { LocalStorage } from "../../models/LocalStorage";
import BaseScene from "../../scenes/BaseScene";
import { FontName } from "../../types";
import Arcade from "../Arcade";

const PADDING_X = 36;
const PADDING_Y = 20;
const GAP = 3;
const HEADLINE_SIZE = 86;
const PROGRESS_SIZE = 24;
const HIGHSCORE_LABEL_SIZE = 14;
const HIGHSCORE_VALUE_SIZE = 24;
const FLASHING_DURATION = 600;

export class ArcadeInfo {
  private visible = false;
  private graphics: Phaser.GameObjects.Graphics;
  private headline: Phaser.GameObjects.Text;
  private progressLabel: Phaser.GameObjects.Text;
  private progressValue: Phaser.GameObjects.Text;
  private allTimeHighscoreLabel: Phaser.GameObjects.Text;
  private allTimeHighscoreValue: Phaser.GameObjects.Text;
  private fading = false;
  private currentFlashingDelayTime = FLASHING_DURATION / 6;
  private remainingFlashingTime = FLASHING_DURATION;
  public arcade: Arcade;
  private scene: BaseScene;
  private container: Phaser.GameObjects.Container;

  public constructor (scene: BaseScene, arcade: Arcade) {
    this.arcade = arcade;
    this.scene = scene;

    this.headline = this.scene.add.text(this.scene.scaled(PADDING_X / 2), this.scene.scaled(PADDING_Y / 2), arcade.linkedBucket?.getBGMConfig()?.title.toUpperCase() ?? 'Unknown Memory'.toUpperCase(), { fontFamily: FontName.LIGHT, fontSize: this.scene.scaled(HEADLINE_SIZE), color: 'white' });
    this.progressLabel = this.scene.add.text(this.scene.scaled((PADDING_X / 2) + 5), this.headline.height, 'Progress:', { fontFamily: FontName.REGULAR, fontSize: this.scene.scaled(24), color: 'grey' });
    this.progressValue = this.scene.add.text((this.progressLabel.getTopRight().x ?? 0) + this.scene.scaled(16), this.progressLabel.getTopRight().y ?? 0, '0%', { fontFamily: FontName.BOLD, fontSize: this.scene.scaled(PROGRESS_SIZE), color: 'red' });

    this.graphics = this.scene.add.graphics();
    this.graphics.fillStyle(0x000000, 1);

    const firstBoxHeight = (this.progressValue.getBottomLeft().y ?? 0) + this.scene.scaled(PADDING_Y);

		this.graphics.fillRect(0, 0, this.headline.width + this.scene.scaled(PADDING_X), firstBoxHeight);



    const secondBoxStartY = firstBoxHeight + this.scene.scaled(GAP);
    const highscore = LocalStorage.getHighscore(this.arcade.linkedBucket?.name ?? '')
    const highscoreText = highscore > 0 ? `${highscore.toString()}` : 'No Highscore';
    this.allTimeHighscoreLabel = this.scene.add.text(this.scene.scaled((PADDING_X / 2) + 5), secondBoxStartY + this.scene.scaled(PADDING_Y / 2), 'All time best'.toUpperCase(), { fontFamily: FontName.BOLD, fontSize: this.scene.scaled(HIGHSCORE_LABEL_SIZE), color: 'grey' });
    this.allTimeHighscoreValue = this.scene.add.text(this.scene.scaled((PADDING_X / 2) + 5), this.allTimeHighscoreLabel.getBottomLeft().y ?? 0, highscoreText, { fontFamily: FontName.BOLD, fontSize: this.scene.scaled(HIGHSCORE_VALUE_SIZE), color: 'white' });

    this.graphics.fillRect(0, secondBoxStartY, this.headline.width + this.scene.scaled(PADDING_X), ((this.allTimeHighscoreValue.getBottomCenter().y ?? 0) - (this.allTimeHighscoreLabel.getTopCenter().y ?? 0)) + this.scene.scaled(PADDING_Y));
    this.scene.add.existing(this.headline);

    this.container = this.scene.add.container(0, 0, [this.graphics, this.headline, this.progressLabel, this.progressValue, this.allTimeHighscoreLabel, this.allTimeHighscoreValue]);
    this.container.setPosition((this.scene.game.canvas.width / 2) - (this.container.getBounds().width / 2), this.scene.scaled(48))
    
    this.setVisible(false);
  }

  public show (): void {
    this.fading = false;
    this.setVisible(true);
    this.currentFlashingDelayTime = FLASHING_DURATION / 6;
    this.remainingFlashingTime = FLASHING_DURATION;
  }

  public hide (): void {
    this.fading = true;
  }

  private setVisible (value: boolean): void {
    this.visible = value;
    if (value) {
      this.container.alpha = 1;
    } else {
      this.container.alpha = 0;
    }
  }

  private triggerFlash (): void {
    this.setVisible(!this.visible);
  }

  public update (_time: number, delta: number): void {
    if (this.fading) {
      if (this.currentFlashingDelayTime <= 0) {
        this.triggerFlash();
        this.currentFlashingDelayTime = this.remainingFlashingTime / 4;
      }

      if (this.remainingFlashingTime <= 0) {
        this.fading = false;
        this.setVisible(false);
      }

      this.currentFlashingDelayTime -= delta;
      this.remainingFlashingTime -= delta;
    }
  }
}