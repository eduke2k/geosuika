import { Instrument } from "../models/Instrument";
import BaseScene from "../scenes/BaseScene";
import { DialogJSON, DialogSceneData } from "../scenes/DialogScene";
import GameScene from "../scenes/GameScene";
import Character from "./Character";
import GameObject from "./GameObject";

export default class InteractableGameObject extends GameObject {
  protected interactable = false;
  protected highlighted = false;
  protected sensor: MatterJS.BodyType | undefined;
  // protected glowTween: Phaser.Tweens.Tween | undefined;
  public portraitKey = 'portrait:fallback';
  public portraitScale = 4;
  public dialog: DialogJSON | undefined;

  public trigger (referenceCharacter: Character): void {
    this.startDialog(referenceCharacter);
  }

  public startDialog (other: InteractableGameObject): void {
    if (!this.dialog) {
      console.log(`cannot start dialog. no dialog object found in interactable game object ${this.constructor.name}`)
      return;
    }
    const sceneData: DialogSceneData = { dialog: this.dialog, left: other, right: this };

		// this.getGameScene().setBokehEffect(2, 1000, Phaser.Math.Easing.Sine.InOut);
    this.getGameScene().setCinematicBar(0.5, 500);
    this.getGameScene().ignoreInputs = true;
    this.scene.scene.launch('dialog-scene', sceneData);
  }

  public isInteractable (): boolean {
    return this.interactable;
  }

  public getScene (): BaseScene {
    return this.scene as BaseScene;
  }

  public getGameScene (): GameScene {
    return this.scene as GameScene;
  }

  public onCollisionStart (_other: Character): void {
    if (this.isInteractable()) {
      this.setVelocityY(-5);
      const sfx = this.scene.registry.get('instrument:musicbox') as Instrument | undefined;
      if (sfx) sfx.playRandomNote(this.getScene(), 0, 0.2);

      const interactablesInRange = this.getGameScene().interactablesInRange;
      const index = interactablesInRange.findIndex((a) => a === this);
      if (index === -1) interactablesInRange.push(this);
      // if (this.glowTween) this.glowTween.stop();
      // if (this.scene) this.glowTween = this.scene.tweens.add({ targets: this.glow, outerStrength: 10, ease: 'sine.inout', duration: 250 });
    }
  }

  public onCollisionEnd (_other?: Character): void {
    console.log('onCollisionEnd', this.name);
    if (this.isInteractable()) {
      const interactablesInRange = this.getGameScene().interactablesInRange;
      const index = interactablesInRange.findIndex((a) => a === this);
      if (index > -1) interactablesInRange.splice(index, 1);
      // if (this.glowTween) this.glowTween.stop();
      // if (this.scene) this.glowTween = this.scene.tweens.add({ targets: this.glow, outerStrength: 0, ease: 'sine.inout', startDelay: 500, duration: 500 });
    }
  }

  public setHighlighted (highlighted: boolean): void {
    this.highlighted = highlighted;
  }

  public destroy (): void {
    // if (this.glowTween) this.glowTween.stop();
    // this.glowTween = undefined;
    if (this.sensor && this.scene) {
      this.onCollisionEnd();
      this.scene.matter.world.remove(this.sensor);
    }
    super.destroy();
  }

  public update (_time: number, _delta: number): void {
    this.flipX = this.direction === -1;

    if (this.sensor && this.body) {
      this.scene.matter.alignBody(this.sensor, this.body.position.x, this.body.position.y, Phaser.Display.Align.CENTER);
    }
  }
}
