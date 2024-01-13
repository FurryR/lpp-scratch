/**
 * Warning! lpp does not support sandboxed mode. Please load it as unsandboxed extension.
 * 注意！lpp 不支持隔离模式，请将其作为非隔离插件加载。
 * 注意！lpp はサンドボックスモードをサポートされていません。非サンドボックス拡張機能でロードしてください。
 * ちゅうい！lpp はサンドボックスモードをサポートされていません。ひサンドボックスかくちょうきのうでロードしてください。
 */
/**
 * Copyright (c) 2023 凌.
 * This program is licensed under the MIT license.
 */
/**
 * Staff:
 * Nights from CCW
 * FurryR belongs to VeroFess (https://github.com/VeroFess) from GitHub (https://github.com/FurryR)
 * Simon Shiki from GitHub (https://github.com/SimonShiki)
 * CST1229 from GitHub (https://github.com/CST1229)
 */

import { ScratchContext } from './impl/typing/extension'
import type VM from 'scratch-vm'
import { locale } from './impl/l10n'
import { global } from './core/builtin'
import { LppCompatibleBlockly, defineBlocks } from './impl/blockly/definition'
import {
  LppReturn,
  LppException,
  LppFunctionContext,
  LppContext,
  LppReturnOrException
} from './core/context'
import { LppTraceback } from './impl/context'
import { ensureValue } from './core/helper'
import {
  LppError,
  LppValue,
  LppChildValue,
  LppConstant,
  LppArray,
  LppObject,
  LppFunction,
  LppPromise
} from './core/type'
import type {
  RuntimeEventMap,
  RuntimeAndVirtualMachineEventMap
} from 'scratch-vm'
import { warnError, warnException } from './impl/traceback'

