import { LppReturn } from '../../context'
import { LppFunction, LppConstant, LppObject, LppValue } from '../../type'

/**
 * lpp builtin `Number` -- constructor of number types.
 */
export default function (global: Record<string, LppValue>) {
  global.Number = LppFunction.native(({ args }) => {
    /**
     * Convert args to number.
     * @param args Array to convert.
     * @returns Converted value.
     */
    function convertToNumber(args: LppValue[]): LppConstant<number> {
      if (args.length < 1) return new LppConstant(0)
      const v = args[0]
      if (v instanceof LppConstant) {
        if (v === new LppConstant(null)) return new LppConstant(0)
        switch (typeof v.value) {
          case 'string':
            return new LppConstant(globalThis.Number(v.value))
          case 'number':
            return new LppConstant(v.value)
          case 'boolean':
            return v.value ? new LppConstant(1) : new LppConstant(0)
        }
      } else if (v instanceof LppFunction) {
        return new LppConstant(NaN)
      } else if (v instanceof LppObject) {
        return new LppConstant(NaN)
      }
      return new LppConstant(NaN) // should never happen
    }
    return new LppReturn(convertToNumber(args))
  }, new LppObject(new Map()))
  global.Number.set('EPLISON', new LppConstant(globalThis.Number.EPSILON))
  global.Number.set('MAX_VALUE', new LppConstant(globalThis.Number.MAX_VALUE))
  global.Number.set(
    'MAX_SAFE_INTEGER',
    new LppConstant(globalThis.Number.MAX_SAFE_INTEGER)
  )
  global.Number.set('MIN_VALUE', new LppConstant(globalThis.Number.MIN_VALUE))
  global.Number.set(
    'MIN_SAFE_INTEGER',
    new LppConstant(globalThis.Number.MIN_SAFE_INTEGER)
  )
  global.Number.set(
    'isNaN',
    LppFunction.native(({ args }) => {
      return new LppReturn(
        new LppConstant(
          args.length > 0 &&
            args[0] instanceof LppConstant &&
            globalThis.Number.isNaN(args[0].value)
        )
      )
    })
  )
  global.Number.set(
    'isFinite',
    LppFunction.native(({ args }) => {
      return new LppReturn(
        new LppConstant(
          args.length > 0 &&
            args[0] instanceof LppConstant &&
            globalThis.Number.isFinite(args[0].value)
        )
      )
    })
  )
  global.Number.set(
    'isSafeInteger',
    LppFunction.native(({ args }) => {
      return new LppReturn(
        new LppConstant(
          args.length > 0 &&
            args[0] instanceof LppConstant &&
            globalThis.Number.isSafeInteger(args[0].value)
        )
      )
    })
  )
  global.Number.set(
    'isSafeInteger',
    LppFunction.native(({ args }) => {
      return new LppReturn(
        new LppConstant(
          args.length > 0 &&
            args[0] instanceof LppConstant &&
            globalThis.Number.isSafeInteger(args[0].value)
        )
      )
    })
  )
}
