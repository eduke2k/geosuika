import { Depths } from "../const/depths";

export type HoverTextOptions = {
  fontSize?: number;
  duration?: number;
  movementY?: number;
  rotation?: number;
  depth?: number;
}

export default class HoverText extends Phaser.GameObjects.Container {
  private textField: Phaser.GameObjects.Text;
  private text = '';
  private duration = 2000;
  private movementY = 0;
  private startY;

  public constructor(
    scene: Phaser.Scene,
    text: string,
    x: number,
    y: number,
    options?: HoverTextOptions,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.text = text;
    this.startY = y;
    if (options) {
      if (options.duration !== undefined) this.duration = options.duration;
      if (options.movementY !== undefined) this.movementY = options.movementY;
      if (options.rotation !== undefined) this.rotation = options.rotation;
    }
    this.setDepth(options?.depth ?? Depths.TEXT_LAYER);

    this.textField = this.scene.add.text(0, 0, this.text, { align: "center" }).setOrigin(0.5, 0.5);
    this.textField.setFontFamily('Coiny');
    this.textField.setFontSize(`${options?.fontSize ?? 12}px`);
    this.textField.setShadow(0, 2, 'black', 2, false, true);
    this.textField.alpha = 0;

    this.add(this.textField);
    this.setX(this.x);
    this.setY(this.y);

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', this.update, this);
  }

  public setText (text: string): void {
    this.textField.setText(text);
  }

  public setFontSize (size: number): void {
    this.textField.setFontSize(size);
  }

  public setMovementY (movementY: number): void {
    this.movementY = movementY;
  }

  public start (): void {
    this.setY(this.startY + this.movementY);
    this.scene.tweens.add({
      targets: this.textField,
      alpha: { value: 1, duration: this.duration, ease: 'Quad.easeOut' }
    });

    this.scene.tweens.add({
      targets: this,
      y: { value: this.startY, duration: this.duration, ease: 'Quad.easeOut' }
    });
  }

  public end (): void {
    this.setY(this.startY);
    this.scene.tweens.add({
      targets: this.textField,
      alpha: { value: 0, duration: this.duration, ease: 'Quad.easeOut' }
    });

    this.scene.tweens.add({
      targets: this,
      y: { value: this.y - this.movementY, duration: this.duration, ease: 'Quad.easeOut' }
    });
  }
}
