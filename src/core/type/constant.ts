import { LppValue, LppError, LppBinaryOperator, LppUnaryOperator } from './base'
import { LppReference } from './reference'
import { asValue, mathOp, equal, compare, asBoolean } from '../helper'
import { LppFunction } from './function'
import Global from '../global'
import { lookupPrototype } from '../helper/prototype'
import { LppArray } from './array'
import { LppObject } from './object'

export type JSConstant = boolean | number | string | null
export class LppConstant<T extends JSConstant = JSConstant> extends LppValue {
  /**
   * @returns The stored value.
   */
  get value(): T {
    return this._value
  }
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (this.value === null) throw new LppError('accessOfNull')
    if (key === 'constructor') {
      switch (typeof this.value) {
        case 'string':
          return Global.String
        case 'number':
          return Global.Number
        case 'boolean':
          return Global.Boolean
      }
    } else if (key === 'prototype') {
      // patch: disable access to constructor prototype.
      return new LppConstant(null)
    } else {
      if (typeof this.value === 'string') {
        const idx = parseInt(key)
        if (!isNaN(idx)) {
          const v = this.value[idx]
          return v !== undefined ? new LppConstant(v) : new LppConstant(null)
        }
      }
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
      if (member === null) return new LppConstant(null)
      return new LppReference(this, key, member)
    }
  }
  /**
   * LppConstant instances are not able to set properties.
   */
  set(): never {
    throw new LppError('assignOfConstant')
  }
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  has(key: string): boolean {
    if (this.value === null) throw new LppError('accessOfNull')
    if (key === 'constructor') return true
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
   * LppConstant instances are not able to set properties.
   */
  delete(): never {
    if (this.value === null) throw new LppError('accessOfNull')
    throw new LppError('assignOfConstant')
  }
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  instanceof(fn: LppFunction): boolean {
    if (this.value === null) return false
    // We assume that builtin functions are not dervied types.
    switch (typeof this.value) {
      case 'string':
        return fn === Global.String
      case 'number':
        return fn === Global.Number
      case 'boolean':
        return fn === Global.Boolean
    }
  }
  /**
   * toString for visualReport.
   * @returns Human readable string.
   */
  toString(): string {
    return `${this.value}`
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
          if (this.value !== null) {
            if (rhs instanceof LppConstant) {
              if (rhs.value !== null)
                return new LppConstant(mathOp(this, op, rhs))
            }
          }
          return new LppConstant(NaN)
        }
        case '*': {
          if (this.value !== null) {
            if (rhs instanceof LppConstant) {
              // exception: number * string
              if (
                typeof this.value === 'string' &&
                typeof rhs.value === 'number'
              ) {
                if (Number.isInteger(rhs.value))
                  return new LppConstant(this.value.repeat(rhs.value))
              } else if (
                typeof this.value === 'number' &&
                typeof rhs.value === 'string'
              ) {
                if (Number.isInteger(this.value))
                  return new LppConstant(rhs.value.repeat(this.value))
              }
              return new LppConstant(mathOp(this, op, rhs))
            } else if (
              rhs instanceof LppArray &&
              (typeof this.value === 'boolean' ||
                typeof this.value === 'number')
            ) {
              const time =
                typeof this.value === 'boolean' ? +this.value : this.value
              if (Number.isInteger(time)) {
                const ret = new LppArray()
                for (let i = 0; i < time; i++) {
                  ret.value = ret.value.concat(rhs.value)
                }
                return ret
              }
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
        // (Pure) math operands
        case '-':
        case '/':
        case '%':
        case '<<':
        case '>>':
        case '>>>':
        case '&':
        case '|':
        case '^': {
          if (
            !(rhs instanceof LppConstant) ||
            this.value === null ||
            rhs.value === null ||
            typeof this.value === 'string' ||
            typeof rhs.value === 'string'
          )
            return new LppConstant(NaN)
          return new LppConstant(mathOp(this, op, rhs))
        }
        case 'instanceof': {
          if (rhs instanceof LppFunction) {
            return new LppConstant(this.instanceof(rhs))
          }
          throw new LppError('notCallable')
        }
      }
    } else {
      switch (op) {
        case 'delete': {
          throw new LppError('assignOfConstant')
        }
        case '+': {
          if (
            !(
              typeof this.value === 'boolean' ||
              typeof this.value === 'number' ||
              typeof this.value === 'string'
            )
          )
            return new LppConstant(NaN)
          return new LppConstant(+this.value)
        }
        case '-': {
          if (
            !(
              typeof this.value === 'boolean' ||
              typeof this.value === 'number' ||
              typeof this.value === 'string'
            )
          )
            return new LppConstant(NaN)
          return new LppConstant(-this.value)
        }
        case '!': {
          return new LppConstant(!asBoolean(this))
        }
        case '~': {
          if (
            !(
              typeof this.value === 'boolean' ||
              typeof this.value === 'number' ||
              typeof this.value === 'string'
            )
          )
            return new LppConstant(NaN)
          const v = +this.value
          if (isNaN(v)) return new LppConstant(NaN)
          return new LppConstant(~v)
        }
      }
    }
    throw new Error('lpp: unknown operand')
  }
  /**
   * Construct a value.
   * @param _value The stored value.
   */
  constructor(private _value: T) {
    super()
  }
}
