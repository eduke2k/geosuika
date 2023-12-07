import { DroppableSet } from "../types";

export const japanFoodSet: DroppableSet = {
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
      spriteKey: 'japanFood',
      animationKey: 'japanfood:naruto',
      bodyType: 'circle',
      radius: 226,
      offset: 30
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:tako',
      bodyType: 'circle',
      radius: 236,
      offset: 20
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:dango',
      bodyType: 'rectangle',
      width: 420,
      height: 180,
      chamfer: 90,
      offsetX: -8,
      offsetY: 0,
      scaleMultiplier: 1.5,
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:taiyaki',
      bodyType: 'fromVerts',
      verts: [
        { "x":0, "y":230 },
        { "x":240, "y":70 },
        { "x":474, "y":121 },
        { "x":510, "y":316 },
        { "x":297, "y":439 },
        { "x":100, "y":402 },
        { "x":15, "y":313 }
      ],
      offsetX: 0,
      offsetY: 0.15,
      scaleMultiplier: 1.2
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:daifuku',
      bodyType: 'fromVerts',
      verts: [
        { "x":256, "y":0 },
        { "x":438, "y":166 }, { "x":490, "y":352 }, { "x":422, "y":470 },
        { "x":256, "y":512 },
        { "x":90, "y":470 }, { "x":22, "y":352 }, { "x":74, "y":166 }
      ],
      offsetX: 0.05,
      offsetY: 0,
      scaleMultiplier: 1.1
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:nigiri',
      bodyType: 'rectangle',
      width: 486,
      height: 348,
      chamfer: 110,
      offsetX: 0,
      offsetY: 0,
      scaleMultiplier: 1.1
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:rollcake',
      bodyType: 'circle',
      radius: 248,
      offset: 4
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:gyoza',
      bodyType: 'fromVerts',
      verts: [
        { "x":256, "y":86 },
        { "x":460, "y":152 }, { "x":512, "y":258 }, { "x":506, "y":354 }, { "x":424, "y":420 },
        { "x":88, "y":420 }, { "x":6, "y":354 }, { "x":0, "y":258 }, { "x":52, "y":152 }
      ],
      scaleMultiplier: 1.1,
      offsetX: 0,
      offsetY: 0.18
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:onigiri',
      bodyType: 'fromVerts',
      verts: [
        { "x":256, "y":10 },
        { "x":360, "y":78 }, { "x":506, "y":370 }, { "x":462, "y":482 },
        { "x":256, "y":502 },
        { "x":50, "y":482 }, { "x":6, "y":370 }, { "x":152, "y":78 }
      ],
      scaleMultiplier: 1,
      offsetX: 0.017,
      offsetY: 0.01
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:sushi',
      bodyType: 'fromVerts',
      verts: [
        { "x":256, "y":18 },
        { "x":388, "y":44 }, { "x":464, "y":122 }, { "x":483, "y":256 }, { "x":436, "y":446 },
        { "x":256, "y":508 },
        { "x":76, "y":446 }, { "x":29, "y":256 }, { "x":48, "y":122 },  { "x":124, "y":44 }
      ],
      scaleMultiplier: 1,
      offsetX: 0.055,
      offsetY: 0.04
    },
    {
      spriteKey: 'japanFood',
      animationKey: 'japanfood:ramen',
      bodyType: 'circle',
      radius: 256,
      offset: 0
    },
  ]
};
