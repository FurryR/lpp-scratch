import Global from '../global'
import { asValue, equal, compare, asBoolean } from '../helper'
import { lookupPrototype } from '../helper/prototype'
import { LppValue, LppError, LppBinaryOperator, LppUnaryOperator } from './base'
import { LppReference } from './reference'
import { LppConstant } from './constant'
import { LppFunction } from './function'
import { LppObject } from './object'

export class LppArray extends LppValue {
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return Global.Array
    } else {
      const idx = parseInt(key, 10)
      if (idx >= 0) {
        const res = this.value[idx]
        if (res) return new LppReference(this, key, res)
        else return new LppReference(this, key, new LppConstant(null))
      } else {
        const constructor = asValue(this.get('constructor'))
        if (!(constructor instanceof LppFunction))
          throw new Error(
            'lpp: unexpected constructor -- must be a LppFunction instance'
          )
        const proto = asValue(constructor.get('prototype'))
        if (!(proto instanceof LppObject))
          throw new Error(
            'lpp: unexpected prototype -- must be a LppObject instance'
          )
        const member = lookupPrototype(proto, key)
        if (member === null) throw new LppError('invalidIndex')
        return new LppReference(this, key, member)
      }
    }
  }
  /**
   * Set a value.
   * @param key Key to set.
   * @param value Value to set.
   * @returns Value.
   */
  set(key: string, value: LppValue): LppReference {
    const idx = parseInt(key, 10)
    if (idx >= 0) {
      this.value[idx] = value
      return new LppReference(this, key, value)
    } else throw new LppError('invalidIndex')
  }
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  has(key: string): boolean {
    if (key === 'constructor') return true
    const idx = parseInt(key, 10)
    if (idx >= 0 && idx in this.value) return true
    const constructor = asValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = asValue(constructor.get('prototype'))
    if (!(proto instanceof LppObject))
      throw new Error(
        'lpp: unexpected prototype -- must be a LppObject instance'
      )
    return lookupPrototype(proto, key) !== null
  }
  /**
   * Delete a value from the object.
   * @param key Key to delete.
   * @returns Whether the value exists.
   */
  delete(key: string): boolean {
    const idx = parseInt(key, 10)
    if (idx >= 0 && idx in this.value) {
      delete this.value[idx]
      return true
    }
    return false
  }
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  instanceof(fn: LppFunction): boolean {
    return fn === Global.Array
  }
  /**
   * @returns toString for visualReport.
   */
  toString(): string {
    return '<Lpp Array>'
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
          if (rhs instanceof LppArray) {
            return new LppArray(this.value.concat(rhs.value))
          }
          return new LppConstant(NaN)
        }
        case '*': {
          if (
            rhs instanceof LppConstant &&
            (typeof rhs.value === 'boolean' || typeof rhs.value === 'number')
          ) {
            const time = typeof rhs.value === 'boolean' ? +rhs.value : rhs.value
            if (Number.isInteger(time)) {
              const ret = new LppArray()
              for (let i = 0; i < time; i++) {
                ret.value = ret.value.concat(this.value)
              }
              return ret
            }
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
        case '-':
        case '**':
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
   * Construct an array object.
   * @param value Array of values.
   */
  constructor(public value: (LppValue | undefined)[] = []) {
    super()
  }
}
