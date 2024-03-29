import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';

// Aseprite sprites
import ArcadePNG from './../assets/arcade.png';
import ArcadeJSON from './../assets/arcade.json';
import YatoPNG from './../assets/yato.png';
import YatoJSON from './../assets/yato.json';
import DogPNG from './../assets/dog.png';
import DogJSON from './../assets/dog.json';
import AchanPNG from './../assets/achan.png';
import AchanJSON from './../assets/achan.json';
import FlagsPNG from './../assets/flags.png';
import FlagsJSON from './../assets/flags.json';
import TetrominosPNG from './../assets/tetrominos.png';
import TetrominosJSON from './../assets/tetrominos.json';
import TetrominosShapesJSON from './../shapes/tetrominos.json';
import ProgressArrowPNG from './../assets/progressArrow.png';
import ProgressArrowJSON from './../assets/progressArrow.json';
import ScoreLabelPNG from './../assets/scoreLabel.png';
import ScoreLabelJSON from './../assets/scoreLabel.json';
import FlaresPNG from './../assets/flares.png';
import FlaresJSON from './../assets/flares.json';
import JapanFoodPNG from './../assets/japanFood.png';
import JapanFoodJSON from './../assets/japanFood.json';
import DuckSetPNG from './../assets/duckSet.png';
import DuckSetJSON from './../assets/duckSet.json';
import DangerLinePNG from './../assets/dangerLine.png';
import DangerLineJSON from './../assets/dangerLine.json';
import PetalPNG from './../assets/petal.png';
import PetalJSON from './../assets/petal.json';
import BarPNG from './../assets/bar.png';
import BarJSON from './../assets/bar.json';
import RecyclingCanPNG from './../assets/recycling.png';
import RecyclingCanJSON from './../assets/recycling.json';
import SmallLampPNG from './../assets/smallLamp.png';
import SmallLampJSON from './../assets/smallLamp.json';
import PortraitAchanPNG from './../assets/portrait_achan.png';
import PortraitAchanJSON from './../assets/portrait_achan.json';
import PortraitFallbackPNG from './../assets/portrait_fallback.png';
import PortraitFallbackJSON from './../assets/portrait_fallback.json';
import PortraitShibaPNG from './../assets/portrait_shiba.png';
import PortraitShibaJSON from './../assets/portrait_shiba.json';

// Images
import JapaneseHouseBucketPNG from './../assets/buckets/japanese_house.png';
import EarthTextureJPG from './../assets/earth.jpg';
import NoiseTextureJPG from './../assets/noise.png';
import LogoPNG from './../assets/logo.png';
import EdutasticLogoPNG from './../assets/edutastic.png';
import HeadphonesIconPNG from './../assets/headphones.png';

// Audio SFX
import HarpSFX from './../assets/sfx/harp.ogg';
import PianoSFX from './../assets/sfx/piano.ogg';
import BassSFX from './../assets/sfx/bass.ogg';
import MergeSFX from './../assets/sfx/merge.ogg';
import GongSFX from './../assets/sfx/gong.ogg';
import GongEffectSFX from './../assets/sfx/gongeffect.ogg';
import TaikoSFX from './../assets/sfx/taiko.ogg';
import AscensionSFX from './../assets/sfx/ascension.ogg';
import MusicBoxSFX from './../assets/sfx/musicbox.ogg';
import ConfirmSFX from './../assets/sfx/confirm.ogg';
import TouchySFX from './../assets/sfx/touchy.ogg';
import BucketSFX from './../assets/sfx/bucket.ogg';
import AchanSFX from './../assets/sfx/achan.ogg';
import StepsSFX from './../assets/sfx/steps.ogg';
import ShockSFX from './../assets/sfx/shock.ogg';
import BreakerSFX from './../assets/sfx/breaker.ogg';
import RiserSFX from './../assets/sfx/riser1sec.ogg';
import SwitchSFX from './../assets/sfx/switch.ogg';
import DroneRiseSFX from './../assets/sfx/drone-rise.ogg';
import ArcadeHummingSFX from './../assets/sfx/arcadehumming.ogg';
import TriangleSFX from './../assets/sfx/triangle.ogg';

// BGM
import MenuBGM from './../assets/music/menu.ogg';

// Tiles
import JapanTilesPNG from './../assets/tilesets/tilesheet_japan.png';
import JapanTiles2xPNG from './../assets/tilesets/tilesheet_japan_2x.png';
import MainTilesPNG from './../assets/tilesets/tilesheet_main.png';
import map2JSON from './../assets/tilesets/map2.json';

