import { StateOperator } from "@ngxs/store";

export function increment(count: number): StateOperator<number> {
  return (number: Readonly<number>) => number + count;
}
