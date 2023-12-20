import Character from "./Character";
import GameObject from "./GameObject";

export default class InteractableGameObject extends GameObject {
  protected interactable = false;
  protected highlighted = false;
  protected glow = this.postFX.addGlow(0xFFFFFF, 0, 0, false, 0.4, 5);
  protected sensor: MatterJS.BodyType | undefined;
  protected glowTween: Phaser.Tweens.Tween | undefined;

  public trigger (_referenceCharacter: Character): void {
    console.log('nothing implemented');
  }

  public isInteractable (): boolean {
    return this.interactable;
  }

  public onCollisionStart (_other: Character): void {
    if (this.isInteractable()) {
      if (this.glowTween) this.glowTween.stop();
      if (this.scene) this.glowTween = this.scene.tweens.add({ targets: this.glow, outerStrength: 10, ease: 'sine.inout', duration: 250 });
    }
  }

  public onCollisionEnd (_other: Character): void {
    if (this.isInteractable()) {
      if (this.glowTween) this.glowTween.stop();
      if (this.scene) this.glowTween = this.scene.tweens.add({ targets: this.glow, outerStrength: 0, ease: 'sine.inout', startDelay: 500, duration: 500 });
    }
  }

  public setHighlighted (highlighted: boolean): void {
    this.highlighted = highlighted;
  }

  public destroy (): void {
    if (this.glowTween) this.glowTween.stop();
    this.glowTween = undefined;
    super.destroy();
  }

  public update (_time: number, _delta: number): void {
    this.flipX = this.direction === -1;

    if (this.sensor && this.body) {
      this.scene.matter.alignBody(this.sensor, this.body.position.x, this.body.position.y, Phaser.Display.Align.CENTER);
    }
  }
}
