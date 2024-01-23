import { LppConstant, LppValue, LppReference, LppFunction } from './type'
/**
 * LppFunction return value.
 */
export class LppReturn {
  /**
   * Construct a new LppReturn instance.
   * @param value Result.
   */
  constructor(public value: LppValue) {
    this.value = value
  }
}
/**
 * LppFunction exception value.
 */
export class LppException {
  /**
   * Traceback.
   */
  stack: LppTraceback.Base[]
  /**
   * Push stack into traceback.
   * @param stack Current stack.
   */
  pushStack(stack: LppTraceback.Base) {
    this.stack.push(stack)
  }
  /**
   * Construct a new LppException instance.
   * @param value Result.
   */
  constructor(public value: LppValue) {
    this.stack = []
  }
}
export namespace LppTraceback {
  /**
   * Abstract base class of traceback.
   */
  export abstract class Base {
    abstract toString(): string
  }
  /**
   * Traceback for native functions.
   */
  export class NativeFn extends Base {
    /**
     * Construct a traceback object.
     * @param fn Called function.
     * @param self Self.
     * @param args Arguments.
     */
    constructor(
      public fn: LppFunction,
      public self: LppValue,
      public args: LppValue[]
    ) {
      super()
    }
    toString(): string {
      return '<Native Function>'
    }
  }
}
/**
 * Closure.
 */
export class LppClosure extends LppValue {
  value: Map<string, LppValue> = new Map()
  /**
   * Get a value.
   * @param key Value to get.
   * @returns Child object.
   */
  get(key: string): LppReference {
    return new LppReference(
      this,
      key,
      this.value.get(key) ?? new LppConstant(null)
    )
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
    return this.value.has(key)
  }
  /**
   * Delete a value from the object.
   * @param key Key to delete.
   * @returns Whether the value exists.
   */
  delete(key: string): boolean {
    return this.value.delete(key)
  }
  instanceof(): never {
    throw new Error('lpp: invalid usage of instanceof on LppClosure')
  }
  toString() {
    return '<Lpp Closure>'
  }
  calc(): never {
    throw new Error('lpp: invalid usage of calc on LppClosure')
  }
  constructor() {
    super()
  }
}
/**
 * Context.
 */
export class LppContext {
  /**
   * Closure.
   */
  closure: LppClosure = new LppClosure()

  /**
   * Exception callback wrapper.
   * @param value Exception.
   */
  exceptionCallback(value: LppException) {
    this._exceptionCallback(value)
    this.clearCallbacks()
  }
  /**
   * Return callback wrapper.
   * @param value Result.
   */
  returnCallback(value: LppReturn) {
    this._returnCallback(value)
    this.clearCallbacks()
  }
  /**
   * Get variable.
   * @param name Variable name.
   * @returns Variable result.
   */
  get(name: string): LppReference {
    if (this.closure.has(name)) return this.closure.get(name)
    else return this.parent ? this.parent.get(name) : this.closure.get(name)
  }
  /**
   * Clear callbacks.
   */
  clearCallbacks() {
    this._exceptionCallback = () => {}
    this._returnCallback = () => {}
  }

  /**
   * Unwind to a parent function context.
   * @returns Result.
   */
  unwind(): LppFunctionContext | null {
    return this.parent ? this.parent.unwind() : null
  }
  /**
   * Construct a new context.
   * @param parent Parent closure.
   * @param returnCallback Callback if function returns.
   * @param exceptionCallback Callback if function throws.
   */
  constructor(
    public parent: LppContext | undefined,
    private _returnCallback: (value: LppReturn) => void,
    private _exceptionCallback: (value: LppException) => void
  ) {
    this.closure = new LppClosure()
    this.parent = parent
  }
}
/**
 * Function context extended from LppContext.
 */
export class LppFunctionContext extends LppContext {
  /**
   * Unwind to a parent function context.
   * @returns Result.
   */
  unwind(): LppFunctionContext {
    return this
  }
  /**
   * @param parent Parent context.
   * @param self Self object.
   * @param returnCallback Callback if function returns.
   * @param exceptionCallback Callback if function throws.
   */
  constructor(
    parent: LppContext | undefined,
    public self: LppValue,
    returnCallback: (value: LppReturn) => void,
    exceptionCallback: (value: LppException) => void
  ) {
    super(parent, returnCallback, exceptionCallback)
  }
}
/**
 * Result or Exception.
 */
export type LppReturnOrException = LppReturn | LppException
