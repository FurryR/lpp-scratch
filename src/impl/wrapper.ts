/**
 * Wrapable object interface.
 */
export interface Wrapable {
  toString(): string
}
/**
 * Wrapper for Scratch monitors.
 */
export class Wrapper<T extends Wrapable> extends String {
  /**
   * Unwraps a wrapped object.
   * @param value Wrapped object.
   * @returns Unwrapped object.
   */
  static unwrap(value: unknown): unknown {
    return value instanceof Wrapper ? value.value : value
  }
  /**
   * toString method for Scratch monitors.
   * @returns String display.
   */
  toString() {
    return this.value.toString()
  }
  /**
   * Construct a wrapped value.
   * @param value Value to wrap.
   */
  constructor(public value: T) {
    super(value.toString())
  }
}
