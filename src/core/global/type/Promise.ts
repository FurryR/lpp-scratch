import {
  LppFunction,
  LppConstant,
  LppObject,
  LppPromise,
  LppValue
} from '../../type'
import { LppReturn } from '../../context'
import { async, processThenReturn, raise } from '../../helper'

function processPromise(self: LppPromise, res: LppPromise): LppReturn {
  self.pm = res.pm
  return new LppReturn(new LppConstant(null))
}
/**
 * lpp builtin `Promise` -- represents the eventual completion (or failure) of an asynchronous operation and its resulting value.
 */
export default function (global: Record<string, LppValue>) {
  global.Promise = LppFunction.native(
    ({ self, args }) => {
      if (
        self instanceof LppPromise &&
        args.length > 0 &&
        args[0] instanceof LppFunction
      ) {
        const fn = args[0]
        // TODO: resolve(v: PromiseLike<...>)
        return async(function* () {
          return processPromise(
            self,
            yield LppPromise.generate((resolve, reject) => {
              return async(function* () {
                yield fn.apply(self, [
                  new LppFunction(({ args }) => {
                    // resolve
                    return async(function* () {
                      yield processThenReturn(
                        new LppReturn(args[0] ?? new LppConstant(null)),
                        resolve,
                        reject
                      )
                      return new LppReturn(new LppConstant(null))
                    })
                  }),
                  new LppFunction(({ args }) => {
                    reject(args[0] ?? new LppConstant(null))
                    return new LppReturn(new LppConstant(null))
                  })
                ])
                return undefined
              })
            })
          )
        })
      } else {
        return async(function* () {
          return raise(
            yield (global.IllegalInvocationErrorError as LppFunction).construct(
              []
            )
          )
        })
      }
    },
    new LppObject(
      new Map([
        [
          'then',
          LppFunction.native(({ self, args }) => {
            if (self instanceof LppPromise) {
              return new LppReturn(
                self.done(
                  args[0] instanceof LppFunction ? args[0] : undefined,
                  args[1] instanceof LppFunction ? args[1] : undefined
                )
              )
            } else {
              return async(function* () {
                return raise(
                  yield (
                    global.IllegalInvocationErrorError as LppFunction
                  ).construct([])
                )
              })
            }
          })
        ],
        [
          'catch',
          LppFunction.native(({ self, args }) => {
            if (
              self instanceof LppPromise &&
              args.length > 0 &&
              args[0] instanceof LppFunction
            ) {
              return new LppReturn(self.error(args[0]))
            } else {
              return async(function* () {
                return raise(
                  yield (
                    global.IllegalInvocationErrorError as LppFunction
                  ).construct([])
                )
              })
            }
          })
        ]
      ])
    )
  )
  global.Promise.set(
    'resolve',
    LppFunction.native(({ args }) => {
      return async(function* () {
        return new LppReturn(
          yield LppPromise.generate((resolve, reject) => {
            return async(function* () {
              yield processThenReturn(
                new LppReturn(args[0] ?? new LppConstant(null)),
                resolve,
                reject
              )
              return undefined
            })
          })
        )
      })
    })
  )
  global.Promise.set(
    'reject',
    LppFunction.native(({ args }) => {
      return new LppReturn(
        new LppPromise(
          globalThis.Promise.reject(args[0] ?? new LppConstant(null))
        )
      )
    })
  )
}
