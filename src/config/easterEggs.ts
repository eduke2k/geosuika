import { DroppableSet } from "../types";

const eggVerts = [
  { "x":122, "y":20 },
  { "x":178, "y":20 },
  { "x":220, "y":63 },
  { "x":242, "y":150 },
  { "x":230, "y":246 },
  { "x":180, "y":282 },
  { "x":120, "y":282 },
  { "x":70, "y":246 },
  { "x":58, "y":150 },
  { "x":80, "y":63 }
]

export const easterEggSet: DroppableSet = {
  randomizeOrder: false,
  tierScales: [
    32,
    42,
    62,
    72,
    92,
    120,
    136,
    168,
    186,
    236,
    276,
  ],
  droppableConfigs: [
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:1',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:2',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:3',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:4',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:5',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:6',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:7',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:8',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:9',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:10',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'easterEggSet',
      animationKey: 'easteregg:11',
      bodyType: 'fromVerts',
      verts: eggVerts,
      offsetX: .2,
      offsetY: .04,
      scaleMultiplier: 1.2
    },
  ]
};
