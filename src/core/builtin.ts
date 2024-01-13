import { LppReturn, LppException } from './context'
import {
  LppArray,
  LppConstant,
  LppFunction,
  LppObject,
  LppPromise,
  LppValue
} from './type'

import { asBoolean, ensureValue } from './helper'
/**
 * Global builtins.
 */
export const global = new Map<string, LppValue>()
/**
 * Convert Lpp object to JavaScript object.
 * @param value Object.
 * @returns Return value.
 */
function serialize(value: LppValue): unknown {
  const map = new WeakMap<LppValue, object>()
  /**
   * Convert Lpp object to JavaScript object.
   * @param value Object.
   * @returns Return value.
   */
  function serializeInternal(value: LppValue): unknown {
    if (value instanceof LppConstant) return value.value
    if (value instanceof LppArray) {
      const cache = map.get(value)
      if (cache) return cache
      const res = value.value.map((v) => (v ? serialize(v) : null))
      map.set(value, res)
      return res
    }
    if (value instanceof LppObject) {
      const cache = map.get(value)
      if (cache) return cache
      const res: Record<string, unknown> = {}
      for (const [k, v] of value.value.entries()) {
        if (k === 'constructor') continue
        res[k] = serialize(v)
      }
      map.set(value, res)
      return res
    }
    return null
  }
  return serializeInternal(value)
}
/**
 * Convert JavaScript object to Lpp object.
 * @param value Object.
 * @returns Return value.
 */
