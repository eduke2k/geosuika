import { SFXConfig } from "../models/SFX";

export const triangleSFXConfig: SFXConfig = {
    audioMarkerConfig: [
      { name: 'triangle-01', duration: 4, start: 0 },
      { name: 'triangle-02', duration: 4, start: 4 },
    ],
    audioMarkerMapping: {
      'triangle': [0,1],
    }
}