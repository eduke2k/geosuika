export type CustomInput = {
  JustDown: (identifier: number) => boolean;
  JustUp: (identifier: number) => boolean;
  IsDown: (identifier: number) => boolean;
  update: (time: number, delta: number, active: boolean) => void;
}