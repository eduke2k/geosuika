export type MenuItem = {
  label: string;
  key: string;
}

export type DroppableSet = {
  tierScales: number[];
  randomizeOrder: boolean;
  droppableConfigs: SingleDroppableConfig[];
}

export type BaseSingleDroppableConfig = {
  spriteKey: string;
  animationKey: string;
  bodyType: 'fromVerts' | 'circle' |'rectangle'
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

export type SingleCustomDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'fromVerts';
  verts: any[];
}

export type SingleDroppableConfig = SingleCircleDroppableConfig | SingleRectangleDroppableConfig | SingleCustomDroppableConfig;

export type TiledPropertiesNative = {
  name: string;
  type: 'bool' | 'string' | 'int' | 'float' | 'color' | 'object',
  value: string | number | boolean;
}[];

export type TiledPropertiesParsed = Record<string, string | number | boolean>;