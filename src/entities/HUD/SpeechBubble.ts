import { getRelativePositionToCanvas } from "../../functions/helper";
import { SFX } from "../../models/SFX";
import BaseScene from "../../scenes/BaseScene";
import GameScene from "../../scenes/GameScene";
import { FontName } from "../../types";
import GameObject from "../GameObject";

const TEXT_REVEAL_DELAY = 50;
const COMPLETE_TEXT_ALIVE_TIME = 3000;
const BUBBLE_PADDING_X = 10;
const BUBBLE_PADDING_Y = 5;
const BUBBLE_MARGIN_Y = -20;
const MAX_WIDTH = 200

export class SpeechBubble extends Phaser.GameObjects.Container {
  public scene: BaseScene;
  private sfx: SFX | undefined;
  private graphics: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private targetTexts: string[] = [];
  private targetTextIndex = 0;
  private isShowing = false;
  private referenceObject: GameObject | undefined; 
  private currentCharacterIndex = 0;
  private nextCharacterTimerEvent: Phaser.Time.TimerEvent | undefined;
  private hideBubbleTimerEvent: Phaser.Time.TimerEvent | undefined;

  public constructor (scene: BaseScene) {
    super(scene, 0, 0);
    this.scene = scene;

    this.sfx = scene.registry.get('sfx:taiko') as SFX | undefined;

    this.graphics = this.scene.add.graphics();
    this.text = this.scene.add.text(0, 0, '', { fontFamily: FontName.REGULAR, fontSize: this.scene.scaled(24), wordWrap: { width: this.scene.scaled(MAX_WIDTH), useAdvancedWrap: true }, color: 'white' });

    this.add([
      this.graphics,
      this.text
    ]);

    this.scene.add.existing(this);
    // this.setVisible(false);
  }

  public triggerTextIndex (index: number): void {
    this.targetTextIndex = index;
    this.currentCharacterIndex = 0;
    this.text.text = '';
    // Start iteration
    this.revealNextCharacter();
  }

  public trigger (reference: GameObject, text: string): void {
    this.graphics.clear();

    if (this.nextCharacterTimerEvent) { this.nextCharacterTimerEvent.destroy(); this.nextCharacterTimerEvent = undefined; }
    if (this.hideBubbleTimerEvent) { this.hideBubbleTimerEvent.destroy(); this.hideBubbleTimerEvent = undefined; }

    this.referenceObject = reference;
    this.isShowing = true;
    this.targetTextIndex = 0;
    this.targetTexts = text.split('\n');
    this.setVisible(true);
    this.triggerTextIndex(this.targetTextIndex);
  }

  public hide (): void {
    this.setVisible(false);
  }

  private getReferencePosition (obj: GameObject, left?: boolean): Phaser.Types.Math.Vector2Like {
    const pos = left ? obj.getTopLeft() : obj.getTopRight();
    return getRelativePositionToCanvas({ x: pos.x ?? 0, y:pos.y ?? 0 }, obj.scene.cameras.main);
  }

  private revealNextCharacter (): void {
    // console.log('revealing index', this.currentCharacterIndex);
    const nextChar = this.targetTexts[this.targetTextIndex].charAt(this.currentCharacterIndex);
    // console.log('nextChar', nextChar);
    if (nextChar) this.text.text = this.text.text + nextChar;

    this.sfx?.playRandomSFXFromCategory(this.scene as GameScene, 'small');

    this.currentCharacterIndex++;

    if ((this.currentCharacterIndex + 1) <= this.targetTexts[this.targetTextIndex].length) {
      const delayMultiplier = ['.', '!'].includes(nextChar) ? 4 : 1;
      this.nextCharacterTimerEvent = this.scene.time.delayedCall(TEXT_REVEAL_DELAY * delayMultiplier, () => {
        this.revealNextCharacter();
      });
    } else {
      this.hideBubbleTimerEvent = this.scene.time.delayedCall(COMPLETE_TEXT_ALIVE_TIME, () => {

        if (this.targetTextIndex + 1 === this.targetTexts.length) {
          this.isShowing = false;
          this.setVisible(false);
        } else {
          this.triggerTextIndex(this.targetTextIndex + 1);
        }
      });
    }
  }

  public update (_time: number, _delta: number): void {
    if (!this.isShowing) return;
    let rightSide = true;

    // Reposition bubble
    if (this.referenceObject) {
      let pos = this.getReferencePosition(this.referenceObject);
      rightSide = (pos.x ?? 0) + this.scene.scaled(MAX_WIDTH) < this.scene.game.canvas.width;

      if (!rightSide) pos = this.getReferencePosition(this.referenceObject, true);
      this.setPosition((pos.x ?? 0) - (rightSide ? 0 : this.text.width), (pos.y ?? 0) - this.scene.scaled(BUBBLE_MARGIN_Y) - this.text.height);
    }

    // Draw bubble background
    const paddingX = this.scene.scaled(BUBBLE_PADDING_X);
    const paddingY = this.scene.scaled(BUBBLE_PADDING_Y);

    this.graphics.clear();
    this.graphics.fillStyle(0x1a1a1a, 1);
		this.graphics.fillRoundedRect(0 - paddingX, 0 - paddingY, this.text.width + (paddingX * 2), this.text.height + (paddingY * 2), this.scene.scaled(4));

    
    const relativeX = rightSide ? (0 - paddingX + this.scene.scaled(10)) : (this.text.width - paddingX + this.scene.scaled(10));
    const relativeY = (0 - paddingY + this.text.height + (paddingY * 2));

    this.graphics.beginPath();
    this.graphics.moveTo(relativeX, relativeY);

    if (rightSide) {
      this.graphics.lineTo(relativeX + this.scene.scaled(15), relativeY);
      this.graphics.lineTo(relativeX, relativeY + this.scene.scaled(15));
    } else {
      this.graphics.lineTo(relativeX - this.scene.scaled(15), relativeY);
      this.graphics.lineTo(relativeX, relativeY + this.scene.scaled(15));
    }
    this.graphics.closePath();
    this.graphics.fillPath();
  }
}