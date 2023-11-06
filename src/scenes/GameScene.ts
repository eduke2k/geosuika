import Phaser from 'phaser'
import Droppable from '../entities/Droppable';

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-scene' })
	}

	create() {
		this.matter.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height);

		this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) =>	{
			console.log('collisionactive', event);
			event.pairs.forEach(c => {
				if (c.bodyA.gameObject instanceof Droppable && c.bodyB.gameObject instanceof Droppable) {
					if (c.bodyA.gameObject.getTier() === c.bodyB.gameObject.getTier()) {
						const spawnPosition = c.bodyB.position;
						const tier = c.bodyB.gameObject.getTier();
						c.bodyA.gameObject.destroy();
						c.bodyB.gameObject.destroy();
						new Droppable(this, tier + 1, spawnPosition.x, spawnPosition.y, 'kirby');
					}
				}
			});
		});

		// this.matter.world.on('collisionstart', (event: Collision, bodyA: BodyType, bodyB: BodyType) =>	{
		// 	if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
		// 		console.log('collisionstart', event);
		// 		console.log(bodyA.gameObject?.getTier(), bodyB.gameObject?.getTier());
		// 		if (bodyA.gameObject.getTier() === bodyB.gameObject.getTier()) {
		// 			const spawnPosition = bodyB.position;
		// 			const tier = bodyB.gameObject.getTier();
		// 			bodyA.gameObject.destroy();
		// 			bodyB.gameObject.destroy();

		// 			new Droppable(this, tier + 1, spawnPosition.x, spawnPosition.y, 'kirby');
		// 		}
		// 	}
		// });

		this.input.on('pointerdown', (pointer: PointerEvent) => {
			new Droppable(this, 1, pointer.x, pointer.y, 'kirby');

			// this.addItem(pointer.x, pointer.y);
		}, this);
	}
}
