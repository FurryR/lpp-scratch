/**
 * Copyright (c) 2023 凌.
 * This program is licensed under the MIT license.
 */

import {
  BlocksConstructor,
  LppCompatibleBlocks,
  LppCompatibleRuntime,
  LppCompatibleThread,
  LppCompatibleVM,
  ScratchContext,
  TargetConstructor,
  ThreadConstructor
} from './impl/typing'
import type VM from 'scratch-vm'
import { locale } from './impl/l10n'
import {
  global,
  ensureValue,
  LppError,
  LppValue,
  LppReference,
  LppConstant,
  LppArray,
  LppObject,
  LppFunction,
  LppPromise,
  LppReturn,
  LppException,
  LppFunctionContext,
  LppContext,
  LppReturnOrException,
  Global,
  serializeObject,
  deserializeObject
} from './core'
import { Dialog, Inspector } from './impl/traceback'
import { LppCompatibleBlockly, defineBlocks } from './impl/blockly/definition'
import { LppTraceback } from './impl/context'
import { warnError, warnException } from './impl/traceback'
import {
  SerializationInfo,
  Validator,
  attachMetadata,
  deserializeBlock,
  hasMetadata,
  serializeBlock
} from './impl/serialization'
import { Wrapper } from './impl/wrapper'
import { attachType } from './impl/metadata'

