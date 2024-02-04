import Global from '../global'
import { LppReturn } from '../context'
import { async, processThenReturn } from '../helper'
import { LppValue } from './base'
import { LppFunction } from './function'
import { LppObject } from './object'

export class LppPromise extends LppObject {
  /**
   * then() function.
   * @param resolveFn
   * @param rejectFn
   * @returns
   */
  done(resolveFn?: LppFunction, rejectFn?: LppFunction): LppPromise {
    return LppPromise.generate((resolve, reject) => {
      this.pm.then(
        value => {
          if (value instanceof LppValue) {
            if (resolveFn) {
              return async(
                function* (this: LppPromise) {
                  return processThenReturn(
                    yield resolveFn.apply(this, [value]),
                    resolve,
                    reject
                  )
                }.bind(this)
              )
            } else {
              return processThenReturn(new LppReturn(value), resolve, reject)
            }
          }
          throw new Error('lpp: unknown result')
        },
        err => {
          if (err instanceof LppValue) {
            if (rejectFn) {
              return async(
                function* (this: LppPromise) {
                  return processThenReturn(
                    yield rejectFn.apply(this, [err]),
                    resolve,
                    reject
                  )
                }.bind(this)
              )
            } else {
              return reject(err)
            }
          }
          throw err
        }
      )
      return undefined
    })
  }
  /**
   * catch() function.
   * @param rejectFn
   * @returns
   */
  error(rejectFn: LppFunction): LppPromise {
    return LppPromise.generate((resolve, reject) => {
      this.pm.catch(err => {
        if (err instanceof LppValue) {
          return async(
            function* (this: LppPromise) {
              return processThenReturn(
                yield rejectFn.apply(this, [err]),
                resolve,
                reject
              )
            }.bind(this)
          )
        }
        throw err
      })
      return undefined
    })
  }

  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => PromiseLike<void>
  ): PromiseLike<LppPromise>
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined
  ): LppPromise
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined | PromiseLike<void>
  ): LppPromise | PromiseLike<LppPromise>
  static generate(
    fn: (
      resolve: (v: LppValue) => void,
      reject: (reason: unknown) => void
    ) => undefined | PromiseLike<void>
  ): LppPromise | PromiseLike<LppPromise> {
    let resolveFn: (v: LppValue) => void
    let rejectFn: (reason: unknown) => void
    resolveFn = rejectFn = () => {
      throw new Error('not initialized')
    }
    const pm = new Promise<LppValue>((resolve, reject) => {
      resolveFn = resolve
      rejectFn = reject
    })
    return async(function* () {
      yield fn(resolveFn, rejectFn)
      return new LppPromise(pm)
    })
  }
  constructor(public pm: Promise<LppValue>) {
    super(new Map(), Global.Promise as LppFunction)
  }
}