function deserialize(value: unknown): LppValue {
  const map = new WeakMap<object, LppValue>()
  /**
   * Convert JavaScript object to Lpp object.
   * @param {any} value Object.
   * @returns {LppValue} Return value.
   */
  function deserializeInternal(value: unknown): LppValue {
    if (value === null || value === undefined) return LppConstant.init(null)
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        return LppConstant.init(value)
      case 'object': {
        const v = map.get(value)
        if (v) return v
        if (value instanceof globalThis.Array) {
          const res = new LppArray(
            value.map((value) => deserializeInternal(value))
          )
          map.set(value, res)
          return res
        }
        const obj = new LppObject()
        for (const [k, v] of globalThis.Object.entries(value)) {
          obj.set(k, deserializeInternal(v))
        }
        map.set(value, obj)
        return obj
      }
    }
    return LppConstant.init(null)
  }
  return deserializeInternal(value)
}
export namespace Global {
  export const Boolean = LppFunction.native((_, args) => {
    if (args.length < 1) return new LppReturn(LppConstant.init(false))
    return new LppReturn(LppConstant.init(asBoolean(args[0])))
  }, new LppObject(new Map()))
  export const Number = LppFunction.native((_, args) => {
    /**
     * Convert args to number.
     * @param args Array to convert.
     * @returns Converted value.
     */
    function convertToNumber(args: LppValue[]): LppConstant<number> {
      if (args.length < 1) return LppConstant.init(0)
      const v = args[0]
      if (v instanceof LppConstant) {
        if (v === LppConstant.init(null)) return LppConstant.init(0)
        switch (typeof v.value) {
          case 'string':
            return LppConstant.init(globalThis.Number(v.value))
          case 'number':
            return LppConstant.init(v.value)
          case 'boolean':
            return v.value ? LppConstant.init(1) : LppConstant.init(0)
        }
      } else if (v instanceof LppFunction) {
        return LppConstant.init(NaN)
      } else if (v instanceof LppObject) {
        return LppConstant.init(NaN)
      }
      return LppConstant.init(NaN) // should never happen
    }
    return new LppReturn(convertToNumber(args))
  }, new LppObject(new Map()))
  export const String = LppFunction.native(
    (_, args) => {
      /**
       * Convert args to string.
       * @param args Array to convert.
       * @returns Converted value.
       */
      function convertToString(args: LppValue[]): LppConstant<string> {
        if (args.length < 1) return LppConstant.init('')
        const v = args[0]
        return LppConstant.init(v.toString()) // should never happen
      }
      return new LppReturn(convertToString(args))
    },
    new LppObject(
      new Map([
        [
          'length',
          LppFunction.native((self) => {
            if (self instanceof LppConstant && typeof self.value === 'string') {
              return new LppReturn(LppConstant.init(self.value.length))
            }
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: GlobalIllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          })
        ]
      ])
    )
  )
  export const Array = LppFunction.native(
    (_, args) => {
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
          LppFunction.native((self) => {
            if (self instanceof LppArray) {
              return new LppReturn(LppConstant.init(self.value.length))
            }
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: GlobalIllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          })
        ]
      ])
    )
  )
  export const Object = LppFunction.native((_, args) => {
    /**
     * Convert args to object.
     * @param {LppValue[]} args Array to convert.
     * @returns {LppValue} Converted value.
     */
    function convertToObject(args: LppValue[]): LppValue {
      if (args.length < 1) return new LppObject()
      return args[0]
    }
    return new LppReturn(convertToObject(args))
  }, new LppObject(new Map()))
  export const Function = LppFunction.native(
    (_, args) => {
      if (args.length < 1)
        return new LppReturn(
          new LppFunction(() => {
            return new LppReturn(LppConstant.init(null))
          })
        )
      if (args[0] instanceof LppFunction) return new LppReturn(args[0])
      const res = IllegalInvocationError.construct([])
      if (res instanceof globalThis.Promise)
        throw new globalThis.Error(
          'lpp: GlobalIllegalInvocationError constructor should be synchronous'
        )
      if (res instanceof LppException) return res
      return new LppException(res.value)
    },
    new LppObject(
      new Map([
        ['prototype', ensureValue(Object.get('prototype'))],
        [
          'apply',
          LppFunction.native((self, args) => {
            if (self instanceof LppFunction) {
              let selfArg: LppValue = LppConstant.init(null)
              let argArray: LppValue[] = []
              switch (args.length) {
                case 0: {
                  break
                }
                case 1: {
                  selfArg = args[0]
                  break
                }
                default: {
                  if (!(args[1] instanceof LppArray)) {
                    const res = IllegalInvocationError.construct([])
                    if (res instanceof globalThis.Promise)
                      throw new globalThis.Error(
                        'lpp: GlobalIllegalInvocationError constructor should be synchronous'
                      )
                    if (res instanceof LppException) return res
                    return new LppException(res.value)
                  }
                  selfArg = args[0]
                  argArray = args[1].value.map(
                    (v) => v ?? LppConstant.init(null)
                  )
                  break
                }
              }
              return self.apply(selfArg, argArray)
            } else {
              const res = IllegalInvocationError.construct([])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            }
          })
        ]
      ])
    )
  )
  export const Promise = LppFunction.native(
    (self, args) => {
      if (
        self instanceof LppPromise &&
        args.length > 0 &&
        args[0] instanceof LppFunction
      ) {
        const fn = args[0]
        return fn.apply(self, [
          new LppFunction((_, args) => {
            self.resolve(args[0] ?? LppConstant.init(null))
            return new LppReturn(LppConstant.init(null))
          }),
          new LppFunction((_, args) => {
            self.reject(args[0] ?? LppConstant.init(null))
            return new LppReturn(LppConstant.init(null))
          })
        ])
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    },
    new LppObject(
      new Map([
        [
          'then',
          LppFunction.native((self, args) => {
            // TODO: deal with Promise resolution
            if (
              self instanceof LppPromise &&
              args.length > 0 &&
              args[0] instanceof LppFunction
            ) {
              return new LppReturn(
                self.done(
                  args[0],
                  args[1] instanceof LppFunction ? args[1] : undefined
                )
              )
            } else {
              const res = IllegalInvocationError.construct([])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            }
          })
        ],
        [
          'catch',
          LppFunction.native((self, args) => {
            if (
              self instanceof LppPromise &&
              args.length > 0 &&
              args[0] instanceof LppFunction
            ) {
              return new LppReturn(self.error(args[0]))
            } else {
              const res = IllegalInvocationError.construct([])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            }
          })
        ]
      ])
    )
  )
  export const Error = LppFunction.native((self, args) => {
    if (self.instanceof(Error)) {
      self.set('value', args[0] ?? LppConstant.init(null))
      self.set('stack', LppConstant.init(null))
      return new LppReturn(new LppArray())
    } else {
      const res = IllegalInvocationError.construct([])
      if (res instanceof globalThis.Promise)
        throw new globalThis.Error(
          'lpp: GlobalIllegalInvocationError constructor should be synchronous'
        )
      if (res instanceof LppException) return res
      return new LppException(res.value)
    }
  }, new LppObject(new Map()))
  export const IllegalInvocationError = LppFunction.native(
    (self, args) => {
      if (self.instanceof(IllegalInvocationError)) {
        const res = Error.apply(self, args)
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: GlobalError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppReturn(LppConstant.init(null))
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    },
    new LppObject(new Map([['prototype', ensureValue(Error.get('prototype'))]]))
  )
  export const SyntaxError = LppFunction.native(
    (self, args) => {
      if (self.instanceof(SyntaxError)) {
        const res = Error.apply(self, args)
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: GlobalError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppReturn(LppConstant.init(null))
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    },
    new LppObject(new Map([['prototype', ensureValue(Error.get('prototype'))]]))
  )
  export const JSON = new LppObject(
    new Map([
      [
        'parse',
        LppFunction.native((self, args) => {
          if (self != JSON) {
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: GlobalIllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'string')
          ) {
            return SyntaxError.construct([LppConstant.init('Invalid JSON')])
          }
          try {
            return new LppReturn(
              deserialize(globalThis.JSON.parse(args[0].value))
            )
          } catch (e) {
            if (e instanceof globalThis.Error) {
              return SyntaxError.construct([LppConstant.init(e.message)])
            } else throw e
          }
        })
      ],
      [
        'stringify',
        LppFunction.native((self, args) => {
          if (self != JSON) {
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: GlobalIllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          if (args.length < 1) {
            return SyntaxError.construct([LppConstant.init('Invalid value')])
          }
          try {
            return new LppReturn(
              LppConstant.init(globalThis.JSON.stringify(serialize(args[0])))
            )
          } catch (e) {
            if (e instanceof globalThis.Error) {
              return SyntaxError.construct([LppConstant.init(e.message)])
            } else throw e
          }
        })
      ]
    ])
  )
}
// Type
global.set('Boolean', Global.Boolean)
global.set('Number', Global.Number)
global.set('String', Global.String)
global.set('Array', Global.Array)
global.set('Object', Global.Object)
global.set('Function', Global.Function)
global.set('Promise', Global.Promise)
// Error
global.set('Error', Global.Error)
global.set('IllegalInvocationError', Global.IllegalInvocationError)
global.set('SyntaxError', Global.SyntaxError)
// Utility
global.set('JSON', Global.JSON)
