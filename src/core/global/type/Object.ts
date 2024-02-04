import { LppReturn } from '../../context'
import { LppValue, LppFunction, LppObject } from '../../type'

/**
 * lpp builtin `Object` -- constructor of object types.
 */
export default function (global: Record<string, LppValue>) {
  global.Object = LppFunction.native(({ args }) => {
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
  }, new LppObject(new Map()))
}
