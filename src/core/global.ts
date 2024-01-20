import { LppReturn, LppException } from './context'
import {
  LppArray,
  LppConstant,
  LppFunction,
  LppObject,
  LppPromise,
  LppValue
} from './type'

import {
  asBoolean,
  serializeObject,
  ensureValue,
  deserializeObject
} from './helper'
/**
 * Global builtins.
 */
export const global = new Map<string, LppValue>()
export namespace Global {
  export const Boolean = LppFunction.native((_, args) => {
    if (args.length < 1) return new LppReturn(new LppConstant(false))
    return new LppReturn(new LppConstant(asBoolean(args[0])))
  }, new LppObject(new Map()))
  export const Number = LppFunction.native((_, args) => {
    /**
     * Convert args to number.
     * @param args Array to convert.
     * @returns Converted value.
     */
    function convertToNumber(args: LppValue[]): LppConstant<number> {
      if (args.length < 1) return new LppConstant(0)
      const v = args[0]
      if (v instanceof LppConstant) {
        if (v === new LppConstant(null)) return new LppConstant(0)
        switch (typeof v.value) {
          case 'string':
            return new LppConstant(globalThis.Number(v.value))
          case 'number':
            return new LppConstant(v.value)
          case 'boolean':
            return v.value ? new LppConstant(1) : new LppConstant(0)
        }
      } else if (v instanceof LppFunction) {
        return new LppConstant(NaN)
      } else if (v instanceof LppObject) {
        return new LppConstant(NaN)
      }
      return new LppConstant(NaN) // should never happen
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
        if (args.length < 1) return new LppConstant('')
        const v = args[0]
        return new LppConstant(v.toString()) // should never happen
      }
      return new LppReturn(convertToString(args))
    },
    new LppObject(
      new Map([
        [
          'length',
          LppFunction.native(self => {
            if (self instanceof LppConstant && typeof self.value === 'string') {
              return new LppReturn(new LppConstant(self.value.length))
            }
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: IllegalInvocationError constructor should be synchronous'
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
          LppFunction.native(self => {
            if (self instanceof LppArray) {
              return new LppReturn(new LppConstant(self.value.length))
            }
            const res = IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: IllegalInvocationError constructor should be synchronous'
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
     * @param args Array to convert.
     * @returns Converted value.
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
            return new LppReturn(new LppConstant(null))
          })
        )
      if (args[0] instanceof LppFunction) return new LppReturn(args[0])
      const res = IllegalInvocationError.construct([])
      if (res instanceof globalThis.Promise)
        throw new globalThis.Error(
          'lpp: IllegalInvocationError constructor should be synchronous'
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
              let selfArg: LppValue = new LppConstant(null)
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
                        'lpp: IllegalInvocationError constructor should be synchronous'
                      )
                    if (res instanceof LppException) return res
                    return new LppException(res.value)
                  }
                  selfArg = args[0]
                  argArray = args[1].value.map(v => v ?? new LppConstant(null))
                  break
                }
              }
              return self.apply(selfArg, argArray)
            } else {
              const res = IllegalInvocationError.construct([])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: IllegalInvocationError constructor should be synchronous'
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
            self.resolve(args[0] ?? new LppConstant(null))
            return new LppReturn(new LppConstant(null))
          }),
          new LppFunction((_, args) => {
            self.reject(args[0] ?? new LppConstant(null))
            return new LppReturn(new LppConstant(null))
          })
        ])
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: IllegalInvocationError constructor should be synchronous'
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
            // TODO: handle Promise (described in standard documentation)
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
                  'lpp: IllegalInvocationError constructor should be synchronous'
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
                  'lpp: IllegalInvocationError constructor should be synchronous'
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
      self.set('value', args[0] ?? new LppConstant(null))
      self.set('stack', new LppConstant(null))
      return new LppReturn(new LppArray())
    } else {
      const res = IllegalInvocationError.construct([])
      if (res instanceof globalThis.Promise)
        throw new globalThis.Error(
          'lpp: IllegalInvocationError constructor should be synchronous'
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
            'lpp: Error constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppReturn(new LppConstant(null))
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: IllegalInvocationError constructor should be synchronous'
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
            'lpp: Error constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppReturn(new LppConstant(null))
      } else {
        const res = IllegalInvocationError.construct([])
        if (res instanceof globalThis.Promise)
          throw new globalThis.Error(
            'lpp: IllegalInvocationError constructor should be synchronous'
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
                'lpp: IllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'string')
          ) {
            const res = SyntaxError.construct([new LppConstant('Invalid JSON')])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: SyntaxError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          try {
            return new LppReturn(
              serializeObject(globalThis.JSON.parse(args[0].value))
            )
          } catch (e) {
            if (e instanceof globalThis.Error) {
              const res = SyntaxError.construct([new LppConstant(e.message)])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: SyntaxError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
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
                'lpp: IllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          if (args.length < 1) {
            const res = SyntaxError.construct([
              new LppConstant('Invalid value')
            ])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: SyntaxError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          try {
            return new LppReturn(
              new LppConstant(
                globalThis.JSON.stringify(deserializeObject(args[0]))
              )
            )
          } catch (e) {
            if (e instanceof globalThis.Error) {
              const res = SyntaxError.construct([new LppConstant(e.message)])
              if (res instanceof globalThis.Promise)
                throw new globalThis.Error(
                  'lpp: SyntaxError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
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
