export enum Action {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    ACTION1,
    ACTION2,
    DEBUG1,
    DEBUG2,
    DEBUG3
}

export type Controls = Record<string, Phaser.Input.Keyboard.Key[]>;

export const controlMapping: Record<string, number[]> = {
    [Action.UP]: [
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.W
    ],
    [Action.DOWN]: [
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.S
    ],
    [Action.LEFT]: [
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.A
    ],
    [Action.RIGHT]: [
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.D
    ],
    [Action.ACTION1]: [
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.E
    ],
    [Action.ACTION2]: [
        Phaser.Input.Keyboard.KeyCodes.F
    ],
    [Action.DEBUG1]: [
        Phaser.Input.Keyboard.KeyCodes.ONE
    ],
    [Action.DEBUG2]: [
        Phaser.Input.Keyboard.KeyCodes.TWO
    ],
    [Action.DEBUG3]: [
        Phaser.Input.Keyboard.KeyCodes.THREE
    ]
};

export function initController (scene: Phaser.Scene): Controls {
    const controls: Controls = {};
    Object.keys(controlMapping).forEach(a => {
        controls[a] = controlMapping[a].map(keyCode => scene.input.keyboard!.addKey(keyCode));
    });
    return controls;
}

export class InputController {
    public controls: Controls = {};

    public constructor(scene: Phaser.Scene) {
        Object.keys(controlMapping).forEach(a => {
            this.controls[a] = controlMapping[a].map(keyCode => scene.input.keyboard!.addKey(keyCode));
        });
    }

    public getMovementVector (): Phaser.Math.Vector2 {
        const v = new Phaser.Math.Vector2(0, 0);

        // Set horizontal movement vector
        if (this.controls[Action.LEFT].some(input => input.isDown)) {
            v.x = -1;
        } else if (this.controls[Action.RIGHT].some(input => input.isDown)) {
            v.x = 1;
        }

        // Set vertical movement vector
        if (this.controls[Action.UP].some(input => input.isDown)) {
            v.y = -1;
        } else if (this.controls[Action.DOWN].some(input => input.isDown)) {
            v.y = 1;
        }

        return v.normalize();
    }

    public justDown (action: Action): boolean {
        return this.controls[action].some(input => Phaser.Input.Keyboard.JustDown(input));
    }

    public isDown (action: Action): boolean {
        return this.controls[action].some(input => input.isDown);
    }
}