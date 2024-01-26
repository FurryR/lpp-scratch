import {
  LppTraceback,
  LppReturnOrException,
  LppReturn,
  LppException
} from './context'

import { global } from './global'
import {
  asBoolean,
  compare,
  ensureValue,
  equal,
  isPromise,
  mathOp,
  processThenReturn
} from './helper'
export class LppError extends Error {
  /**
   * Construct a new Lpp error.
   * @param id Error ID.
   */
  constructor(public id: string) {
    super(`lpp: Error ${id}`)
  }
}
export type LppBinaryOperator =
  | '='
  | '+'
  | '*'
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | '&&'
  | '||'
  | '-'
  | '/'
  | '%'
  | '<<'
  | '>>'
  | '>>>'
  | '&'
  | '|'
  | '^'
  | 'instanceof'
export type LppUnaryOperator = '+' | '-' | '!' | '~' | 'delete'
/**
 * Lpp compatible object.
 */
export abstract class LppValue {
  /**
   * @abstract Get a value.
   * @param key Key to get.
   * @returns Value if exist.
   */
  abstract get(key: string): LppValue | LppReference
  /**
   * @abstract Set a value.
   * @param key Key to set.
   * @param value Value to set.
   * @returns Value.
   */
  abstract set(key: string, value: LppValue): LppReference
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  abstract has(key: string): boolean
  /**
   * Delete a value from the object.
   * @param key Key to delete.
   * @returns Whether the value exists.
   */
  abstract delete(key: string): boolean
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  abstract instanceof(fn: LppFunction): boolean
  /**
   * toString for visualReport.
   * @returns Human readable string.
   */
  abstract toString(): string
  /**
   * Do arithmetic operations.
   * @param op Binary operator.
   * @param rhs Right hand side of the operation.
   */
  abstract calc(
    op: LppBinaryOperator | LppUnaryOperator,
    rhs?: LppValue
  ): LppValue | LppReference
}
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

/**
 * Lookup for a property in prototype.
 * @param proto Object.
 * @param name Property name.
 * @returns Result value.
 */
function lookupPrototype(proto: LppObject, name: string): LppValue | null {
  const cache = new WeakSet<LppObject>()
  /**
   * Lookup for a property in prototype.
   * @param proto Object.
   * @param name Property name.
   * @returns Result value.
   */
  function lookupPrototypeInternal(
    proto: LppObject,
    name: string
  ): LppValue | null {
    if (proto instanceof LppObject) {
      const res = proto.value.get(name)
      if (res) {
        return res
      } else {
        // recursive
        const v = proto.value.get('prototype')
        if (v instanceof LppObject) {
          if (cache.has(v)) throw new LppError('recursivePrototype')
          else cache.add(v)
          return lookupPrototype(v, name)
        }
      }
    }
    return null
  }
  return lookupPrototypeInternal(proto, name)
}
/**
 * Detect whether prototype1 equals to prototype2 or contains prototype2.
 * @param prototype1 lhs.
 * @param prototype2 rhs.
 * @returns Result.
 */
