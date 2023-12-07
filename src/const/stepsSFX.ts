import { SFXConfig } from "../models/SFX";

// Manual sound bank config for steps sfx
export const stepsSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'step-00', duration: 0.25, start: 0 },
      { name: 'step-01', duration: 0.25, start: 0.25 },
      { name: 'step-02', duration: 0.25, start: 0.5 },
      { name: 'step-03', duration: 0.25, start: 0.75 },
      { name: 'step-04', duration: 0.25, start: 1 },
      { name: 'step-05', duration: 0.25, start: 1.25 },
      { name: 'slide-00', duration: 0.5, start: 1.5 },
      { name: 'slide-00', duration: 0.5, start: 2 },
      { name: 'land-00', duration: 0.5, start: 2.5 }
    ],
    audioMarkerMapping: {
      'step': [0, 1, 2, 3, 4, 5 ],
      'slide': [6,7],
      'land': [8]
    }
}