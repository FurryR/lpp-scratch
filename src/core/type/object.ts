import { asValue, equal, compare, asBoolean } from '../helper'
import { lookupPrototype, comparePrototype } from '../helper/prototype'
import { LppReference, LppConstant } from '../type'
import { LppValue, LppBinaryOperator, LppUnaryOperator, LppError } from './base'
import { LppFunction } from './function'
import Global from '../global'
import { LppReturn } from '../context'

export class LppObject extends LppValue {
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return this.value.get(key) ?? Global.Object
    } else {
      const res = this.value.get(key)
      if (res) return new LppReference(this, key, res)
      const constructor = asValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'lpp: unexpected constructor -- must be a LppFunction instance'
        )
      const proto = asValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        return new LppReference(this, key, new LppConstant(null))
      const member = lookupPrototype(proto, key)
      if (member === null)
        return new LppReference(this, key, new LppConstant(null))
      return new LppReference(this, key, member)
    }
  }
  /**
   * Set a value.
   * @param key Key to set.
   * @param value Value to set.
   * @returns Value.
   */
  set(key: string, value: LppValue): LppReference {
    this.value.set(key, value)
    return new LppReference(this, key, value)
  }
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  has(key: string): boolean {
    if (key === 'constructor' || this.value.has(key)) return true
    const constructor = asValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = asValue(constructor.get('prototype'))
    if (!(proto instanceof LppObject)) return false
    return lookupPrototype(proto, key) !== null
  }
  /**
   * Delete a value from the object.
   * @param key Key to delete.
   * @returns Whether the value exists.
   */
  delete(key: string): boolean {
    return this.value.delete(key)
  }
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  instanceof(fn: LppFunction): boolean {
    const constructor = this.get('constructor')
    const prototype1 = asValue(constructor.get('prototype'))
    const prototype2 = asValue(fn.get('prototype'))
    if (prototype1 instanceof LppObject && prototype2 instanceof LppObject)
      return comparePrototype(prototype1, prototype2)
    return false // should never happen
  }
  /**
   * @returns toString for visualReport.
   */
  toString(): string {
    return '<Lpp Object>'
  }
  /**
   * Do arithmetic operations.
   * @param op Binary operator.
   * @param rhs Right hand side of the operation.
   */
  calc(op: LppBinaryOperator | LppUnaryOperator, rhs?: LppValue): LppValue {
    if (rhs) {
      switch (op) {
        case '=': {
          throw new LppError('assignOfConstant')
        }
        case '+': {
          if (rhs instanceof LppObject && !(rhs instanceof LppFunction)) {
            if (this.value.has('constructor') || rhs.value.has('constructor')) {
              return new LppConstant(NaN)
            }
            const ret = new LppObject()
            for (const [key, value] of this.value.entries()) {
              ret.set(key, value)
            }
            for (const [key, value] of rhs.value.entries()) {
              ret.set(key, value)
            }
            return ret
          }
          return new LppConstant(NaN)
        }
        case '==': {
          return new LppConstant(equal(this, rhs))
        }
        case '!=': {
          return new LppConstant(!equal(this, rhs))
        }
        case '>':
        case '<':
        case '>=':
        case '<=': {
          return new LppConstant(compare(this, op, rhs))
        }
        case '&&':
        case '||': {
          const left = asBoolean(this)
          const right = asBoolean(rhs)
          return new LppConstant(op === '&&' ? left && right : left || right)
        }
        case 'instanceof': {
          if (rhs instanceof LppFunction) {
            return new LppConstant(this.instanceof(rhs))
          }
          throw new LppError('notCallable')
        }
        // (Pure) math operands
        case '*':
        case '**':
        case '-':
        case '/':
        case '%':
        case '<<':
        case '>>':
        case '>>>':
        case '&':
        case '|':
        case '^': {
          return new LppConstant(NaN)
        }
      }
    } else {
      switch (op) {
        case 'delete': {
          throw new LppError('assignOfConstant')
        }
        case '!': {
          return new LppConstant(!asBoolean(this))
        }
        case '+':
        case '-':
        case '~': {
          return new LppConstant(NaN)
        }
      }
    }
    throw new Error('lpp: unknown operand')
  }
  /**
   * Construct a object value.
   * @param value Object content.
   * @param constructor Constructor function. Defaults to Object.
   */
  constructor(
    public value: Map<string, LppValue> = new Map(),
    constructor?: LppFunction
  ) {
    super()
    this.value = value ?? new Map()
    if (constructor) this.value.set('constructor', constructor)
  }
  /**
   * Create a new object, using an existing object as the prototype of the newly created object.
   * @param prototype Prototype.
   * @returns New object.
   */
  static create(prototype: LppObject): LppObject {
    return new LppObject(
      new Map(),
      new LppFunction(() => new LppReturn(new LppConstant(null)), prototype)
    )
  }
  static assign(dest: LppObject, ...args: LppObject[]): LppObject {
    for (const v of args) {
      for (const [key, value] of v.value.entries()) {
        if (key !== 'constructor') dest.value.set(key, value)
      }
    }
    return dest
  }
}
