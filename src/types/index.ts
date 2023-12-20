// export type MenuItem = {
//   label: string;
//   key: string;
//   url?: string;
// }

export enum FontName {
  LIGHT = 'Barlow Condensed Light',
  REGULAR = 'Barlow Condensed Regular',
  BOLD = 'Barlow Condensed Bold',
}

export type DroppableSet = {
  tierScales: number[];
  randomizeOrder: boolean;
  droppableConfigs: SingleDroppableConfig[];
}

export type BaseSingleDroppableConfig = {
  spriteKey: string;
  animationKey: string;
  bodyType: 'fromVerts' | 'circle' |'rectangle' | 'polygon'
  scaleMultiplier?: number;
}

export type SingleCircleDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'circle';
  radius: number;
  offset: number;
}

export type SingleRectangleDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'rectangle';
  width: number;
  height: number;
  chamfer: number;
  offsetX: number;
  offsetY: number
}

export type SinglePolygonDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'polygon';
  radius: number;
  sides: number;
  chamfer: number[];
  offset: number;
}

export type SingleCustomDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'fromVerts';
  verts: any[];
  offsetX?: number;
  offsetY?: number;
  chamfer?: number[];
}

export type SingleDroppableConfig = SingleCircleDroppableConfig | SinglePolygonDroppableConfig | SingleRectangleDroppableConfig | SingleCustomDroppableConfig;

export type TiledPropertiesNative = {
  name: string;
  type: 'bool' | 'string' | 'int' | 'float' | 'color' | 'object',
  value: string | number | boolean;
}[];

export type TiledPropertiesParsed = Record<string, string | number | boolean>;

export type MatterCollisionContactVertex = {
  body: MatterJS.BodyType,
  index: number;
  isinternal: boolean;
  x: number;
  y: number;
}

export type MatterCollisionContact = {
  normalImpulse: number;
  tangentImpulse: number;
  vertex: MatterCollisionContactVertex;
}

export type FixedMatterCollisionData = Phaser.Types.Physics.Matter.MatterCollisionData & {
  contacts: MatterCollisionContact[];
}