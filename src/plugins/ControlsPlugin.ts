export const EVENT_UP = 'CONTROL_UP'
export const EVENT_RIGHT = 'CONTROL_RIGHT'
export const EVENT_DOWN = 'CONTROL_DOWN'
export const EVENT_LEFT = 'CONTROL_LEFT'
export const EVENT_INTERACT = 'CONTROL_INTERACT'

export class ControlsPlugin extends Phaser.Plugins.ScenePlugin {
    private keys: Record<string, number[]>;

    constructor (scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
        super(scene, pluginManager, 'controls-plugin');

        this.keys = {
            up: [Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.W],
            right: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D],
            down: [Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.S],
            left: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A],
            interact: [Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE],
        }
    }

    public update () {
        this.emitKeyEvent({ keys: this.keys.up, eventName: EVENT_UP })
        this.emitKeyEvent({ keys: this.keys.right, eventName: EVENT_RIGHT })
        this.emitKeyEvent({ keys: this.keys.down, eventName: EVENT_DOWN })
        this.emitKeyEvent({ keys: this.keys.left, eventName: EVENT_LEFT })
        this.emitKeyEvent({ keys: this.keys.interact, eventName: EVENT_INTERACT })
    }

    private emitKeyEvent (options: { keys: number[], eventName: string }) {
        const keyboard = this.scene?.input?.keyboard;
        if (keyboard) {
            options.keys.forEach(key => {
                const keyObj = keyboard.addKey(key)
                if (Phaser.Input.Keyboard.JustDown(keyObj)) {
                    this.scene?.events.emit(options.eventName, this.scene)
                }
            })
        }
    }
}