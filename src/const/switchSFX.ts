import { SFXConfig } from "../models/SFX";

// Manual sound bank config for steps sfx
export const switchSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'switch-00', duration: 0.25, start: 0 },
      { name: 'switch-01', duration: 0.25, start: 0.25 },
      { name: 'switch-02', duration: 0.25, start: 0.5 },
      { name: 'switch-03', duration: 0.25, start: 0.75 },
      { name: 'switch-04', duration: 0.25, start: 1 },
      { name: 'switch-05', duration: 0.25, start: 1.25 },
    ],
    audioMarkerMapping: {
      'switch': [0, 1, 2, 3, 4, 5 ],
    }
}