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
