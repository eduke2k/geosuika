import { BodyType, Collision } from 'matter'
import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-scene' })
	}

	addItem (x: number, y: number) {
		const item = this.matter.add.image(x, y, 'logo');
		item.setAngle(Math.random() * 180);
		item.setBounce(1);
		item.setName('item');
	}

	preload() {
		this.load.setBaseURL('https://labs.phaser.io')
		this.load.image('sky', 'assets/skies/space3.png')
		this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		this.load.image('red', 'assets/particles/red.png')
	}

	create() {
		this.matter.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height);
		this.add.image(400, 300, 'sky');

		this.matter.world.on('collisionstart', (_event: Collision, bodyA: BodyType, bodyB: BodyType) =>	{
			if (bodyA.gameObject?.name === 'item' && bodyB.gameObject?.name === 'item') {
				bodyA.gameObject.destroy();
				bodyB.gameObject.destroy();
			}
		});

		this.input.on('pointerdown', (pointer: PointerEvent) => {
			this.addItem(pointer.x, pointer.y);
		}, this);
	}
}
