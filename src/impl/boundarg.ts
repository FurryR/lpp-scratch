import { LppValue } from '../core/type'

export class LppBoundArg {
  toString(): string {
    return '<Lpp BoundArg>'
  }
  /**
   * Construct a bound arg for lpp.
   * @param value
   */
  constructor(public value: (LppValue | undefined)[]) {}
}
