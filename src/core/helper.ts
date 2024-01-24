import { LppException, LppReturn, LppReturnOrException } from './context'
import {
  LppValue,
  LppReference,
  LppConstant,
  LppArray,
  LppObject,
  LppFunction,
  JSConstant
} from './type'

/**
 * Ensure result is a LppValue.
 * @param obj Object.
 * @returns Ensured result.
 */
export function ensureValue(obj: LppValue | LppReference): LppValue {
  return obj instanceof LppReference ? obj.value : obj
}
/**
 * As boolean.
 * @param value Value.
 * @returns Result.
 */
export function asBoolean(value: LppValue): boolean {
  if (value instanceof LppConstant) {
    if (value.value === null) return false
    switch (typeof value.value) {
      case 'number':
        return value.value !== 0
      case 'boolean':
        return value.value
      case 'string':
        return value.value.length !== 0
    }
    return false
  } else if (value instanceof LppArray) {
    return value.value.length !== 0
  } else if (value instanceof LppObject) {
    return value.value.size !== 0
  } else if (value instanceof LppFunction) {
    return true
  }
  return false
}
/**
 * Calculate math operations.
 * @param lhs Left hand side.
 * @param op Operand.
 * @param rhs Right hand side.
 * @returns Result.
 */
export function mathOp(lhs: LppValue, op: string, rhs: LppValue): JSConstant {
  if (!(lhs instanceof LppConstant && rhs instanceof LppConstant)) return NaN
  const left = typeof lhs.value === 'boolean' ? +lhs.value : lhs.value
  const right = typeof rhs.value === 'boolean' ? +rhs.value : rhs.value
  // FIXME: This is hacky because it allows string.
  const math: Map<string, (a: number, b: number) => JSConstant> = new Map([
    ['+', (a, b) => a + b],
    ['-', (a, b) => a - b],
    ['*', (a, b) => a * b],
    ['/', (a, b) => a / b],
    ['<<', (a, b) => a << b],
    ['>>', (a, b) => a >> b],
    ['>>>', (a, b) => a >>> b],
    ['&', (a, b) => a & b],
    ['|', (a, b) => a | b],
    ['^', (a, b) => a ^ b]
  ])
  const fn = math.get(op)
  if (!fn) throw new Error('lpp: not implemented')
  return fn(left, right)
}
/**
 * Compare if equal.
 * @param lhs Left hand side.
 * @param rhs Right hand side.
 * @returns Result.
 */
export function equal(lhs: LppValue, rhs: LppValue): boolean {
  lhs =
    lhs instanceof LppConstant && typeof lhs.value === 'boolean'
      ? new LppConstant(+lhs.value)
      : lhs
  rhs =
    rhs instanceof LppConstant && typeof rhs.value === 'boolean'
      ? new LppConstant(+rhs.value)
      : rhs
  if (lhs instanceof LppConstant && rhs instanceof LppConstant)
    return lhs.value === rhs.value // patch: compare by value when using LppConstant
  return lhs === rhs
}
/**
 * Calculate compare operations.
 * @param lhs Left hand side.
 * @param op Operand.
 * @param rhs Right hand side.
 * @returns Result.
 */
export function compare(lhs: LppValue, op: string, rhs: LppValue): boolean {
  /**
   * Compare values.
   * @param fn Compare function.
   * @param lhs Left hand side.
   * @param rhs Right hand side.
   * @returns Result.
   */
  function compareInternal(
    fn: <T extends number | string>(a: T, b: T) => boolean,
    lhs: LppValue,
    rhs: LppValue
  ): boolean {
    if (lhs instanceof LppConstant) {
      if (rhs instanceof LppConstant) {
        if (lhs.value === null || rhs.value === null) return false
        switch (typeof lhs.value) {
          case 'boolean': {
            switch (typeof rhs.value) {
              case 'boolean': {
                return fn(+lhs.value, +rhs.value)
              }
              case 'number': {
                return fn(+lhs.value, rhs.value)
              }
              case 'string': {
                return fn(+lhs.value, rhs.value.length ? 1 : 0)
              }
              default:
                throw new Error('lpp: unknown rhs')
            }
          }
          case 'number': {
            switch (typeof rhs.value) {
              case 'boolean': {
                return fn(lhs.value, +rhs.value)
              }
              case 'number': {
                return fn(lhs.value, rhs.value)
              }
              case 'string': {
                return fn(lhs.value ? 1 : 0, rhs.value.length ? 1 : 0)
              }
              default:
                throw new Error('lpp: unknown rhs')
            }
          }
          case 'string': {
            switch (typeof rhs.value) {
              case 'boolean': {
                return fn(lhs.value.length ? 1 : 0, +rhs.value)
              }
              case 'number': {
                return fn(lhs.value.length ? 1 : 0, rhs.value ? 1 : 0)
              }
              case 'string': {
                return fn(lhs.value, rhs.value)
              }
              default:
                throw new Error('lpp: unknown rhs')
            }
          }
          default:
            throw new Error('lpp: unknown lhs')
        }
      }
      return compareInternal(fn, lhs, new LppConstant(asBoolean(rhs)))
    }
    return compareInternal(fn, new LppConstant(asBoolean(lhs)), rhs)
  }
  const math: Map<string, <T extends number | string>(a: T, b: T) => boolean> =
    new Map([
      ['>', (a, b) => a > b],
      ['<', (a, b) => a < b],
      ['>=', (a, b) => a >= b],
      ['<=', (a, b) => a <= b]
    ])
  const fn = math.get(op)
  if (!fn) throw new Error('lpp: not implemented')
  return compareInternal(fn, lhs, rhs)
}
/**
 * Convert Lpp object to JavaScript object.
 * @param value Object.
 * @returns Return value.
 */
