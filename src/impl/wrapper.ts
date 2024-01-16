export interface Wrapable {
  toString(): string
}
export class Wrapper<T extends Wrapable> extends String {
  static unwrap(value: unknown): unknown {
    return value instanceof Wrapper ? value.value : value
  }
  toString() {
    return this.value.toString()
  }
  constructor(public value: T) {
    super(value.toString())
  }
}
