import Phaser from 'phaser'
// import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket';
import { parseTiledProperties, scaleNumberRange } from '../functions/helper';
import { PetalEmitter } from '../models/PetalEmitter';
import chroma from 'chroma-js';
import Dog from '../entities/Dog';
import Arcade from '../entities/Arcade';
import { Instrument } from '../models/Instrument';
import BlinkingText from '../entities/BlinkingText';
import { Action, InputController } from '../models/Input';
import { CATEGORY_TERRAIN } from '../const/collisions';
import Character from '../entities/Character';
import Achan from '../entities/Achan';
import { EffectCircleOptions, TilemapLayerEffectCircle } from '../entities/TilemapLayerEffectCircle';
import { SFX } from '../models/SFX';
import RecyclingCan from '../entities/RecyclingCan';

// import Dog from '../entities/Dog';

export default class GameScene extends Phaser.Scene {
	public buckets: DropBucket[] = [];
	public arcades: Arcade[] = [];
	// public dog: Dog | undefined = undefined;
	public characters: Character[] = [];
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public reveilableTilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public effectCircles: TilemapLayerEffectCircle[] = [];
	public ignoreInputs = false;

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
		const tilesetJapan = map.addTilesetImage('tilesheet_japan');
		const tilesetMain = map.addTilesetImage('tilesheet_main');

		if (!tilesetJapan) throw new Error('tileset missing: tilesetJapan');
		if (!tilesetMain) throw new Error('tileset missing: tilesetMain');

		
		// Add layers from tileset
		const background3 = map.createLayer('Background3', tilesetJapan);
		if (background3) {
			this.tilemapLayers.push(background3);
			this.reveilableTilemapLayers.push(background3);
			// background3.setScrollFactor(1, 0);
		}
		const background2 = map.createLayer('Background2', tilesetJapan);
		if (background2) {
			this.tilemapLayers.push(background2);
			this.reveilableTilemapLayers.push(background2);
		}

		const background1 = map.createLayer('Background1', tilesetJapan);
		if (background1) {
			this.tilemapLayers.push(background1);
			this.reveilableTilemapLayers.push(background1);
		}

		const world = map.createLayer('World', tilesetMain);
		if (world) {
			// foreground.setPipeline('Light2D');
			this.tilemapLayers.push(world);
		}

		const terrain = map.createLayer('Terrain', tilesetJapan);
		if (terrain) {
			// terrain.setPipeline('Light2D');
			this.tilemapLayers.push(terrain);
			this.reveilableTilemapLayers.push(terrain);
		}

		const detail1 = map.createLayer('TerrainDetail2', tilesetJapan);
		if (detail1) {
			// detail1.setPipeline('Light2D');
			this.tilemapLayers.push(detail1);
			this.reveilableTilemapLayers.push(detail1);
		} 

		const detail2 = map.createLayer('TerrainDetail1', tilesetJapan);
		if (detail2) {
			// detail2.setPipeline('Light2D');
			this.tilemapLayers.push(detail2);
			this.reveilableTilemapLayers.push(detail2);
		} 

		const foreground = map.createLayer('Foreground', tilesetJapan);
		if (foreground) {
			// foreground.setPipeline('Light2D');
			this.tilemapLayers.push(foreground);
			this.reveilableTilemapLayers.push(foreground);		}

		// terrain?.forEachTile(t => {
		// 	t.alpha = 0.5;
		// });
	
