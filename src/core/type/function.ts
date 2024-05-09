import Global from '../global'
import { LppResult, LppException, LppTraceback, LppReturn } from '../context'
import { async, asValue, asBoolean, compare, equal } from '../helper'
import { lookupPrototype } from '../helper/prototype'
import { LppValue, LppError, LppBinaryOperator, LppUnaryOperator } from './base'
import { LppReference } from './reference'
import { LppConstant } from './constant'
import { LppObject } from './object'
import { LppPromise } from './promise'

/**
 * Handle for calling.
 */
export class LppHandle {
  constructor(
    public fn: LppFunction,
    public self: LppValue,
    public args: LppValue[]
  ) {}
}

export class LppFunction extends LppObject {
  /**
   * Construct a native function.
   * @param caller Function to execute.
   * @param prototype Function prototype.
   * @returns Constructed function.
   */
  static native(
    caller: (ctx: LppHandle) => LppResult | PromiseLike<LppResult>,
    prototype?: LppObject
  ): LppFunction {
    /**
     * Add a stack to exception.
     * @param exception Exception.
     * @param ctx Handle.
     * @returns Result.
     */
    function addNativeTraceback(
      exception: LppResult,
      ctx: LppHandle
    ): LppResult {
      if (exception instanceof LppException)
        exception.pushStack(
          new LppTraceback.NativeFn(ctx.fn, ctx.self, ctx.args)
        )
      return exception
    }
    return new LppFunction(ctx => {
      return async(function* () {
        return addNativeTraceback(yield caller(ctx), ctx)
      })
    }, prototype)
  }
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppValue | LppReference {
    if (key === 'constructor') {
      return Global.Function
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
  apply(self: LppValue, args: LppValue[]): LppResult | PromiseLike<LppResult> {
    return this.caller(new LppHandle(this, self, args))
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
        case '+':
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
   * Call function as a constructor.
   * @param args Function arguments.
   * @returns Return value.
   */
  construct(args: LppValue[]): LppResult | PromiseLike<LppResult> {
    if (
      this === Global.Number ||
      this === Global.String ||
      this === Global.Boolean ||
      this === Global.Array ||
      this === Global.Function ||
      this === Global.Object
    )
      return this.apply(new LppConstant(null), args)
    const obj =
      this === Global.Promise
        ? new LppPromise(new Promise(() => {}))
        : new LppObject(new Map(), this)
    return async(
      function* (this: LppFunction) {
        const result: LppResult = yield this.apply(obj, args)
        if (result instanceof LppException) return result
        return new LppReturn(obj)
      }.bind(this)
    )
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
   * @param caller Function to execute.
   * @param prototype Function prototype.
   */
  constructor(
    public caller: (ctx: LppHandle) => LppResult | PromiseLike<LppResult>,
    prototype: LppObject = new LppObject()
  ) {
    super(new Map(), undefined)
    this.value.set('prototype', prototype)
  }
}
