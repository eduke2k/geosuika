import { SFX } from "../models/SFX";

export class StepSoundBehaviour {
    private scene: Phaser.Scene;
    private sfx: SFX;
    private stepsOnFrames: number[] = [];
    private lastStepFrameIndex = -1
    private slideTriggered = false;

    public constructor(scene: Phaser.Scene, sfx: SFX, stepOnFrames: number[]) {
        this.scene = scene;
        this.sfx = sfx;
        this.stepsOnFrames = stepOnFrames;
    }

    public reset (): void {
        this.lastStepFrameIndex = -1;
        this.slideTriggered = false;
    }

    public update (frameIndex: number): void {
        // Rest on animation loop to support one step per animation
        if (frameIndex === 1) {
            this.reset();
        }

        // Trigger step sound if specific step frame has been reached
        if (this.stepsOnFrames.includes(frameIndex) && frameIndex !== this.lastStepFrameIndex) {
            this.lastStepFrameIndex = frameIndex;
            this.sfx.playRandomSFXFromCategory(this.scene, 'step');
        }
    }

    public triggerSlide (): void {
        if (!this.slideTriggered) this.sfx.playRandomSFXFromCategory(this.scene, 'slide')
        this.slideTriggered = true;
    }

    public justLanded (): void {
        this.sfx.playRandomSFXFromCategory(this.scene, 'land');
    }
}