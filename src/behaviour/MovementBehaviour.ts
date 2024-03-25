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
    public terminalVelocity: number = 20;

    public constructor(character: Character, options?: MovementBehaviourOptions) {
        this.character = character;
        if (options) {
            if (options.maxSpeed !== undefined) this.maxSpeed = options.maxSpeed;
            if (options.acceleration !== undefined) this.acceleration = options.acceleration;
            if (options.deacceleration !== undefined) this.deacceleration = options.deacceleration;
        }
    }

    private getGroundVector (): Phaser.Math.Vector2 {
        const cloned = this.character.groundNormal?.clone();
        if (cloned) {
            const normal = cloned.x > 0 ? cloned.normalizeRightHand() : cloned.normalizeLeftHand();
            normal.set( normal.x * -1, normal.y);
            return normal;
        }
        return new Phaser.Math.Vector2(0, 0);
    }

    public addSlideCorrectionForce (delta: number): void {
        // Extra force for slope slide correction
        const groundVector = this.getGroundVector();

        const forceConstant = (groundVector.y < 0.25 && groundVector.y > 0.23) ? 24 : 16.5; 
        const force = new Phaser.Math.Vector2(groundVector.x, groundVector.y).normalize().scale(groundVector.y / (forceConstant / (this.character.getBody()?.mass ?? 1)) / delta);
        this.character.applyForce(force);
    }

    public handleMovement (movementVector: Phaser.Math.Vector2, accelerationMultiplier: number, delta: number) {
        const vX = this.character.getVelocity().x ?? 0;
        const triesToChangeDirection = movementVector.x !== 0 && vX !== 0 && Math.sign(movementVector.x) !== Math.sign(vX ?? 0);
        const directionChangeMultiplier = triesToChangeDirection ? 2 : 1;

        const vXDelta = movementVector.x * (this.acceleration * accelerationMultiplier * directionChangeMultiplier) / delta;

        let newVX = (vX ?? 0) + vXDelta;

        if (Math.abs(newVX) > this.maxSpeed) {
            const tooFast = Math.abs(newVX) - this.maxSpeed;
            const speedReduction = Math.max((tooFast / delta), tooFast);
            const sign = Math.sign(newVX);
            newVX = newVX - (speedReduction * sign);
        }

        this.character.setVelocityX(newVX);
        // this.addSlideCorrectionForce(delta);
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
        // this.addSlideCorrectionForce(delta);
    }

    public handleFall (): void {
        const vY = this.character.getVelocity().y ?? 0;
        if (vY > this.terminalVelocity) this.character.setVelocityY(this.terminalVelocity);
    }
}