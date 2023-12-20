import { CustomInput } from "./CustomInput";

type ButtonState = {
  isDown: boolean;
  justDown: boolean;
  justUp: boolean;
}

const defaultWhitelist = [
  'F5', 'F12'
]

export class KeyboardInput implements CustomInput {
  private pressedKeys: number[] = [];
  public buttons: ButtonState[] = [];

  public constructor(keyCodes: number[]) {
    keyCodes.forEach(c => {
      this.buttons[c] = { isDown: false, justDown: false, justUp: false };
    })

    window.addEventListener('keydown', (e) => {
      if (!defaultWhitelist.includes(e.key)) e.preventDefault();
      if (this.pressedKeys.findIndex((code) => e.keyCode === code) === -1) this.pressedKeys.push(e.keyCode);
    });
    window.addEventListener('keyup', (e) => {
      if (!defaultWhitelist.includes(e.key)) e.preventDefault();
      const index = this.pressedKeys.findIndex((code) => e.keyCode === code);
      if (index > -1) this.pressedKeys.splice(index, 1);
    });
  }

  public JustDown (code: number): boolean {
    return this.buttons[code]?.justDown;
  }

  public JustUp (code: number): boolean {
    return this.buttons[code]?.justUp;
  }

  public IsDown (code: number): boolean {
    return this.buttons[code]?.isDown;
  }

  public update (): void {
    this.buttons.forEach((state, keyCode) => {
      const buttonIsBeingPressedThisFrame = !!this.pressedKeys.includes(keyCode);
      const buttonWasPressedLastFrame = state.isDown;
      state.justUp = buttonWasPressedLastFrame && !buttonIsBeingPressedThisFrame;
      state.justDown = !buttonWasPressedLastFrame && buttonIsBeingPressedThisFrame;
      state.isDown = buttonIsBeingPressedThisFrame;
    });
  }
}