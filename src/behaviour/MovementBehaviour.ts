import Character from "../entities/Character";

export type MovementBehaviourOptions = {
    maxSpeed?: number;
    acceleration?: number;
    deacceleration?: number;
}

export class MovementBehaviour {
    private character: Character;
    public maxSpeed: number = 5;
    public acceleration: number = 10;
    public deacceleration: number = 15;

    public constructor(character: Character, options?: MovementBehaviourOptions) {
        this.character = character;
        if (options) {
            if (options.maxSpeed !== undefined) this.maxSpeed = options.maxSpeed;
            if (options.acceleration !== undefined) this.acceleration = options.acceleration;
            if (options.deacceleration !== undefined) this.deacceleration = options.deacceleration;
        }
    }

    public handleLooking (movementVector: Phaser.Math.Vector2, onGround: boolean) {
        if (!onGround) return;

        if (movementVector.y > 0) {
            this.character.play({ key: `${this.character.name}:lookup`, repeat: -1 }, true);
        } else {
            this.character.play({ key: `${this.character.name}:lookdown`, repeat: -1 }, true);
        }
    }

    public handleMovement (movementVector: Phaser.Math.Vector2, accelerationMultiplier: number, delta: number) {
        const vX = this.character.getVelocity().x ?? 0;
        // const vY = this.character.getVelocity().y ?? 0;
        const triesToChangeDirection = movementVector.x !== 0 && vX !== 0 && Math.sign(movementVector.x) !== Math.sign(vX ?? 0);

        if (triesToChangeDirection) {
            this.handleNoMovement(delta, accelerationMultiplier);
        } else {
            const vXDelta = movementVector.x * (this.acceleration * accelerationMultiplier) / delta;

            let newVX = (vX ?? 0) + vXDelta;
    
            if (Math.abs(newVX) > this.maxSpeed) {
                const tooFast = Math.abs(newVX) - this.maxSpeed;
                const speedReduction = Math.max((tooFast / delta), tooFast);
                const sign = Math.sign(newVX);
                newVX = newVX - (speedReduction * sign);
            }
    
            this.character.setVelocityX(newVX);
        }
    }

    public handleNoMovement (delta: number, accelerationMultiplier: number) {
        const vX = this.character.getVelocity().x ?? 0;
        // const vY = this.character.getVelocity().y ?? 0;
        const originalSign = Math.sign(vX ?? 0);
        const vXDelta = (this.deacceleration * accelerationMultiplier * originalSign) / delta;
        let newVX = (vX ?? 0) - vXDelta;

        const newSign = Math.sign(newVX);
        if (originalSign !== newSign) newVX = 0;

        this.character.setVelocityX(newVX);
    }
}