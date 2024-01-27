// TODO: a PromiseLike object that **does not meet the requirement of A+ standard**, used for performance (and compatibility with Scratch).
// Reference (https://promisesaplus.com/):
// 2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1].
// export class ImmediatePromise<T> implements PromiseLike<T> {
//   /**
//    * Attaches callbacks for the resolution and/or rejection of the Promise.
//    * @param onFulfilled The callback to execute when the Promise is resolved.
//    * @param onRejected The callback to execute when the Promise is rejected.
//    * @returns A Promise for the completion of which ever callback is executed.
//    */
//   then<TResult1 = T, TResult2 = never>(
//     onFulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
//     onRejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>
//   ): PromiseLike<TResult1 | TResult2> {
//     throw new Error('not implemented')
//   }
// }
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
   * @warning Avoid where possible.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<T | TResult> {
    const pm = this.promise as Promise<T>
    if (pm.catch) {
      return pm.catch(
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
    } else
      throw new Error('catch is not implemented on this PromiseLike object')
  }
  constructor(
    private promise: PromiseLike<T>,
    private afterResolved?: () => void,
    private afterRejected?: () => void
  ) {}
}
