import { LppFunction, LppConstant, LppObject } from '../type'
import { LppValue } from '../type'
import { LppReturn } from '../context'

export default function (global: Record<string, LppValue>) {
  global.Math = new LppObject(
    new Map<string, LppValue>([
      ['E', new LppConstant(globalThis.Math.E)],
      ['PI', new LppConstant(globalThis.Math.PI)],
      [
        'sin',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.sin(args[0].value))
          )
        })
      ],
      [
        'sinh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.sinh(args[0].value))
          )
        })
      ],
      [
        'asin',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.asin(args[0].value))
          )
        })
      ],
      [
        'asinh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.asinh(args[0].value))
          )
        })
      ],
      [
        'cos',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.cos(args[0].value))
          )
        })
      ],
      [
        'cosh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.cosh(args[0].value))
          )
        })
      ],
      [
        'acos',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.acos(args[0].value))
          )
        })
      ],
      [
        'acosh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.acosh(args[0].value))
          )
        })
      ],
      [
        'tan',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.tan(args[0].value))
          )
        })
      ],
      [
        'tanh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.tanh(args[0].value))
          )
        })
      ],
      [
        'atan',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.atan(args[0].value))
          )
        })
      ],
      [
        'atanh',
        LppFunction.native(({ args }) => {
          if (
            args.length < 1 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.atanh(args[0].value))
          )
        })
      ],
      [
        'atan2',
        LppFunction.native(({ args }) => {
          if (
            args.length < 2 ||
            !(args[0] instanceof LppConstant) ||
            !(typeof args[0].value === 'number') ||
            !(args[1] instanceof LppConstant) ||
            !(typeof args[0].value === 'number')
          ) {
            return new LppReturn(new LppConstant(NaN))
          }
          return new LppReturn(
            new LppConstant(globalThis.Math.atan2(args[0].value, args[1].value))
          )
        })
      ],
      [
        'random',
        LppFunction.native(() => {
          return new LppReturn(new LppConstant(globalThis.Math.random()))
        })
      ]
    ])
  )
}
