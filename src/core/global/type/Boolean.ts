import { LppReturn } from '../../context'
import { asBoolean } from '../../helper'
import { LppConstant, LppFunction, LppObject, LppValue } from '../../type'

/**
 * lpp builtin `Boolean` -- constructor of boolean types.
 */
export default function (global: Record<string, LppValue>) {
  global.Boolean = LppFunction.native(({ args }) => {
    if (args.length < 1) return new LppReturn(new LppConstant(false))
    return new LppReturn(new LppConstant(asBoolean(args[0])))
  }, new LppObject(new Map()))
}
