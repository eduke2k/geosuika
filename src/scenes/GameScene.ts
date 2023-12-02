import Phaser from 'phaser'
// import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';
import { parseTiledProperties } from '../functions/helper';
import { PetalEmitter } from '../models/PetalEmitter';
import chroma from 'chroma-js';
import Dog from '../entities/Dog';
import Arcade from '../entities/Arcade';
import { Instrument } from '../models/Instrument';
import BlinkingText from '../entities/BlinkingText';
import { Action, InputController } from '../models/Input';
import { CATEGORY_TERRAIN } from '../const/collisions';
import Character from '../entities/Character';

// import Dog from '../entities/Dog';

export default class GameScene extends Phaser.Scene {
	public buckets: DropBucket[] = [];
	public arcades: Arcade[] = [];
	// public dog: Dog | undefined = undefined;
	public characters: Character[] = [];
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public elevatorBodies: {
		bucketName: string,
		body: MatterJS.BodyType
	}[] = []

	public inputController: InputController | null = null;
	public bokehEffect: Phaser.FX.Bokeh | undefined;

	constructor() {
		super({ key: 'game-scene' })
	}

	// Todo: Move this to Droppable? or Bucket?
	// public handleCollision (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, event: Phaser.Physics.Matter.Events.CollisionStartEvent | Phaser.Physics.Matter.Events.CollisionActiveEvent): void {
	// 	if (bodyA.gameObject instanceof Droppable && bodyB.gameObject instanceof Droppable) {
	// 		const parentBucket = bodyB.gameObject.getParentBucket();
	// 		parentBucket.tryMergeDroppables(bodyA.gameObject, bodyB.gameObject);
	// 	}

	// 	if (bodyA.gameObject instanceof Droppable || bodyB.gameObject instanceof Droppable) {
	// 		// const droppable = bodyA.gameObject instanceof Droppable ? bodyA : bodyB;
	// 		// const parentBucket = droppable.getParentBucket();
	// 		const droppable = Droppable.getFirstDroppableFromBodies(bodyA, bodyB);
	// 		if (!droppable) return;
	// 		const parentBucket = droppable.getParentBucket();

	// 		const v1 = new Phaser.Math.Vector2(bodyB.velocity).length();
	// 		const v2 = new Phaser.Math.Vector2(bodyA.velocity).length();
	// 		if ((!bodyA.isSensor && !bodyB.isSensor) && (v1 > 2 || v2 > 2)) {

