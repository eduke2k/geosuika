import { Portrait } from '../entities/Dialog/Portrait';
import InteractableGameObject from '../entities/InteractableGameObject';
import { Action } from '../models/Input';
import { FontName } from '../types';
import BaseScene from './BaseScene';
import GameScene from './GameScene';

// const DIALOG_BOX_HEIGHT = 800;
// const FADE_IN_DURATION = 500;
const DIALOG_TEXT_MARGIN = -64;

export type DialogEntryJSON = {
  side: 'left' | 'right',
  text: string[];
  end?: true;
}
export type DialogJSON = Record<string, DialogEntryJSON[]>

export type DialogSceneData = {
  left: InteractableGameObject,
  right: InteractableGameObject
  dialog: DialogJSON;
}

export class DialogScene extends BaseScene {
  private dialog: DialogJSON | undefined;
  private left: InteractableGameObject | undefined;
  private leftPortrait: Portrait | undefined;
  private right: InteractableGameObject | undefined;
  private rightPortrait: Portrait | undefined;
  private treePointer = '';
  private currentTree: DialogEntryJSON[] | undefined;
  private branchPointer = -1;
  private twigPointer = -1;
  // private gradient: Phaser.GameObjects.Graphics | undefined;

  private nameText: Phaser.GameObjects.Text | undefined;
  private dialogText:  Phaser.GameObjects.Text | undefined;

	constructor() {
		super({ key: 'dialog-scene' })
	}

	public async create () {
    super.create();
    // this.gradient = this.add.graphics();
    // this.gradient.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 1, 1);
    // this.gradient.fillRect(0, this.game.canvas.height - DIALOG_BOX_HEIGHT, this.game.canvas.width, DIALOG_BOX_HEIGHT);
    // this.gradient.y = DIALOG_BOX_HEIGHT;

    // this.tweens.add({
    //   targets: this.gradient,
    //   y: 0,
    //   ease: Phaser.Math.Easing.Quadratic.Out,
    //   duration: FADE_IN_DURATION
    // });

    this.leftPortrait = new Portrait(this, 'left', this.left?.portraitKey ?? 'portrait.fallback', this.left?.portraitScale ?? 4);
    this.rightPortrait = new Portrait(this, 'right', this.right?.portraitKey ?? 'portrait.fallback', this.right?.portraitScale ?? 4)

    this.leftPortrait.fadeIn(750);
    this.rightPortrait.fadeIn(750);

    this.time.delayedCall(500, () => {
      this.startDialog();
    })
  }

  private startDialog (pointer?: string): void {
    if (!this.dialog) return;
    this.treePointer = pointer ?? Object.keys(this.dialog)[0];
    this.currentTree = this.dialog[this.treePointer];
    this.showNextBranchInCurrentTree();
  }

  private closeDialog (): void {
    this.leftPortrait?.fadeOut(750);
    this.rightPortrait?.fadeOut(750);
    this.ignoreInputs = true;

    const gameScene: GameScene | undefined = this.scene.get('game-scene') as GameScene | undefined;
    if (!gameScene) return;
    gameScene.setCinematicBar(0, 500);
    gameScene.ignoreInputs = false;
  }

  public showNextBranchInCurrentTree (): void {
    if (!this.dialog || !this.currentTree) return;
    this.twigPointer = -1;
    this.branchPointer++;
    const currentBranch = this.currentTree[this.branchPointer];
    console.log('showNextBranchInCurrentTree current branch', currentBranch);

    if (!currentBranch) {
      this.closeDialog();
    } else {
      if (currentBranch.side === 'left' && !this.leftPortrait?.active) {
        this.rightPortrait?.setInactive();
        this.leftPortrait?.setActive();
      } else if (currentBranch.side === 'right' && !this.rightPortrait?.active) {
        this.leftPortrait?.setInactive();
        this.rightPortrait?.setActive();
      }

      this.showNextTwigInBranch(currentBranch);
    }
  }

  public showNextTwigInBranch (branch: DialogEntryJSON): void {
    this.twigPointer++;
    const currentName = branch.side === 'left' ? this.left?.name ?? '???' : this.right?.name ?? '???';
    const currentText = branch.text[this.twigPointer];

    console.log('showNextTwigInBranch current currentName', currentName);
    console.log('showNextTwigInBranch current currentText', currentText);

    if (!currentText) {
      this.showNextBranchInCurrentTree();
    } else {
      this.nameText = this.add.text(
        branch.side === 'left' ? (this.leftPortrait?.portraitSprite?.displayWidth ?? 0) + DIALOG_TEXT_MARGIN : this.game.canvas.width - (this.rightPortrait?.portraitSprite?.displayWidth ?? 0) + DIALOG_TEXT_MARGIN,
        this.game.canvas.height - 225,
        `${currentName}`,
        { fontFamily: FontName.BOLD, fontSize: 36, color: 'white' }
      ).setOrigin(branch.side === 'left' ? 0 : 1, 0);
      
      this.dialogText = this.add.text(
        (this.leftPortrait?.portraitSprite?.displayWidth ?? 0) + DIALOG_TEXT_MARGIN,
        this.game.canvas.height - 150,
        `${currentText}`,
        { fontFamily: FontName.REGULAR, fontSize: 24, color: 'white' }
      ).setOrigin(0,0);
    }
  }

  public init (data: DialogSceneData)  {
    this.dialog = data.dialog;
    this.left = data.left;
    this.right = data.right;
  }

  private canContinue (): boolean {
    return true;
  }

  private destroyTextFields (): void {
    this.nameText?.destroy();
    this.dialogText?.destroy();
    this.nameText = undefined;
    this.dialogText = undefined;

  }

  public continue (): void {
    if (!this.currentTree) return;
    this.destroyTextFields();
    const currentBranch = this.currentTree[this.branchPointer];
    this.showNextTwigInBranch(currentBranch);
  }

  public update (time: number, delta: number): void {
    super.update(time, delta);

    if (this.canContinue() && this.inputController?.justDown(Action.CONFIRM)) {
      this.continue();
    }
  }
}