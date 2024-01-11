import Phaser from 'phaser'

import MainMenuScene from './scenes/MainMenuScene'
import GameScene from './scenes/GameScene'
import BootScene from './scenes/BootScene'
import HUDScene from './scenes/HUDScene'
import GameOverScene from './scenes/GameOverScene'
import { WarpPostFX } from './shaders/WarpPostFX/WarpPostFX'
import ShockwavePostFx from 'phaser3-rex-plugins/plugins/shockwavepipeline.js';
import ChromaticPostFX from './shaders/ChromaticPostFX'
import PauseScene from './scenes/PauseScene'
import { DialogScene } from './scenes/DialogScene'
import CinematicBarsFX from './shaders/CinematicBarsFX'
import ScalePostFX from './shaders/ScalePostFX';
import OptionsScene from './scenes/OptionsScene'
import { OPTION_KEYS, RESOLUTIONS } from './const/const'
import SmokeTransition from './shaders/SmokeTransition';

const reolsutionIndex = parseInt(localStorage.getItem(OPTION_KEYS.RESOLUTION) ?? '0');
const resolutionString = RESOLUTIONS[reolsutionIndex];
const resolution = resolutionString.split('x');
const width = parseInt(resolution[0]) ?? 1280;
const height = parseInt(resolution[1]) ?? 720;

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width,
	height,
	antialias: true,
	roundPixels: true,
	input: {
		gamepad: true
	},
	fps: {
		limit: 60,
	},
	callbacks: {
		preBoot: (game) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Types for SoundManagerCreator are incomplete
			game.music = Phaser.Sound.SoundManagerCreator.create(game);
		}
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore: Types for pipeline are broken for some reason
	pipeline: { WarpPostFX, ShockwavePostFx, ChromaticPostFX, CinematicBarsFX, ScalePostFX, SmokeTransition },
	physics: {
		default: 'matter',
		matter: {
			gravity: {
				y: 2
			},
			positionIterations: 8,
			velocityIterations: 8,
			// debug: {
			// 	showSensors: true,
			// 	// showCollisions: true,
			// 	showVelocity: true,
			// 	showBounds: true,
			// 	showSeparation: false,
			// 	showBody: true,
			// }
		}
	},
	scene: [BootScene, MainMenuScene, GameScene, DialogScene, HUDScene, GameOverScene, PauseScene, OptionsScene]
}

export default new Phaser.Game(config)
