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

export type TiledPropertiesNative = {
  name: string;
  type: 'bool' | 'string' | 'int' | 'float' | 'color' | 'object',
  value: string | number | boolean;
}[];

export type TiledPropertiesParsed = Record<string, string | number | boolean>;

// type MatterCollisionData = {
//   collided: boolean;
//   bodyA: MatterJS.BodyType;
//   bodyB: MatterJS.BodyType;
//   axisBody: MatterJS.BodyType;
//   axisNumber: number;
//   depth: number;
//   parentA: MatterJS.BodyType;
//   parentB: MatterJS.BodyType;
//   normal: MatterJS.Vector;
//   tangent: MatterJS.Vector;
//   penetration: MatterJS.Vector;
//   supports: MatterJS.Vector[];
//   inverseMass: number;
//   friction: number;
//   frictionStatic: number;
//   restitution: number;
//   slop: number;
// };