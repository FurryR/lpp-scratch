import { LppFunction, LppConstant, LppObject, LppValue } from '../../type'
import { LppReturn, LppException } from '../../context'
import { async, raise, asValue } from '../../helper'

/**
 * Lpp builtin `SyntaxError` -- represents an error when trying to interpret syntactically invalid code.
 */
export default function (global: Record<string, LppValue>) {
  const SyntaxError = (global.SyntaxError = LppFunction.native(
    ({ self, args }) => {
      if (self.instanceof(SyntaxError)) {
        return async(function* () {
          const v = yield (global.Error as LppFunction).apply(self, args)
          if (v instanceof LppException) return v
          return new LppReturn(new LppConstant(null))
        })
      } else {
        return async(function* () {
          return raise(
            yield (global.IllegalInvocationError as LppFunction).construct([])
          )
        })
      }
    },
    new LppObject(
      new Map([
        ['prototype', asValue((global.Error as LppFunction).get('prototype'))]
      ])
    )
  ))
}
