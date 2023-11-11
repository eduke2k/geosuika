export type MenuItem = {
  label: string;
  key: string;
}

export type DroppableSet = {
  tierScles: number[];
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
}

export type SingleCustomDroppableConfig = BaseSingleDroppableConfig & {
  bodyType: 'fromVerts';
  verts: any[];
}

export type SingleDroppableConfig = SingleCircleDroppableConfig | SingleCustomDroppableConfig
