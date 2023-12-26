import BaseScene from "../../scenes/BaseScene";
const PORTRAIT_GAP = 0;

export class Portrait {
  public scene: BaseScene;
  public side: 'left' | 'right';
  public active = false;
  public x: number;
  public y: number;
  public alpha: number;
  public spriteKey: string;
  public portraitSprite: Phaser.GameObjects.Sprite | undefined;

  public constructor(scene: BaseScene, side: 'left' | 'right', spriteKey: string, scale: number) {
    this.scene = scene;
    this.side = side;
    this.x = side === 'left' ? PORTRAIT_GAP : scene.game.canvas.width - PORTRAIT_GAP;
    this.y = scene.game.canvas.height - PORTRAIT_GAP;
    this.alpha = 0;
    this.spriteKey = spriteKey;
    this.portraitSprite = this.scene.add.sprite(this.x, this.y, spriteKey);
    this.portraitSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.portraitSprite.flipX = side === 'right';
    this.portraitSprite.setDisplayOrigin(this.portraitSprite.width / 2, this.portraitSprite.height);
    this.portraitSprite.setScale(scale);
    this.portraitSprite.setX(this.portraitSprite.x + (this.portraitSprite.displayWidth / 2) * (this.side === 'right' ? -1 : 1 ));
    this.portraitSprite.setY(this.portraitSprite.y + this.portraitSprite.displayHeight);
    this.setInactive();
		this.portraitSprite.anims.createFromAseprite(spriteKey);
  }

  public fadeOut (duration = 500, onComplete?: () => void): Portrait {
    this.scene.tweens.add({
      targets: this.portraitSprite,
      alpha: 0,
      y: this.y + (this.portraitSprite?.displayHeight ?? 0),
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
      onComplete
    });
    return this;
  }

  public fadeIn (duration = 500, onComplete?: () => void): Portrait {
    this.scene.tweens.add({
      targets: this.portraitSprite,
      alpha: 1,
      y: this.y,
      duration,
      ease: Phaser.Math.Easing.Sine.InOut,
      onComplete
    });
    return this;
  }

  public setInactive (): Portrait {
    this.active = false;
    this.portraitSprite?.setTint(0x4F4F4F);
    return this;
  }

  public setActive (): Portrait {
    this.active = true;
    this.portraitSprite?.setTint(0xFFFFFF);
    const baseScale = this.portraitSprite?.scale ?? 1;
    this.scene.tweens.add({
      targets: this.portraitSprite,
      scaleX: baseScale - (0.1 * baseScale),
      scaleY: baseScale + (0.1 * baseScale),
      yoyo: true,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: 250
    })
    return this;
  }

  public destroy (): void {
    this.portraitSprite?.destroy();
    this.portraitSprite = undefined;
  }
}