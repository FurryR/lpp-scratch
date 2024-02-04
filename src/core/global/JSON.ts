import { LppFunction, LppConstant, LppObject, LppValue } from '../type'
import { LppReturn } from '../context'
import { async, raise } from '../helper'
import * as ffi from '../ffi'

export default function (global: Record<string, LppValue>) {
  global.JSON = new LppObject(
    new Map([
      [
        'parse',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'string')
          ) {
            return async(function* () {
              return raise(
                yield (global.SyntaxError as LppFunction).construct([
                  new LppConstant('Invalid JSON')
                ])
              )
            })
          }
          try {
            return new LppReturn(
              ffi.fromObject(globalThis.JSON.parse(args[0].value))
            )
          } catch (e) {
            return async(function* () {
              if (e instanceof globalThis.Error) {
                return raise(
                  yield (global.SyntaxError as LppFunction).construct([
                    new LppConstant(e.message)
                  ])
                )
              }
              throw e
            })
          }
        })
      ],
      [
        'stringify',
        LppFunction.native(({ args }) => {
          if (args.length < 1) {
            return async(function* () {
              return raise(
                yield (global.SyntaxError as LppFunction).construct([
                  new LppConstant('Invalid value')
                ])
              )
            })
          }
          try {
            return new LppReturn(
              new LppConstant(globalThis.JSON.stringify(ffi.toObject(args[0])))
            )
          } catch (e) {
            return async(function* () {
              if (e instanceof globalThis.Error) {
                return raise(
                  yield (global.SyntaxError as LppFunction).construct([
                    new LppConstant(e.message)
                  ])
                )
              }
              throw e
            })
          }
        })
      ]
    ])
  )
}
