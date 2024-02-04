import { LppReturn } from '../../context'
import { async, raise } from '../../helper'
import { LppValue, LppFunction, LppConstant, LppObject } from '../../type'

/**
 * lpp builtin `String` -- constructor of string types.
 */
export default function (global: Record<string, LppValue>) {
  global.String = LppFunction.native(
    ({ args }) => {
      /**
       * Convert args to string.
       * @param args Array to convert.
       * @returns Converted value.
       */
      function convertToString(args: LppValue[]): LppConstant<string> {
        if (args.length < 1) return new LppConstant('')
        const v = args[0]
        return new LppConstant(v.toString()) // should never happen
      }
      return new LppReturn(convertToString(args))
    },
    new LppObject(
      new Map([
        [
          'length',
          LppFunction.native(({ self }) => {
            if (self instanceof LppConstant && typeof self.value === 'string') {
              return new LppReturn(new LppConstant(self.value.length))
            }
            return async(function* () {
              return raise(
                yield (global.IllegalInvocationError as LppFunction).construct(
                  []
                )
              )
            })
          })
        ]
      ])
    )
  )
}
