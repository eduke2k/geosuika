import { DroppableSet } from "../types";

export const tetrominosSet: DroppableSet = {
  randomizeOrder: true,
  tierScles: [
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4
  ],
  droppableConfigs: [
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:long',
      bodyType: 'fromVerts',
      verts: [ { "x":16, "y":0 }, { "x":16, "y":64 }, { "x":32, "y":64 }, { "x":32, "y":0 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:L1',
      bodyType: 'fromVerts',
      verts: [ { "x":0, "y":32 }, { "x":0, "y":48 }, { "x":32, "y":48 }, { "x":32, "y":0 }, { "x":16, "y":0 }, { "x":16, "y":32 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:L2',
      bodyType: 'fromVerts',
      verts: [ { "x":16, "y":0 }, { "x":16, "y":48 }, { "x":48, "y":48 }, { "x":48, "y":32 }, { "x":32, "y":32 }, { "x":32, "y":0 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:sq',
      bodyType: 'fromVerts',
      verts: [ { "x":0, "y":16 }, { "x":32, "y":16 }, { "x":32, "y":48 }, { "x":0, "y":48 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:Z1',
      bodyType: 'fromVerts',
      verts: [ { "x":0, "y":32 }, { "x":0, "y":48 }, { "x":32, "y":48 }, { "x":32, "y":32 }, { "x":48, "y":32 }, { "x":48, "y":16 }, { "x":16, "y":16 }, { "x":16, "y":32 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:Z2',
      bodyType: 'fromVerts',
      verts: [ { "x":0, "y":16 }, { "x":0, "y":32 }, { "x":16, "y":32 }, { "x":16, "y":48 }, { "x":48, "y":48 }, { "x":48, "y":32 }, { "x":32, "y":32 }, { "x":32, "y":16 } ],
    },
    {
      spriteKey: 'tetrominos',
      animationKey: 'tetromino:T',
      bodyType: 'fromVerts',
      verts: [ { "x":0, "y":16 }, { "x":0, "y":32 }, { "x":16, "y":32 }, { "x":16, "y":48 }, { "x":32, "y":48 }, { "x":32, "y":32 }, { "x":48, "y":32 }, { "x":48, "y":16 } ],
    },
  ]
};
