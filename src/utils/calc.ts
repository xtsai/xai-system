/**
 * @public test function
 * @param args number array
 * @returns number result
 */
export function reducePlus(...args: number[]): number {
  return args.reduce((prev, current) => prev * current, 1);
}
