/**
 * Wrapper for Scratch monitors.
 */
export class Wrapper<T> extends String {
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
    return String(this.value)
  }
  /**
   * Construct a wrapped value.
   * @param value Value to wrap.
   */
  constructor(public value: T) {
    super(value)
  }
}
