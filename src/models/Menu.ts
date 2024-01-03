import BaseScene from "../scenes/BaseScene";
import { FontName } from "../types";
import { SFX } from "./SFX";

export enum MenuAlignment { LEFT, CENTER, RIGHT }

export type MenuItemParams = {
  key: string;
  label: string;
  enabled: boolean;
};

export class MenuItem {
  public parent: MenuList;
  public text: Phaser.GameObjects.Text;
  public key: string;
  public enabled: boolean = true;
  public focused: boolean;
  public pipeline: Phaser.FX.Blur | undefined

  public constructor(parent: MenuList, x: number, y: number, options: MenuItemParams) {
    this.parent = parent;
    this.key = options.key;
    this.focused = false;
    this.text = parent.scene.add.text(x, y, options.label, { fontFamily: FontName.REGULAR, fontSize: parent.fontSize, color: parent.textColor, align: "center" });
    
    switch (this.parent.alignment) {
      case 'center': this.text.setOrigin(0.5, 0); break;
      case 'left': this.text.setOrigin(0, 0); break;
      case 'right': this.text.setOrigin(1, 0); break;
    }
    parent.add(this.text);
  }

  public focus (): void {
    this.text.setColor(this.parent.activeTextColor);
    if (!this.pipeline) this.pipeline = this.text.postFX.addBlur(0, 1, 0, 1, 0xFFFFFF, 16);
    else this.pipeline.strength = 1;

    this.parent.scene.tweens.add({
      targets: this.pipeline,
      strength: 0,
      duration: 250,
      ease: Phaser.Math.Easing.Quadratic.Out
    })

    this.focused = true;
  }

  public blur (): void {
    this.text.setColor(this.parent.textColor);
    this.focused = false;
  }
}

export type SliderMenuItemParams = MenuItemParams & {
  initialValue: number;
  minValue: number;
  maxValue: number;
  increment: number;
  onUpdate: (value: string | number) => void;
};

export class SliderMenuItem extends MenuItem {
  private value: number;
  private valueText: Phaser.GameObjects.Text;
  private minValue: number;
  private maxValue: number;
  private increment: number;
  private onUpdate: (value: number | string) => void;

  public constructor(parent: MenuList, x: number, y: number, params: SliderMenuItemParams) {
    super(parent, x, y, params);
    this.value = params.initialValue;
    this.minValue = params.minValue;
    this.maxValue = params.maxValue;
    this.increment = params.increment;
    this.onUpdate = params.onUpdate;

    this.valueText = parent.scene.add.text(x + 500, y, this.value.toString(), { fontFamily: FontName.REGULAR, fontSize: parent.fontSize, color: parent.textColor, align: "center" }).setOrigin(1, 0);
    this.parent.add(this.valueText);
  }

  public getValue (): number {
    return this.value;
  }

  public setValue (value: number): void {
    this.value = Math.min(this.maxValue, Math.max(this.minValue, value));
    this.valueText.setText(this.value.toString());
    this.onUpdate(this.value);
  }

  public increaseValue (): void {
    this.setValue(this.value + this.increment);
  }

  public decreaseValue (): void {
    this.setValue(this.value - this.increment);
  }

  public focus (): void {
    super.focus();
    this.valueText.setColor(this.parent.activeTextColor);
  }

  public blur (): void {
    super.blur();
    this.valueText.setColor(this.parent.textColor);
  }
}

export type MenuOptions = {
  x: number;
  y: number;
  fontSize: number;
  textColor: string;
  activeTextColor: string;
  alignment: 'left' | 'center' | 'right';
}

/**
 * A simple MenuList that can hold MenuItems and navigate them in two directions via methods. On
 * each navigational change, the new MenuItem is focused. When calling the `executeAction` method a
 * signal is emitted containing the focused MenuItem's ID. Disabled MenuItems will be skipped
 * automatically when navigating. The draw method of the list instance has to be called to have all
 * containing buttons be drawn automatically.
 */
export class MenuList extends Phaser.GameObjects.Container {
  private gap = 8;
  public scene: BaseScene;
  private items: (MenuItem | SliderMenuItem)[] = [];
  public fontSize: number;
  public alignment: MenuOptions['alignment'] = 'center'
  public textColor: string;
  public activeTextColor: string;
  private switchSFX: SFX | undefined;
  private taikoSFX: SFX | undefined;
  public onActivated: ((key: string) => void) | undefined;
  public onRightAction: ((key: string) => void) | undefined;
  public onLeftAction: ((key: string) => void) | undefined;
  public onChange: ((key: string) => void) | undefined ;

  public constructor(scene: BaseScene, options: MenuOptions) {
    super(scene, options.x, options.y);
    this.scene = scene;
    this.fontSize = options.fontSize;
    this.textColor = options.textColor;
    this.activeTextColor = options.activeTextColor;
    this.alignment = options.alignment;
    this.name = 'menu-list';

    const switchSFX = scene.registry.get('sfx:switch') as SFX | undefined;
    if (switchSFX) this.switchSFX = switchSFX;

    const taikoSFX = scene.registry.get('sfx:taiko') as SFX | undefined;
    if (taikoSFX) this.taikoSFX = taikoSFX;

    scene.add.existing(this);
  }

