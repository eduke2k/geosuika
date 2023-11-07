import Phaser from 'phaser'
import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-scene' })
	}

	public handleCollision (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
			if (bodyA.gameObject.getTier() === bodyB.gameObject.getTier()) {
				// Collect data for new spawn before destroying both bodies
				const spawnPosition = bodyB.position;
				const tier = bodyB.gameObject.getTier();
				const parentBucket = bodyB.gameObject.getParentBucket();

				// Get rid of them
				bodyA.gameObject.destroy();
				bodyB.gameObject.destroy();

				// Spawn new body, one tier higher!
				new Droppable(this, tier + 1, false, parentBucket, spawnPosition.x, spawnPosition.y, 'kirby');
			}
		}
	}

	create() {
		this.matter.world.setBounds(0, 0 - 500, this.game.canvas.width, this.game.canvas.height + 500);
		// this.cam = this.cameras.main;
		// this.cam.setBounds(0, 0, this.map.widthInPixels * this.mapScale, this.map.heightInPixels * this.mapScale);
		// this.smoothMoveCameraTowards(this.playerController.matterSprite);

		this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) =>	{
			event.pairs.forEach(c => { this.handleCollision(c.bodyA, c.bodyB) });
		});

		this.matter.world.on('collisionstart', (_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) =>	{
			this.handleCollision(bodyA, bodyB)
		});

		new DropBucket(this, this.game.canvas.width / 2, 300, 500, 600, 50);

		// this.input.on('pointerdown', (pointer: PointerEvent) => {
		// 	new Droppable(this, 1, false, bucket, pointer.x, pointer.y, 'kirby');
		// }, this);
	}
}