declare let Scratch: ScratchContext
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
          args[0] instanceof Object &&
          Reflect.get(args[0], 'id') === ''
        ) {
          this.handleError(new LppError('useAfterDispose'))
          this.runtime.stopAll()
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
      // Patch Function.
      Global.Function.set(
        'serialize',
        LppFunction.native((self, args) => {
          const fn = args[0]
          if (
            self !== Global.Function ||
            !fn ||
            !(fn instanceof LppFunction) ||
            !hasMetadata(fn) ||
            fn.isTypehint
          ) {
            const res = Global.IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: IllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          return new LppReturn(
            LppExtension.serializeFunction(
              fn.blocks && fn.block ? fn.blocks.getBlock(fn.block) : undefined,
              fn.blocks,
              fn.signature
            )
          )
        })
      )
      Global.Function.set(
        'deserialize',
        LppFunction.native((self, args) => {
          if (self !== Global.Function) {
            const res = Global.IllegalInvocationError.construct([])
            if (res instanceof globalThis.Promise)
              throw new globalThis.Error(
                'lpp: IllegalInvocationError constructor should be synchronous'
              )
            if (res instanceof LppException) return res
            return new LppException(res.value)
          }
          const val: unknown = deserializeObject(
            args[0] ?? new LppConstant(null)
          )
          if (Validator.isInfo(val)) {
            if (!val.block) {
              const fn = new LppFunction(() => {
                return new LppReturn(new LppConstant(null))
              })
              attachMetadata(fn, undefined, undefined, undefined, val.signature)
              return new LppReturn(fn)
            }
            const Blocks = this.runtime.flyoutBlocks
              .constructor as BlocksConstructor
            const blocks = new Blocks(this.runtime, true)
            deserializeBlock(blocks, val.script)
            const fn = new LppFunction((self, args) => {
              const Target = this.runtime.targets[0]
                .constructor as TargetConstructor
              let resolveFn: ((v: LppReturnOrException) => void) | undefined
              let syncResult: LppReturnOrException | undefined
              const target = this.createDummyTarget(Target, blocks)
              const block = blocks.getBlock(val.block ?? '')
              if (!block?.inputs?.SUBSTACK)
                return new LppReturn(new LppConstant(null))
              const thread = this.runtime._pushThread(
                block.inputs.SUBSTACK.block,
                target
              ) as LppCompatibleThread
              thread.lpp = new LppFunctionContext(
                undefined,
                self ?? new LppConstant(null),
                val => {
                  if (!syncResult) {
                    if (resolveFn) resolveFn(val)
                    else syncResult = val
                  }
                },
                val => {
                  if (!syncResult) {
                    if (resolveFn) resolveFn(val)
                    else syncResult = val
                  }
                }
              )
              for (const [key, value] of val.signature.entries()) {
                if (key < args.length) thread.lpp.closure.set(value, args[key])
                else thread.lpp.closure.set(value, new LppConstant(null))
              }
              // TODO: no reserved variable names!
              // builtin.Array.apply(null, args).then(value => {
              //   thread.lpp.closure.set('arguments', value)
              // })
              // Call callback (if exists) when the thread is finished.
              this.bindThread(thread, () => {
                ;(thread as LppCompatibleThread)?.lpp?.returnCallback(
                  new LppReturn(new LppConstant(null))
                )
              })
              this.stepThread(thread)
              return (
                syncResult ??
                new Promise<LppReturnOrException>(resolve => {
                  resolveFn = resolve
                })
              )
            })
            attachMetadata(fn, undefined, blocks, val.block, val.signature)
            return new LppReturn(fn)
          }
          const res = Global.SyntaxError.construct([
            new LppConstant('Invalid value')
          ])
          if (res instanceof globalThis.Promise)
            throw new globalThis.Error(
              'lpp: SyntaxError constructor should be synchronous'
            )
          if (res instanceof LppException) return res
          return new LppException(res.value)
        })
      )
      attachType()
      // Export
      this.runtime.lpp = {
        LppValue,
        LppReference,
        LppConstant,
        LppArray,
        LppObject,
        LppFunction,
        LppReturn,
        LppException,
        LppPromise,
        Wrapper,
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
    getInfo() {
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
    builtinType(
      args: { value: string },
      { thread }: VM.BlockUtility
    ): Wrapper<LppValue> {
      const instance = global.get(args.value)
      const block = this.getActiveBlockInstance(args, thread)
      if (instance) {
        this.visualReport(block.id, thread, instance)
        return new Wrapper(instance)
      }
      throw new Error('lpp: Not implemented')
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @returns Class.
     */
    builtinError(
      args: { value: string },
      utils: VM.BlockUtility
    ): Wrapper<LppValue> {
      return this.builtinType(args, utils)
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @returns Class.
     */
    builtinUtility(
      args: { value: string },
      utils: VM.BlockUtility
    ): Wrapper<LppValue> {
      return this.builtinType(args, utils)
    }
    /**
     * Get literal value.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Constant value.
     */
    constructLiteral(
      args: { value: unknown },
      { thread }: VM.BlockUtility
    ): Wrapper<LppConstant> | void {
      if (this.shouldExit(thread)) {
        try {
          return thread.stopThisScript()
        } catch (_) {
          return
        }
      }
      const block = this.getActiveBlockInstance(args, thread)
      const res = (() => {
        switch (args.value) {
          case 'null':
            return new LppConstant(null)
          case 'true':
            return new LppConstant(true)
          case 'false':
            return new LppConstant(false)
          case 'NaN':
            return new LppConstant(NaN)
          case 'Infinity':
            return new LppConstant(Infinity)
        }
        throw new Error('lpp: Unknown literal')
      })()
      this.visualReport(block.id, thread, res)
      return new Wrapper(res)
    }
    /**
     * Make binary calculations.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Result.
     */
    binaryOp(
      args: { lhs: unknown; op: string | number; rhs: unknown },
      { thread }: VM.BlockUtility
    ): Wrapper<LppValue> | Wrapper<LppReference> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const lhs = Wrapper.unwrap(args.lhs)
        const rhs = Wrapper.unwrap(args.rhs)
        const block = this.getActiveBlockInstance(args, thread)
        const res = (() => {
          if (args.op === '.') {
            if (lhs instanceof LppValue || lhs instanceof LppReference) {
              if (typeof rhs === 'string' || typeof rhs === 'number') {
                return lhs.get(`${rhs}`)
              } else if (
                rhs instanceof LppValue ||
                rhs instanceof LppReference
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
            (lhs instanceof LppValue || lhs instanceof LppReference) &&
            (rhs instanceof LppValue || rhs instanceof LppReference)
          ) {
            switch (args.op) {
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
                return lhs.calc(args.op, ensureValue(rhs))
              }
              case 'in': {
                const left = ensureValue(lhs)
                const right = ensureValue(rhs)
                if (!(left instanceof LppConstant && left.value !== null))
                  throw new LppError('invalidIndex')
                return new LppConstant(right.has(left.toString()))
              }
              default:
                throw new Error('lpp: unknown operand')
            }
          }
          throw new LppError('syntaxError')
        })()
        this.visualReport(block.id, thread, ensureValue(res))
        return new Wrapper(res)
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
      args: { op: string; value: unknown },
      { thread }: VM.BlockUtility
    ):
      | Promise<Wrapper<LppValue> | void>
      | Wrapper<LppValue>
      | Wrapper<LppReference>
      | void {
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
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const value = Wrapper.unwrap(args.value)
        const block = this.getActiveBlockInstance(args, thread)
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const res = (() => {
          switch (args.op) {
            case '+':
            case '-':
            case '!':
            case '~':
            case 'delete': {
              return value.calc(args.op)
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
            //   if (then instanceof LppReference) {
            //     if (!(then.value instanceof LppFunction)) return v
            //     thenFn = then.value
            //     thenSelf = then.parent.deref() ?? new LppConstant(null)
            //   } else {
            //     if (!(then instanceof LppFunction)) return v
            //     thenFn = then
            //     thenSelf = new LppConstant(null)
            //   }
            //   if (error instanceof LppReference) {
            //     if (error.value instanceof LppFunction) {
            //     catchFn = error.value
            //     catchSelf = error.parent.deref() ?? new LppConstant(null)
            //     }
            //   } else {
            //     if (error instanceof LppFunction) {
            //       catchFn = error
            //       catchSelf = new LppConstant(null)
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
        })()
        this.visualReport(block.id, thread, res)
        return new Wrapper(res)
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
      { thread }: VM.BlockUtility
    ): Promise<void | Wrapper<LppValue>> | Wrapper<LppValue> | void {
      try {
        let { fn } = args
        fn = Wrapper.unwrap(fn)
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (value instanceof LppValue || value instanceof LppReference)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppReference))
          throw new LppError('syntaxError')
        const func = ensureValue(fn)
        if (func instanceof LppFunction) {
          const res = func.apply(
            fn instanceof LppReference
              ? fn.parent.deref() ?? new LppConstant(null)
              : new LppConstant(null),
            actualArgs
          )
          if (res instanceof Promise) {
            return res.then(result => {
              const v = this.processApplyValue(result, thread)
              if (v) {
                this.visualReport(block.id, thread, v)
                return new Wrapper(v)
              }
              return
            })
          } else {
            const v = this.processApplyValue(res, thread)
            if (v) {
              this.visualReport(block.id, thread, v)
              return new Wrapper(v)
            }
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
      { thread }: VM.BlockUtility
    ): Promise<void | Wrapper<LppValue>> | Wrapper<LppValue> | void {
      try {
        let { fn } = args
        fn = Wrapper.unwrap(fn)
        // runtime hack by @FurryR.
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (value instanceof LppValue || value instanceof LppReference)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppReference))
          throw new LppError('syntaxError')
        fn = ensureValue(fn)
        if (!(fn instanceof LppFunction)) throw new LppError('notCallable')
        const res = fn.construct(actualArgs)
        if (res instanceof Promise) {
          return res.then(result => {
            const v = this.processApplyValue(result, thread)
            if (v) {
              this.visualReport(block.id, thread, v)
              return new Wrapper(v)
            }
            return
          })
        } else {
          const v = this.processApplyValue(res, thread)
          if (v) {
            this.visualReport(block.id, thread, v)
            return new Wrapper(v)
          }
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return self object.
     * @param args Unnecessary argument.
     * @param util Scratch util.
     * @returns Result.
     */
    self(args: object, { thread }: VM.BlockUtility): Wrapper<LppValue> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, thread)
        const lppThread = thread as LppCompatibleThread
        if (lppThread.lpp) {
          const unwind = lppThread.lpp.unwind()
          if (unwind) {
            this.visualReport(block.id, thread, unwind.self)
            return new Wrapper(unwind.self)
          }
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
    constructNumber(
      args: {
        value: string | number
      },
      { thread }: VM.BlockUtility
    ): Wrapper<LppConstant<number>> {
      const obj = new LppConstant(Number(args.value))
      const block = this.getActiveBlockInstance(args, thread)
      this.visualReport(block.id, thread, obj)
      return new Wrapper(obj)
    }
    /**
     * Construct a String.
     * @param param0 Arguments.
     * @returns Result object.
     */
    constructString(
      args: {
        value: string | number
      },
      { thread }: VM.BlockUtility
    ): Wrapper<LppConstant<string>> {
      const obj = new LppConstant(String(args.value))
      const block = this.getActiveBlockInstance(args, thread)
      this.visualReport(block.id, thread, obj)
      return new Wrapper(obj)
    }
    /**
     * Construct an Array.
     * @param args ID for finding where the array is.
     * @param util Scratch util.
     * @returns An array.
     */
    constructArray(
      args: Record<string, unknown>,
      { thread }: VM.BlockUtility
    ): Wrapper<LppArray> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const arr = new LppArray()
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (!(value instanceof LppValue || value instanceof LppReference))
            throw new LppError('syntaxError')
          arr.value.push(ensureValue(value))
        }
        this.visualReport(block.id, thread, arr)
        return new Wrapper(arr)
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
      { thread }: VM.BlockUtility
    ): Wrapper<LppObject> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const obj = new LppObject()
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          let key = Wrapper.unwrap(args[`KEY_${i}`])
          const value = Wrapper.unwrap(args[`VALUE_${i}`])
          if (typeof key === 'string' || typeof key === 'number') {
            key = `${key}`
          } else if (key instanceof LppConstant) {
            key = key.toString()
          } else if (
            key instanceof LppReference &&
            key.value instanceof LppConstant
          ) {
            key = key.value.toString()
          } else throw new LppError('invalidIndex')
          if (!(value instanceof LppValue || value instanceof LppReference))
            throw new LppError('syntaxError')
          obj.set(key as string, ensureValue(value))
        }
        this.visualReport(block.id, thread, obj)
        return new Wrapper(obj)
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
      { thread, target }: VM.BlockUtility
    ): Wrapper<LppFunction> | void {
      try {
        const Target = target.constructor as TargetConstructor
        // runtime hack by @FurryR.
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, thread)
        const signature: string[] = []
        const len = parseInt(
          (block?.mutation as Record<string, string> | null)?.length ?? '0',
          10
        )
        for (let i = 0; i < len; i++) {
          if (typeof args[`ARG_${i}`] !== 'object')
            signature[i] = String(args[`ARG_${i}`])
          else throw new LppError('syntaxError')
        }
        let context: LppContext | undefined
        const blocks = thread.target.blocks
        const targetId = target.id
        const lppThread = thread as LppCompatibleThread
        if (lppThread.lpp) {
          context = lppThread.lpp
        }
        const fn = new LppFunction((self, args) => {
          let resolveFn: ((v: LppReturnOrException) => void) | undefined
          let syncResult: LppReturnOrException | undefined
          const target =
            this.runtime.getTargetById(targetId) ??
            this.createDummyTarget(Target, blocks)
          if (!block.inputs.SUBSTACK)
            return new LppReturn(new LppConstant(null))
          const id = block.inputs.SUBSTACK.block
          const thread = this.runtime._pushThread(
            id,
            target
          ) as LppCompatibleThread
          thread.lpp = new LppFunctionContext(
            context,
            self ?? new LppConstant(null),
            val => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            },
            val => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            }
          )
          for (const [key, value] of signature.entries()) {
            if (key < args.length) thread.lpp.closure.set(value, args[key])
            else thread.lpp.closure.set(value, new LppConstant(null))
          }
          // TODO: no reserved variable names!
          // builtin.Array.apply(null, args).then(value => {
          //   thread.lpp.closure.set('arguments', value)
          // })
          // Call callback (if exists) when the thread is finished.
          this.bindThread(thread, () => {
            ;(thread as LppCompatibleThread)?.lpp?.returnCallback(
              new LppReturn(new LppConstant(null))
            )
          })
          this.stepThread(thread)
          return (
            syncResult ??
            new Promise<LppReturnOrException>(resolve => {
              resolveFn = resolve
            })
          )
        })
        attachMetadata(
          fn,
          target.sprite.clones[0].id,
          blocks,
          block.id,
          signature
        )
        this.visualReport(block.id, thread, fn)
        return new Wrapper(fn)
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
    var(
      args: { name: string },
      { thread }: VM.BlockUtility
    ): Wrapper<LppReference> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        const block = this.getActiveBlockInstance(args, thread)
        const lppThread = thread as LppCompatibleThread
        if (lppThread.lpp) {
          const v = lppThread.lpp.get(args.name)
          this.visualReport(block.id, thread, v.value)
          return new Wrapper(v)
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
    return({ value }: { value: unknown }, { thread }: VM.BlockUtility) {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        value = Wrapper.unwrap(value)
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const lppThread = thread as LppCompatibleThread
        if (lppThread.lpp) {
          const ctx = lppThread.lpp.unwind()
          if (ctx instanceof LppFunctionContext) {
            ctx.returnCallback(new LppReturn(val))
            return thread.stopThisScript()
          }
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
    throw({ value }: { value: unknown }, { thread }: VM.BlockUtility) {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        value = Wrapper.unwrap(value)
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const result = new LppException(val)
        const lppThread = thread as LppCompatibleThread
        result.pushStack(
          new LppTraceback.Block(
            thread.target.sprite.clones[0].id,
            thread.peekStack(),
            lppThread.lpp ?? undefined
          )
        )
        if (lppThread.lpp) {
          lppThread.lpp.exceptionCallback(result)
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
      { thread, target }: VM.BlockUtility
    ): Promise<void> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const parentThread = thread as LppCompatibleThread
        const scopeThread = this.runtime._pushThread(
          id,
          target
        ) as LppCompatibleThread
        let resolveFn: (() => void) | undefined
        let resolved = false
        scopeThread.lpp = new LppContext(
          parentThread.lpp ?? undefined,
          value => {
            if (parentThread.lpp) {
              parentThread.lpp.returnCallback(value)
              return scopeThread.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          value => {
            if (parentThread.lpp) {
              // interrupt the thread.
              parentThread.lpp.exceptionCallback(value)
              return thread.stopThisScript()
            }
            this.handleException(value)
          }
        )
        this.bindThread(scopeThread, () => {
          if (resolveFn) resolveFn()
          else resolved = true
        })
        this.stepThread(scopeThread)
        if (resolved) return
        return new Promise<void>(resolve => {
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
      { thread, target }: VM.BlockUtility
    ): Promise<void> | void {
      try {
        if (this.shouldExit(thread)) {
          try {
            return thread.stopThisScript()
          } catch (_) {
            return
          }
        }
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const dest = Wrapper.unwrap(args.var)
        if (!(dest instanceof LppReference)) throw new LppError('syntaxError')
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const captureId = block.inputs.SUBSTACK_2?.block
        const parentThread = thread as LppCompatibleThread
        const tryThread = this.runtime._pushThread(
          id,
          target
        ) as LppCompatibleThread
        let triggered = false
        let resolveFn: (() => void) | undefined
        let resolved = false
        tryThread.lpp = new LppContext(
          parentThread.lpp ?? undefined,
          value => {
            if (parentThread.lpp) {
              parentThread.lpp.returnCallback(value)
              return tryThread.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          value => {
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
                value.stack.map(v => new LppConstant(v.toString()))
              )
              error.set('stack', traceback)
            }
            dest.assign(error)
            const catchThread = this.runtime._pushThread(
              captureId,
              target
            ) as LppCompatibleThread
            catchThread.lpp = new LppContext(
              parentThread.lpp ?? undefined,
              value => {
                if (parentThread.lpp) {
                  parentThread.lpp.returnCallback(value)
                  return thread.stopThisScript()
                } else throw new LppError('useOutsideFunction')
              },
              value => {
                if (parentThread.lpp) {
                  // interrupt the thread.
                  parentThread.lpp.exceptionCallback(value)
                  return thread.stopThisScript()
                }
                this.handleException(value)
              }
            )
            this.bindThread(catchThread, () => {
              if (resolveFn) resolveFn()
              else resolved = true
            })
            this.stepThread(catchThread)
          }
        )
        this.bindThread(tryThread, () => {
          if (!triggered) {
            if (resolveFn) resolveFn()
            else resolved = true
          }
        })
        this.stepThread(tryThread)
        if (resolved) return
        return new Promise(resolve => {
          resolveFn = resolve
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Drops the value of specified expression.
     * @param args Unneccessary argument.
     * @param util Scratch util.
     */
    nop({ value }: { value: unknown }, { thread }: VM.BlockUtility) {
      if (this.shouldExit(thread)) {
        try {
          return thread.stopThisScript()
        } catch (_) {
          return
        }
      }
      if (
        this.Blockly &&
        thread.stackClick &&
        thread.atStackTop() &&
        !thread.target.blocks.getBlock(thread.peekStack())?.next &&
        value
      ) {
        const value2 = Wrapper.unwrap(value)
        if (value2 instanceof LppValue || value2 instanceof LppReference) {
          this.visualReport(thread.peekStack(), thread, ensureValue(value2))
        } else {
          const workspace = this.Blockly.getMainWorkspace() as unknown as {
            reportValue(blockId: string, value: string): void
          }
          workspace.reportValue(thread.peekStack(), String(value))
        }
      }
    }

    /**
     * Handle syntax error.
     * @param e Error object.
     */
    private handleError(e: unknown): void {
      if (e instanceof LppError) {
        const thread = this.runtime.sequencer.activeThread
        if (thread) {
          const stack = thread.peekStack()
          if (stack) {
            warnError(
              this.Blockly,
              this.vm,
              this.formatMessage.bind(this),
              e.id,
              stack,
              thread.target.sprite.clones[0].id
            )
            this.runtime.stopAll()
          }
        }
      } else throw e
    }
    /**
     * Handle unhandled exceptions.
     * @param e LppException object.
     */
    private handleException(e: LppException): void {
      warnException(this.Blockly, this.vm, this.formatMessage.bind(this), e)
      this.runtime.stopAll()
    }
    /**
     * Bind fn to thread. Fn will be called when the thread exits.
     * @param thread Thread object.
     * @param fn Dedicated function.
     */
    private bindThread(thread: LppCompatibleThread, fn: () => void) {
      // Call callback (if exists) when the thread is finished.
      let status = thread.status
      let alreadyCalled = false
      const threadConstructor = thread.constructor as ThreadConstructor
      Reflect.defineProperty(thread, 'status', {
        get: () => {
          return status
        },
        set: newStatus => {
          status = newStatus
          if (status === threadConstructor.STATUS_DONE) {
            if (!alreadyCalled) {
              alreadyCalled = true
              fn()
            }
          }
        }
      })
      if (this.isEarlyScratch) {
        /**
         * Patched pushStack().
         * @param blockId
         */
        thread.pushStack = blockId => {
          if (!blockId && !alreadyCalled) {
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
    private processApplyValue(
      result: LppReturnOrException,
      thread: LppCompatibleThread
    ): LppValue | void {
      if (result instanceof LppReturn) {
        return result.value
      } else {
        result.pushStack(
          new LppTraceback.Block(
            thread.target.sprite.clones[0].id,
            thread.peekStack(),
            thread.lpp ?? undefined
          )
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
     * Detect if the block should exit directly.
     * @param thread Current thread.
     * @returns Whether the block is triggered by clicking on the mutator icon.
     */
    private shouldExit(thread: VM.Thread): boolean {
      if (this.mutatorClick) {
        if (thread.stack.length === 1) this.mutatorClick = false
        if (thread.stackClick) return true
      }
      return false
    }
    /**
     * Get active block instance of specified thread.
     * @param args Block arguments.
     * @param thread Thread.
     * @returns Block instance.
     */
    private getActiveBlockInstance(
      args: object,
      thread: LppCompatibleThread
    ): VM.Block {
      const container = thread.target.blocks as LppCompatibleBlocks
      const id = thread.isCompiled
        ? thread.peekStack()
        : container._cache._executeCached[thread.peekStack()]?._ops?.find(
            v => args === v._argValues
          )?.id
      const block = id
        ? thread.target.blocks.getBlock(id) ??
          this.runtime.flyoutBlocks.getBlock(id)
        : undefined
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
    private getMutation(block: VM.Block): null | Record<string, string> {
      return block.mutation as null | Record<string, string>
    }
    /**
     * Create a dummy target.
     * @param Target Target constructor.
     * @param blocks Block container.
     * @returns Dummy target.
     */
    private createDummyTarget(
      Target: TargetConstructor,
      blocks: VM.Blocks
    ): VM.Target {
      // Use a dummy target instead of the original disposed target
      const target = new Target({
        blocks
      })
      target.id = ''
      target.runtime = this.runtime
      const warnFn = (): void => {
        this.handleError(new LppError('useAfterDispose'))
        this.runtime.stopAll()
      }
      // Patch some functions to disable user's ability to access the dummy's sprite, which is not exist.
      for (const key of Reflect.ownKeys(target.constructor.prototype)) {
        if (typeof key === 'string' && key.startsWith('set')) {
          Reflect.set(target, key, warnFn)
        }
      }
      // Also, clones.
      Reflect.set(target, 'makeClone', warnFn)
      return target
    }
    /**
     * Method for compiler to fix globalState.
     * @param seq Sequencer.
     * @param thread Thread instance.
     */
    private stepThread(thread: LppCompatibleThread) {
      const callerThread = this.runtime.sequencer
        .activeThread as LppCompatibleThread
      this.runtime.sequencer.stepThread(thread)
      if (
        thread.isCompiled &&
        callerThread &&
        callerThread.isCompiled &&
        callerThread.generator
      ) {
        const orig = callerThread.generator
        callerThread.generator = {
          next: () => {}
        }
        this.runtime.sequencer.stepThread(callerThread) // restore globalState.
        callerThread.generator = orig
      }
    }
    /**
     * Serialize function.
     * @param block Function block instance.
     * @param blocks Blocks instance.
     * @param signature Function signature.
     * @returns LppFunction result.
     */
    private static serializeFunction(
      block: VM.Block | undefined,
      blocks: VM.Blocks | undefined,
      signature: string[]
    ): LppValue {
      if (!block || !blocks)
        return serializeObject({
          signature,
          script: {},
          block: null
        })
      const info: SerializationInfo = {
        signature,
        script: serializeBlock(blocks as LppCompatibleBlocks, block),
        block: block.id
      }
      return serializeObject(info)
    }
    private visualReport(blockId: string, thread: VM.Thread, obj: LppValue) {
      if (
        this.Blockly &&
        thread.stackClick &&
        thread.atStackTop() &&
        thread.peekStack() === blockId
      ) {
        const _originalVisualReport = this.runtime.visualReport
        this.runtime.visualReport = function (blockId, value) {
          return blockId === blockId
            ? void (this.visualReport = _originalVisualReport)
            : _originalVisualReport.call(this, blockId, value)
        }
        Dialog.show(
          this.Blockly as LppCompatibleBlockly,
          blockId,
          [
            Inspector(this.Blockly, this.vm, this.formatMessage.bind(this), obj)
          ],
          obj instanceof LppConstant ? 'center' : 'left'
        )
      }
    }
  }
  if (Scratch.vm?.runtime) {
    Scratch.extensions.register(new LppExtension(Scratch.vm.runtime))
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
