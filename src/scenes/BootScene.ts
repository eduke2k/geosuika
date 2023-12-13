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
import SmallLampJSPN from './../assets/smallLamp.json';

// Images
import JapaneseHouseBucketPNG from './../assets/buckets/japanese_house.png';

// Audio SFX
import HarpSFX from './../assets/sfx/harp.ogg';
import BassSFX from './../assets/sfx/bass.ogg';
import MergeSFX from './../assets/sfx/merge.ogg';
import GongSFX from './../assets/sfx/gong.ogg';
import TaikoSFX from './../assets/sfx/taiko.ogg';
import AscensionSFX from './../assets/sfx/ascension.ogg';
import MusicBoxSFX from './../assets/sfx/musicbox.ogg';
import ConfirmSFX from './../assets/sfx/confirm.ogg';
import TouchySFX from './../assets/sfx/touchy.ogg';
import BucketSFX from './../assets/sfx/bucket.ogg';
import AchanSFX from './../assets/sfx/achan.ogg';
import StepsSFX from './../assets/sfx/steps.ogg';
import ShockSFX from './../assets/sfx/shock.ogg';

// Tiles
import JapanTilesPNG from './../assets/tilesets/tilesheet_japan.png';
import MainTilesPNG from './../assets/tilesets/tilesheet_main.png';
import map2JSON from './../assets/tilesets/map2.json';

import { Instrument } from '../models/Instrument';
import { SFX } from '../models/SFX';
import { BaseNote } from '../const/scales';
import { achanSFXConfig } from '../const/achanSFX';
import { bucketSFXConfig } from '../const/bucketSFX';
import { stepsSFXConfig } from '../const/stepsSFX';

const LOADING_BAR_HEIGHT = 25;
const LOADING_BAR_WIDTH = 240;
const LOADING_BAR_PADDING = 12;

export default class MainMenuScene extends Phaser.Scene {
	private progressBar!: Phaser.GameObjects.Graphics;
	private progressBox!: Phaser.GameObjects.Graphics;

	constructor() {
		super({ key: 'boot-scene', active: true })
	}

	public preload () {
		this.progressBar = this.add.graphics();
		this.progressBox = this.add.graphics();
		this.progressBox.fillStyle(0x222222, 0.8);
		this.progressBox.fillRect(
			(this.game.canvas.width / 2) - (LOADING_BAR_WIDTH / 2),
			(this.game.canvas.height / 2) - (LOADING_BAR_HEIGHT / 2),
			LOADING_BAR_WIDTH, LOADING_BAR_HEIGHT
		);

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
		this.load.aseprite('smallLamp', SmallLampPNG, SmallLampJSPN);

		this.load.atlas('bar', BarPNG, BarJSON);

		// Images
		this.load.image('bucket:japanese-house', JapaneseHouseBucketPNG);

		// Audio SFX
		// Don't forget to register the corresponsing instrument when adding new instrument sfx files
		this.load.audio('sfx:shock', ShockSFX);
		this.load.audio('sfx:harp', HarpSFX);
		this.load.audio('sfx:bass', BassSFX);
		this.load.audio('sfx:merge', MergeSFX);
		this.load.audio('sfx:gong', GongSFX);
		this.load.audio('sfx:taiko', TaikoSFX);
		this.load.audio('sfx:ascension', AscensionSFX);
		this.load.audio('sfx:musicbox', MusicBoxSFX);
		this.load.audio('sfx:confirm', ConfirmSFX);
		this.load.audio('sfx:touchy', TouchySFX);
		this.load.audio('sfx:bucket', BucketSFX);
		this.load.audio('sfx:achan', AchanSFX);
		this.load.audio('sfx:steps', StepsSFX);

		// Audio BGM 01
		// this.load.audio('bgm01-chello-chord', Bgm01ChelloChord);
		// this.load.audio('bgm01-backing-voice', Bgm01BackingVoice);
		// this.load.audio('bgm01-bass', Bgm01Bass);
		// this.load.audio('bgm01-chello-melody', Bgm01ChelloMelody);
		// this.load.audio('bgm01-kamo-voice', Bgm01KamoVoice);
		// this.load.audio('bgm01-main-voice', Bgm01MainVoice);
		// this.load.audio('bgm01-piano', Bgm01Piano);

		// Load body shapes from JSON file generated using PhysicsEditor
		this.load.json('shapes', TetrominosShapesJSON);

		// load tilesets
		this.load.image('tilesheet_japan', JapanTilesPNG);
		this.load.image('tilesheet_main', MainTilesPNG);

		// load map files
		this.load.tilemapTiledJSON('map2', map2JSON)

		// this.load.setBaseURL('https://labs.phaser.io')
		// this.load.image('sky', 'assets/skies/space3.png')
		// this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		// this.load.image('red', 'assets/particles/red.png')

		this.load.on('progress', (value: number) => {
			this.progressBar.clear();
			this.progressBar.fillStyle(0xffffff, 1);
			this.progressBar.fillRect(
				(this.game.canvas.width / 2) - ((LOADING_BAR_WIDTH - LOADING_BAR_PADDING) / 2),
				(this.game.canvas.height / 2) - ((LOADING_BAR_HEIGHT - LOADING_BAR_PADDING) / 2),
				(LOADING_BAR_WIDTH - LOADING_BAR_PADDING)  * value, LOADING_BAR_HEIGHT - LOADING_BAR_PADDING);
		});

		this.load.on('loaderror', (file: any) => {
			console.error(file);
		});
	
		this.load.on('complete', () => {
			this.progressBar.destroy();
			this.progressBox.destroy();
		});
	}

	public async create () {
    console.log('--- Creating Boot Scene ---');

    const font = new FontFaceObserver('Coiny');
    await font.load();
    console.log('--- Finished Loading Fonts ---');

		this.registry.set('instument:harp', new Instrument({ key: 'sfx:harp', octaves: 3, audioMarkerDuration: 4 }));
		// this.registry.set('instument:bass', new Instrument({ key: 'sfx:bass', octaves: 2, audioMarkerDuration: 4 }));
		this.registry.set('instument:merge', new Instrument({ key: 'sfx:merge', octaves: 3, audioMarkerDuration: 4 }));
		this.registry.set('instument:gong', new Instrument({ key: 'sfx:gong', octaves: 1, audioMarkerDuration: 8 }));
		this.registry.set('drum:taiko', new SFX('sfx:taiko', { notes: 15, audioMarkerDuration: 4 }));
		this.registry.set('sfx:bucket', new SFX('sfx:bucket', undefined, bucketSFXConfig));
		this.registry.set('sfx:achan', new SFX('sfx:achan', undefined, achanSFXConfig));
		this.registry.set('sfx:steps', new SFX('sfx:steps', undefined, stepsSFXConfig));
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

    this.scene.start('main-menu');
  }
}
