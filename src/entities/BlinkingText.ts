import { Depths } from "../const/depths";
import { getRelativePositionToCanvas } from "../functions/helper";
import { FontName } from "../types";
import GameObject from "./GameObject";

export type Alignment = 'top-center' | 'bottom-center' | 'center';

export type BlinkingTextOptions = {
  fontFamily?: FontName;
  fontSize?: number;
  duration?: number;
  flashingDuration?: number;
  movementY?: number;
  fadeInTime?: number;
  rotation?: number;
  depth?: number;
  manualStart?: boolean;
  manualEnd?: boolean;
  referenceObject?: GameObject;
  referenceObjectAlignment?: Alignment;
  updateReferencePosition?: boolean;
}

export default class BlinkingText extends Phaser.GameObjects.Container {
  private scoreText: Phaser.GameObjects.Text;
  private text = '';
  // private fontSize = 16;
  private duration = 2000;
  private flashingDuration = 500;
  private movementY = 50;
  private fadeInTime = 500;
  private currentFlashingDelayTime = this.flashingDuration / 6;
  private remainingFlashingTime = this.flashingDuration;
  private flashing = false;
  private manualEnd = false;
  private referenceObject: GameObject | undefined;
  private referenceObjectAlignment: Alignment;
  private updateReferencePosition: boolean;
  private referencePosition: Phaser.Types.Math.Vector2Like;
  // private updateEmitter: Phaser.Events.EventEmitter | null = null;

  public constructor(
    scene: Phaser.Scene,
    text: string,
    x: number,
    y: number,
    options?: BlinkingTextOptions,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.text = text;
    if (options) {
      if (options.flashingDuration !== undefined) this.flashingDuration = options.flashingDuration;
      if (options.duration !== undefined) this.duration = options.duration;
      if (options.flashingDuration !== undefined) this.flashingDuration = options.flashingDuration;
      if (options.movementY !== undefined) this.movementY = options.movementY;
      if (options.fadeInTime !== undefined) this.fadeInTime = options.fadeInTime;
      if (options.rotation !== undefined) this.rotation = options.rotation;
      if (options.manualEnd) this.manualEnd = options.manualEnd;
      if (options.referenceObject) this.referenceObject = options.referenceObject;
    }

    this.referenceObjectAlignment = options?.referenceObjectAlignment ? options.referenceObjectAlignment : 'center';
    this.updateReferencePosition = options?.updateReferencePosition ?? false;
    this.referencePosition = this.referenceObject ? this.getReferencePosition(this.referenceObject, this.referenceObjectAlignment) : { x: 0, y: 0 };

    this.setDepth(options?.depth ?? Depths.TEXT_LAYER);

    this.scoreText = this.scene.add.text(0, 0, this.text, { align: "center" }).setOrigin(0.5, 0.5);
    this.scoreText.setFontFamily(options?.fontFamily ?? FontName.BOLD);
    this.scoreText.setFontSize(`${options?.fontSize ?? 12}px`);
    this.scoreText.setShadow(0, 2, 'black', 2, false, true);
    this.scoreText.alpha = 0;

    this.add(this.scoreText);
    this.setPosition(this.x + (this.referencePosition.x ?? 0), this.y + (this.referencePosition.y ?? 0));

    console.log(this.x + (this.referencePosition.x ?? 0));
    console.log(this.y + (this.referencePosition.y ?? 0));

    if (!options || !options.manualStart) {
      this.start();
    }

    // Call internal update function if scene updates. Extended classes not update automatically
    scene.events.on('update', this.update, this);
  }

  public setText (text: string): void {
    this.scoreText.setText(text);
  }

  public setFontSize (size: number): void {
    this.scoreText.setFontSize(size);
  }

  public setMovementY (movementY: number): void {
    this.movementY = movementY;
  }

  public start (): void {
    this.scene.tweens.add({
      targets: this.scoreText,
      alpha: { value: 1, duration: this.fadeInTime, ease: 'Quad.easeOut' }
    });

    this.scene.tweens.add({
      targets: this.scoreText,
      y: { value: -this.movementY, duration: this.duration, ease: 'Quad.easeOut' },
      onComplete: () => {
        if (!this.manualEnd) {
          this.end();
        }
      }
    });
  }

  public end (): void {
    this.flashing = true;
    this.triggerFlash();
  }

  private triggerFlash (): void {
    this.setVisible(!this.visible);
  }

  private getReferencePosition (obj: GameObject, alignment: Alignment): Phaser.Types.Math.Vector2Like {
    let pos: Phaser.Types.Math.Vector2Like;
    switch (alignment) {
      case 'center': pos = obj.getCenter(); break;
      case 'top-center': pos = obj.getTopCenter(); break;
      case 'bottom-center': pos = obj.getBottomCenter(); break;
    }

    return getRelativePositionToCanvas({ x: pos.x ?? 0, y:pos.y ?? 0 }, obj.scene.cameras.main);
  }

  public update (_time: number, delta: number): void {
    if (this.updateReferencePosition && this.referenceObject) {
      const pos = this.getReferencePosition(this.referenceObject, this.referenceObjectAlignment);
      this.setPosition(pos.x, pos.y);
    }

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
