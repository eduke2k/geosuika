import { CustomInput } from "./CustomInput";

type ButtonState = {
  id: GamePadButtonId,
  isDown: boolean;
  justDown: boolean;
  justUp: boolean;
}

export enum GamePadButtonId {
  BUTTON_A,
  BUTTON_B,
  BUTTON_X,
  BUTTON_Y,
  BUTTON_L1,
  BUTTON_L2,
  BUTTON_L3,
  BUTTON_R1,
  BUTTON_R2,
  BUTTON_R3,
  BUTTON_START,
  BUTTON_SELECT,
  DPAD_UP,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT
}

export class GamepadInput implements CustomInput {
  // public gamepad: Gamepad;
  public index: number = -1;
  public type: 'playstation' | 'xbox';
  public leftStick: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public rightStick: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public buttons: ButtonState[] = [];

  public constructor(gamepad: Gamepad) {
    console.log('constructing ControllerInput', gamepad);
    // Very cheap way of matching controller id to vendor. Might not work in all browsers and will fall back to xbox
    this.type = (gamepad.id.indexOf('054c') > -1) ? 'playstation' : 'xbox';
    this.index = gamepad.index;

    // Initialize indexed buttons array
    gamepad.buttons.forEach((_b, i) => {
      const index = this.getIndexByButton(i);
      if (index !== undefined) this.buttons[index] = { id: index, isDown: false, justDown: false, justUp: false };
    });
  }

  private handleBinaryButton (state: ButtonState, inputValue: boolean | number): void {
    const buttonIsBeingPressedThisFrame = typeof inputValue === 'boolean' ? inputValue : inputValue > 0.5 ;
    const buttonWasPressedLastFrame = state.isDown;
    state.justUp = buttonWasPressedLastFrame && !buttonIsBeingPressedThisFrame;
    state.justDown = !buttonWasPressedLastFrame && buttonIsBeingPressedThisFrame;
    state.isDown = buttonIsBeingPressedThisFrame;
  }

  private getIndexByButton (i: number): number | undefined {
    // These indices are currently derived from dual sense on chrome.
    switch (i) {
      case 0: return GamePadButtonId.BUTTON_A;
      case 1: return GamePadButtonId.BUTTON_B;
      case 2: return GamePadButtonId.BUTTON_X;
      case 3: return GamePadButtonId.BUTTON_Y;
      case 4: return GamePadButtonId.BUTTON_L1;
      case 5: return GamePadButtonId.BUTTON_R1;
      case 6: return GamePadButtonId.BUTTON_L2;
      case 7: return GamePadButtonId.BUTTON_R2;
      case 8: return GamePadButtonId.BUTTON_SELECT;
      case 9: return GamePadButtonId.BUTTON_START;
      case 10: return GamePadButtonId.BUTTON_L3;
      case 11: return GamePadButtonId.BUTTON_R3;
      case 12: return GamePadButtonId.DPAD_UP;
      case 13: return GamePadButtonId.DPAD_DOWN;
      case 14: return GamePadButtonId.DPAD_LEFT;
      case 15: return GamePadButtonId.DPAD_RIGHT;
      default: return;
    }
  }

  public JustDown (index: GamePadButtonId): boolean {
    return this.buttons[index]?.justDown;
  }

  public JustUp (index: GamePadButtonId): boolean {
    return this.buttons[index]?.justUp;
  }

  public IsDown (index: GamePadButtonId): boolean {
    return this.buttons[index]?.isDown;
  }

  public update (): void {
    // Find gamepad by index
    const gamepads: (Gamepad | null)[] = navigator.getGamepads ? navigator.getGamepads() : ((navigator as any).webkitGetGamepads ? (navigator as any).webkitGetGamepads : [])
    if (!gamepads) return;

    const gamepad = gamepads[this.index];
    if (!gamepad) return;

    // Copy stick vectors
    this.leftStick.set(gamepad.axes[0], gamepad.axes[1]);
    this.rightStick.set(gamepad.axes[2], gamepad.axes[3]);

    // Calculate button events
    gamepad.buttons.forEach((b, i) => {
      const index = this.getIndexByButton(i);
      if (index !== undefined && this.buttons[index]) this.handleBinaryButton(this.buttons[index], b.pressed);
    });
  }
}