import {
  LppFunction,
  LppConstant,
  LppArray,
  LppObject,
  LppValue
} from '../../type'
import { LppReturn } from '../../context'
import { async, raise } from '../../helper'

/**
 * lpp builtin `Error` -- `Error` objects are thrown when runtime errors occur.
 */
export default function (global: Record<string, LppValue>) {
  const Error = (global.Error = LppFunction.native(({ self, args }) => {
    if (self.instanceof(Error)) {
      self.set('value', args[0] ?? new LppConstant(null))
      self.set('stack', new LppConstant(null))
      return new LppReturn(new LppArray())
    } else {
      return async(function* () {
        return raise(
          yield (global.IllegalInvocationError as LppFunction).construct([])
        )
      })
    }
  }, new LppObject(new Map())))
}
