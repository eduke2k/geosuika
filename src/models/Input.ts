import { GamePadButtonId, GamepadInput, GamepadType } from "./GamepadInput";
import { KeyboardInput } from "./KeyboardInput";

export enum ControllerType {
   KEYBOARD = 'keyboard',
   GAMEPAD = 'gamepad',
}

export enum Action {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    JUMP,
    INTERACT,
    LAYER_CHANGE,
    CONFIRM,
    CANCEL,
    PAUSE,
    BACK,
    DROP_PIECE,
    ROTATE_PIECE_CW,
    ROTATE_PIECE_CCW,
    DEBUG1,
    DEBUG2,
    DEBUG3
}

export type Controls = Record<string, Phaser.Input.Keyboard.Key[]>;

export const controlMapping: Record<string, { keyboard: number[], gamepad: number[] }> = {
    [Action.UP]: {
        gamepad: [GamePadButtonId.DPAD_UP],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.W
        ]
    },
    [Action.DOWN]: {
        gamepad: [GamePadButtonId.DPAD_DOWN],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.S
        ]
    },
    [Action.LEFT]: {
        gamepad: [GamePadButtonId.DPAD_LEFT],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.A
        ]
    },
    [Action.RIGHT]: {
        gamepad: [GamePadButtonId.DPAD_RIGHT],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.D
        ]
    },
    [Action.JUMP]: {
        gamepad: [GamePadButtonId.BUTTON_A],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.SPACE]
    },
    [Action.INTERACT]: {
        gamepad: [GamePadButtonId.BUTTON_Y],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.E,
            Phaser.Input.Keyboard.KeyCodes.ENTER,
        ]
    },
    [Action.CONFIRM]: {
        gamepad: [GamePadButtonId.BUTTON_A],
        keyboard: [
            GamePadButtonId.BUTTON_A,
            Phaser.Input.Keyboard.KeyCodes.ENTER,
        ]
    },
    [Action.CANCEL]: {
        gamepad: [ GamePadButtonId.BUTTON_B],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.TAB]
    },
    [Action.LAYER_CHANGE]: {
        gamepad: [ GamePadButtonId.BUTTON_R1],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.F]
    },
    [Action.BACK]: {
        gamepad: [ GamePadButtonId.BUTTON_B],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.TAB
        ]
    },
    [Action.PAUSE]: {
        gamepad: [ GamePadButtonId.BUTTON_START],
        keyboard: [
            Phaser.Input.Keyboard.KeyCodes.ESC,
        ]
    },
    [Action.DROP_PIECE]: {
        gamepad: [GamePadButtonId.DPAD_UP, GamePadButtonId.DPAD_DOWN],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.E, Phaser.Input.Keyboard.KeyCodes.ENTER],
    },
    [Action.ROTATE_PIECE_CW]: {
        gamepad: [GamePadButtonId.BUTTON_B],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.SPACE],
    },
    [Action.ROTATE_PIECE_CCW]: {
        gamepad: [GamePadButtonId.BUTTON_A],
        keyboard: []
    },
    [Action.DEBUG1]: {
        gamepad: [],
        keyboard: [Phaser.Input.Keyboard.KeyCodes.ONE]
    },
    // [Action.DEBUG2]: [
    //     Phaser.Input.Keyboard.KeyCodes.TWO
    // ],
    // [Action.DEBUG3]: [
    //     Phaser.Input.Keyboard.KeyCodes.THREE
    // ]
};

export class InputController {
    // public scene: BaseScene;
    public gamepad: GamepadInput | undefined;
    public keyboard: KeyboardInput;
    // public keyboardControls: Controls = {};
    public activeControllerType: ControllerType = ControllerType.KEYBOARD;
    public justChangedType = false;

    public constructor() {
        // Register custom keyboard controller that works in tandem with the gamepad controller
        const allRegisteredKeys = [...new Set(Object.keys(controlMapping).map(c => { return controlMapping[c].keyboard }).flat())];
        this.keyboard = new KeyboardInput(allRegisteredKeys);

        // Register gamepad controller once it is connected
        window.addEventListener("gamepadconnected", (e) => {
            console.log(
              "Gamepad connected at index %d: %s. %d buttons, %d axes.",
              e.gamepad.index,
              e.gamepad.id,
              e.gamepad.buttons.length,
              e.gamepad.axes.length,
            );

            if (!this.gamepad) {
                console.log('no active gamepad setup up yet. setting up now', e);
                this.gamepad = new GamepadInput(e.gamepad);
            }
        });
    }

    public getActiveGamepadType (): GamepadType | undefined {
        return this.gamepad?.type;
    }

    public update (time: number, delta: number): void {
        this.justChangedType = false;
        const gamepadTimestamp = this.gamepad?.timestamp ?? 0;
        const keyboardTimestamp = this.keyboard?.timestamp ?? 0;

        const wasType = this.activeControllerType;
        this.activeControllerType = keyboardTimestamp >= gamepadTimestamp ? ControllerType.KEYBOARD : ControllerType.GAMEPAD;
        if (wasType !== this.activeControllerType) {
            console.log('active controller just changed to', this.activeControllerType);
            this.justChangedType = true;
        }

        this.gamepad?.update(time, delta, this.activeControllerType === 'gamepad');
        this.keyboard?.update(time, delta, this.activeControllerType === 'keyboard');
    }

    public getMovementVector (): Phaser.Math.Vector2 {
        const v = new Phaser.Math.Vector2(0, 0);

        if (this.activeControllerType === 'keyboard') {
            v.x = controlMapping[Action.LEFT].keyboard.some(code => this.keyboard.IsDown(code)) ? -1 : controlMapping[Action.RIGHT].keyboard.some(code => this.keyboard.IsDown(code)) ? 1 : 0;
            v.y = controlMapping[Action.UP].keyboard.some(code => this.keyboard.IsDown(code)) ? -1 : controlMapping[Action.DOWN].keyboard.some(code => this.keyboard.IsDown(code)) ? 1 : 0;
        } else if (this.activeControllerType === 'gamepad') {
            v.x = this.gamepad?.IsDown(GamePadButtonId.DPAD_LEFT) ? -1 : this.gamepad?.IsDown(GamePadButtonId.DPAD_RIGHT) ? 1 : 0;
            v.y = this.gamepad?.IsDown(GamePadButtonId.DPAD_UP) ? -1 : this.gamepad?.IsDown(GamePadButtonId.DPAD_DOWN) ? 1 : 0;
        }

        return v.length() > 1 ? v.normalize() : v;
    }

    public justDown (action: Action): boolean {
        return controlMapping[action]?.keyboard.some(id => this.keyboard.JustDown(id)) || controlMapping[action]?.gamepad.some(id => this.gamepad?.JustDown(id));
    }

    public justUp (action: Action): boolean {
        return controlMapping[action]?.keyboard.some(id => this.keyboard.JustUp(id)) || controlMapping[action]?.gamepad.some(id => this.gamepad?.JustUp(id));
    }

    public isDown (action: Action): boolean {
        return controlMapping[action]?.keyboard.some(id => this.keyboard.IsDown(id)) || controlMapping[action]?.gamepad.some(id => this.gamepad?.IsDown(id));
    }
}