import Phaser from 'phaser'
import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';
import { parseTiledProperties } from '../functions/helper';
import { PetalEmitter } from '../models/PetalEmitter';
import chroma from 'chroma-js';

// import Dog from '../entities/Dog';

export default class GameScene extends Phaser.Scene {
	public debugText!: Phaser.GameObjects.Text;
	public buckets: DropBucket[] = [];
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public elevatorBodies: {
		bucketName: string,
		body: MatterJS.BodyType
	}[] = []

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
		const background3 = map.createLayer('Background3', tileset);
		if (background3) {
			this.tilemapLayers.push(background3);
			// background3.setScrollFactor(1, 0);
		}
		const background2 = map.createLayer('Background2', tileset);
		if (background2) {
			this.tilemapLayers.push(background2);
		}

		const background1 = map.createLayer('Background1', tileset);
		if (background1) {
			this.tilemapLayers.push(background1);
			console.log(background1);
		}

		const terrain = map.createLayer('Terrain', tileset);
		if (terrain) {
			// terrain.setPipeline('Light2D');
			this.tilemapLayers.push(terrain);
		}

		const detail1 = map.createLayer('TerrainDetail2', tileset);
		if (detail1) {
			// detail1.setPipeline('Light2D');
			this.tilemapLayers.push(detail1);
		} 

		const detail2 = map.createLayer('TerrainDetail1', tileset);
		if (detail2) {
			// detail2.setPipeline('Light2D');
			this.tilemapLayers.push(detail2);
		} 

		const foreground = map.createLayer('Foreground', tileset);
		if (foreground) {
			// foreground.setPipeline('Light2D');
			this.tilemapLayers.push(foreground);
		}

		// terrain?.forEachTile(t => {
		// 	t.alpha = 0.5;
		// });
	
		// Setup initial tilemap state
    this.getTilemapLayers().forEach(tl => {
      tl.forEachTile(t => {
        t.properties.progress = 0;
				t.properties.baseRotation = Phaser.Math.Angle.Random();
				t.alpha = t.properties.progress;
				t.rotation = t.properties.baseRotation;
      });  
    });

		// Generate map collisions from tiled map
		const Body = new Phaser.Physics.Matter.MatterPhysics(this).body;
		const mapObjects = map.objects.find(o => o.name === 'Objects')?.objects;
		if (mapObjects) {
			mapObjects.forEach(o => {
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

	public revealTile (tile: Phaser.Tilemaps.Tile): void {
		tile.properties.progress = 1;
	}

	public updateTileProgress (tile: Phaser.Tilemaps.Tile, color: string, affection: number, delta: number): void {
		// if (tile.properties.progress === 1) return;
		const progress = Math.max(Math.min((tile.properties.progress ?? 0) + (affection / 10 / delta), 1), 0);
		const baseRotation = tile.properties.baseRotation ?? 0;
		tile.alpha = progress + affection;
		tile.rotation = baseRotation - (baseRotation * progress);

		tile.width = tile.baseWidth * (progress + (affection / 4));
		tile.height = tile.baseHeight * (progress + (affection / 4));

		tile.properties.progress = progress;

		tile.tint = Phaser.Display.Color.HexStringToColor(chroma.mix('#364f71', color, affection).hex()).color;
		// tile.tint = 0x364f71;
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
		// this.lights.enable().setAmbientColor(0x364f71);
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
		const mapObjects = map.objects.find(o => o.name === 'Objects')?.objects;
		if (mapObjects) {
			mapObjects.forEach(o => {
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
								elevatorDistance: properties.elevatorDistance ? parseInt(properties.elevatorDistance.toString()) : undefined,
								elevatorBody: this.elevatorBodies.find(b => b.bucketName === o.name)?.body
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
