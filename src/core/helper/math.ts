import { LppValue, JSConstant, LppConstant } from '../type'
import { asBoolean } from './cast'

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
    ['**', (a, b) => a ** b],
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
  // lhs =
  //   lhs instanceof LppConstant && typeof lhs.value === 'boolean'
  //     ? new LppConstant(+lhs.value)
  //     : lhs
  // rhs =
  //   rhs instanceof LppConstant && typeof rhs.value === 'boolean'
  //     ? new LppConstant(+rhs.value)
  //     : rhs
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
