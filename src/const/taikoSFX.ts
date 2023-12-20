import { SFXConfig } from "../models/SFX";

// Manual sound bank config for achan sfx
export const taikoSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'deep-01', duration: 4, start: 0 },
      { name: 'deep-02', duration: 4, start: 4 },
      { name: 'deep-03', duration: 4, start: 8 },
      { name: 'deep-04', duration: 4, start: 12 },
      { name: 'hit-01', duration: 4, start: 16 },
      { name: 'hit-02', duration: 4, start: 20 },
      { name: 'hit-03', duration: 4, start: 24 },
      { name: 'hit-04', duration: 4, start: 28 },
      { name: 'drum-01', duration: 4, start: 32 },
      { name: 'drum-02', duration: 4, start: 36 },
      { name: 'rim-01', duration: 4, start: 40 },
      { name: 'rim-02', duration: 4, start: 44 },
      { name: 'rim-03', duration: 4, start: 48 },
      { name: 'small-01', duration: 4, start: 52 },
      { name: 'small-02', duration: 4, start: 56 },
    ],
    audioMarkerMapping: {
      'deep': [0,1,2,3],
      'hit': [4,5,6,7],
      'drum': [8,9],
      'rim': [10,11,12],
      'small': [13,14],
    }
}