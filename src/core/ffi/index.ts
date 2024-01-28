import { LppValue, LppConstant, LppArray, LppObject } from '../type'

/**
 * Convert Lpp object to JavaScript object.
 * @param value Object.
 * @returns Return value.
 */
export function toObject(value: LppValue): unknown {
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
      const res = value.value.map(v => (v ? deserializeInternal(v) : null))
      map.set(value, res)
      return res
    }
    if (value instanceof LppObject) {
      const cache = map.get(value)
      if (cache) return cache
      const res: Record<string, unknown> = {}
      for (const [k, v] of value.value.entries()) {
        if (k === 'constructor') continue
        res[k] = deserializeInternal(v)
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
export function fromObject(value: unknown): LppValue {
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
