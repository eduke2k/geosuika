import Phaser from 'phaser'
import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';
import { parseTiledProperties } from '../functions/helper';
import { PetalEmitter } from '../models/PetalEmitter';
// import Dog from '../entities/Dog';

export default class GameScene extends Phaser.Scene {
	public debugText!: Phaser.GameObjects.Text;
	public buckets: DropBucket[] = [];
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];

	constructor() {
		super({ key: 'game-scene' })
	}

	// Todo: Move this to Droppable? or Bucket?
	public handleCollision (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, event: Phaser.Physics.Matter.Events.CollisionStartEvent | Phaser.Physics.Matter.Events.CollisionActiveEvent): void {
		if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
			const parentBucket = bodyB.gameObject.getParentBucket();
			parentBucket.tryMergeDroppables(bodyA.gameObject, bodyB.gameObject);
		}

		if (bodyA.gameObject instanceof Droppable || bodyB.gameObject instanceof Droppable) {
			// const droppable = bodyA.gameObject instanceof Droppable ? bodyA : bodyB;
			// const parentBucket = droppable.getParentBucket();
			const droppable = Droppable.getFirstDroppableFromBodies(bodyA, bodyB);
			if (!droppable) return;
			const parentBucket = droppable.getParentBucket();

			const v1 = new Phaser.Math.Vector2(bodyB.velocity).length();
			const v2 = new Phaser.Math.Vector2(bodyA.velocity).length();
			if ((!bodyA.isSensor && !bodyB.isSensor) && (v1 > 2 || v2 > 2)) {

				// Get contact point. Typings of MatterJS are broken.
				const contactVertex = (event.pairs[0] as any).contacts.filter((c: any) => c !== undefined)[0].vertex;
				parentBucket.playCollisionSound(droppable, Math.max(v1, v2), contactVertex);
			}
		}
	}

	public initMap (): Phaser.Tilemaps.Tilemap {
		// create the Tilemap
		const map = this.make.tilemap({ key: 'tilemap' });
	
		// add the tileset image we are using
		const tileset = map.addTilesetImage('tilesheet_japan');
		if (!tileset) throw new Error('tileset missing');

		// Add layers from tileset
		const terrain = map.createLayer('Terrain', tileset);
		if (terrain) this.tilemapLayers.push(terrain);

		const detail1 = map.createLayer('TerrainDetail2', tileset);
		if (detail1) this.tilemapLayers.push(detail1);

		const detail2 = map.createLayer('TerrainDetail1', tileset);
		if (detail2) this.tilemapLayers.push(detail2);

		const foreground = map.createLayer('Foreground', tileset);
		if (foreground) this.tilemapLayers.push(foreground);

		// terrain?.forEachTile(t => {
		// 	t.alpha = 0.5;
		// });

		// Generate map collisions from tiled map
		const Body = new Phaser.Physics.Matter.MatterPhysics(this).body;
		const collisionObjects = map.objects.find(o => o.name === 'Objects')?.objects;
		if (collisionObjects) {
			collisionObjects.forEach(o => {
				if (o.type === 'collision') {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						this.matter.add.rectangle(o.x + (o.width / 2), o.y + (o.height / 2), o.width, o.height, { isStatic: true });
					} else if (o.polygon && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						const body = this.matter.add.fromVertices(0, 0, o.polygon, { isStatic: true, frictionStatic: 1, friction: 1 });
						Body.setPosition(body, { x: o.x + body.centerOffset.x, y: o.y + body.centerOffset.y}, false);
					}
				}
			});
		}

		return map;
	}

	public initDebugTextField(): void {
		this.debugText = this.add.text(0, 0, 'Early Preview', { font: "12px Courier", align: "left" });
		this.debugText.setScrollFactor(0, 0);
	}

	public getTilemapLayers ():  Phaser.Tilemaps.TilemapLayer[] {
		return this.tilemapLayers;
	}

	update (time: number, delta: number): void {
		this.petalEmitter.update(time, delta);
	}

	create() {
		const map = this.initMap();
		this.initDebugTextField();

		this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) =>	{
			event.pairs.forEach(c => { this.handleCollision(c.bodyA, c.bodyB, event) });
		});

		this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			this.handleCollision(bodyA, bodyB, event);
		});

		// Camera Settings
		this.cameras.main.setZoom(4);
		this.cameras.main.fadeIn(1000);
		this.cameras.main.setRoundPixels(false);

		// Spawn entities of map
		const collisionObjects = map.objects.find(o => o.name === 'Objects')?.objects;
		if (collisionObjects) {
			collisionObjects.forEach(o => {
				if (o.type === 'entity') {
					const properties = parseTiledProperties(o.properties);
					switch (o.name) {
						case 'bucket': {
							this.buckets.push(new DropBucket({
								scene: this,
								active: Boolean(properties.active),
								x: o.x ?? 0,
								y: o.y ?? 0,
								width: properties.width ? parseInt(properties.width.toString()) : 470,
								height: properties.height ? parseInt(properties.height.toString()) : 535,
								thickness: properties.thickness ? parseInt(properties.thickness.toString()) : 64,
								gameOverThreshold: properties.gameOverThreshold ? parseInt(properties.gameOverThreshold.toString()) : 535,
								maxTierToDrop: properties.maxTierToDrop ? parseInt(properties.maxTierToDrop.toString()) : undefined,
								disableMerge: Boolean(properties.disableMerge),
								droppableSet: DropBucket.getDroppableSetfromName(properties.droppableSet ? properties.droppableSet.toString() : 'flagSet'),
								image: properties.image ? properties.image as string : '',
								targetScore: 2100,
							}));
							break;
						}
					}
				}
			});
		}
		// const dog = new Dog(this, 400, 600);
		// dog.setScale(0.3);
		// dog.setRotation(90);
		// dog.play({ key: 'idle', repeat: -1 });
	}
}
