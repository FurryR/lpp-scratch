import { LppException, LppReturn, LppResult } from '../context'
import { LppConstant, LppFunction } from '../type'
import { LppValue } from '../type'
import { asValue } from './cast'
import { async } from './promise'

export * from './cast'
export * from './math'
export * from './promise'

export function processThenReturn(
  returnValue: LppResult,
  resolve: (v: LppValue) => void,
  reject: (reason: unknown) => void
): undefined | PromiseLike<undefined> {
  if (returnValue instanceof LppReturn) {
    const value = returnValue.value
    if (!(value instanceof LppConstant) || value.value !== null) {
      const then = asValue(value.get('then'))
      if (then instanceof LppFunction) {
        return async(function* () {
          const res: LppResult = yield then.apply(value, [
            new LppFunction(({ args }) => {
              return async(function* () {
                // resolve
                yield processThenReturn(
                  new LppReturn(args[0] ?? new LppConstant(null)),
                  resolve,
                  reject
                )
                return new LppReturn(new LppConstant(null))
              })
            }),
            new LppFunction(({ args }) => {
              // reject
              reject(args[0] ?? new LppConstant(null))
              return new LppReturn(new LppConstant(null))
            })
          ])
          return res instanceof LppException
            ? void reject(res.value)
            : undefined
        })
      }
    }
    return void resolve(returnValue.value)
  }
  return void reject(returnValue.value)
}
export function raise(res: LppResult) {
  return res instanceof LppException ? res : new LppException(res.value)
}
