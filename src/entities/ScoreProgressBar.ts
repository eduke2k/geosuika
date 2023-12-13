const SCORE_BAR_WIDTH = 24;

export default class ScoreProgressBar extends Phaser.GameObjects.Container {
  private scoreProgressBackground: Phaser.GameObjects.NineSlice;
  private scoreProgressForeground: Phaser.GameObjects.Rectangle;
  // private scoreProgressForegroundMask: Phaser.GameObjects.NineSlice;
  private scoreProgressBarHeight = 0;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bucketHeight: number,
    bucketThickness: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.depth = 1;

    this.scoreProgressBarHeight = bucketHeight - (bucketThickness - SCORE_BAR_WIDTH);

    this.scoreProgressBackground = this.scene.add.nineslice(0, this.scoreProgressBarHeight / 2, 'bar', 'bar:bg', SCORE_BAR_WIDTH, this.scoreProgressBarHeight, 14, 14, 14, 14);
    this.scoreProgressBackground.setOrigin(0.5, 1)
    this.add(this.scoreProgressBackground);

    // this.scoreProgressForeground = this.scene.add.nineslice(0, this.scoreProgressBarHeight / 2, 'bar', 'bar:fill', SCORE_BAR_WIDTH, this.scoreProgressBarHeight, 14, 14, 14, 14);
    // this.scoreProgressForeground.setOrigin(0.5, 1);
    // this.add(this.scoreProgressForeground);

    this.scoreProgressForeground = this.scene.add.rectangle(0, (this.scoreProgressBarHeight - 12) / 2, SCORE_BAR_WIDTH - 12, this.scoreProgressBarHeight - 12, 0xFFFFFF);
    this.scoreProgressForeground.setOrigin(0.5, 1);
    this.add(this.scoreProgressForeground);

    // this.scoreProgressForegroundMask = this.scene.make.nineslice({ x: 0, y: this.scoreProgressBarHeight / 2, key: 'bar', frame: 'bar:fill:mask', add: false, width: SCORE_BAR_WIDTH, height: this.scoreProgressBarHeight, leftWidth: 14, rightWidth: 14, topHeight: 14, bottomHeight: 14 });
    // this.scoreProgressForegroundMask.setOrigin(0.5, 1);
    // const mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.scoreProgressForegroundMask);
    // mask.invertAlpha = true;
    // this.scoreProgressForeground.setMask(mask);

    // Call internal update function if scene updates. Extended classes not update automatically
    // scene.events.on('update', (time: number, delta: number) => { this.update(time, delta)} );

    this.setProgress(0);
  }

  public setProgress (progress: number): void {
    this.scene.tweens.add({
      targets: this.scoreProgressForeground,
      scaleY: Math.min(1, progress),
      duration: 500,
      ease: 'sine.out',
    });
  }

  public destroy (): void {
    this.scoreProgressBackground.destroy();
    this.scoreProgressForeground.destroy();
    super.destroy();
  }
}
