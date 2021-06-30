import { StateOperator } from "@ngxs/store";

export function decrement(count: number): StateOperator<number> {
  return (number: Readonly<number>) => number - count;
}
