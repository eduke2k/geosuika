import Phaser from 'phaser'
// import Droppable from '../entities/Droppable';
import DropBucket from '../entities/DropBucket/DropBucket';
import { getNormalizedRelativePositionToCanvas, getRandomId, parseTiledProperties } from '../functions/helper';
import { scaleNumberRange } from '../functions/numbers';
import { PetalEmitter } from '../models/PetalEmitter';
import chroma from 'chroma-js';
import Dog from '../entities/Dog';
import Arcade from '../entities/Arcade';
import { Action } from '../models/Input';
import { CATEGORY_ONEWAY_PLATFORM, CATEGORY_TERRAIN } from '../const/collisions';
import Character from '../entities/Character';
import Achan from '../entities/Achan';
// import { EffectCircleOptions, TilemapLayerEffectCircle } from '../entities/TilemapLayerEffectCircle';
import { SFX } from '../models/SFX';
import RecyclingCan from '../entities/RecyclingCan';
import ChromaticPostFX, { CHROMATIC_BASE_STRENGTH } from '../shaders/ChromaticPostFX';
import { SmallLamp, SmallLampFrame } from '../entities/SmallLamp';
import GameObject from '../entities/GameObject';
import BaseScene from './BaseScene';
import CinematicBarsFX from '../shaders/CinematicBarsFX';
import { StaticOneWayPlatform } from '../entities/Platforms/StaticOneWayPlatform';
import { SoundSource2d } from '../entities/Sound/SoundSource2d';
import { PauseSceneInitData } from './PauseScene';
import { WaterRectangle } from '../entities/WaterRectangle';
import BlackHoleFX from '../shaders/BlackHoleFX';
import InteractableGameObject from '../entities/InteractableGameObject';
import HUDScene from './HUDScene';
import GenericInteractable from '../entities/GenericInteractable';
import Shrine, { ShrineTag } from '../entities/Shrine';
import { JumpingPad } from '../entities/JumpingPad';
import { Crate } from '../entities/Crate';
import { Sensor } from '../entities/Sensor';
import Flameboy from '../entities/Flameboy';
import { LocalStorage } from '../models/LocalStorage';
// import BendPostFX from '../shaders/BendPostFX';
// import BarrelPostFX from '../shaders/BarrelPostFX';
// import { WarpPostFX } from '../shaders/WarpPostFX/WarpPostFX.js';

// import Dog from '../entities/Dog';

export type GameSceneState = 'play' | 'changeLayer';

type LevelBounds = {
	ambientColor?: string;
	rect: Phaser.Geom.Rectangle;
}

type ObjectState = {
	id: number;
	x: number;
	y: number;
	destroyed: boolean;
}

type MutateObjectStatePayload = {
	id: number;
	x?: number;
	y?: number;
	destroyed?: boolean;
}

type PositionReference = {
	id: number;
	x: number;
	y: number;
}

export type Snapshot = {
	collectibles: Record<string, boolean>
}

export default class GameScene extends BaseScene {
	public state: GameSceneState = 'play';
	public buckets: DropBucket[] = [];
	public arcades: Arcade[] = [];
	public objects: GameObject[] = [];
	public characters: Character[] = [];
	public positions: PositionReference[] = [];
	public soundSources2d: SoundSource2d[] = [];
	public playerCharacter: Character | undefined;
	public petalEmitter = new PetalEmitter(this);
	public tilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	// public reveilableTilemapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	// public effectCircles: TilemapLayerEffectCircle[] = [];
	public map: Phaser.Tilemaps.Tilemap | undefined = undefined;
	private tilesets: Record<string, Phaser.Tilemaps.Tileset> = {};
	private playerLight: Phaser.GameObjects.Light | undefined = undefined;
  private breakerSound!: Phaser.Sound.BaseSound | undefined;
  private riserSound!: Phaser.Sound.BaseSound | undefined;
	private chromaticPostFX?: ChromaticPostFX;
	private cinematicBarsFX?: CinematicBarsFX;
	private waterRectangles: WaterRectangle[] = [];