import { Instrument } from '../models/Instrument';
import { SFX } from '../models/SFX';
import { BaseNote } from '../const/scales';
import { achanSFXConfig } from '../const/achanSFX';
import { bucketSFXConfig } from '../const/bucketSFX';
import { stepsSFXConfig } from '../const/stepsSFX';
import { switchSFXConfig } from '../const/switchSFX';
import { taikoSFXConfig } from '../const/taikoSFX';
import { triangleSFXConfig } from '../const/triangleSFX';
import { InputController } from '../models/Input';
import { gongEffectSFXConfig } from '../const/gongEffectSFX';
import CirclingDotsFX from '../shaders/CirclingDotsFX';
import { scaleNumberRange } from '../functions/numbers';
import BaseScene from './BaseScene';
import { NATIVE_AR, OPTION_KEYS } from '../const/const';

const skipAnimation = false;

function handleResize() {
	const canvas = document.getElementsByTagName('canvas')[0];
	if (canvas) {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const ar = width / height;
		const canvasWidth = NATIVE_AR >= ar ? width : height * NATIVE_AR;
		const canvasHeight = NATIVE_AR < ar ? height : width / NATIVE_AR;
		canvas.style.width = `${canvasWidth}px`;
		canvas.style.height = `${canvasHeight}px`;
	}
}

export default class BootScene extends BaseScene {
	// private progressBar!: Phaser.GameObjects.Graphics;
	// private progressBox!: Phaser.GameObjects.Graphics;
  private circlingDotsFX: CirclingDotsFX | undefined;
	private circlingDotsFXImage: Phaser.GameObjects.Image | undefined;
	private percentageText: Phaser.GameObjects.Text | undefined;

	constructor() {
		super({ key: 'boot-scene', active: true })
	}

	public preload () {
		window.addEventListener('resize', handleResize);
		handleResize();

		const postFXResolution = parseFloat(localStorage.getItem(OPTION_KEYS.POSTFX_RESOLUTION) ?? '1');
    this.circlingDotsFX = new CirclingDotsFX(this, 0.05, this.game.canvas.width * postFXResolution, this.game.canvas.height * postFXResolution);
    this.circlingDotsFXImage = this.circlingDotsFX.createShaderImage();
    this.circlingDotsFXImage.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
    this.circlingDotsFXImage.setDisplaySize(this.game.canvas.width, this.game.canvas.width / (16/9));

		this.percentageText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, '0%', { fontFamily: 'Arial', fontSize: this.scaled(12), color: 'white' }).setOrigin(0.5, 0.5).setAlign('center')

		// this.progressBar = this.add.graphics();
		// this.progressBox = this.add.graphics();
		// this.progressBox.fillStyle(0x222222, 0.8);
		// this.progressBox.fillRect(
		// 	(this.game.canvas.width / 2) - (LOADING_BAR_WIDTH / 2),
		// 	(this.game.canvas.height / 2) - (LOADING_BAR_HEIGHT / 2),
		// 	LOADING_BAR_WIDTH, LOADING_BAR_HEIGHT
		// );

		// IMPORTANT: When adding new aseprite sprites, don't forget to load their animations in the create-method.
		this.load.aseprite('arcade', ArcadePNG, ArcadeJSON);
		this.load.aseprite('yato', YatoPNG, YatoJSON);
		this.load.aseprite('dog', DogPNG, DogJSON);
		this.load.aseprite('achan', AchanPNG, AchanJSON);
		this.load.aseprite('flags', FlagsPNG, FlagsJSON);
		this.load.aseprite('japanFood', JapanFoodPNG, JapanFoodJSON);
		this.load.aseprite('ducks', DuckSetPNG, DuckSetJSON);
		this.load.aseprite('tetrominos', TetrominosPNG, TetrominosJSON);
		this.load.aseprite('progressArrow', ProgressArrowPNG, ProgressArrowJSON);
		this.load.aseprite('scoreLabel', ScoreLabelPNG, ScoreLabelJSON);
		this.load.aseprite('flares', FlaresPNG, FlaresJSON);
		this.load.aseprite('dangerLine', DangerLinePNG, DangerLineJSON);
		this.load.aseprite('petal', PetalPNG, PetalJSON);
		this.load.aseprite('recyclingCan', RecyclingCanPNG, RecyclingCanJSON);
		this.load.aseprite('smallLamp', SmallLampPNG, SmallLampJSON);
		this.load.aseprite('portrait:achan', PortraitAchanPNG, PortraitAchanJSON);
		this.load.aseprite('portrait:shiba', PortraitShibaPNG, PortraitShibaJSON);
		this.load.aseprite('portrait:fallback', PortraitFallbackPNG, PortraitFallbackJSON);

