import Phaser from 'phaser'
import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';
// import Dog from '../entities/Dog';
import ProgressCircle from '../entities/ProgressCircle';
import ScoreLabel from '../entities/ScoreLabel';
import { Score } from '../models/Score';
import { flagSet } from '../config/flags';
import { sizeFromVertices } from '../functions/helper';

export default class GameScene extends Phaser.Scene {
	public debugText!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: 'game-scene' })
	}

	// Todo: Move this to Droppable? or Bucket?
	public handleCollision (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
			const parentBucket = bodyB.gameObject.getParentBucket();
			parentBucket.tryMergeDroppables(bodyA.gameObject, bodyB.gameObject);
		}
	}

	public initMap (): void {
		// create the Tilemap
		const map = this.make.tilemap({ key: 'tilemap' });
	
		// add the tileset image we are using
		const tileset = map.addTilesetImage('tileset');
		if (!tileset) throw new Error('tileset missing');

		// create the layers we want in the right order
		map.createLayer('Foreground', tileset);

		// "Ground" layer will be on top of "Background" layer
		map.createLayer('Terrain', tileset);

		// if (terrainLayer){
		// 	terrainLayer.setCollisionByProperty({ collides: true });
		// 	this.matter.world.convertTilemapLayer(terrainLayer);
		// }

		const Body = new Phaser.Physics.Matter.MatterPhysics(this).body;

		const collisionObjects = map.objects.find(o => o.name === 'Collisions')?.objects;
		if (collisionObjects) {
			// const Bodies = new Phaser.Physics.Matter.MatterPhysics(this).bodies;
			collisionObjects.forEach(o => {
				if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
					this.matter.add.rectangle(o.x + (o.width / 2), o.y + (o.height / 2), o.width, o.height, { isStatic: true });
				} else if (o.polygon && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
					const body = this.matter.add.fromVertices(0, 0, o.polygon, { isStatic: true, frictionStatic: 1, friction: 1 });
					Body.setPosition(body, { x: o.x + body.centerOffset.x, y: o.y + body.centerOffset.y}, false);
				}
			});
		}
	}

	create() {
		this.initMap();

		this.debugText = this.add.text(0, 0, 'hello', { font: "12px Courier", align: "left" });
		this.debugText.setScrollFactor(0, 0);

		// this.matter.world.setBounds(0, 0 - 500, this.game.canvas.width, this.game.canvas.height + 500);
		// this.cam = this.cameras.main;
		// this.cam.setBounds(0, 0, this.map.widthInPixels * this.mapScale, this.map.heightInPixels * this.mapScale);
		// this.smoothMoveCameraTowards(this.playerController.matterSprite);

		this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) =>	{
			event.pairs.forEach(c => { this.handleCollision(c.bodyA, c.bodyB) });
		});

		this.matter.world.on('collisionstart', (_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			this.handleCollision(bodyA, bodyB);
		});

		const score = new ScoreLabel(this, 50, 50);
		score.setScrollFactor(0, 0);

		// const debugBucket = new DropBucket(this, 1212, 200, 470, 535, 50, score, true);
		const debugBucket = new DropBucket({
			scene: this,
			x: 284,
			y: 200,
			width: 470,
			height: 535,
			thickness: 64,
			scoreLabel: score,
			gameOverThreshold: 535,
			// maxTierToDrop: 10,
			// disableMerge: false
		});
		debugBucket.assignDroppableSet(flagSet);

		// Camera Settings
		this.cameras.main.startFollow(debugBucket, true, 0.05, 0.05);
		this.cameras.main.fadeIn(1000);

		const progressCircle = new ProgressCircle(this, debugBucket, 1100, 500);
		progressCircle.setScrollFactor(0, 0);

		Score.init(this);

		// const dog = new Dog(this, 400, 600);
		// dog.setScale(0.3);
		// dog.setRotation(90);
		// dog.play({ key: 'idle', repeat: -1 });

		// this.input.on('pointerdown', () => {
		// 	const x = this.game.input.mousePointer?.worldX;
    //   const y = this.game.input.mousePointer?.worldY;

		// 	Droppable.create({
		// 		bucket: debugBucket,
		// 		scene: this,
		// 		tethered: false,
		// 		tierIndex: 1,
		// 		x: x ?? 0,
		// 		y: y ?? 0
		// 	});
		// }, this);
	}
}
