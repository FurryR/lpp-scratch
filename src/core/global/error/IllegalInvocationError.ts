import { LppFunction, LppConstant, LppObject, LppValue } from '../../type'
import { LppReturn, LppException } from '../../context'
import { async, raise, asValue } from '../../helper'

/**
 * Lpp builtin `IllegalInvocationError` -- represents an error when trying to called a function with illegal arguments / context.
 */
export default function (global: Record<string, LppValue>) {
  const IllegalInvocationError: LppFunction = (global.IllegalInvocationError =
    LppFunction.native(
      ({ self, args }) => {
        if (self.instanceof(IllegalInvocationError)) {
          return async(function* () {
            const v = yield (global.Error as LppFunction).apply(self, args)
            if (v instanceof LppException) return v
            return new LppReturn(new LppConstant(null))
          })
        } else {
          return async(function* () {
            return raise(yield IllegalInvocationError.construct([]))
          })
        }
      },
      new LppObject(
        new Map([['prototype', asValue(global.Error.get('prototype'))]])
      )
    ))
}
