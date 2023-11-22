const TOTAL_FLASHING_TIME = 500;

export default class MergeScore extends Phaser.GameObjects.Container {
  private scoreText: Phaser.GameObjects.Text;
  private score = 0;
  private multiplier = 1;
  private currentFlashingDelayTime = TOTAL_FLASHING_TIME / 6;
  private remainingFlashingTime = TOTAL_FLASHING_TIME;
  private flashing = false;
  // private updateEmitter: Phaser.Events.EventEmitter | null = null;

  public constructor(
    scene: Phaser.Scene,
    score: number,
    multiplier: number,
    x: number,
    y: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.score = score;
    this.multiplier = multiplier;

    const fontSize = this.score + 15;

    this.scoreText = this.scene.add.text(0, 0, this.score.toString(), { font: `${fontSize}px Coiny`, align: "center" });
    this.scoreText.setShadow(0, 2, 'black', 2, false, true);

    this.add(this.scoreText);
    this.setX(this.x - (this.scoreText.width / 2));

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', this.update, this);

    this.scene.tweens.add({
      targets: this,
      y: { value: this.getBounds().centerY - (Math.pow(fontSize / 2, 2)), duration: 1000, ease: 'Quad.easeOut' },
      onComplete: () => {
        // this.destroy();
        this.flashing = true;
        this.triggerFlash();
      }
    });
  }

  public getMultiplier (): number {
    return this.multiplier;
  }

  private triggerFlash (): void {
    this.setVisible(!this.visible);
  }

  public update (_time: number, delta: number): void {
    if (this.flashing) {
      if (this.currentFlashingDelayTime <= 0) {
        this.triggerFlash();
        this.currentFlashingDelayTime = this.remainingFlashingTime / 4;
      }

      if (this.remainingFlashingTime <= 0) {
        this.flashing = false;
        this.scene.events.off('update', this.update, this);
        this.destroy();
      }

      this.currentFlashingDelayTime -= delta;
      this.remainingFlashingTime -= delta;
    }
  }
}
