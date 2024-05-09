import { LppObject, LppValue, LppFunction } from '../type'

/**
 * Lookup for a property in prototype.
 * @param proto Object.
 * @param name Property name.
 * @returns Result value.
 */
export function lookupPrototype(
  proto: LppObject,
  name: string
): LppValue | null {
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
        const constructor = proto.value.get('constructor')
        if (constructor instanceof LppFunction) {
          const v = proto.value.get('prototype')
          if (v instanceof LppObject) {
            if (cache.has(v)) return null
            else cache.add(v)
            return lookupPrototype(v, name)
          }
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
export function comparePrototype(
  prototype1: LppObject,
  prototype2: LppObject
): boolean {
  if (prototype1 === prototype2) return true
  const constructor1 = prototype1.value.get('constructor')
  if (constructor1 && constructor1 instanceof LppFunction) {
    const v = constructor1.value.get('prototype')
    // recursive
    if (v instanceof LppObject) return comparePrototype(v, prototype2)
  }
  return false
}
