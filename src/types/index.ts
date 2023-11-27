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
  bodyType: 'fromVerts' | 'circle'
}

export type SingleCircleDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'circle';
  radius: number;
  offset: number;
}

export type SingleCustomDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'fromVerts';
  verts: any[];
}

export type SingleDroppableConfig = SingleCircleDroppableConfig | SingleCustomDroppableConfig

export type TiledPropertiesNative = {
  name: string;
  type: 'bool' | 'string' | 'int' | 'float' | 'color' | 'object',
  value: string | number | boolean;
}[];

export type TiledPropertiesParsed = Record<string, string | number | boolean>;