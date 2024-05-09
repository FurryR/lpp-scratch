import { async, raise } from 'src/core/helper'
import { LppReturn } from '../../context'
import { LppValue, LppFunction, LppObject } from '../../type'

/**
 * lpp builtin `Object` -- constructor of object types.
 */
export default function (global: Record<string, LppValue>) {
  const Object = (global.Object = LppFunction.native(({ args }) => {
    /**
     * Convert args to object.
     * @param args Array to convert.
     * @returns Converted value.
     */
    function convertToObject(args: LppValue[]): LppValue {
      if (args.length < 1) return new LppObject()
      return args[0]
    }
    return new LppReturn(convertToObject(args))
  }, new LppObject(new Map())))
  Object.set(
    'create',
    LppFunction.native(({ args }) => {
      return async(function* () {
        if (args.length !== 1 || !(args[0] instanceof LppObject))
          return raise(
            yield (global.IllegalInvocationError as LppFunction).construct([])
          )
        return new LppReturn(LppObject.create(args[0]))
      })
    })
  )
}
