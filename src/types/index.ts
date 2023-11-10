export type MenuItem = {
  label: string;
  key: string;
}

export type DroppableSet = {
  tierScles: number[];
  randomizeOrder: boolean;
  droppableConfigs: SingleDroppableConfig[];
}

export type SingleDroppableConfig = {
  spriteKey: string;
  animationKey: string;
  bodyConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig
}