		this.load.atlas('bar', BarPNG, BarJSON);

		// Images
		this.load.image('bucket:japanese-house', JapaneseHouseBucketPNG);
		this.load.image('texture:earth', EarthTextureJPG);
		this.load.image('texture:noise', NoiseTextureJPG);
		this.load.image('logo', LogoPNG);
		this.load.image('logo-edutastic', EdutasticLogoPNG);
		this.load.image('icon-headphones', HeadphonesIconPNG);

		// Global BGM
		this.load.audio('bgm:menu', MenuBGM);

		// Audio SFX
		this.load.audio('sfx:shock', ShockSFX);
		this.load.audio('sfx:harp', HarpSFX);
		this.load.audio('sfx:piano', PianoSFX);
		this.load.audio('sfx:bass', BassSFX);
		this.load.audio('sfx:merge', MergeSFX);
		this.load.audio('sfx:gong', GongSFX);
		this.load.audio('sfx:gong-effect', GongEffectSFX);
		this.load.audio('sfx:triangle', TriangleSFX);
		this.load.audio('sfx:taiko', TaikoSFX);
		this.load.audio('sfx:ascension', AscensionSFX);
		this.load.audio('sfx:musicbox', MusicBoxSFX);
		this.load.audio('sfx:confirm', ConfirmSFX);
		this.load.audio('sfx:touchy', TouchySFX);
		this.load.audio('sfx:bucket', BucketSFX);
		this.load.audio('sfx:achan', AchanSFX);
		this.load.audio('sfx:steps', StepsSFX);
		this.load.audio('sfx:breaker', BreakerSFX);
		this.load.audio('sfx:riser', RiserSFX);
		this.load.audio('sfx:switch', SwitchSFX);
		this.load.audio('sfx:drone-rise', DroneRiseSFX);
		this.load.audio('sfx:arcade-humming', ArcadeHummingSFX);

		// Load body shapes from JSON file generated using PhysicsEditor
		this.load.json('shapes', TetrominosShapesJSON);

		// load tilesets
		this.load.image('tilesheet_japan', this.game.canvas.height > 720 ? JapanTiles2xPNG : JapanTilesPNG);
		this.load.image('tilesheet_main', MainTilesPNG);

		// load map files
		this.load.tilemapTiledJSON('map2', map2JSON)

		// this.load.setBaseURL('https://labs.phaser.io')
		// this.load.image('sky', 'assets/skies/space3.png')
		// this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		// this.load.image('red', 'assets/particles/red.png')

		this.load.on('progress', (value: number) => {
			this.percentageText?.setText(`${Math.round(value * 100)}%`);
			// this.progressBar.clear();
			// this.progressBar.fillStyle(0xffffff, 1);
			// this.progressBar.fillRect(
			// 	(this.game.canvas.width / 2) - ((LOADING_BAR_WIDTH - LOADING_BAR_PADDING) / 2),
			// 	(this.game.canvas.height / 2) - ((LOADING_BAR_HEIGHT - LOADING_BAR_PADDING) / 2),
			// 	(LOADING_BAR_WIDTH - LOADING_BAR_PADDING)  * value, LOADING_BAR_HEIGHT - LOADING_BAR_PADDING);
		});

		this.load.on('loaderror', (file: any) => {
			console.error(file);
		});
	
