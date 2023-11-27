import Character from "../entities/Character";

export type MovementBehaviourOptions = {
    maxSpeed?: number;
    acceleration?: number;
    deacceleration?: number;
}

export class MovementBehaviour {
    private character: Character;
    private maxSpeed: number = 50;
    private acceleration: number = 50;
    private deacceleration: number = 10;

    public constructor(character: Character, options?: MovementBehaviourOptions) {
        this.character = character;
        if (options) {
            if (options.maxSpeed !== undefined) this.maxSpeed = options.maxSpeed;
            if (options.acceleration !== undefined) this.acceleration = options.acceleration;
            if (options.deacceleration !== undefined) this.deacceleration = options.deacceleration;
        }
    }

    public handleMovement (movementVector: Phaser.Math.Vector2, delta: number) {
        const v = { ...this.character.getVelocity() };
        const vXDelta = movementVector.x * this.acceleration / delta;
        this.character.setVelocityX(v.x ?? 0 + vXDelta);
    }
}