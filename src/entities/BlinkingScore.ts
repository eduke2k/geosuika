import BlinkingText from './BlinkingText';

export default class BlinkingScore extends BlinkingText {
  private score = 0;
  private multiplier = 1;

  public constructor(
    scene: Phaser.Scene,
    score: number,
    multiplier: number,
    x: number,
    y: number
  ) {
    super(scene, score.toString(), x, y, { manualStart: true });

    const fontSize = score + 15;
    this.setMovementY(Math.pow(fontSize / 2, 2));
    this.setFontSize(fontSize);

    this.score = score;
    this.multiplier = multiplier;

    this.start();
  }

  public getScore (): number {
    return this.score;
  }

  public getMultiplier (): number {
    return this.multiplier;
  }
}
