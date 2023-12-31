import { CustomInput } from "./CustomInput";

type ButtonState = {
  isDown: boolean;
  justDown: boolean;
  justUp: boolean;
}

const defaultWhitelist = [
  'F5', 'F11', 'F12'
]

export class KeyboardInput implements CustomInput {
  private pressedKeys: number[] = [];
  public buttons: ButtonState[] = [];
  public time = 0;
  public timestamp = 0;

  public constructor(keyCodes: number[]) {
    keyCodes.forEach(c => {
      this.buttons[c] = { isDown: false, justDown: false, justUp: false };
    })

    window.addEventListener('keydown', (e) => {
      if (!defaultWhitelist.includes(e.key)) e.preventDefault();
      if (this.pressedKeys.findIndex((code) => e.keyCode === code) === -1) this.pressedKeys.push(e.keyCode);
      this.timestamp = this.time;
    });
    window.addEventListener('keyup', (e) => {
      if (!defaultWhitelist.includes(e.key)) e.preventDefault();
      const index = this.pressedKeys.findIndex((code) => e.keyCode === code);
      if (index > -1) this.pressedKeys.splice(index, 1);
      this.timestamp = this.time;
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

  public update (time: number, _delta: number, active: boolean): void {
    this.time = time;

    if (!active) return;
    this.buttons.forEach((state, keyCode) => {
      const buttonIsBeingPressedThisFrame = !!this.pressedKeys.includes(keyCode);
      const buttonWasPressedLastFrame = state.isDown;
      state.justUp = buttonWasPressedLastFrame && !buttonIsBeingPressedThisFrame;
      state.justDown = !buttonWasPressedLastFrame && buttonIsBeingPressedThisFrame;
      state.isDown = buttonIsBeingPressedThisFrame;
    });
  }
}