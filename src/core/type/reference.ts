import { LppValue, LppError, LppBinaryOperator, LppUnaryOperator } from './base'
import { LppConstant } from './constant'
import { LppFunction } from './function'

/**
 * Lpp compatible object (with scope).
 */
export class LppReference implements LppValue {
  /**
   * Parent object.
   */
  parent: WeakRef<LppValue>
  /**
   * Get a value.
   * @param key Value to get.
   * @param key Child object.
   */
  get(key: string): LppValue | LppReference {
    return this.value.get(key)
  }
  /**
   * Set a value.
   * @param key Key to set.
   * @param value Value to set.
   * @returns Value.
   */
  set(key: string, value: LppValue): LppReference {
    return this.value.set(key, value)
  }
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  has(key: string): boolean {
    return this.value.has(key)
  }
  /**
   * Delete a value from the object or just delete itself.
   * @param key Key to delete. May be undefined.
   * @returns Whether the value exists.
   */
  delete(key?: string): boolean {
    const parent = this.parent.deref()
    if (!parent) throw new LppError('assignOfConstant')
    if (!key) return parent.delete(this.name)
    return this.value.delete(key)
  }
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  instanceof(fn: LppFunction): boolean {
    return this.value.instanceof(fn)
  }
  /**
   * Assign current value.
   * @param value Value to set.
   * @returns New value.
   */
  assign(value: LppValue): LppReference {
    const parent = this.parent.deref()
    if (!parent) throw new LppError('assignOfConstant')
    parent.set(this.name, value)
    this.value = value
    return this
  }
  /**
   * toString for visualReport.
   * @returns Human readable string.
   */
  toString(): string {
    return this.value.toString()
  }
  /**
   * Do arithmetic operations.
   * @param op Binary operator.
   * @param rhs Right hand side of the operation.
   */
  calc(
    op: LppBinaryOperator | LppUnaryOperator,
    rhs?: LppValue
  ): LppValue | LppReference {
    if (op === '=' && rhs) {
      return this.assign(rhs)
    } else if (op === 'delete' && !rhs) {
      return new LppConstant(this.delete())
    }
    return this.value.calc(op, rhs)
  }
  /**
   * Construct a new LppChildObject object.
   * @param parent parent.
   * @param name key in parent.
   * @param value value.
   */
  constructor(
    parent: LppValue,
    public name: string,
    public value: LppValue
  ) {
    this.parent = new WeakRef(parent)
  }
}
