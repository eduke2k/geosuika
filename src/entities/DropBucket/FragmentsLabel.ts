import { BackgroundMusicConfig } from "../../models/BackgroundMusic";
import { FontName } from "../../types";

export default class FragmentsLabel extends Phaser.GameObjects.Container {
  private bgmConfig?: BackgroundMusicConfig;
  private overlineText: Phaser.GameObjects.Text;
  private mainText: Phaser.GameObjects.Text;
  private maxFragements: number;
  private unlocked = 0;
  private totalScore = 0;
  private targetScore = 0;
  private bar: Phaser.GameObjects.Graphics;

  public constructor(
    scene: Phaser.Scene,
    bgmConfig: BackgroundMusicConfig | undefined,
    targetScore: number,
    x: number,
    y: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.maxFragements = bgmConfig?.audioKeys.length ?? 0;
    this.targetScore = targetScore;
    this.bgmConfig = bgmConfig;

    this.overlineText = this.scene.add.text(0, 0, 'Unlocked Song fragments', { fontFamily: FontName.REGULAR, fontSize: '16px', align: "left" });
    this.add(this.overlineText);

    this.bar = this.scene.add.graphics();
    this.add(this.bar);
    
    this.mainText = this.scene.add.text(0, this.overlineText.height, '', { fontFamily: FontName.REGULAR, fontSize: '22px', align: "left" });
    this.updateText();
    this.add(this.mainText);
  }

  public updateBarPercentage (percentage: number): void {
    this.bar.clear();
    this.bar.fillStyle(0x3d1a31, 1);
		this.bar.fillRect(this.mainText.x, this.mainText.y, this.overlineText.width * percentage, this.mainText.height);
  }

  public rankUp (): void {
    this.unlocked++;
    this.updateText();
  }

  public updateScore (score: number): void {
    this.totalScore = score;
    const absoluteScoreRatio = this.totalScore / this.targetScore;
    const scoreTargets = this.getCurrentBGMProgressLevel(absoluteScoreRatio);
    const relativeScoreInKey = (this.totalScore - scoreTargets.startingScore) / (scoreTargets.targetScore - scoreTargets.startingScore);
    this.updateBarPercentage(relativeScoreInKey);
  }

  private updateText (): void {
    this.mainText.text = `${this.unlocked} / ${this.maxFragements}`;
  }

  private getCurrentBGMProgressLevel (scoreRatio: number): { startingScore: number, targetScore: number} {
    if (!this.bgmConfig) return { startingScore: 0, targetScore: 0 };
    
    let currentKeyIndex = 0;
    this.bgmConfig.audioKeys.forEach((k, i) => {
      if (scoreRatio > k.minScoreRatio) {
        currentKeyIndex = i + 1;
      }
    });

    const currentKey = this.bgmConfig.audioKeys[currentKeyIndex];
    const lastKey = this.bgmConfig.audioKeys[currentKeyIndex - 1];

    return {
      startingScore: lastKey ? lastKey.minScoreRatio * this.targetScore : 0,
      targetScore: currentKey ? currentKey.minScoreRatio * this.targetScore : 0
    };
  }
}