		this.load.on('complete', () => {
			// this.progressBar.destroy();
			// this.progressBox.destroy();
		});
	}

	private initSettings (): void {
		const soundVolume = localStorage.getItem(OPTION_KEYS.SFX_VOLUME);
		if (soundVolume === null) localStorage.setItem(OPTION_KEYS.SFX_VOLUME, '1');
		this.soundManager?.sound.setVolume(soundVolume === null ? 1 : parseFloat(soundVolume));

		const musicVolume = localStorage.getItem(OPTION_KEYS.MUSIC_VOLUME);
		if (musicVolume === null) localStorage.setItem(OPTION_KEYS.MUSIC_VOLUME, '1');
		this.soundManager?.music.setVolume(musicVolume === null ? 1 : parseFloat(musicVolume));

		const resolution = localStorage.getItem(OPTION_KEYS.RESOLUTION);
		if (resolution === null) localStorage.setItem(OPTION_KEYS.RESOLUTION, '0');

		const postFXResolution = localStorage.getItem(OPTION_KEYS.POSTFX_RESOLUTION);
		if (postFXResolution === null) localStorage.setItem(OPTION_KEYS.POSTFX_RESOLUTION, '1');
	}

	public async create () {
		super.create();
	
		console.log('--- Creating Boot Scene ---');
		this.initSettings();

    await new FontFaceObserver('Barlow Condensed Light').load();
		await new FontFaceObserver('Barlow Condensed Regular').load();
		await new FontFaceObserver('Barlow Condensed Bold').load();

    console.log('--- Finished Loading Fonts ---');

		this.registry.set('instrument:harp', new Instrument({ key: 'sfx:harp', octaves: 3, audioMarkerDuration: 4 }));
		this.registry.set('instrument:piano', new Instrument({ key: 'sfx:piano', octaves: 1, audioMarkerDuration: 6 }));
		this.registry.set('instrument:merge', new Instrument({ key: 'sfx:merge', octaves: 3, audioMarkerDuration: 4 }));
		this.registry.set('instrument:gong', new Instrument({ key: 'sfx:gong', octaves: 1, audioMarkerDuration: 8 }));

		this.registry.set('sfx:triangle', new SFX('sfx:triangle', undefined, triangleSFXConfig));
		this.registry.set('sfx:taiko', new SFX('sfx:taiko', undefined, taikoSFXConfig));
		this.registry.set('sfx:gong-effect', new SFX('sfx:gong-effect', undefined, gongEffectSFXConfig));
		this.registry.set('sfx:bucket', new SFX('sfx:bucket', undefined, bucketSFXConfig));
		this.registry.set('sfx:achan', new SFX('sfx:achan', undefined, achanSFXConfig));
		this.registry.set('sfx:steps', new SFX('sfx:steps', undefined, stepsSFXConfig));
		this.registry.set('sfx:switch', new SFX('sfx:switch', undefined, switchSFXConfig));
		this.registry.set('instrument:musicbox', new Instrument({ key: 'sfx:musicbox', octaves: 1, audioMarkerDuration: 4 }));
		this.registry.set('instrument:confirm', new Instrument({ key: 'sfx:confirm', octaves: 1, audioMarkerDuration: 4 }));
		this.registry.set('instrument:touchy', new Instrument({ key: 'sfx:touchy', octaves: 1, audioMarkerDuration: 4 }));
		this.registry.set('instrument:ascension', new Instrument({ key: 'sfx:ascension', octaves: 1, notes: [BaseNote.C], audioMarkerDuration: 12 }));
		console.log('---finished loading instruments');

		this.anims.createFromAseprite('dog');
		this.anims.createFromAseprite('flags');
		this.anims.createFromAseprite('japanFood');
		this.anims.createFromAseprite('ducks');
		this.anims.createFromAseprite('tetrominos');
		this.anims.createFromAseprite('progressArrow');
		this.anims.createFromAseprite('scoreLabel');
		this.anims.createFromAseprite('flares');
		this.anims.createFromAseprite('dangerLine');
		this.anims.createFromAseprite('petal');
		console.log('--- Finished Creating Animations from Spritesheets ---');

		this.registry.set('input-controller', new InputController());
		console.log('--- Finished Creating Custom Controller Input ---');

		if (skipAnimation) {
			this.scene.start('main-menu-scene').remove();
			return;
		} 

		this.tweens.add({
			targets: this.percentageText,
			alpha: 0,
			duration: 1500,
			ease: Phaser.Math.Easing.Quadratic.In,
		})

		const startDistance = this.circlingDotsFX?.getDistance() ?? 0.05;
		this.tweens.addCounter({
			from: 0,
			to: 1,
			duration: 2500,
			ease: Phaser.Math.Easing.Quadratic.In,
			onUpdate: (tween) => {
				this.circlingDotsFX?.setDistance(scaleNumberRange(tween.getValue(), [0, 1], [startDistance, 0.8]));
				this.circlingDotsFXImage?.setAlpha(1 - tween.getValue());
			},
			onComplete: () => {
				this.scene.start('main-menu-scene').remove();
			}
		})

    // this.scene.start('main-menu-scene').remove();
		this.scene.start('logos-scene').remove();
		// this.scene.launch('game-scene').launch('hud-scene').remove();
  }
}