  private getNextItemYPosition (): number {
    const lastItem = this.items[this.items.length - 1];
    return lastItem ? ((lastItem.text.getBounds()?.bottom - this.y ) ?? 0) + this.gap : 0;
  }

  public addItem(params: MenuItemParams): void {
    const item = new MenuItem(this, 0, this.getNextItemYPosition(), params);
    this.items.push(item);
    this.focusFirstItem();
  }

  public addSliderItem(params: SliderMenuItemParams): void {
    const item = new SliderMenuItem(this, 0, this.getNextItemYPosition(), params);
    this.items.push(item);
    this.focusFirstItem();
  }

  /**
   * Clears all menu items from the menu instance
   */
  public reset(): void {
    this.items = [];
  }

  /**
   * Sets an arbitrary number of menu items to the menu list and overrides any previously added
   * items. The first available menu item will be focused automatically.
   */
  // public setItems(...items: MenuItem[]): this {
  //   this.items = [...items];
  //   this.focusFirstItem();
  //   return this;
  // }

  /**
   * Finds and focuses the first available item if no item was focused before.
   */
  private focusFirstItem(): void {
    if (!this.getFocusedItem()) {
      const index = this.items.findIndex(item => item.enabled);
      if (index > -1) {
        this.items[index].focus();
      }
    }
  }

  private getFocusedItem(): MenuItem | undefined {
    return this.items.find(item => item.focused);
  }

  private getFocusedItemIndex(): number {
    return this.items.findIndex(item => item.focused);
  }

  private unfocusAllItems(): void {
    this.items.forEach(item => { item.blur(); });
  }

  private focusItem(item: MenuItem): void {
    this.unfocusAllItems();
    item.focus();
  }

  /**
   * Recursive method to focus the next item in the direction provided in the argument.
   * @param currentIndex - The index of the currently focused item in the items array
   * @param direction    - Direction in which the next item should be searched for.
   *                       Either 1 (forwards) or -1 (backwards)
   */
  private findAndFocusNextItem(currentIndex: number, direction: -1 | 1): void {
    const min = direction > 0 ? 0 : (this.items.length - 1);
    const max = direction > 0 ? (this.items.length - 1) : 0;
    const nextIndex = (currentIndex === max) ? min : currentIndex + direction;

    const nextItem = this.items[nextIndex];

    if (nextItem.enabled) {
      this.focusItem(this.items[nextIndex]);
    } else {
      this.findAndFocusNextItem(nextIndex, direction);
    }
  }

  /**
   * Method to navigate the focus of the menu list to the next item
   */
  public nextItem(): void {
    this.findAndFocusNextItem(this.getFocusedItemIndex(), 1);
    this.handleOnChange();
  }

  /**
   * Method to navigate the focus of the menu list to the previous item
   */
  public prevItem(): void {
    this.findAndFocusNextItem(this.getFocusedItemIndex(), -1);
    this.handleOnChange();
  }

  public increaseIncrement (): void {
    const focusedItem = this.getFocusedItem();
    if (focusedItem instanceof SliderMenuItem) {
      focusedItem.increaseValue();
      this.switchSFX?.playRandomSFXFromCategory(this.scene, 'switch');
    }
  }

  public decreaseIncrement (): void {
    const focusedItem = this.getFocusedItem();
    if (focusedItem instanceof SliderMenuItem) {
      focusedItem.decreaseValue();
      this.switchSFX?.playRandomSFXFromCategory(this.scene, 'switch');
    }
  }

  private handleOnChange (): void {
    const focusedButton = this.getFocusedItem();
    if (focusedButton && this.onChange) this.onChange(focusedButton.key)
    this.switchSFX?.playRandomSFXFromCategory(this.scene, 'switch');
  }

  public executeAction(): void {
    const focusedButton = this.getFocusedItem();

    if (this.onActivated && focusedButton && focusedButton.enabled) {
      this.onActivated(focusedButton.key);
    }
    this.taikoSFX?.playRandomSFXFromCategory(this.scene, 'deep');
  }

  public executeRightAction(): void {
    const focusedButton = this.getFocusedItem();

    if (focusedButton && focusedButton.enabled) {
      if (this.onRightAction) this.onRightAction(focusedButton.key);
      // if (focusedButton instanceof SliderMenuItem) {
      //   focusedButton.increaseValue();
      // }
    }
  }

  public executeLeftAction(): void {
    const focusedButton = this.getFocusedItem();

    if (focusedButton && focusedButton.enabled) {
      if (this.onLeftAction) this.onLeftAction(focusedButton.key);
      // if (focusedButton instanceof SliderMenuItem) {
      //   focusedButton.decreaseValue();
      // }
    }
  }
}