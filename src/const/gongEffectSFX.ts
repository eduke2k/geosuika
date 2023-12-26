import { SFXConfig } from "../models/SFX";

// Manual sound bank config for achan sfx
export const gongEffectSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'deep-01', duration: 6, start: 0 },
    ],
    audioMarkerMapping: {
      'deep': [0],
    }
}