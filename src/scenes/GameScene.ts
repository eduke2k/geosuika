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
import ChromaticPostFX from '../shaders/ChromaticPostFX';
import { SmallLamp, SmallLampFrame } from '../entities/SmallLamp';
import GameObject from '../entities/GameObject';
// import BendPostFX from '../shaders/BendPostFX';
// import BarrelPostFX from '../shaders/BarrelPostFX';
// import { WarpPostFX } from '../shaders/WarpPostFX/WarpPostFX.js';

// import Dog from '../entities/Dog';

export type GameSceneState = 'play' | 'changeLayer';

export default class GameScene extends Phaser.Scene {
	public state: GameSceneState = 'play';
	public buckets: DropBucket[] = [];
	public arcades: Arcade[] = [];
	public objects: GameObject[] = [];
	// public dog: Dog | undefined = undefined;
	public characters: Character[] = [];
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public reveilableTilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	public effectCircles: TilemapLayerEffectCircle[] = [];
	public ignoreInputs = false;
	public map: Phaser.Tilemaps.Tilemap | undefined = undefined;
	private tilesets: Record<string, Phaser.Tilemaps.Tileset> = {};
	private playerLight: Phaser.GameObjects.Light | undefined = undefined;

	// Active map stuff
	private currentMap = '';
	private currentMapLayer = '';
	private staticMapCollisions: MatterJS.BodyType[] = [];

	public inputController: InputController | null = null;
	public bokehEffect: Phaser.FX.Bokeh | undefined;

	// Layer change stuff
	private layerChangeSprites: any[] = [];

	constructor() {
		super({ key: 'game-scene' })
	}

	public getState (): GameSceneState {
		return this.state;
	}

	public setTimeScaleFromTween (tweenValue: number, start: number, end: number): void {
		const value = scaleNumberRange(tweenValue, [0, 1], [start, end]);
		this.setTimeScale(value);
	}

	public setTimeScale(value: number): void {
		this.time.timeScale = value;
		this.matter.world.engine.timing.timeScale = value;
		this.anims.globalTimeScale = value;
	}

	// private getRelativePlayableCharacterPosition (): Phaser.Math.Vector2 {
	// 	return new Phaser.Math.Vector2(
	// 		(this.getPlayerCharacter()?.x ?? 0) - this.cameras.main.worldView.x,
	// 		(this.getPlayerCharacter()?.y ?? 0) - this.cameras.main.worldView.y
	// 	)
	// }

	public startLayerChange (): void {
		const duration = 1000;

		// this.cameras.main.setPostPipeline(WarpPostFX);
		// const pipeline = this.cameras.main.getPostPipeline(WarpPostFX) as any;
		// pipeline.direction = {
		// 	x: 0,
		// 	y: 1
		// }
		// pipeline.smoothness = 1;

		const currentPlayerLightRadius = this.playerLight?.radius ?? 400;
		const currentAmbient = Phaser.Display.Color.RGBToString(this.lights.ambientColor.r * 255, this.lights.ambientColor.g * 255, this.lights.ambientColor.b * 255);

		this.tweens.addCounter({
			from: 0,
			to: 1,
			duration: duration,
			ease: Phaser.Math.Easing.Sine.Out,
			onUpdate: (tween) => {
				this.setTimeScaleFromTween(tween.getValue(), 1, 0.05);
				this.playerLight?.setRadius((1 - tween.getValue()) * currentPlayerLightRadius);
				this.lights.setAmbientColor(Phaser.Display.Color.HexStringToColor(chroma.mix(currentAmbient, '#000000', tween.getValue()).hex()).color);
			},
			onComplete: () => {
				this.setTimeScale(0.05);
				this.nextLayer(1);
				this.tweens.addCounter({
					from: 0,
					to: 1,
					duration: duration,
					ease: Phaser.Math.Easing.Sine.In,
					onUpdate: (tween) => {
						this.setTimeScaleFromTween(tween.getValue(), 0.05, 1);
						this.playerLight?.setRadius(tween.getValue() * currentPlayerLightRadius);
						this.lights.setAmbientColor(Phaser.Display.Color.HexStringToColor(chroma.mix('#000000', currentAmbient, tween.getValue()).hex()).color);
					},
					onComplete: () => {
						this.setTimeScale(1);
					}
				});
			}
		});
	}

	public nextLayer (_direction: -1 | 1) {
		const newLayer = this.getCurrentMapLayer() === 'main' ? 'japan' : 'main';

		this.unloadActiveWorldLayer();
		this.loadInWorldLayer(newLayer);
	}

