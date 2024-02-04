import { LppReturn } from '../../context'
import { async, raise, asValue } from '../../helper'
import { LppFunction, LppConstant, LppObject, LppValue } from '../../type'

/**
 * lpp builtin `Function` -- constructor of function types.
 */
export default function (global: Record<string, LppValue>) {
  global.Function = LppFunction.native(
    ({ args }) => {
      if (args.length < 1)
        return new LppReturn(
          new LppFunction(() => {
            return new LppReturn(new LppConstant(null))
          })
        )
      if (args[0] instanceof LppFunction) return new LppReturn(args[0])
      return async(function* () {
        return raise(
          yield (global.IllegalInvocationError as LppFunction).construct([])
        )
      })
    },
    new LppObject(
      new Map([
        ['prototype', asValue(global.Object.get('prototype'))],
        [
          'bind',
          LppFunction.native(({ self, args }) => {
            if (!(self instanceof LppFunction) || args.length < 1) {
              return async(function* () {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              })
            }
            const selfArg: LppValue = args[0]
            return new LppReturn(
              new LppFunction(ctx => {
                return self.apply(selfArg, ctx.args)
              })
            )
          })
        ]
      ])
    )
  )
}
