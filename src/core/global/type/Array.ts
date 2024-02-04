import { LppException, LppReturn } from '../../context'
import { asBoolean, async, raise } from '../../helper'
import {
  LppFunction,
  LppArray,
  LppObject,
  LppConstant,
  LppValue
} from '../../type'

/**
 * lpp builtin `Array` -- constructor of array types.
 */
export default function (global: Record<string, LppValue>) {
  global.Array = LppFunction.native(
    ({ args }) => {
      /**
       * Convert args to Array object.
       * @param args Array to convert.
       * @returns Converted value.
       */
      function convertToArray(args: LppValue[]): LppArray {
        if (args.length < 1) return new LppArray()
        if (args.length === 1 && args[0] instanceof LppArray) {
          return args[0]
        }
        return new LppArray(args)
      }
      return new LppReturn(convertToArray(args))
    },
    new LppObject(
      new Map([
        [
          'length',
          LppFunction.native(({ self }) => {
            if (!(self instanceof LppArray)) {
              return async(function* () {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              })
            }
            return new LppReturn(new LppConstant(self.value.length))
          })
        ],
        [
          'slice',
          LppFunction.native(({ self, args }) => {
            return async(function* () {
              if (!(self instanceof LppArray)) {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              }
              const start = args[0]
              const end = args[0]
              if (
                (start && !(start instanceof LppConstant)) ||
                (end && !(end instanceof LppConstant))
              ) {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              }
              return new LppReturn(
                new LppArray(
                  self.value.slice(
                    start?.value ?? undefined,
                    end?.value ?? undefined
                  )
                )
              )
            })
          })
        ],
        [
          'map',
          LppFunction.native(({ self, args }) => {
            return async(function* () {
              if (
                !(self instanceof LppArray) ||
                !(args[0] instanceof LppFunction)
              ) {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              }
              const result = new LppArray()
              const predict = args[0]
              for (const [k, v] of self.value.entries()) {
                const res = yield predict.apply(self, [
                  v ?? new LppConstant(null),
                  new LppConstant(k)
                ])
                if (res instanceof LppException) return res
                else result.value.push(res.value)
              }
              return new LppReturn(result)
            })
          })
        ],
        [
          'every',
          LppFunction.native(({ self, args }) => {
            return async(function* () {
              if (
                !(self instanceof LppArray) ||
                !(args[0] instanceof LppFunction)
              ) {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              }
              const predict = args[0]
              for (const [k, v] of self.value.entries()) {
                const res = yield predict.apply(self, [
                  v ?? new LppConstant(null),
                  new LppConstant(k)
                ])
                if (res instanceof LppException) return res
                else if (!asBoolean(res.value)) {
                  return new LppReturn(new LppConstant(false))
                }
              }
              return new LppReturn(new LppConstant(true))
            })
          })
        ],
        [
          'any',
          LppFunction.native(({ self, args }) => {
            return async(function* () {
              if (
                !(self instanceof LppArray) ||
                !(args[0] instanceof LppFunction)
              ) {
                return raise(
                  yield (
                    global.IllegalInvocationError as LppFunction
                  ).construct([])
                )
              }
              const predict = args[0]
              for (const [k, v] of self.value.entries()) {
                const res = yield predict.apply(self, [
                  v ?? new LppConstant(null),
                  new LppConstant(k)
                ])
                if (res instanceof LppException) return res
                else if (asBoolean(res.value)) {
                  return new LppReturn(new LppConstant(true))
                }
              }
              return new LppReturn(new LppConstant(false))
            })
          })
        ]
      ])
    )
  )
}