	private objectStates: ObjectState[] = [];

	// Active map stuff
	private currentMap = '';
	private currentMapLayer = '';
	private staticMapCollisions: MatterJS.BodyType[] = [];
	private staticOneWayPlatforms: StaticOneWayPlatform[] = [];
	private sensors: Sensor[] = [];
	public bokehEffect: Phaser.FX.Bokeh | undefined;

	// Collectibles
	public collectibles: Record<string, boolean> = {
		para: false,
		duck: false,
		ude: false,
		lisa: false,
		jenell: false,
		arc: false,
		osaka: false,
		achan: false,
		easteregg: false,
		lumia: false,
		elbfoxx: false,
		renato: false,
		haon: false,
		puntoffel: false,
		geotastic: false,
		tentacle: false,
		spielzwerg: false,
		panda: false,
		tape: false
	};

	// Arrays
	public interactablesInRange: InteractableGameObject[] = [];

	// Layer change stuff
	// private layerChangeSprites: any[] = [];

	constructor() {
		super({ key: 'game-scene' })
	}

	public getState (): GameSceneState {
		return this.state;
	}

	public generateSnapshot (): string {
		const snapshot: Snapshot = {
			collectibles: this.collectibles
		}
		return JSON.stringify(snapshot);
	}

	public setCollected (eggKey: string): void {
		if (this.collectibles[eggKey] !== undefined) this.collectibles[eggKey] = true;

		const collected = Object.values(this.collectibles).filter(c => c === true).length;
		const total = Object.keys(this.collectibles).length;

		(this.scene.get('hud-scene') as HUDScene).updateCollectiblesAmount(collected, total);

		LocalStorage.setSnapshot(this.generateSnapshot());

		if (collected === total) {
			window.top?.postMessage('cc92527dd58d73706274f048de679f22', 'http://localhost:8080'); // Community egg
			window.top?.postMessage('cc92527dd58d73706274f048de679f22', 'https://geotastic.net'); // Community egg
		}
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

	public setCinematicBar (strength: number, duration: number): void {
		if (!this.cinematicBarsFX) return;
		const pipeline = this.cinematicBarsFX;
		this.tweens.addCounter({
			from: pipeline.getStrength(),
			to: strength,
			duration,
			onUpdate: (tween) => {
				pipeline.setStrength(tween.getValue());
			},
			onComplete: () => {
				pipeline.setStrength(strength);
			}
		});
	}

	public setChromaticEffect (effect: number, duration: number): void {
		if (!this.chromaticPostFX) return;
		const pipeline = this.chromaticPostFX;
		this.tweens.addCounter({
			from: pipeline.getStrength(),
			to: effect,
			duration,
			onUpdate: (tween) => {
				pipeline.setStrength(tween.getValue());
			},
			onComplete: () => {
				pipeline.setStrength(effect);
			}
		});
	}

	public startLayerChange (target: string): void {
		this.riserSound?.play();
		this.getPlayerCharacter()?.setFreezeInteract(true);
		const duration = 1000;
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
				this.chromaticPostFX?.setStrength(1 + tween.getValue() * 9);
			},
			onComplete: () => {
				this.setTimeScale(0.05);
				this.toggleLayer(target);

				this.getPlayerCharacter()?.setFreezeInteract(false);
				this.setTimeScale(1);
				this.playerLight?.setRadius(currentPlayerLightRadius);
				this.chromaticPostFX?.setStrength(CHROMATIC_BASE_STRENGTH);
			}
		});
	}

	public toggleLayer (targetLayer: string): void {
		this.breakerSound?.play();
		this.unloadActiveWorldLayer();
		this.loadInWorldLayer(targetLayer);
	}

	// public nextLayer (_direction: -1 | 1) {
	// 	const newLayer = this.getCurrentMapLayer() === 'main' ? 'japan' : 'main';
	// 	this.breakerSound?.play();

	// 	this.unloadActiveWorldLayer();
	// 	this.loadInWorldLayer(newLayer);
	// }

	public endLayerChange (): void {
		this.state = 'play';
	}

  // public destroyEffectCircle (circle: TilemapLayerEffectCircle): void {
  //   const index = this.effectCircles.findIndex(c => c === circle);
  //   if (index > -1) this.effectCircles.splice(index, 1);
  //   circle.destroy();
  // }

  // public addEffectCircle (x: number, y: number, options?: EffectCircleOptions): void {
  //   const circle = new TilemapLayerEffectCircle(this, x, y, options);
  //   this.effectCircles.push(circle);
  // }

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

	// public getReveilableTilemapLayers ():  Phaser.Tilemaps.TilemapLayer[] {
	// 	return this.reveilableTilemapLayers;
	// }

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
		return this.playerCharacter;
		// return this.characters.find(c => c.isPlayerControlled())
	}

	public bucketUnmountFinished (_bucket: DropBucket): void {
		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			playerCharacter.isAtArcade = false;
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

	public setBokehEffect (radius: number, duration: number, ease?: (v: number) => number, onComplete?: () => void): void {
		if (!this.bokehEffect) return;
		this.tweens.add({ targets: this.bokehEffect, duration, ease, radius, onComplete });
	}

	public pause (): void {
		if (!this.bokehEffect) this.bokehEffect = this.cameras.main.postFX.addBokeh(0, 0, 0);
		this.setBokehEffect(2, 100, Phaser.Math.Easing.Sine.InOut, () => {
			const payload: PauseSceneInitData = {
				bucket: this.getMountedBucket()
			}
			this.scene.launch('pause-scene', payload);
			this.scene.pause();
		});
		this.ignoreInputs = true;
	}

	public continue (): void {
		this.ignoreInputs = false;
		this.setBokehEffect(0, 100, Phaser.Math.Easing.Sine.InOut, () => {
			this.bokehEffect?.destroy();
		});
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

		this.petalEmitter.setIntesity(0);
		this.petalEmitter.resetTint();

		this.setBokehEffect(2, 1000, Phaser.Math.Easing.Sine.InOut);
		this.ignoreInputs = true;
		// this.time.delayedCall(1000, () => {
		// 	this.scene.pause();
		// });
	}

	public dropDownOnewayPlatform (bodyId: number): void {
		const platform = this.staticOneWayPlatforms.find(p => p.body.id === bodyId);
		if (platform && !platform.ignoreFallThrough) platform.disableCollision();
	}

	private tileSetLogic (layerData?: Phaser.Tilemaps.LayerData): void {
		if (!layerData || !this.map) return;
		const existingLayer = this.tilemapLayers.find(l => l.layer.name === layerData.name);

		if (existingLayer) {
			existingLayer.setVisible(true);
		} else {
			const tileset = this.tilesets[(layerData?.properties as { name: string, value: string }[]).find(k => k.name === 'tileset')?.value ?? ''];
			const layer = this.map.createLayer(layerData.name, tileset);
			if (layer) {
				layer?.setPipeline('Light2D');
				this.tilemapLayers.push(layer);
			}
		}
	}

	public loadInWorldLayer (layerName: string): void {
		if (!this.map) {
			console.error(`Could not load in map layer '${layerName}' because map is not set in GameScenee`);
			return;
		}

		this.currentMapLayer = layerName;

		const objectLayer = this.map.objects.find(l => l.name.startsWith(`${layerName}_objects`));
		const bounds: LevelBounds[] = [];

		// Add available map layers in correct order to rendering pipe
		this.tileSetLogic(this.map.layers.find(l => l.name.startsWith(`${layerName}_background`)));
		this.tileSetLogic(this.map.layers.find(l => l.name.startsWith(`${layerName}_terrain`)));
		this.tileSetLogic(this.map.layers.find(l => l.name.startsWith(`${layerName}_foreground`)));

		// Generate map collisions from object layer
		const Body = new Phaser.Physics.Matter.MatterPhysics(this).body;
		if (objectLayer) {
			objectLayer.objects.forEach(o => {
				const properties = parseTiledProperties(o.properties);
				if (['collision'].includes(o.type)) {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						const body = this.matter.add.rectangle(
							o.x + (o.width / 2),
							o.y + (o.height / 2),
							o.width,
							o.height,
							{
								isStatic: true,
								label: o.name,
								collisionFilter: {
									group: 0,
									category: o.type === 'collision' ? CATEGORY_TERRAIN : CATEGORY_ONEWAY_PLATFORM,
								}
							},
						)
						this.staticMapCollisions.push(body);
					} else if (o.polygon && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						const body = this.matter.add.fromVertices(0, 0, o.polygon, { isStatic: true, label: o.name });
						Body.setPosition(body, { x: o.x + body.centerOffset.x, y: o.y + body.centerOffset.y}, false);
						this.staticMapCollisions.push(body);
					}
				} else if (o.type === 'oneway-collision') {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						this.staticOneWayPlatforms.push(new StaticOneWayPlatform(
							this,
							o.x,
							o.y,
							o.width,
							o.height,
							properties.ignoreFallThrough !== undefined ? (properties.ignoreFallThrough as boolean) : false,
						));
					}
				} else if (o.type === 'bounds') {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						bounds.push({
							ambientColor: properties.ambient?.toString(),
							rect: new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height)
						});
					}
				} else if (o.type === 'sensor') {
					if (o.rectangle && o.visible && o.x !== undefined && o.y !== undefined && o.width !== undefined && o.height !== undefined) {
						this.sensors.push(new Sensor(
							this,
							o.id,
							o.x,
							o.y,
							o.width,
							o.height,
							{
								teleportTargetId: properties.teleport !== undefined ? (properties.teleport as number) : undefined,
								whitelist: properties.whitelist !== undefined ? (properties.whitelist as string).split(',') : undefined,
								action: properties.action !== undefined ? (properties.action as string) : undefined,
							}
						));
					}
				}
			});
		}

		const staticObjectsQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const charactersQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const bucketQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const arcadesQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const objectsQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const soundSource2dQueue: Phaser.Types.Tilemaps.TiledObject[] = [];
		const waterShaderQueue: Phaser.Types.Tilemaps.TiledObject[] = [];

		// Apply new camera bounds if player character is within one
		const currentBounds = this.getFirstRectWithinBounds(bounds, { x: this.playerCharacter?.getBody()?.position.x ?? 0, y: this.playerCharacter?.getBody()?.position.y ?? 0 });
		this.cameras.main.setBounds(currentBounds.rect.x, currentBounds.rect.y, currentBounds.rect.width, currentBounds.rect.height);
		this.cameras.main.setBackgroundColor('#0a0a0a');
		const hex = currentBounds.ambientColor ? `#${currentBounds.ambientColor?.substring(3)}` : '#000000';
		this.lights.setAmbientColor(Phaser.Display.Color.HexStringToColor(hex).color);

		if (objectLayer) {
			objectLayer.objects.forEach(o => {
				// console.log(o);
				if (['bucket', 'arcade', 'character', 'staticObject', 'object', 'soundSource2d', 'shrine', 'jumping-pad', 'position'].includes(o.type) && currentBounds.rect.contains(o.x ?? 0, o.y ?? 0)) {
					switch (o.type) {
						case 'character': {	charactersQueue.push(o); break;	}
						case 'staticObject': { staticObjectsQueue.push(o); break; }
						case 'object': { objectsQueue.push(o); break; }
						case 'egg': { arcadesQueue.push(o); break; }
						case 'bucket': { bucketQueue.push(o); break; }
						case 'arcade': { arcadesQueue.push(o); break; }
						case 'soundSource2d': { soundSource2dQueue.push(o); break; }
						case 'shrine': { objectsQueue.push(o); break; }
						case 'jumping-pad': { objectsQueue.push(o); break; }
						case 'position': { this.positions.push({ id: o.id, x: o.x ?? 0, y: o.y ?? 0 }); break; }
					}
				}
			});
		}

		waterShaderQueue.forEach(o => {
			this.waterRectangles.push(new WaterRectangle(this, o.x ?? 0, o.y ?? 0, o.width ?? 1, o.height ?? 1));
		});

		staticObjectsQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);
			if (o.name === 'recyclingCan') { new RecyclingCan(this, o.x ?? 0, o.y ?? 0, properties.frame ? properties.frame.toString() : 'blue');}
		});

		objectsQueue.forEach(o => {
			// Check for saved states to apply
			const objectState = this.objectStates.find(s => s.id === o.id);
			if (objectState?.destroyed) return;

			const id = o.id ?? getRandomId();
			const posX = objectState?.x ?? o.x ?? 0;
			const posY = objectState?.y ?? o.y ?? 0;

			const properties = parseTiledProperties(o.properties);
			switch (o.name) {
				case 'crate': {
					this.objects.push(new Crate(
						this,
						id,
						posX,
						posY,
						properties.scale ? (properties.scale as number) : 4,
					));
					break;
				}
				case 'jumping-pad': {
					this.objects.push(new JumpingPad(
						this,
						id,
						posX,
						posY,
						properties.strength ? (properties.strength as number) : 1,
					));
					break;
				}
				case 'shrine': {
					this.objects.push(new Shrine(
						this,
						id,
						posX,
						posY,
						properties.frame ? (properties.frame.toString() as ShrineTag) : 'tori',
						properties.target ? (properties.target.toString() as string) : '',
					));
					break;
				}
				case 'generic': {
					const name = properties.name ? (properties.name as string) : '';
					// skip if already collected
					if (this.collectibles[name]) break;
					this.objects.push(new GenericInteractable(
						this,
						id,
						posX,
						posY,
						properties.w ? (properties.w as number) : 16,
						properties.h ? (properties.h as number) : 16,
						properties.scale ? (properties.scale as number) : 1,
						name,
						properties.spriteKey ? (properties.spriteKey as string) : '',
						properties.frame ? (properties.frame.toString() as string) : 0,
						properties.message ? (properties.message.toString() as string) : 'Fallback Text',
						properties.collectible !== undefined ? (properties.collectible as boolean) : false,
						properties.mirror !== undefined ? (properties.mirror as boolean) : false,
						properties.light !== undefined ? (properties.light as boolean) : false,
						properties.lightColor !== undefined ? (properties.lightColor as string) : undefined,
					));
					break;
				}
				case 'smallLamp': {
					this.objects.push(new SmallLamp(
						this,
						id,
						posX,
						posY,
						{
							frame: properties.frame ? (properties.frame.toString() as SmallLampFrame) : undefined,
							ropeLength: properties.ropeLength ? (properties.ropeLength as number) : undefined,
							constrained: properties.constrained ? (properties.ropeLength as boolean) : undefined,
						}
					));
					break;
				}
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
			const bucket = this.buckets.find(b => b.name === bucketQueue.find(bq => bq.id === (properties.bucket as number))?.name);
			this.arcades.push(new Arcade(this, o.id ? o.id : getRandomId(), o.x ?? 0, o.y ?? 0, o.name, undefined, bucket, properties.mirror as boolean));
		});

		charactersQueue.forEach(o => {
			const properties = parseTiledProperties(o.properties);

			switch (o.name) {
				case 'dog': {
					const c = new Dog(
						this,
						o.id ? o.id : getRandomId(),
						o.x ?? 0,
						o.y ?? 0
					);
					this.characters.push(c);
					break;
				}
				case 'flameboy': {
					const c = new Flameboy(
						this,
						o.id ? o.id : getRandomId(),
						o.x ?? 0,
						o.y ?? 0,
						properties.direction ? (properties.direction as (1 | -1)) : 1
					);
					this.characters.push(c);
					break;
				}
			}
		});

		if (this.playerCharacter) {
			const reference = this.playerCharacter;
			soundSource2dQueue.forEach(o => {
				const properties = parseTiledProperties(o.properties);
				const audioKey = properties.key.toString();
				const reach = parseInt(properties.reach.toString());
				const volume = parseFloat(properties.volume.toString());
				this.soundSources2d.push(new SoundSource2d(this, o.x ?? 0, o.y ?? 0, reference, { audioKey, reach, volume }));
			});
		}
	}

	private getFirstRectWithinBounds (bounds: LevelBounds[], pos: { x: number, y: number }): LevelBounds {
		for (let i = 0; i < bounds.length; i++) {
			if (bounds[i].rect.contains(pos.x, pos.y)) {
				return bounds[i];
			}
		}

		// Fall back to full map bounds
		return {
			rect: new Phaser.Geom.Rectangle(0, 0, this.map?.widthInPixels, this.map?.heightInPixels)
		}
	}

	public removeFromObjects (object: InteractableGameObject): void {
		const index = this.objects.findIndex(o => o === object);
		if (index > -1) this.objects.splice(index, 1);
		// console.log('spliced object on index', index);
	}

	public syncObjectState(payload: MutateObjectStatePayload): void {
		const index = this.objectStates.findIndex(s => s.id === payload.id);
		if (index === -1) {
			this.objectStates.push({
				id: payload.id,
				x: payload.x ?? 0,
				y: payload.y ?? 0,
				destroyed: payload.destroyed !== undefined ? payload.destroyed : false,
			});
		} else {
			if (payload.destroyed !== undefined) this.objectStates[index].destroyed = payload.destroyed;
			if (payload.x !== undefined) this.objectStates[index].x = payload.x;
			if (payload.y !== undefined)this.objectStates[index].y = payload.y;
		}
	}

	private saveObjectSates (objects: GameObject[]): void {
		objects.forEach(o => {
			this.syncObjectState({
				id: o.id,
				x: o.body?.position.x ?? 0,
				y: o.body?.position.y ?? 0,
				destroyed: false
			});
		});

		// console.log('current object state', this.objectStates);
	}

	public unloadActiveWorldLayer (): void {
		// Save state of all objects
		this.saveObjectSates([...this.objects])

		// Remove all static collisions
		this.matter.world.remove(this.staticMapCollisions);
		this.staticMapCollisions = [];

		this.staticOneWayPlatforms.forEach(s => s.destroy());
		this.staticOneWayPlatforms = [];

		this.sensors.forEach(s => s.destroy());
		this.sensors = [];

		// Remove active tileset
		this.tilemapLayers.forEach(l => { 
			l.setVisible(false);
		})

		this.arcades.forEach(a => {	a.destroy(); });
		this.arcades = [];

		this.characters.forEach(a => {	a.destroy(); });
		this.characters = [];

		this.buckets.forEach(b => {	b.destroy(); });
		this.buckets = [];

		this.objects.forEach(o => {	o.destroy(); });
		this.objects = [];

		this.positions = [];

		this.soundSources2d.forEach(o => {	o.destroy(); });
		this.soundSources2d = [];

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

		map.tilesets.forEach(t => {
			// This will determine if the double resolution tilemap images are being used or not. Double resoluton means the tileset image config needs
			// to be doubled as well
			const scale = 1;
			const tileset = map.addTilesetImage(t.name, undefined, map.tileHeight * scale, map.tileHeight * scale, t.tileMargin * scale, t.tileSpacing * scale);
			if (tileset) this.tilesets[t.name] = tileset;
		});
		// const tilesetJapan = map.addTilesetImage('tilesheet_japan');
		// const tilesetMain = map.addTilesetImage('tilesheet_main');

		return map;
	}

	public init () {
		// Clear arrays. Those might still be filled with obsolete data from an earlier game scene instance
		this.tilemapLayers = [];
		this.buckets = [];
		this.arcades = [];
		this.objects = [];
		this.characters = [];
		this.soundSources2d = [];

		// if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
		// 	this.game.renderer.pipelines.add(
		// 		'TestPipeline',
		// 		new WaterFX(this.game)
		// 	);
		// }
	}

	public create () {
		super.create();

		// Load state
		const snapshotString = LocalStorage.getSnapshot();
		if (snapshotString) {
			try {
				const snapshot = JSON.parse(snapshotString) as Snapshot;
				this.collectibles = Object.assign(this.collectibles, snapshot.collectibles);
			} catch (e) {
				console.error('could not parse snapshot string', e);
			}
		}

		// Setup initail HUD
		const collected = Object.values(this.collectibles).filter(c => c === true).length;
		(this.scene.get('hud-scene') as HUDScene).updateCollectiblesAmount(collected, Object.keys(this.collectibles).length);

		this.breakerSound = this.soundManager?.sound.add('sfx:breaker');
		this.riserSound = this.soundManager?.sound.add('sfx:riser');
		this.ignoreInputs = false;

		// Enable Lights
		this.lights.enable();
		this.playerLight = this.lights.addLight(0, 0, 400, 0xFFFFFF, 2);

		const achan = new Achan(this, getRandomId(), 0, 0);
		this.playerCharacter = achan;

		this.map = this.loadMap('map2');
		const playerSpawn = this.map.getObjectLayer('triggers')?.objects.find(o => o.name === 'playerSpawn');
		achan.setPosition(playerSpawn?.x, playerSpawn?.y);

		const properties = playerSpawn ? parseTiledProperties(playerSpawn.properties) : undefined;
		this.loadInWorldLayer(properties?.layer ? (properties.layer as string) : 'street');

		this.cameras.main.setPostPipeline([ChromaticPostFX, CinematicBarsFX, BlackHoleFX]);
		this.chromaticPostFX = this.cameras.main.getPostPipeline(ChromaticPostFX) as ChromaticPostFX;
		this.cinematicBarsFX = this.cameras.main.getPostPipeline(CinematicBarsFX) as CinematicBarsFX;

		const playerCharacter = this.getPlayerCharacter();
		if (playerCharacter) {
			this.cameraFollowEntity({ object: playerCharacter, instant: true });
		}

		// Camera Settings
		this.cameras.main.fadeIn(1000);
		this.cameras.main.setZoom(this.scaled(1));
	}

	public update (time: number, delta: number): void {
		super.update(time, delta);
		const player = this.getPlayerCharacter();

		// Let PlayerLight follow Player
		this.playerLight?.setPosition(player?.body?.position.x, player?.body?.position.y);

		this.petalEmitter.update(time, delta);
		this.playerCharacter?.update(time, delta);
		this.characters.forEach(c => c.update(time, delta));
		this.arcades.forEach(a => a.update(time, delta));
		this.buckets.forEach(a => a.update(time, delta));
		this.objects.forEach(a => a.update(time, delta));
		this.soundSources2d.forEach(s => s.update(time, delta));
		this.staticOneWayPlatforms.forEach(a => { if (this.playerCharacter) a.update(this.playerCharacter) });

		// Update chromaticPostFX center position
		const normalizedPlayerPosition = getNormalizedRelativePositionToCanvas({ x: player?.getBody()?.position.x ?? 0, y: player?.getBody()?.position.y ?? 0 }, this.cameras.main);
		this.chromaticPostFX?.setCenter(normalizedPlayerPosition.x, normalizedPlayerPosition.y);

		if (!this.ignoreInputs) {
			if (this.inputController?.justDown(Action.PAUSE)) {
				this.pause();
			}
		}

		// Show interaction bubble if interactable is in reach
		(this.scene.get('hud-scene') as HUDScene).interactionLabel.setAlpha((!this.ignoreInputs && player?.canInteract() && this.interactablesInRange.length > 0) ? 1 : 0);
	}
}
