import { SFXConfig } from "../models/SFX";

// Manual sound bank config for achan sfx
export const bucketSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'in-00', duration: 2, start: 0 },
      { name: 'out-00', duration: 2, start: 2 },
      { name: 'roll-00', duration: 4, start: 4 },
    ],
    audioMarkerMapping: {
      'in': [0 ],
      'out': [1],
      'roll': [2]
    }
}