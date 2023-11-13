const BASE_SCORE = 2;
const MULTIPLIER_INCREMENT = 0.1;
const MULTIPLIER_DURATION = 5000;

export default class ScoreLabel extends Phaser.GameObjects.Container {
  private scoreText: Phaser.GameObjects.Text;
  private multiplierLabel: Phaser.GameObjects.Text;
  private multiplierValue: Phaser.GameObjects.Text;
  private score = 0;
  private multiplier = 1;
  private multiplierTime = 0;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number
  ) {
    super(scene, x, y);

    // this.setStatic(true);
    // this.setCollidesWith([]);

    scene.add.existing(this);

    const label = this.scene.add.sprite(0, 0, 'scoreLabel');
    label.play({ key: 'scoreLabel_idle', repeat: -1 });
    this.add(label);
    label.setPosition(label.width / 2, label.height / 2);

    this.scoreText = this.scene.add.text(20, 10, '0', { font: "32px Coiny", align: "left" });
    this.add(this.scoreText);

    this.multiplierLabel = this.scene.add.text(20, 60, 'Multiplier', { font: "16px Coiny", align: "left" });
    this.add(this.multiplierLabel);

    this.multiplierValue = this.scene.add.text(this.multiplierLabel.width + this.multiplierLabel.x + 10, 60, this.multiplier.toString(), { font: "16px Coiny", align: "left" });
    this.add(this.multiplierValue);

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );
  }

  public restart (): void {
    this.score = 0;
    this.multiplier = 1;
    this.multiplierTime = 0;
  }

  private calculateScore (tier: number, multiplier: number): number {
    return BASE_SCORE * tier * multiplier;
  }

  public grantScore (tier: number): { totalScore: number; scoreIncrement: number; currentMultiplier: number } {
    const scoreIncrement = Math.round(this.calculateScore(tier, this.multiplier));
    this.score += this.calculateScore(tier, this.multiplier);
    const currentMultiplier = this.grantMultiplier();

    return {
      totalScore: this.score,
      scoreIncrement,
      currentMultiplier
    }
  }

  private grantMultiplier (): number {
    this.multiplierTime = MULTIPLIER_DURATION;
    this.multiplier += MULTIPLIER_INCREMENT;
    return this.multiplier;
  }

  public resetMultiplier (): void {
    this.multiplierTime = 0;
    this.multiplier = 1;
  }

  public update (_time: number, delta: number): void {
    if (this.multiplierTime > 0) {
      this.multiplierTime -= delta;
      if (this.multiplierTime < 0) this.resetMultiplier();
    }

    this.scoreText.text = Math.round(this.score).toString();
    this.multiplierValue.text = this.multiplier.toFixed(1);
  }
}
