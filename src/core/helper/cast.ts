import {
  LppReference,
  LppConstant,
  LppArray,
  LppObject,
  LppFunction,
  LppValue
} from '../type'

/**
 * Ensure result is a LppValue.
 * @param obj Object.
 * @returns Ensured result.
 */
export function asValue(obj: LppValue | LppReference): LppValue {
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