		// Setup initial tilemap state
		this.getReveilableTilemapLayers().forEach(tl => {
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

  public destroyEffectCircle (circle: TilemapLayerEffectCircle): void {
    const index = this.effectCircles.findIndex(c => c === circle);
    if (index > -1) this.effectCircles.splice(index, 1);
    circle.destroy();
  }

  public addEffectCircle (x: number, y: number, options?: EffectCircleOptions): void {
    const circle = new TilemapLayerEffectCircle(this, x, y, options);
    this.effectCircles.push(circle);
  }

  private getNearestCircle (t: Phaser.Tilemaps.Tile): { distance: number; circle: TilemapLayerEffectCircle } | undefined {
    const distances = this.effectCircles.map(c => ({
      distance: c.getDistance(t.getCenterX(), t.getCenterY()),
      circle: c
    })).sort((a, b) => a.distance - b.distance);
    return distances[0];
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

	public getReveilableTilemapLayers ():  Phaser.Tilemaps.TilemapLayer[] {
		return this.reveilableTilemapLayers;
	}

	public getAllTilemapLayers ():  Phaser.Tilemaps.TilemapLayer[] {
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
	
    // Effect circles
    if (this.effectCircles.length > 0) {
      this.getReveilableTilemapLayers().forEach(tl => {
        tl.getTilesWithinWorldXY(this.cameras.main.worldView.left, this.cameras.main.worldView.top, this.cameras.main.worldView.width, this.cameras.main.worldView.height).forEach(t => {
          const nearest = this.getNearestCircle(t);
          if (nearest) {
            const affection = Math.max(scaleNumberRange(nearest.distance, [128, 0], [0, 1]) * nearest.circle.getInverseProgress(), 0) * nearest.circle.getEffect();
            this.updateTileProgress(t, nearest.circle.getColor(), affection, delta);
          }
        });  
      });
    }

		if (!this.ignoreInputs) {
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
    const sfx = this.registry.get('sfx:bucket') as SFX | undefined;
    if (sfx) sfx.playRandomSFXFromCategory(this, 'roll');

		if (!this.bokehEffect) this.bokehEffect = this.cameras.main.postFX.addBokeh(0, 0, 0);
		this.scene.launch('gameover-scene', {
			score,
			bgmConfig: this.getMountedBucket()?.bgm?.config,
			bucketKey: this.getMountedBucket()?.name
		});
		// this.scene.get('gameover-scene')?.

		this.setBokehEffect(2, 1000, Phaser.Math.Easing.Sine.InOut);
		this.ignoreInputs = true;
		// this.time.delayedCall(1000, () => {
		// 	this.scene.pause();
		// });
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

		const potentialStaticObjects: Phaser.Types.Tilemaps.TiledObject[] = [];
		const staticObjectsQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const charactersQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const bucketQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const arcadesQueue: Phaser.Types.Tilemaps.TiledObject[] = [];

		if (mapObjects) {
			mapObjects.forEach(o => {
				if (['bucket', 'arcade', 'character', 'staticObject', 'potentialStaticObject'].includes(o.type)) {
					switch (o.type) {
						case 'character': {	charactersQueue.push(o); break;	}
						case 'potentialStaticObject': { potentialStaticObjects.push(o); break; }
						case 'staticObject': { staticObjectsQueue.push(o); break; }
						case 'bucket': { bucketQueue.push(o); break; }
						case 'arcade': { arcadesQueue.push(o); }
					}
				}
			});
		}

		staticObjectsQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			if (o.name === 'recyclingCan') { new RecyclingCan(this, o.x ?? 0, o.y ?? 0, properties.frame ? properties.frame.toString() : 'blue');}
		});

		bucketQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			this.buckets.push(
				new DropBucket({
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
				targetScore: properties.targetScore ? parseInt(properties.targetScore.toString()) : 2000,
				elevatorDistance: properties.elevatorDistance ? parseInt(properties.elevatorDistance.toString()) : undefined
			}));
		});

		arcadesQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			const bucket = this.buckets.find(b => b.name === properties.bucket);
			this.arcades.push(new Arcade(this, o.x ?? 0, o.y ?? 0, o.name, undefined, bucket));
		});

		charactersQueue.forEach(o => {
			if (o.name === 'dog') {
				const dog = new Dog(this, o.x ?? 0, o.y ?? 0);
				this.characters.push(dog);
			} else if (o.name === 'achan') {
				const achan = new Achan(this, o.x ?? 0, o.y ?? 0);
				this.characters.push(achan);
			}
		});

		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			this.cameraFollowEntity({ object: playerCharacter, instant: false });
		}
	}
}
