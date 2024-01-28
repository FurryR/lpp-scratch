// TODO: a PromiseLike object that **does not meet the requirement of A+ standard**, used for performance (and compatibility with Scratch).
// Reference (https://promisesaplus.com/):
// 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1].

import { isPromise } from 'src/core'
class Resolved<T> {
  constructor(public value: T) {}
}
class Rejected {
  public handled = false
  constructor(public reason: unknown) {}
}
const PromiseResult = Symbol('PromiseResult')
const PromiseCallback = Symbol('PromiseCallback')

export interface ImmediatePromiseWithResolvers<T> {
  promise: ImmediatePromise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}
export class ImmediatePromise<T> implements PromiseLike<T> {
  get [Symbol.toStringTag]() {
    return 'ImmediatePromise'
  }
  private [PromiseCallback]: (() => void)[] = []
  private [PromiseResult]?: Resolved<T> | Rejected
  /**
   * Creates a new Promise.
   * @param executor A callback used to initialize the promise. This callback is passed two arguments:
   * a resolve callback used to resolve the promise with a value or the result of another promise,
   * and a reject callback used to reject the promise with a provided reason or error.
   * @version es5
   */
  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void
    ) => void
  ) {
    const resolve = (result: T | PromiseLike<T>) => {
      const processResolve = (result: T): void => {
        if (!this[PromiseResult]) {
          this[PromiseResult] = new Resolved(result)
          this[PromiseCallback].forEach(callback => callback())
          this[PromiseCallback] = []
        }
      }
      if (isPromise(result)) {
        result.then(
          (result: T) => {
            processResolve(result)
          },
          (reason: unknown) => {
            reject(reason)
          }
        )
      } else {
        processResolve(result)
      }
    }
    const reject = (reason: unknown) => {
      if (!this[PromiseResult]) {
        const res = new Rejected(reason)
        this[PromiseResult] = res
        this[PromiseCallback].forEach(callback => callback())
        this[PromiseCallback] = []
        setTimeout(() => {
          if (!res.handled) throw res.reason
        })
      }
    }
    if (typeof executor !== 'function')
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   * @version es5
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): ImmediatePromise<TResult1 | TResult2> {
    return new ImmediatePromise<TResult1 | TResult2>((resolve, reject) => {
      if (this[PromiseResult]) {
        if (this[PromiseResult] instanceof Resolved) {
          return onfulfilled
            ? resolve(onfulfilled(this[PromiseResult].value))
            : resolve(this[PromiseResult].value as unknown as TResult1)
        }
        this[PromiseResult].handled = true
        return onrejected
          ? resolve(onrejected(this[PromiseResult].reason))
          : reject(this[PromiseResult].reason)
      }
      return void this[PromiseCallback].push(() => {
        try {
          if (this[PromiseResult] instanceof Resolved) {
            if (onfulfilled) {
              resolve(onfulfilled(this[PromiseResult].value as T))
            } else resolve(this[PromiseResult].value as unknown as TResult1)
          } else if (this[PromiseResult] instanceof Rejected) {
            this[PromiseResult].handled = true
            if (onrejected) {
              resolve(onrejected(this[PromiseResult].reason))
            } else reject(this[PromiseResult].reason)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   * @version es5
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): ImmediatePromise<T | TResult> {
    return this.then<T, TResult>(undefined, onrejected)
  }
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   * @version es2018
   */
  finally(
    onfinally?: (() => void | PromiseLike<void>) | undefined | null
  ): ImmediatePromise<T> {
    if (!onfinally) return this
    return new ImmediatePromise<T>((resolve, reject) => {
      if (this[PromiseResult]) {
        const res = onfinally()
        if (isPromise(res)) {
          return void res.then(
            () => {
              return (
                this[PromiseResult] &&
                (this[PromiseResult] instanceof Resolved
                  ? resolve(this[PromiseResult].value)
                  : reject(this[PromiseResult].reason))
              )
            },
            reason => {
              return reject(reason)
            }
          )
        }
        return this[PromiseResult] instanceof Resolved
          ? resolve(this[PromiseResult].value)
          : reject(this[PromiseResult].reason)
      }
      return void this[PromiseCallback].push(() => {
        if (this[PromiseResult]) {
          try {
            const res = onfinally()
            if (isPromise(res)) {
              return void res.then(
                () => {
                  return (
                    this[PromiseResult] &&
                    (this[PromiseResult] instanceof Resolved
                      ? resolve(this[PromiseResult].value)
                      : reject(this[PromiseResult].reason))
                  )
                },
                reason => {
                  return reject(reason)
                }
              )
            }
            return this[PromiseResult] instanceof Resolved
              ? resolve(this[PromiseResult].value)
              : reject(this[PromiseResult].reason)
          } catch (e) {
            reject(e)
          }
        }
      })
    })
  }
  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   * @version es2015
   */
  static all<T>(
    values: Iterable<T | PromiseLike<T>>
  ): ImmediatePromise<Awaited<T>[]>
  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   * @version es2015
   */
  static all<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<{ -readonly [P in keyof T]: Awaited<T[P]> }>
  static all<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
    type Result = { -readonly [P in keyof T]: Awaited<T[P]> }
    return new ImmediatePromise<Result>((resolve, reject) => {
      let index = 0
      let completed = 0
      const result: Partial<Result> = {}
      let performCheck = false
      for (const v of values) {
        const current = index++
        ImmediatePromise.resolve(v).then(v => {
          result[current] = v as Awaited<T>
          completed++
          if (performCheck && completed === index) {
            resolve(result as Result)
          }
        }, reject)
      }
      if (completed === index) {
        return resolve(result as Result)
      }
      performCheck = true
    })
  }
  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   * @version es2015
   */
  static race<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<Awaited<T[number]>> {
    return new ImmediatePromise<Awaited<T[number]>>(resolve => {
      for (const v of values) resolve(v as Awaited<T[number]>)
    })
  }
  /**
   * Creates a new rejected promise for the provided reason.
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  static reject<T = never>(reason?: unknown): ImmediatePromise<T> {
    return new ImmediatePromise((_, reject) => reject(reason))
  }
  /**
   * Creates a new resolved promise.
   * @returns A resolved promise.
   * @version es2015
   */
  static resolve(): ImmediatePromise<void>
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   * @version es2015
   */
  static resolve<T>(value: T): ImmediatePromise<Awaited<T>>
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   * @version es2015
   */
  static resolve<T>(value: T | PromiseLike<T>): ImmediatePromise<Awaited<T>>
  static resolve<T = never>(
    value?: T | PromiseLike<T>
  ): ImmediatePromise<Awaited<T>> {
    return new ImmediatePromise<Awaited<T>>(resolve =>
      resolve(value as Awaited<T>)
    )
  }
  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   * @version es2020
   */
  static allSettled<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<{
    -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>
  }>
  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   * @version es2020
   */
  static allSettled<T>(
    values: Iterable<T | PromiseLike<T>>
  ): ImmediatePromise<PromiseSettledResult<Awaited<T>>[]>
  static allSettled<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<{
    -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>
  }> {
    type Result = {
      -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>
    }
    return new ImmediatePromise<Result>(resolve => {
      let index = 0
      let completed = 0
      const result: Partial<Result> = {}
      let performCheck = false
      for (const v of values) {
        const current = index++
        ImmediatePromise.resolve(v).then(
          v => {
            result[current] = {
              status: 'fulfilled',
              value: v
            }
            completed++
            if (performCheck && completed === index) {
              resolve(result as Result)
            }
          },
          err => {
            result[current] = {
              status: 'rejected',
              reason: err
            }
            completed++
            if (performCheck && completed === index) {
              resolve(result as Result)
            }
          }
        )
      }
      if (completed === index) {
        return resolve(result as Result)
      }
      performCheck = true
    })
  }
  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   * @param values An array or iterable of Promises.
   * @returns A new Promise.
   * @version es2021
   */
  static any<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<Awaited<T[number]>>
  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   * @param values An array or iterable of Promises.
   * @returns A new Promise.
   * @version es2021
   */
  static any<T>(
    values: Iterable<T | PromiseLike<T>>
  ): ImmediatePromise<Awaited<T>>
  static any<T extends readonly unknown[] | []>(
    values: T
  ): ImmediatePromise<Awaited<T[number]>> {
    type Result = Awaited<T[number]>
    return new ImmediatePromise<Result>((resolve, reject) => {
      let index = 0
      let failed = 0
      const result: unknown[] = []
      let performCheck = false
      for (const v of values) {
        const current = index++
        ImmediatePromise.resolve(v).then(
          v => resolve(v as Result),
          v => {
            result[current] = v
            failed++
            if (performCheck && failed === index) {
              reject(new AggregateError(result, 'All promises were rejected'))
            }
          }
        )
      }
      if (failed === index) {
        return reject(new AggregateError(result, 'All promises were rejected'))
      }
      performCheck = true
    })
  }
  /**
   * Make a PromiseLike object synchronous.
   * @param v PromiseLike object.
   * @returns Value or PromiseLike object.
   * @warning Non-standard.
   */
  static sync<T>(v: PromiseLike<T>): T | PromiseLike<T> {
    let result: Resolved<T> | Rejected | undefined = undefined
    v.then(
      v => {
        result = new Resolved(v)
      },
      v => {
        result = new Rejected(v)
      }
    )
    if (result) {
      const v = result as Resolved<T> | Rejected
      if (v instanceof Resolved) {
        return v.value
      } else {
        throw v.reason
      }
    }
    return v
  }
  /**
   * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
   * @returns An object with the properties `promise`, `resolve`, and `reject`.
   *
   * ```ts
   * const { promise, resolve, reject } = Promise.withResolvers<T>();
   * ```
   *
   * @version es2023
   */
  withResolvers<T>(): ImmediatePromiseWithResolvers<T> {
    let resolveFn: (value: T | PromiseLike<T>) => void
    let rejectFn: (reason?: unknown) => void
    resolveFn = rejectFn = (): never => {
      throw new Error('not implemented')
    }
    const promise = new ImmediatePromise<T>((resolve, reject) => {
      resolveFn = resolve
      rejectFn = reject
    })
    return { promise, reject: rejectFn, resolve: resolveFn }
  }
}
export class PromiseProxy<T> implements PromiseLike<T> {
  private afterFulfilledCalled = false
  private afterRejectedCalled = false
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(
      onfulfilled
        ? value => {
            const res = onfulfilled(value)
            if (!this.afterFulfilledCalled) {
              if (this.afterResolved) this.afterResolved()
              this.afterFulfilledCalled = true
            }
            return res
          }
        : undefined,
      onrejected
        ? reason => {
            const res = onrejected(reason)
            if (!this.afterRejectedCalled) {
              if (this.afterRejected) this.afterRejected()
              this.afterRejectedCalled = true
            }
            return res
          }
        : undefined
    )
  }
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): PromiseLike<T | TResult> {
    return this.promise.then(undefined, onrejected)
  }
  constructor(
    private promise: PromiseLike<T>,
    private afterResolved?: () => void,
    private afterRejected?: () => void
  ) {}
}
