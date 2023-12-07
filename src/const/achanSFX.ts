import { SFXConfig } from "../models/SFX";

// Manual sound bank config for achan sfx
export const achanSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'jump-00', duration: 0.5, start: 0 },
      { name: 'jump-01', duration: 0.5, start: 0.5 },
      { name: 'jump-02', duration: 0.5, start: 1 },
      { name: 'jump-03', duration: 0.5, start: 1.5 },
      { name: 'jump-04', duration: 0.5, start: 2.0 },
      { name: 'jump-05', duration: 0.5, start: 2.5 },
      { name: 'jump-06', duration: 0.5, start: 3.0 },
      { name: 'jump-07', duration: 0.5, start: 3.5 },
      { name: 'jump-07', duration: 0.5, start: 4.0 },
      { name: 'annoyed-00', duration: 2, start: 4.5 },
      { name: 'annoyed-01', duration: 2, start: 6.5 },
      { name: 'restart-00', duration: 0.5, start: 8.5 },
    ],
    audioMarkerMapping: {
      'jump': [0, 1, 2, 3, 4, 5, 6, 7, 8 ],
      'restart': [11],
      'annoyed': [9, 10]
    }
}