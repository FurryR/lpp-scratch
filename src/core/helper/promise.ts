type InternalAny = ReturnType<JSON['parse']>
export function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string | number | symbol, unknown>).then ===
      'function'
  )
}
export function async<T, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Generator<InternalAny, T, InternalAny>,
  ...args: TArgs
): T | PromiseLike<Awaited<T>> {
  const generator = fn(...args)
  function next(v?: InternalAny): T | PromiseLike<Awaited<T>> {
    const res = generator.next(v)
    if (isPromise(res.value)) {
      return res.done
        ? res.value
        : (res.value.then(v => next(v)) as PromiseLike<Awaited<T>>)
    }
    return res.done ? res.value : next(res.value)
  }
  return next()
}