function comparePrototype(
  prototype1: LppObject,
  prototype2: LppObject
): boolean {
  if (prototype1 === prototype2) return true
  if (prototype1.value.has('prototype')) {
    const v = prototype1.value.get('prototype')
    // recursive
    if (v instanceof LppObject) return comparePrototype(v, prototype2)
  }
  return false
}
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
          return global.get('String') ?? new LppConstant(null)
        case 'number':
          return global.get('Number') ?? new LppConstant(null)
        case 'boolean':
          return global.get('Boolean') ?? new LppConstant(null)
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
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'lpp: unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
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
    const constructor = ensureValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = ensureValue(constructor.get('prototype'))
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
        return fn === global.get('String')
      case 'number':
        return fn === global.get('Number')
      case 'boolean':
        return fn === global.get('Boolean')
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
export class LppObject extends LppValue {
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return (
        this.value.get(key) ?? global.get('Object') ?? new LppConstant(null)
      )
    } else {
      const res = this.value.get(key)
      // patch: disable access to constructor prototype.
      if (res || key == 'prototype')
        return new LppReference(this, key, res ?? new LppConstant(null))
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'lpp: unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'lpp: unexpected prototype -- must be a LppObject instance'
        )
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
    const constructor = ensureValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = ensureValue(constructor.get('prototype'))
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
    return this.value.delete(key)
  }
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  instanceof(fn: LppFunction): boolean {
    const constructor = this.get('constructor')
    const prototype1 = ensureValue(constructor.get('prototype'))
    const prototype2 = ensureValue(fn.get('prototype'))
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
          if (
            !(this instanceof LppFunction) &&
            rhs instanceof LppObject &&
            !(rhs instanceof LppFunction)
          ) {
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
}
export class LppArray extends LppValue {
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return global.get('Array') ?? new LppConstant(null)
    } else {
      const idx = parseInt(key, 10)
      if (idx >= 0) {
        const res = this.value[idx]
        if (res) return new LppReference(this, key, res)
        else return new LppReference(this, key, new LppConstant(null))
      } else {
        const constructor = ensureValue(this.get('constructor'))
        if (!(constructor instanceof LppFunction))
          throw new Error(
            'lpp: unexpected constructor -- must be a LppFunction instance'
          )
        const proto = ensureValue(constructor.get('prototype'))
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
    const constructor = ensureValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = ensureValue(constructor.get('prototype'))
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
    return fn === global.get('Array')
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

export class LppFunction extends LppObject {
  /**
   * Construct a native function.
   * @param execute Function to execute.
   * @param prototype Function prototype.
   * @returns Constructed function.
   */
  static native(
    execute: (
      self: LppValue,
      args: LppValue[]
    ) => LppReturnOrException | PromiseLike<LppReturnOrException>,
    prototype?: LppObject
  ): LppFunction {
    /**
     * Add a stack to exception.
     * @param exception Exception.
     * @param fn Called function.
     * @param self Self object.
     * @param args Arguments.
     * @returns Result.
     */
    function addNativeTraceback(
      exception: LppReturnOrException,
      fn: LppFunction,
      self: LppValue,
      args: LppValue[]
    ): LppReturnOrException {
      if (exception instanceof LppException)
        exception.pushStack(new LppTraceback.NativeFn(fn, self, args))
      return exception
    }
    const obj: LppFunction = new LppFunction((self, args) => {
      const res = execute(self, args)
      if (isPromise(res)) {
        return res.then(value =>
          addNativeTraceback(value, obj, self ?? new LppConstant(null), args)
        )
      }
      return addNativeTraceback(res, obj, self ?? new LppConstant(null), args)
    }, prototype)
    return obj
  }
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return global.get('Function') ?? new LppConstant(null)
    } else if (key === 'prototype') {
      const res = this.value.get(key)
      if (res) return res
      else throw new Error('lpp: unexpected get -- prototype is null')
    } else {
      const res = this.value.get(key)
      if (res) return new LppReference(this, key, res)
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'lpp: unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'lpp: unexpected prototype -- must be a LppObject instance'
        )
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
    const constructor = ensureValue(this.get('constructor'))
    if (!(constructor instanceof LppFunction))
      throw new Error(
        'lpp: unexpected constructor -- must be a LppFunction instance'
      )
    const proto = ensureValue(constructor.get('prototype'))
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
    if (key === 'prototype') {
      throw new LppError('assignOfConstant')
    }
    return this.value.delete(key)
  }
  /**
   * Call function with arguments.
   * @param self Function self object. Might be null.
   * @param args Function arguments.
   * @returns Return value.
   */
  apply(
    self: LppValue,
    args: LppValue[]
  ): LppReturnOrException | PromiseLike<LppReturnOrException> {
    return this.execute(self, args)
  }
  /**
   * Call function as a constructor.
   * @param args Function arguments.
   * @returns Return value.
   */
  construct(
    args: LppValue[]
  ): LppReturnOrException | PromiseLike<LppReturnOrException> {
    if (
      this === global.get('Number') ||
      this === global.get('String') ||
      this === global.get('Boolean') ||
      this === global.get('Array') ||
      this === global.get('Function') ||
      this === global.get('Object')
    )
      return this.apply(new LppConstant(null), args)
    const obj =
      this === global.get('Promise')
        ? new LppPromise(new Promise(() => {}))
        : new LppObject(new Map(), this)
    const res = this.apply(obj, args)
    /**
     * Process return value.
     * @param result Result.
     * @returns Processed result.
     */
    const process = (result: LppReturnOrException): LppReturnOrException => {
      if (result instanceof LppException) return result
      return new LppReturn(obj)
    }
    if (isPromise(res)) {
      return res.then(result => {
        return process(result)
      })
    }
    return process(res)
  }
  /**
   * @returns toString for visualReport.
   */
  toString(): string {
    return '<Lpp Function>'
  }
  /**
   * Construct a function object.
   * @warning Do not use this function directly unless you know what you are doing! Use LppFunction.native instead.
   * @param execute Function to execute.
   * @param prototype Function prototype.
   */
  constructor(
    private execute: (
      self: LppValue,
      args: LppValue[]
    ) => LppReturnOrException | PromiseLike<LppReturnOrException>,
    prototype: LppObject = new LppObject()
  ) {
    super(new Map(), undefined)
    this.value.set('prototype', prototype)
  }
}
export class LppPromise extends LppObject {
  /**
   * then() function.
   * @param resolveFn
   * @param rejectFn
   * @returns
   */
  done(resolveFn?: LppFunction, rejectFn?: LppFunction): LppPromise {
    return LppPromise.generate((resolve, reject) => {
      this.pm.then(
        resolveFn
          ? value => {
              if (value instanceof LppValue) {
                const res = resolveFn.apply(this, [value])
                if (isPromise(res)) {
                  return res.then(v => processThenReturn(v, resolve, reject))
                }
                return processThenReturn(res, resolve, reject)
              }
              throw new Error('lpp: unknown result')
            }
          : undefined,
        rejectFn
          ? err => {
              if (err instanceof LppValue) {
                const res = rejectFn.apply(this, [err])
                if (isPromise(res)) {
                  return res.then(v => processThenReturn(v, resolve, reject))
                }
                return processThenReturn(res, resolve, reject)
              }
              throw err
            }
          : undefined // TODO: uncaughtException
      )
      return undefined
    })
  }
  /**
   * catch() function.
   * @param rejectFn
   * @returns
   */
  error(rejectFn: LppFunction): LppPromise {
    return LppPromise.generate((resolve, reject) => {
      this.pm.catch(err => {
        if (err instanceof LppValue) {
          const res = rejectFn.apply(this, [err])
          if (isPromise(res)) {
            return res.then(v => processThenReturn(v, resolve, reject))
          }
          return processThenReturn(res, resolve, reject)
        }
        throw err
      })
      return undefined
    })
  }

  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => PromiseLike<void>
  ): PromiseLike<LppPromise>
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined
  ): LppPromise
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined | PromiseLike<void>
  ): LppPromise | PromiseLike<LppPromise>
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined | PromiseLike<void>
  ): LppPromise | PromiseLike<LppPromise> {
    let resolveFn: (v: LppValue) => void
    let rejectFn: (reason: unknown) => void
    resolveFn = rejectFn = () => {
      throw new Error('not initialized')
    }
    const pm = new Promise<LppValue>((resolve, reject) => {
      resolveFn = resolve
      rejectFn = reject
    })
    const res = fn(resolveFn, rejectFn)
    if (isPromise(res)) {
      return res.then(() => new LppPromise(pm))
    }
    return new LppPromise(pm)
  }
  constructor(public pm: Promise<LppValue>) {
    const GlobalPromise = global.get('Promise')
    if (!(GlobalPromise instanceof LppFunction)) {
      throw new Error('lpp: not implemented')
    }
    super(new Map(), GlobalPromise)
  }
}