	public endLayerChange (): void {
		this.state = 'play';
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

  // private getNearestCircle (t: Phaser.Tilemaps.Tile): { distance: number; circle: TilemapLayerEffectCircle } | undefined {
  //   const distances = this.effectCircles.map(c => ({
  //     distance: c.getDistance(t.getCenterX(), t.getCenterY()),
  //     circle: c
  //   })).sort((a, b) => a.distance - b.distance);
  //   return distances[0];
  // }

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

	public updateTiles (tiles: Phaser.Tilemaps.Tile[], delta: number): void {
		tiles.forEach(t => {
			
			// Update Alpha
			const targetAlphaProgress = t.properties.progress ?? 0;
			const currentAlpha = t.alpha;
			const newAlpha = ((targetAlphaProgress - currentAlpha) / 2 / delta) + currentAlpha;
			t.alpha = newAlpha;

			// Update Position
			// const targetPositionProgress = t.properties.progressX ?? 0;
			// const targetOffset = (1 - targetPositionProgress) * 64;
			// const newOffset = targetOffset //((targetOffset - currentOffset) / 2 / delta) + currentOffset;
			// t.pixelY = t.properties.originalPixelY + newOffset;
		});
	}

	public getAllVisibleTiles (): Phaser.Tilemaps.Tile[] {
		const tiles: Phaser.Tilemaps.Tile[] = []; 
		this.tilemapLayers.forEach(tl => {
			tiles.push(...tl.getTilesWithinWorldXY(this.cameras.main.worldView.left, this.cameras.main.worldView.top, this.cameras.main.worldView.width, this.cameras.main.worldView.height));
		});
		return tiles;
	}

	public updateTileTargetProgressByDistance (center: { x: number, y: number }, tiles: Phaser.Tilemaps.Tile[]): void {
		tiles.forEach(t => {
			const distance = Phaser.Math.Distance.BetweenPoints(center, { x: t.properties.originalPixelX + (t.width / 2), y: t.properties.originalPixelY + (t.width / 2) });
			t.properties.progress = Math.max(Math.min(scaleNumberRange(distance, [256, 254], [0, 1]), 1), 0);
			
			const distanceX = Math.abs(center.x - (t.properties.originalPixelX + (t.width / 2) ));
			t.properties.progressX = Math.min(scaleNumberRange(distanceX, [256, 0], [0, 2]), 1);
			// t.width = t.baseWidth * scaledDistance;
			// t.height = t.baseHeight * scaledDistance;

			// const nearest = this.getNearestCircle(t);
			// if (nearest) {
			// 	const affection = Math.max(scaleNumberRange(nearest.distance, [128, 0], [0, 1]) * nearest.circle.getInverseProgress(), 0) * nearest.circle.getEffect();
			// 	this.updateTileProgress(t, nearest.circle.getColor(), affection, delta);
			// }
		});  
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

	public loadInWorldLayer (layerName: string): void {
		if (!this.map) {
			console.error(`Could not load in map layer '${layerName}' because map is not set in GameScenee`);
			return;
		}

		this.currentMapLayer = layerName;

		const terrainLayer = this.map.layers.find(l => l.name.startsWith(`${layerName}_terrain`));
		// const backgroundLayer = this.map.layers.find(l => l.name.startsWith(`${layerName}_background`));
		// const detailsLayer = this.map.layers.find(l => l.name.startsWith(`${layerName}_details`));
		// const foregroundLayer = this.map.layers.find(l => l.name.startsWith(`${layerName}_foreground`));
		const objectLayer = this.map.objects.find(l => l.name.startsWith(`${layerName}_objects`));

		// Add available map layers to rendering pipe
		if (terrainLayer) {
			const existingLayer = this.tilemapLayers.find(l => l.layer.name === terrainLayer.name);

			if (existingLayer) {
				existingLayer.setVisible(true);
			} else {
				const tileset = this.tilesets[(terrainLayer?.properties as { name: string, value: string }[]).find(k => k.name === 'tileset')?.value ?? ''];
				const layer = this.map.createLayer(terrainLayer.name, tileset);
				if (layer) {
					layer?.setPipeline('Light2D');
					this.tilemapLayers.push(layer);
				}
			}
		}

		// this.tilemapLayers.forEach(tl => {
		// 	tl.forEachTile(t => {
		// 		t.properties.progress = 0;
		// 		t.alpha = 0;
		// 		t.properties.originalPixelX = t.x * t.baseWidth;
		// 		t.properties.originalPixelY = t.y * t.baseHeight;
		// 	});
		// });

		// Generate map collisions from object layer
		const Body = new Phaser.Physics.Matter.MatterPhysics(this).body;
		if (objectLayer) {
			objectLayer.objects.forEach(o => {
				if (o.type === 'collision') {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						this.staticMapCollisions.push(this.matter.add.rectangle(
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
						));
					} else if (o.polygon && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						const body = this.matter.add.fromVertices(0, 0, o.polygon, { isStatic: true, label: o.name });
						Body.setPosition(body, { x: o.x + body.centerOffset.x, y: o.y + body.centerOffset.y}, false);
						this.staticMapCollisions.push(body);
					}
				}
			});
		}

		const staticObjectsQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const charactersQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const bucketQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const arcadesQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const objectsQueue: Phaser.Types.Tilemaps.TiledObject[] = [];

		if (objectLayer) {
			objectLayer.objects.forEach(o => {
				if (['bucket', 'arcade', 'character', 'staticObject', 'object'].includes(o.type)) {
					switch (o.type) {
						case 'character': {	charactersQueue.push(o); break;	}
						case 'staticObject': { staticObjectsQueue.push(o); break; }
						case 'object': { objectsQueue.push(o); break; }
						case 'bucket': { bucketQueue.push(o); break; }
						case 'arcade': { arcadesQueue.push(o); break; }
					}
				}
			});
		}

		staticObjectsQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			if (o.name === 'recyclingCan') { new RecyclingCan(this, o.x ?? 0, o.y ?? 0, properties.frame ? properties.frame.toString() : 'blue');}
		});

		objectsQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			if (o.name === 'smallLamp') {
				this.objects.push(new SmallLamp(
					this,
					o.x ?? 0,
					o.y ?? 0,
					{
						frame: properties.frame ? (properties.frame.toString() as SmallLampFrame) : undefined,
						ropeLength: properties.ropeLength ? (properties.ropeLength as number) : undefined,
						constrained: properties.constrained ? (properties.ropeLength as boolean) : undefined,
					}
				));
			}
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
			}
		});
	}

	public unloadActiveWorldLayer (): void {
		// Remove all static collisions
		this.matter.world.remove(this.staticMapCollisions);
		this.staticMapCollisions = [];

		// Remove active tileset
		this.tilemapLayers.forEach(l => { 
			l.setVisible(false);
		})

		this.arcades.forEach(a => {	a.destroy(); });
		this.arcades = [];

		this.buckets.forEach(b => {	b.destroy(); });
		this.buckets = [];

		// console.log(this.map);
		// this.tilemapLayers = [];

		this.currentMapLayer = '';
	}

	public getCurrentMap (): string {
		return this.currentMap;
	}

	public getCurrentMapLayer(): string {
		return this.currentMapLayer
	}

	private loadMap (mapKey: string): Phaser.Tilemaps.Tilemap {
		this.currentMap = mapKey;

		// create the Tilemap
		const map = this.make.tilemap({ key: mapKey });
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		map.tilesets.forEach(t => {
			const tileset = map.addTilesetImage(t.name);
			if (tileset) this.tilesets[t.name] = tileset;
		});
		// const tilesetJapan = map.addTilesetImage('tilesheet_japan');
		// const tilesetMain = map.addTilesetImage('tilesheet_main');

		return map;
	}

	public create() {
		// Enable Lights
		this.lights.enable().setAmbientColor(0x0f101c);
		this.playerLight = this.lights.addLight(0, 0, 400, 0xFFFFFF, 2);

		const achan = new Achan(this, 0, 0);
		this.characters.push(achan);

		this.inputController = new InputController(this);
		this.map = this.loadMap('map2');
		this.loadInWorldLayer('japan');

		this.cameras.main.setPostPipeline(ChromaticPostFX);

		const playerSpawn = this.map.getObjectLayer('triggers')?.objects.find(o => o.name === 'playerSpawn');
		achan.setPosition(playerSpawn?.x, playerSpawn?.y);

		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			this.cameraFollowEntity({ object: playerCharacter, instant: false });
		}

		// Camera Settings
		this.cameras.main.fadeIn(1000);
	}

	public update (time: number, delta: number): void {
		const player = this.getPlayerCharacter();

		// Let PlayerLight follow Player
		this.playerLight?.setPosition(player?.body?.position.x, player?.body?.position.y);

		this.petalEmitter.update(time, delta);
		this.characters.forEach(c => c.update(time, delta));
		this.arcades.forEach(a => a.update(time, delta));
		this.buckets.forEach(a => a.update(time, delta));
		this.objects.forEach(a => a.update(time, delta));
		
		const mountedBucket = this.getMountedBucket();

		// TILE UPDATE LOGIC
		// const allVisibleTiles = this.getAllVisibleTiles();
		// if (player && player.body) {
		// 	this.updateTileTargetProgressByDistance(player.body.position, allVisibleTiles);
		// }
		// this.updateTiles(allVisibleTiles, delta);

    // EFFECT CIRCLE LOGIC
    // if (this.effectCircles.length > 0) {
    //   this.getReveilableTilemapLayers().forEach(tl => {
    //     tl.getTilesWithinWorldXY(this.cameras.main.worldView.left, this.cameras.main.worldView.top, this.cameras.main.worldView.width, this.cameras.main.worldView.height).forEach(t => {
    //       const nearest = this.getNearestCircle(t);
    //       if (nearest) {
    //         const affection = Math.max(scaleNumberRange(nearest.distance, [128, 0], [0, 1]) * nearest.circle.getInverseProgress(), 0) * nearest.circle.getEffect();
    //         this.updateTileProgress(t, nearest.circle.getColor(), affection, delta);
    //       }
    //     });  
    //   });
    // }

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
}