	// 			// Get contact point. Typings of MatterJS are broken.
	// 			const contactVertex = (event.pairs[0] as any).contacts.filter((c: any) => c !== undefined)[0].vertex;
	// 			const maxV = Math.max(v1, v2);
	// 			parentBucket.playCollisionSound(droppable, maxV, contactVertex);
	// 		}
	// 	}
	// }

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
						this.matter.add.rectangle(
							o.x + (o.width / 2),
							o.y + (o.height / 2),
							o.width,
							o.height,
							{
								isStatic: true,
								label: o.name,
								collisionFilter: {
									group: 0,
									category: CATEGORY_TERRAIN
								}
							},
						);
					} else if (o.polygon && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						const body = this.matter.add.fromVertices(0, 0, o.polygon, { isStatic: true, label: o.name });
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

	public getTilemapLayers ():  Phaser.Tilemaps.TilemapLayer[] {
		return this.tilemapLayers;
	}

	public getMountedBucket (): DropBucket | undefined {
		return this.buckets.find(b => b.isMounted());
	}

	public unmountBucket (): void {
		const bucket = this.getMountedBucket();
		if (!bucket) return;
		bucket.unmountBucket();
	}

	public restartBucket (): void {
		const bucket = this.getMountedBucket();
		if (!bucket) return;
		bucket.restartBucket();
	}

	update (time: number, delta: number): void {
		this.petalEmitter.update(time, delta);
		this.characters.forEach(c => c.update(time, delta));
		this.arcades.forEach(a => a.update(time, delta));
		this.buckets.forEach(a => a.update(time, delta));
		
		const mountedBucket = this.getMountedBucket();

		// Handle Input
		// if (this.inputController?.justDown(Action.ACTION2)) {
		// 	if (mountedBucket) mountedBucket.rotateNextDroppable();
		// }
	
		// if (this.inputController?.justDown(Action.ACTION1)) {
		// 	if (mountedBucket) {
		// 		mountedBucket.unmountBucket();
		// 	} else {
		// 		this.arcades[0]?.trigger();
		// 	}
		// }
	
		if (this.inputController?.justDown(Action.DEBUG1)) {
			if (mountedBucket) mountedBucket.rankUp();
		}
	
		if (this.inputController?.isDown(Action.UP)) {
			// this.elevator.moveY(-100 / delta);
			if (mountedBucket) mountedBucket.moveY(-100 / delta);
		}
	
		if (this.inputController?.isDown(Action.DOWN)) {
			// this.elevator.moveY(100 / delta);
			if (mountedBucket) mountedBucket.moveY(100 / delta);
		}
		
		if (this.inputController?.justDown(Action.DEBUG2)) {
			if (mountedBucket) mountedBucket.clearAllVisibleTiles();
		} 
	
		if (this.inputController?.justDown(Action.DEBUG3)) {
			if (!mountedBucket || !mountedBucket.bgm) return;
			const instrument = this.registry.get('instument:harp') as Instrument | undefined;
			if (instrument) {
				const chord = mountedBucket.bgm.getCurrentChord();
				new BlinkingText(this, chord, mountedBucket.x, mountedBucket.y, { fontSize: 16, movementY: 100, duration: 1000 });
				instrument.playRandomNoteInChord(chord, this, 0, 1);
			}
		}
	}

	public getPlayerCharacter (): Character | undefined {
		return this.characters.find(c => c.isPlayerControlled())
	}

	public bucketUnmountFinished (_bucket: DropBucket): void {
		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			this.cameraFollowEntity({ object: playerCharacter });
		}
	}

	public cameraFollowEntity (options: { object: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | undefined, instant?: boolean, smooth?: number, offsetX?: number, offsetY?: number }): void {
		if (!options.object) return;
		const lerpAmount = options.smooth ?? 0.1;
		const instantaneous = options.instant ?? false;

		if (instantaneous) {
			this.cameras.main.startFollow(options.object, true, lerpAmount, lerpAmount, options.offsetX, options.offsetY);
		} else {
			this.cameras.main.pan(
				options.object.x - (options.offsetX ?? 0),
				options.object.y - (options.offsetY ?? 0),
				1500,
				Phaser.Math.Easing.Cubic.InOut,
				undefined,
				(camera, progress, _x, _y) => {
					if (!options.object) return;
					camera.panEffect.destination.x = options.object.x - (options.offsetX ?? 0);
          camera.panEffect.destination.y = options.object.y - (options.offsetY ?? 0);
					if (progress === 1) {
						if (options.object)	this.cameras.main.startFollow(options.object, true, lerpAmount, lerpAmount, options.offsetX, options.offsetY);	
					}
				}
			)
		}
	}

	public setBokehEffect (radius: number, duration: number, ease?: (v: number) => number ): void {
		if (!this.bokehEffect) return;
		this.tweens.add({ targets: this.bokehEffect, duration, ease, radius });
	}

	public triggerGameOver (score: number): void {
		if (!this.bokehEffect) this.bokehEffect = this.cameras.main.postFX.addBokeh(0, 0, 0);
		this.scene.launch('gameover-scene', { score });

		this.setBokehEffect(2, 1000, Phaser.Math.Easing.Sine.InOut);

		this.time.delayedCall(1000, () => {
			this.scene.pause();
		});
	}

	public create() {
		this.inputController = new InputController(this);

		// this.lights.enable().setAmbientColor(0x364f71);
		const map = this.initMap();

		// Camera Settings
		// this.cameras.main.setZoom(4);
		this.cameras.main.fadeIn(1000);
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		// Spawn entities of map
		const mapObjects = map.objects.find(o => o.name === 'Objects')?.objects;
		if (mapObjects) {
			mapObjects.forEach(o => {
				if (['bucket', 'arcade', 'character'].includes(o.type)) {
					const properties = parseTiledProperties(o.properties);
					switch (o.type) {
						case 'character': {
							if (o.name === 'dog') {
								const dog = new Dog(this, o.x ?? 0, o.y ?? 0).setIgnoreGravity(true);
								this.characters.push(dog);
							}
							break;
						}
						case 'bucket': {
							this.buckets.push(new DropBucket({
								scene: this,
								active: Boolean(properties.active),
								x: o.x ?? 0,
								y: o.y ?? 0,
								name: o.name,
								width: properties.width ? parseInt(properties.width.toString()) : 470,
								height: properties.height ? parseInt(properties.height.toString()) : 535,
								thickness: properties.thickness ? parseInt(properties.thickness.toString()) : 64,
								bgmKey: properties.bgmKey ? properties.bgmKey.toString() : 'bgm01',
								gameOverThreshold: properties.gameOverThreshold ? parseInt(properties.gameOverThreshold.toString()) : 535,
								maxTierToDrop: properties.maxTierToDrop ? parseInt(properties.maxTierToDrop.toString()) : undefined,
								disableMerge: Boolean(properties.disableMerge),
								droppableSet: DropBucket.getDroppableSetfromName(properties.droppableSet ? properties.droppableSet.toString() : 'flagSet'),
								image: properties.image ? properties.image as string : '',
								targetScore: 500,
								elevatorDistance: properties.elevatorDistance ? parseInt(properties.elevatorDistance.toString()) : undefined,
								elevatorBody: this.elevatorBodies.find(b => b.bucketName === o.name)?.body
							}));
							break;
						}
						case 'arcade': {
							const bucket = this.buckets.find(b => b.name === properties.bucket);
							this.arcades.push(new Arcade(this, o.x ?? 0, o.y ?? 0, o.name, undefined, bucket));
							break;
						}
					}
				}
			});
		}

		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			this.cameraFollowEntity({ object: playerCharacter, instant: false });
		}
	}
}