declare let Scratch: ScratchContext
interface LppCompatibleRuntime extends VM.Runtime {
  lpp?: {
    LppValue: typeof LppValue
    LppChildValue: typeof LppChildValue
    LppConstant: typeof LppConstant
    LppArray: typeof LppArray
    LppObject: typeof LppObject
    LppFunction: typeof LppFunction
    LppPromise: typeof LppPromise
    LppReturn: typeof LppReturn
    LppException: typeof LppException
    version: string
    global: typeof global
  }
  compilerOptions?: {
    enabled: boolean
  }
  _events: Record<
    keyof RuntimeEventMap,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
}
interface LppCompatibleThread extends VM.Thread {
  lpp?: LppContext
  isCompiled?: boolean
  tryCompile?(): void
}
interface LppCompatibleVM extends VM {
  _events: Record<
    keyof RuntimeAndVirtualMachineEventMap,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
}
interface LppCompatibleBlocks extends VM.Blocks {
  getNextBlock(id: string): string | null
  _cache: {
    _executeCached: Record<
      string,
      { _ops: { _argValues: object; id: string }[] }
    >
  }
}
interface TargetConstructor {
  new ({ blocks }: { blocks: VM.Blocks }): VM.Target
}
interface ThreadConstructor {
  new (id: string): VM.Thread
  STATUS_DONE: number
  STATUS_RUNNING: number
}
interface SequencerConstructor {
  new (runtime: VM.Runtime): VM.Sequencer
}
;(function (Scratch: ScratchContext) {
  const color = '#808080'
  const lppVersion = 'Development (for Turbowarp / Cocrea users)'
  // Translations.

  if (Scratch.extensions.unsandboxed === false) {
    throw new Error('lpp must be loaded in unsandboxed mode.')
  }
  // hijack Function.prototype.apply to get React element instance.
  function hijack(fn: () => unknown): unknown {
    const _orig = Function.prototype.apply
    /**
     * Hijack the Function.prototype.apply function.
     * @param thisArg
     * @returns thisArg.
     */
    Function.prototype.apply = function (thisArg: unknown): unknown {
      return thisArg
    }
    const result = fn()
    Function.prototype.apply = _orig
    return result
  }
  /**
   * The extension class.
   */
  class LppExtension {
    /**
     *  Scratch runtime.
     */
    runtime: LppCompatibleRuntime
    /**
     * Virtual machine instance.
     */
    vm: LppCompatibleVM
    /**
     * ScratchBlocks instance.
     */
    Blockly?: LppCompatibleBlockly
    /**
     * Whether the extension is initalized.
     */
    initalized: boolean
    /**
     * Whether the extension is running on early Scratch versions.
     */
    isEarlyScratch: boolean
    /**
     * Shared isMutatorClick state.
     */
    mutatorClick: boolean
    /**
     * Constructs a new instance of lpp.
     * @param runtime Scratch runtime.
     */
    constructor(runtime: VM.Runtime) {
      this.initalized = false
      this.runtime = runtime as LppCompatibleRuntime
      this.Blockly = undefined
      this.mutatorClick = false
      Scratch.translate.setup(locale)
      // step 1: get virtual machine instance
      let virtualMachine: LppCompatibleVM | undefined
      if (this.runtime._events['QUESTION'] instanceof Array) {
        for (const value of this.runtime._events['QUESTION']) {
          const v = hijack(value) as
            | {
                props?: {
                  vm?: VM
                }
              }
            | undefined
          if (v?.props?.vm) {
            virtualMachine = v?.props?.vm as LppCompatibleVM | undefined
            break
          }
        }
      } else if (this.runtime._events['QUESTION']) {
        virtualMachine = (
          hijack(this.runtime._events['QUESTION']) as
            | {
                props?: {
                  vm?: VM
                }
              }
            | undefined
        )?.props?.vm as LppCompatibleVM | undefined
      }
      if (!virtualMachine)
        throw new Error('lpp cannot get Virtual Machine instance.')
      this.vm = virtualMachine
      // step 2: get ScratchBlocks instance
      if (this.vm._events['EXTENSION_ADDED'] instanceof Array) {
        for (const value of this.vm._events['EXTENSION_ADDED']) {
          const v = hijack(value) as
            | {
                ScratchBlocks?: LppCompatibleBlockly
              }
            | undefined
          if (v?.ScratchBlocks) {
            this.Blockly = v?.ScratchBlocks
            break
          }
        }
      } else if (this.vm._events['EXTENSION_ADDED']) {
        this.Blockly = (
          hijack(this.vm._events['EXTENSION_ADDED']) as
            | {
                ScratchBlocks?: LppCompatibleBlockly
              }
            | undefined
        )?.ScratchBlocks
      }
      // Ignore SAY and QUESTION calls on dummy target.
      const _emit = this.runtime.emit
      this.runtime.emit = (event: string, ...args: unknown[]): void => {
        const blacklist = ['SAY', 'QUESTION']
        if (
          blacklist.includes(event) &&
          args.length >= 1 &&
          typeof args[0] === 'object' &&
          args[0] !== null &&
          Reflect.get(args[0], 'id') === ''
        ) {
          this.handleError(new LppError('useAfterDispose'))
        }
        return (
          _emit as (this: VM.Runtime, event: string, ...args: unknown[]) => void
        ).call(this.runtime, event, ...args)
      }
      const _stepThread =
        this.runtime.sequencer.constructor.prototype.stepThread
      // Patch for early Scratch 3 versions (before commit 39b18fe by @mzgoddard, Apr 12, 2019).
      if (!('activeThread' in this.runtime.sequencer)) {
        this.isEarlyScratch = true
        ;(
          this.runtime.sequencer as VM.Sequencer
        ).constructor.prototype.stepThread = function (thread: VM.Thread) {
          _stepThread.call(this, (this.activeThread = thread))
        }
      } else this.isEarlyScratch = false
      // Export
      this.runtime.lpp = {
        LppValue,
        LppChildValue,
        LppConstant,
        LppArray,
        LppObject,
        LppFunction,
        LppReturn,
        LppException,
        LppPromise,
        version: lppVersion,
        global
      }
      console.groupCollapsed('💫 lpp', lppVersion)
      console.log('🌟', this.formatMessage('lpp.about.summary'))
      console.log(
        '🤖',
        this.formatMessage('lpp.about.github'),
        '-> https://github.com/FurryR/lpp-scratch'
      )
      console.log(
        '💞',
        this.formatMessage('lpp.about.afdian'),
        '-> https://afdian.net/a/FurryR'
      )
      console.group('👾', this.formatMessage('lpp.about.staff.1'))
      console.log(
        '🐺 @FurryR https://github.com/FurryR - Developer, Test, Translation, Documentation'
      )
      console.log(
        '🤔 @SimonShiki https://github.com/SimonShiki - Test, Technical support'
      )
      console.log('😄 @Nights https://github.com/Nightre - Technical support')
      console.log('🔤 @CST1229 https://github.com/CST1229 - Technical support')
      console.log(
        '🐺 @VeroFess https://github.com/VeroFess - Technical support'
      )
      console.log('🥰', this.formatMessage('lpp.about.staff.2'))
      console.groupEnd()
      console.groupEnd()
    }

    /**
     * Multi-language formatting support.
     * @param id key of the translation.
     * @returns Formatted string.
     */
    formatMessage(id: string): string {
      return Scratch.translate({
        id,
        default: id,
        description: id
      })
    }
    /**
     * Get extension info.
     * @returns Extension info.
     */
    getInfo(): unknown {
      // Sometimes getInfo() is called multiple times due to engine defects.
      if (!this.initalized) {
        this.initalized = true
        if (this.Blockly) {
          defineBlocks(
            this.Blockly,
            color,
            this,
            this.vm,
            this.formatMessage.bind(this)
          )
        }
      }
      return {
        id: 'lpp',
        name: this.formatMessage('lpp.name'),
        color1: color,
        blocks: [
          {
            blockType: 'label',
            text: `#️⃣ ${this.formatMessage('lpp.category.builtin')}`
          },
          {
            opcode: 'builtinType',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'builtinError',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'builtinUtility',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            blockType: 'label',
            text: `🚧 ${this.formatMessage('lpp.category.construct')}`
          },
          {
            opcode: 'constructLiteral',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'constructNumber',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                defaultValue: '10'
              }
            }
          },
          {
            opcode: 'constructString',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                defaultValue: '🌟'
              }
            }
          },
          {
            opcode: 'constructArray',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'constructObject',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'constructFunction',
            blockType: 'reporter',
            text: ''
          },
          {
            blockType: 'label',
            text: `🔢 ${this.formatMessage('lpp.category.operator')}`
          },
          {
            opcode: 'binaryOp',
            blockType: 'reporter',
            text: '[lhs][op][rhs]',
            arguments: {
              lhs: { type: 'string' },
              op: {
                type: 'string',
                menu: 'dummy'
              },
              rhs: { type: 'string' }
            }
          },
          {
            opcode: 'unaryOp',
            blockType: 'reporter',
            text: '[op][value]',
            arguments: {
              op: {
                type: 'string',
                menu: 'dummy'
              },
              value: { type: 'any' }
            }
          },
          {
            opcode: 'call',
            blockType: 'reporter',
            text: '[fn]',
            arguments: {
              fn: { type: 'any' }
            }
          },
          {
            opcode: 'new',
            blockType: 'reporter',
            text: '[fn]',
            arguments: {
              fn: { type: 'any' }
            }
          },
          {
            opcode: 'self',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'var',
            blockType: 'reporter',
            text: '[name]',
            arguments: {
              name: {
                type: 'string',
                defaultValue: '🐺'
              }
            }
          },
          {
            blockType: 'label',
            text: `🤖 ${this.formatMessage('lpp.category.statement')}`
          },
          {
            opcode: 'return',
            isTerminal: true,
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          },
          {
            opcode: 'throw',
            isTerminal: true,
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          },
          {
            opcode: 'scope',
            blockType: 'command',
            text: ''
          },
          {
            opcode: 'try',
            blockType: 'command',
            text: '[var]',
            arguments: {
              var: { type: 'any' }
            }
          },
          {
            opcode: 'nop',
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          }
        ],
        menus: {
          dummy: {
            acceptReporters: false,
            items: []
          }
        }
      }
    }
    /**
     * Builtin types.
     * @param param0 Function name.
     * @returns Class.
     */
    builtinType({ value }: { value: string }): LppValue {
      const instance = global.get(value)
      if (instance) return instance
      throw new Error('lpp: Not implemented')
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @returns Class.
     */
    builtinError(args: { value: string }): LppValue {
      return this.builtinType(args)
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @returns Class.
     */
    builtinUtility(args: { value: string }): LppValue {
      return this.builtinType(args)
    }
    /**
     * Get literal value.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Constant value.
     */
    constructLiteral(
      { value }: { value: unknown },
      util: VM.BlockUtility
    ): LppConstant | void {
      if (this.shouldExit(util)) {
        try {
          return util.thread.stopThisScript()
        } catch (_) {
          return
        }
      }
      switch (value) {
        case 'null':
          return LppConstant.init(null)
        case 'true':
          return LppConstant.init(true)
        case 'false':
          return LppConstant.init(false)
        case 'NaN':
          return LppConstant.init(NaN)
        case 'Infinity':
          return LppConstant.init(Infinity)
      }
      throw new Error('lpp: Unknown literal')
    }
    /**
     * Make binary calculations.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Result.
     */
    binaryOp(
      { lhs, op, rhs }: { lhs: unknown; op: string | number; rhs: unknown },
      util: VM.BlockUtility
    ): LppValue | LppChildValue | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        if (op === '.') {
          if (lhs instanceof LppValue || lhs instanceof LppChildValue) {
            if (typeof rhs === 'string' || typeof rhs === 'number') {
              return lhs.get(`${rhs}`)
            } else if (
              rhs instanceof LppValue ||
              rhs instanceof LppChildValue
            ) {
              const n = ensureValue(rhs)
              if (n instanceof LppConstant && n.value !== null) {
                return lhs.get(n.toString())
              }
            }
            throw new LppError('invalidIndex')
          }
          throw new LppError('syntaxError')
        } else if (
          (lhs instanceof LppValue || lhs instanceof LppChildValue) &&
          (rhs instanceof LppValue || rhs instanceof LppChildValue)
        ) {
          switch (op) {
            case '=':
            case '+':
            case '*':
            case '==':
            case '!=':
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '&&':
            case '||':
            case '-':
            case '/':
            case '%':
            case '<<':
            case '>>':
            case '>>>':
            case '&':
            case '|':
            case '^':
            case 'instanceof': {
              return lhs.calc(op, ensureValue(rhs))
            }
            case 'in': {
              const left = ensureValue(lhs)
              const right = ensureValue(rhs)
              if (!(left instanceof LppConstant && left.value !== null))
                throw new LppError('invalidIndex')
              return LppConstant.init(right.has(left.toString()))
            }
            default:
              throw new Error('lpp: unknown operand')
          }
        } else {
          throw new LppError('syntaxError')
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Do unary calculations.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Result.
     */
    unaryOp(
      { op, value }: { op: string; value: unknown },
      util: VM.BlockUtility
    ): Promise<LppValue | undefined> | LppValue | void {
      /**
       * ['+', '+'],
         ['-', '-'],
         ['!', '!'],
         ['~', '~'],
         ['delete', 'delete'],
         ['await', 'await'],
         ['yield', 'yield'],
         ['yield*', 'yield*']
       */
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        if (!(value instanceof LppValue || value instanceof LppChildValue))
          throw new LppError('syntaxError')
        switch (op) {
          case '+':
          case '-':
          case '!':
          case '~':
          case 'delete': {
            return value.calc(op)
          }
          // case 'await': {
          //   const v = ensureValue(value)
          //   const then = v.get('then')
          //   const error = v.get('catch')
          //   const thread = util.thread
          //   /** @type {LppFunction} */
          //   let thenFn
          //   /** @type {LppFunction?} */
          //   let catchFn
          //   /** @type {LppValue} */
          //   let thenSelf
          //   /** @type {LppValue} */
          //   let catchSelf
          //   if (then instanceof LppChildValue) {
          //     if (!(then.value instanceof LppFunction)) return v
          //     thenFn = then.value
          //     thenSelf = then.parent.deref() ?? LppConstant.init(null)
          //   } else {
          //     if (!(then instanceof LppFunction)) return v
          //     thenFn = then
          //     thenSelf = LppConstant.init(null)
          //   }
          //   if (error instanceof LppChildValue) {
          //     if (error.value instanceof LppFunction) {
          //     catchFn = error.value
          //     catchSelf = error.parent.deref() ?? LppConstant.init(null)
          //     }
          //   } else {
          //     if (error instanceof LppFunction) {
          //       catchFn = error
          //       catchSelf = LppConstant.init(null)
          //     }
          //   }
          //   function registerThenCallback() {

          //   }
          //   /** @type {((val: LppValue) => void)?} */
          //   let resolveFn = null
          //   /** @type {LppValue?} */
          //   let syncResult = null
          //   fn.apply(self, [new LppFunction()])
          // }
          default:
            throw new Error('lpp: unknown operand')
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Call function with arguments.
     * @param args The function and arguments.
     * @param util Scratch util.
     * @returns Function result.
     */
    call(
      args: { fn: unknown; mutation: { length: string } } & Record<
        string,
        unknown
      >,
      util: VM.BlockUtility
    ): Promise<void | LppValue> | LppValue | void {
      try {
        const thread = util.thread
        const { fn } = args
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const len = parseInt(
          this.getMutation(args, util.thread)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (value instanceof LppValue || value instanceof LppChildValue)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppChildValue))
          throw new LppError('syntaxError')
        const func = ensureValue(fn)
        if (func instanceof LppFunction) {
          const res = func.apply(
            fn instanceof LppChildValue
              ? fn.parent.deref() ?? LppConstant.init(null)
              : LppConstant.init(null),
            actualArgs
          )
          if (res instanceof Promise) {
            return res.then((result) => {
              return this.processApplyValue(result, thread)
            })
          } else {
            return this.processApplyValue(res, thread)
          }
        } else throw new LppError('notCallable')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Generate a new object by function with arguments.
     * @param args The function and arguments.
     * @param util Scratch util.
     * @returns Result.
     */
    new(
      args: { fn: unknown; mutation: { length: string } } & Record<
        string,
        unknown
      >,
      util: VM.BlockUtility
    ): Promise<void | LppValue> | LppValue | void {
      try {
        const thread = util.thread
        let { fn } = args
        // runtime hack by @FurryR.
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const len = parseInt(
          this.getMutation(args, util.thread)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (value instanceof LppValue || value instanceof LppChildValue)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppChildValue))
          throw new LppError('syntaxError')
        fn = ensureValue(fn)
        if (!(fn instanceof LppFunction)) throw new LppError('notCallable')
        const res = fn.construct(actualArgs)
        if (res instanceof Promise) {
          return res.then((result) => {
            return this.processApplyValue(result, thread)
          })
        } else {
          return this.processApplyValue(res, thread)
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return self object.
     * @param _args unnecessary argument.
     * @param util Scratch util.
     * @returns Result.
     */
    self(_args: unknown, util: VM.BlockUtility): LppValue | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const thread = util.thread as LppCompatibleThread
        if (thread.lpp) {
          const unwind = thread.lpp.unwind()
          if (unwind) return unwind.self
        }
        throw new LppError('useOutsideFunction')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct a Number.
     * @param param0 Arguments.
     * @returns Result object.
     */
    constructNumber({
      value
    }: {
      value: string | number
    }): LppConstant<number> {
      return LppConstant.init(Number(value))
    }
    /**
     * Construct a String.
     * @param param0 Arguments.
     * @returns Result object.
     */
    constructString({
      value
    }: {
      value: string | number
    }): LppConstant<string> {
      return LppConstant.init(`${value}`)
    }
    /**
     * Construct an Array.
     * @param args ID for finding where the array is.
     * @param util Scratch util.
     * @returns An array.
     */
    constructArray(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): LppArray | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const arr = new LppArray()
        const len = parseInt(
          this.getMutation(args, util.thread)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (!(value instanceof LppValue || value instanceof LppChildValue))
            throw new LppError('syntaxError')
          arr.value.push(ensureValue(value))
        }
        return arr
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct an Object.
     * @param args ID for finding where the object is.
     * @param util Scratch util.
     * @returns An object.
     */
    constructObject(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): LppObject | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const obj = new LppObject()
        const len = parseInt(
          this.getMutation(args, util.thread)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          let key = args[`KEY_${i}`]
          const value = args[`VALUE_${i}`]
          if (typeof key === 'string' || typeof key === 'number') {
            key = `${key}`
          } else if (key instanceof LppConstant) {
            key = key.toString()
          } else if (
            key instanceof LppChildValue &&
            key.value instanceof LppConstant
          ) {
            key = key.value.toString()
          } else throw new LppError('invalidIndex')
          if (!(value instanceof LppValue || value instanceof LppChildValue))
            throw new LppError('syntaxError')
          obj.set(key as string, ensureValue(value))
        }
        return obj
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct a Function.
     * @param args ID for finding where the function is.
     * @param util Scratch util.
     * @returns A function object.
     */
    constructFunction(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): LppFunction | void {
      try {
        const { Thread, Target, Sequencer } = this.prepareConstructor(util)
        // runtime hack by @FurryR.
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, util.thread)
        const signature: string[] = []
        const len = parseInt(
          (block?.mutation as Record<string, string> | null)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          if (typeof args[`ARG_${i}`] !== 'object')
            signature[i] = `${args[`ARG_${i}`]}`
          else throw new LppError('syntaxError')
        }
        let context: LppContext | undefined
        const blocks = util.thread.blockContainer
        const targetId = util.target.id
        const thread = util.thread as LppCompatibleThread
        if (thread.lpp) {
          context = thread.lpp
        }
        return new LppFunction((self, args) => {
          let resolveFn: ((v: LppReturnOrException) => void) | undefined
          let syncResult: LppReturnOrException | undefined
          let target = this.runtime.getTargetById(targetId)
          if (target === undefined) {
            // Use a dummy target instead of the original disposed target
            target = new Target({
              blocks
            })
            target.id = ''
            target.runtime = this.runtime
            const warnFn = (): never => {
              this.handleError(new LppError('useAfterDispose'))
            }
            // Patch some functions to disable user's ability to access the dummy's sprite, which is not exist.
            for (const key of Reflect.ownKeys(target.constructor.prototype)) {
              if (typeof key === 'string' && key.startsWith('set')) {
                Reflect.set(target, key, warnFn)
              }
            }
            // Also, clones.
            target.makeClone = warnFn
          }
          if (!block.inputs.SUBSTACK)
            return new LppReturn(LppConstant.init(null))
          const id = block.inputs.SUBSTACK.block
          const thread = this.createThread(
            Thread,
            id,
            target
          ) as LppCompatibleThread
          thread.lpp = new LppFunctionContext(
            context,
            self ?? LppConstant.init(null),
            (val) => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            },
            (val) => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            }
          )
          for (const [key, value] of signature.entries()) {
            if (key < args.length) thread.lpp.closure.set(value, args[key])
            else thread.lpp.closure.set(value, LppConstant.init(null))
          }
          // TODO: no reserved variable names!
          // builtin.Array.apply(null, args).then(value => {
          //   thread.lpp.closure.set('arguments', value)
          // })
          // Call callback (if exists) when the thread is finished.
          this.bindThread(thread, () => {
            ;(thread as LppCompatibleThread)?.lpp?.returnCallback(
              new LppReturn(LppConstant.init(null))
            )
          })
          const seq = new Sequencer(this.runtime)
          seq.stepThread(thread)
          return (
            syncResult ??
            new Promise<LppReturnOrException>((resolve) => {
              resolveFn = resolve
            })
          )
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Get value of specified function variable.
     * @param args Variable name.
     * @param util Scratch util.
     * @returns The value of the variable. If it is not exist, returns null instead.
     */
    var(args: { name: string }, util: VM.BlockUtility): LppChildValue | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const thread = util.thread as LppCompatibleThread
        if (thread.lpp) {
          return thread.lpp.get(args.name)
        }
        throw new LppError('useOutsideContext')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return a value from the function.
     * @param param0 Return value.
     * @param util Scratch util.
     */
    return({ value }: { value: unknown }, util: VM.BlockUtility) {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        if (!(value instanceof LppValue || value instanceof LppChildValue))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const thread = util.thread as LppCompatibleThread
        if (thread.lpp) {
          const ctx = thread.lpp.unwind()
          if (ctx instanceof LppFunctionContext)
            ctx.returnCallback(new LppReturn(val))
          return thread.stopThisScript()
        }
        throw new LppError('useOutsideFunction')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Throw a value from the function.
     * @param param0 Exception.
     * @param util Scratch util.
     */
    throw({ value }: { value: unknown }, util: VM.BlockUtility) {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        if (!(value instanceof LppValue || value instanceof LppChildValue))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const result = new LppException(val)
        const thread = util.thread as LppCompatibleThread
        result.pushStack(
          new LppTraceback.Block(thread.peekStack(), thread.lpp ?? undefined)
        )
        if (thread.lpp) {
          thread.lpp.exceptionCallback(result)
          return thread.stopThisScript()
        }
        this.handleException(result)
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Execute in new scope.
     * @param args ID for finding where the branch is.
     * @param util Scratch util.
     * @returns Wait for the branch to finish.
     */
    scope(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): Promise<void> | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const { Thread, Sequencer } = this.prepareConstructor(util)
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, util.thread)
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const thread = util.thread as LppCompatibleThread
        const target = util.target
        const thread1 = this.createThread(
          Thread,
          id,
          target
        ) as LppCompatibleThread
        let resolveFn: (() => void) | undefined
        let resolved = false
        thread1.lpp = new LppContext(
          thread.lpp ?? undefined,
          (value) => {
            if (thread.lpp) {
              thread.lpp.returnCallback(value)
              return thread1.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          (value) => {
            value.pushStack(
              new LppTraceback.Block(
                thread.peekStack(),
                thread.lpp ?? undefined
              )
            )
            if (thread.lpp) {
              // interrupt the thread.
              thread.lpp.exceptionCallback(value)
              return thread.stopThisScript()
            }
            this.handleException(value)
          }
        )
        this.bindThread(thread1, () => {
          if (resolveFn) resolveFn()
          else resolved = true
        })
        const seq = new Sequencer(this.runtime)
        seq.stepThread(thread1)
        if (resolved) return
        return new Promise<void>((resolve) => {
          resolveFn = resolve
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Catch exceptions.
     * @param args ID for finding where the branch is.
     * @param util Scratch util.
     * @returns Wait for the function to finish.
     */
    try(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): Promise<void> | void {
      try {
        if (this.shouldExit(util)) {
          try {
            return util.thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const { Thread, Sequencer } = this.prepareConstructor(util)
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, util.thread)
        const dest = args.var
        if (!(dest instanceof LppChildValue)) throw new LppError('syntaxError')
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const captureId = block.inputs.SUBSTACK_2?.block
        const thread = util.thread as LppCompatibleThread
        const target = util.target
        const thread1 = this.createThread(
          Thread,
          id,
          target
        ) as LppCompatibleThread
        let triggered = false
        let resolveFn: (() => void) | undefined
        let resolved = false
        thread1.lpp = new LppContext(
          thread.lpp ?? undefined,
          (value) => {
            if (thread.lpp) {
              thread.lpp.returnCallback(value)
              return thread1.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          (value) => {
            triggered = true
            if (!captureId) {
              if (resolveFn) resolveFn()
              else resolved = true
              return
            }
            const GlobalError = global.get('Error')
            if (!(GlobalError instanceof LppFunction))
              throw new Error('lpp: Not implemented')
            const error = value.value
            if (error.instanceof(GlobalError)) {
              const traceback = new LppArray(
                value.stack.map((v) => LppConstant.init(v.toString()))
              )
              error.set('stack', traceback)
            }
            dest.assign(error)
            const thread2 = this.createThread(
              Thread,
              captureId,
              target
            ) as LppCompatibleThread
            thread2.lpp = new LppContext(
              thread.lpp ?? undefined,
              (value) => {
                if (thread.lpp) {
                  thread.lpp.returnCallback(value)
                  return thread1.stopThisScript()
                } else throw new LppError('useOutsideFunction')
              },
              (value) => {
                value.pushStack(
                  new LppTraceback.Block(
                    thread.peekStack(),
                    thread.lpp ?? undefined
                  )
                )
                if (thread.lpp) {
                  // interrupt the thread.
                  thread.lpp.exceptionCallback(value)
                  return thread.stopThisScript()
                }
                this.handleException(value)
              }
            )
            this.bindThread(thread2, () => {
              if (resolveFn) resolveFn()
              else resolved = true
            })
            const seq = new Sequencer(this.runtime)
            seq.stepThread(thread2)
          }
        )
        this.bindThread(thread1, () => {
          if (!triggered) {
            if (resolveFn) resolveFn()
            else resolved = true
          }
        })
        const seq = new Sequencer(this.runtime)
        seq.stepThread(thread1)
        if (resolved) return
        return new Promise((resolve) => {
          resolveFn = resolve
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Drops the value of specified expression.
     * @param _ Unneccessary argument.
     * @param util Scratch util.
     */
    nop(_: unknown, util: VM.BlockUtility) {
      if (this.shouldExit(util)) {
        try {
          return util.thread.stopThisScript()
        } catch (_) {
          return
        }
      }
    }

    /**
     * Handle syntax error.
     * @param e Error object.
     */
    handleError(e: unknown): never {
      if (e instanceof LppError) {
        const thread = this.runtime.sequencer.activeThread
        if (thread) {
          const stack = thread.peekStack()
          if (stack) {
            warnError(this.Blockly, this.formatMessage.bind(this), e.id, stack)
            this.runtime.stopAll()
          }
        }
      }
      throw e
    }
    /**
     * Handle unhandled exceptions.
     * @param e LppException object.
     */
    handleException(e: LppException): never {
      warnException(
        this.Blockly,
        this.runtime,
        this.formatMessage.bind(this),
        e
      )
      this.runtime.stopAll()
      throw new Error('lpp: Uncaught Lpp exception')
    }
    /**
     * Create a new thread (without compiling).
     * @param id Top block id.
     * @param target Thread target.
     * @returns Thread instance.
     */
    createThread(
      threadConstructor: ThreadConstructor,
      id: string,
      target: VM.Target
    ): VM.Thread {
      const thread = new threadConstructor(id)
      thread.target = target
      thread.blockContainer = target.blocks
      thread.pushStack(id)
      this.runtime.threads.push(thread)
      // this.runtime.threadMap?.set(thread.getId(), thread)
      return thread
    }
    /**
     * Bind fn to thread. Fn will be called when the thread exits.
     * @param thread Thread object.
     * @param fn Dedicated function.
     */
    bindThread(thread: LppCompatibleThread, fn: () => void) {
      // Call callback (if exists) when the thread is finished.
      let status = thread.status
      let flag = false
      let alreadyCalled = false
      const threadConstructor = thread.constructor as ThreadConstructor
      Reflect.defineProperty(thread, 'status', {
        get: () => {
          return status
        },
        set: (newStatus) => {
          status = newStatus
          if (status === threadConstructor.STATUS_DONE) {
            if (!alreadyCalled) {
              alreadyCalled = true
              fn()
            }
          } else if (status === threadConstructor.STATUS_RUNNING && !flag) {
            // Lazy compilation in order to step thread immediately.
            if (
              thread.peekStack() &&
              !thread.isCompiled &&
              this.runtime.compilerOptions?.enabled
            ) {
              const container = thread.blockContainer as LppCompatibleBlocks
              const nextBlock = container.getNextBlock(thread.topBlock)
              if (nextBlock) {
                thread.topBlock = nextBlock
                if (thread.tryCompile) thread.tryCompile()
              }
            }
            flag = true
          }
        }
      })
      if (this.isEarlyScratch) {
        /**
         * Patched pushStack().
         * @param blockId
         */
        thread.pushStack = (blockId) => {
          if (blockId === null && !alreadyCalled) {
            alreadyCalled = true
            fn()
          }
          return threadConstructor.prototype.pushStack.call(thread, blockId)
        }
      }
    }
    /**
     * Process return value.
     * @param result Result value.
     * @param thread Caller thread.
     * @returns processed value.
     */
    processApplyValue(
      result: LppReturnOrException,
      thread: LppCompatibleThread
    ): LppValue | void {
      if (result instanceof LppReturn) {
        return result.value
      } else {
        result.pushStack(
          new LppTraceback.Block(thread.peekStack(), thread.lpp ?? undefined)
        )
        if (thread.lpp) {
          // interrupt the thread.
          thread.lpp.exceptionCallback(result)
          return thread.stopThisScript()
        }
        this.handleException(result)
      }
    }
    /**
     * Prepare constructors for injection.
     * @param util Scratch util.
     * @returns Constructors.
     */
    prepareConstructor(util: VM.BlockUtility): {
      Target: TargetConstructor
      Thread: ThreadConstructor
      Sequencer: SequencerConstructor
    } {
      return {
        Target: util.target.constructor as TargetConstructor,
        Thread: util.thread.constructor as ThreadConstructor,
        Sequencer: util.runtime.sequencer.constructor as SequencerConstructor
      }
    }
    /**
     * Detect if the block should exit directly.
     * @param util Scratch util.
     * @returns Whether the block is triggered by clicking on the mutator icon.
     */
    shouldExit(util: VM.BlockUtility): boolean {
      const { Thread } = this.prepareConstructor(util)
      if (this.mutatorClick) {
        if (util.thread.stack.length === 1) this.mutatorClick = false
        if (util.thread.stackClick) return true
      }
      if (util.thread.status === Thread.STATUS_DONE) return true
      return false
    }
    /**
     * Get active block instance of specified thread.
     * @warning Avoid where possible. Only use it if you need to get substack.
     * @param args Block arguments.
     * @param thread Thread.
     * @returns Block instance.
     */
    getActiveBlockInstance(
      args: object,
      thread: LppCompatibleThread
    ): VM.Block {
      const container = thread.blockContainer as LppCompatibleBlocks
      let id = container._cache._executeCached[thread.peekStack()]?._ops?.find(
        (v) => args === v._argValues
      )?.id
      if (!id && thread.isCompiled) {
        // patch: In TurboWarp, we can simply use thread.peekStack() to get the lambda's ID.
        id = thread.peekStack()
      }
      const block = id
        ? thread.blockContainer.getBlock(id)
        : this.runtime.flyoutBlocks.getBlock(thread.peekStack())
      if (!block) {
        throw new Error('lpp: Cannot get active block')
      }
      return block
    }
    /**
     * Get mutation of dedicated block.
     * @param args Block arguments.
     * @param thread Thread.
     * @returns mutation object.
     */
    getMutation(
      args: Record<string, unknown>,
      thread: LppCompatibleThread
    ): null | Record<string, string> {
      return (
        (args.mutation as undefined | null | Record<string, string>) ??
        (this.getActiveBlockInstance(args, thread).mutation as null | Record<
          string,
          string
        >)
      )
    }
  }
  if (Scratch.vm) {
    Scratch.extensions.register(new LppExtension(Scratch.vm?.runtime))
  } else {
    // Compatible with CCW
    Reflect.set(window, 'tempExt', {
      Extension: LppExtension,
      info: {
        name: 'lpp.name',
        description: 'lpp.desc',
        extensionId: 'lpp',
        featured: true,
        disabled: false,
        collaborator: 'FurryR'
      },
      // CCW doesn't support languages like ja-jp, so we do not need to add other translations.
      l10n: {
        'zh-cn': {
          'lpp.name': 'lpp',
          'lpp.desc': '🛠️ (实验性) 向 Scratch 引入 OOP。'
        },
        en: {
          'lpp.name': 'lpp',
          'lpp.desc': '🛠️ (Experimental) Introduces OOP to Scratch.'
        }
      }
    })
  }
})(Scratch)