export function deserializeObject(value: LppValue): unknown {
  const map = new WeakMap<LppValue, object>()
  /**
   * Convert Lpp object to JavaScript object.
   * @param value Object.
   * @returns Return value.
   */
  function deserializeInternal(value: LppValue): unknown {
    if (value instanceof LppConstant) return value.value
    if (value instanceof LppArray) {
      const cache = map.get(value)
      if (cache) return cache
      const res = value.value.map(v => (v ? deserializeObject(v) : null))
      map.set(value, res)
      return res
    }
    if (value instanceof LppObject) {
      const cache = map.get(value)
      if (cache) return cache
      const res: Record<string, unknown> = {}
      for (const [k, v] of value.value.entries()) {
        if (k === 'constructor') continue
        res[k] = deserializeObject(v)
      }
      map.set(value, res)
      return res
    }
    return null
  }
  return deserializeInternal(value)
}
/**
 * Convert JavaScript object to Lpp object.
 * @param value Object.
 * @returns Return value.
 */
export function serializeObject(value: unknown): LppValue {
  const map = new WeakMap<object, LppValue>()
  /**
   * Convert JavaScript object to Lpp object.
   * @param value Object.
   * @returns Return value.
   */
  function serializeInternal(value: unknown): LppValue {
    if (value === null || value === undefined) return new LppConstant(null)
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        return new LppConstant(value)
      case 'object': {
        const v = map.get(value)
        if (v) return v
        if (value instanceof globalThis.Array) {
          const res = new LppArray(value.map(value => serializeInternal(value)))
          map.set(value, res)
          return res
        }
        const obj = new LppObject()
        for (const [k, v] of globalThis.Object.entries(value)) {
          obj.set(k, serializeInternal(v))
        }
        map.set(value, obj)
        return obj
      }
    }
    return new LppConstant(null)
  }
  return serializeInternal(value)
}
export function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string | number | symbol, unknown>).then ===
      'function'
  )
}
export function processThenReturn(
  returnValue: LppReturnOrException,
  resolve: (v: LppValue) => void,
  reject: (reason: unknown) => void
): undefined | PromiseLike<void> {
  if (returnValue instanceof LppReturn) {
    const value = returnValue.value
    if (!(value instanceof LppConstant) || value.value !== null) {
      const then = ensureValue(value.get('then'))
      if (then instanceof LppFunction) {
        const res = then.apply(value, [
          new LppFunction((_, args) => {
            // resolve
            const res = processThenReturn(
              new LppReturn(args[0] ?? new LppConstant(null)),
              resolve,
              reject
            )
            if (isPromise(res)) {
              return res.then(() => new LppReturn(new LppConstant(null)))
            }
            return new LppReturn(new LppConstant(null))
          }),
          new LppFunction((_, args) => {
            // reject
            reject(args[0] ?? new LppConstant(null))
            return new LppReturn(new LppConstant(null))
          })
        ])
        if (isPromise(res)) {
          return res.then(value => {
            // PromiseLike should return a PromiseLike. Here we do not care about that.
            if (value instanceof LppException) {
              reject(value.value)
            }
          })
        }
        return undefined
      }
    }
    return void resolve(returnValue.value)
  }
  return void reject(returnValue.value)
}
