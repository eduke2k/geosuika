import Phaser from 'phaser'
import DropBucket, { BucketPhase } from './DropBucket';

const ELEVATOR_THICKNESS = 128;

export default class BucketElevator extends Phaser.Physics.Matter.Image {
	private parentBucket: DropBucket;
	private startY;
	private endY;

	constructor(bucket: DropBucket, x: number, y: number, width: number, texture: string)	{
		super(bucket.scene.matter.world, x, y, texture, 0, { isStatic: true });
		this.parentBucket = bucket;

		const initialY = y + (ELEVATOR_THICKNESS / 2);
		const Bodies = new Phaser.Physics.Matter.MatterPhysics(bucket.scene).bodies;
		const body = Bodies.rectangle(x, initialY, width, ELEVATOR_THICKNESS, { isStatic: true });
		this.setExistingBody(body);
		this.startY = initialY;
		this.endY = this.startY;
	}

	public moveY (amount: number): void {
		this.y += amount;
	}

	public getStartY (): number {
		return this.startY;
	}

	public getEndY (): number {
		return this.endY;
	}

	public moveRelativeY (relativeTargetY: number): void {
		this.scene.tweens.addCounter({
			from: this.y,
			to: this.y + relativeTargetY,
			duration: 15000,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (_tween, target) => {
				this.y = target.value;
				if (this.parentBucket.getBucketPhase() === BucketPhase.DROP) {
					this.endY = this.y;
				}
			}
		})
	}

	public moveToAbsoluteY (targetY: number, duration: number): void {
		this.scene.tweens.addCounter({
			from: this.y,
			to: targetY,
			duration,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (_tween, target) => {
				this.y = target.value;
				if (this.parentBucket.getBucketPhase() === BucketPhase.DROP) {
					this.endY = this.y;
				}
			}
		})
	}

	public backToStart (duration: number): void {
		this.scene.tweens.addCounter({
			from: this.y,
			to: this.startY,
			duration,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (_tween, target) => {
				this.y = target.value
			}
		})
	}
}