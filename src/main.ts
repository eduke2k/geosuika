import Phaser from 'phaser'

import MainMenuScene from './scenes/MainMenuScene'
import GameScene from './scenes/GameScene'
import BootScene from './scenes/BootScene'
import HUDScene from './scenes/HUDScene'
import GameOverScene from './scenes/GameOverScene'
import { WarpPostFX } from './shaders/WarpPostFX/WarpPostFX'
import ShockwavePostFx from 'phaser3-rex-plugins/plugins/shockwavepipeline.js';
import ChromaticPostFX from './shaders/ChromaticPostFX'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 1280,
	height: 720,
	antialias: true,
	fps: {
		limit: 60,
	},
	pipeline: [WarpPostFX, ShockwavePostFx, ChromaticPostFX],
	physics: {
		default: 'matter',
		matter: {
			gravity: {
				y: 2
			},
			positionIterations: 8,
			velocityIterations: 8,
			debug: {
				showSensors: true,
				// showCollisions: true,
				showVelocity: true,
				showBounds: true,
				showSeparation: false,
				showBody: true,
			}
		}
	},
	scene: [BootScene, MainMenuScene, GameScene, HUDScene, GameOverScene]
}

export default new Phaser.Game(config)
