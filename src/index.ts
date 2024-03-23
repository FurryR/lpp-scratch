/**
 * Copyright (c) 2024 凌.
 * This program is licensed under the LGPL-3.0 license.
 */

import {
  BlocksConstructor,
  Blocks,
  LppCompatibleRuntime,
  Thread,
  VM,
  ScratchContext,
  TargetConstructor
} from './impl/typing'
import icon from './impl/asset/icon'
import type * as ScratchBlocks from 'blockly/core'
import {
  asValue,
  LppError,
  LppValue,
  LppReference,
  LppConstant,
  LppArray,
  LppObject,
  LppFunction,
  LppReturn,
  LppException,
  LppFunctionContext,
  LppContext,
  LppResult,
  Global,
  ffi,
  LppHandle,
  isPromise,
  async,
  raise
} from './core'
import { version, developers } from '../package.json'
import * as Core from './core'
import locale from './impl/l10n'
import { Dialog, Inspector, warnError, warnException } from './impl/traceback'
import { BlocklyInstance, Extension } from './impl/blockly'
import { defineExtension } from './impl/block'
import { LppTraceback } from './impl/context'
import * as Metadata from './impl/metadata'
import * as Serialization from './impl/serialization'
import { Wrapper } from './impl/wrapper'
import { attachType } from './impl/typehint'
import { ImmediatePromise, PromiseProxy } from './impl/promise'
import { ThreadController } from './impl/thread'
import { LppBoundArg } from './impl/boundarg'

declare let Scratch: ScratchContext
;(function (Scratch: ScratchContext) {
  const color = '#808080'
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
     * Virtual machine instance.
     */
    readonly vm: VM
    /**
     * ScratchBlocks instance.
     */
    readonly Blockly?: BlocklyInstance
    /**
     * Blockly extension.
     */
    readonly extension: Extension
    /**
     * Scratch util.
     */
    util?: VM.BlockUtility
    /**
     * Construct a new instance of lpp.
     * @param originalRuntime Scratch runtime.
     */
    constructor(originalRuntime: VM.Runtime) {
      const runtime = originalRuntime as LppCompatibleRuntime
      this.Blockly = undefined
      Scratch.translate.setup(locale)
      // step 1: get virtual machine instance
      let virtualMachine: VM | undefined
      if (runtime._events['QUESTION'] instanceof Array) {
        for (const value of runtime._events['QUESTION']) {
          const v = hijack(value) as
            | {
                props?: {
                  vm?: VM
                }
              }
            | undefined
          if (v?.props?.vm) {
            virtualMachine = v?.props?.vm as VM | undefined
            break
          }
        }
      } else if (runtime._events['QUESTION']) {
        virtualMachine = (
          hijack(runtime._events['QUESTION']) as
            | {
                props?: {
                  vm?: VM
                }
              }
            | undefined
        )?.props?.vm as VM | undefined
      }
      if (!virtualMachine)
        throw new Error('lpp cannot get Virtual Machine instance.')
      this.vm = virtualMachine
      this.extension = defineExtension(
        color,
        this.vm.runtime,
        this.formatMessage.bind(this)
      )
      // step 2: get ScratchBlocks instance
      if (this.vm._events['EXTENSION_ADDED'] instanceof Array) {
        for (const value of this.vm._events['EXTENSION_ADDED']) {
          const v = hijack(value) as
            | {
                ScratchBlocks?: BlocklyInstance
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
                ScratchBlocks?: BlocklyInstance
              }
            | undefined
        )?.ScratchBlocks
      }
      if (this.Blockly) {
        const Blockly = this.Blockly
        const Events = Blockly.Events as unknown as {
          Change: BlocklyInstance['Events']['Abstract']
          Create: BlocklyInstance['Events']['Abstract']
          Move: BlocklyInstance['Events']['Abstract']
        }
        // Patch: redo bug -- force re-render the block after change
        const _Change = Events.Change.prototype.run
        Events.Change.prototype.run = function (_forward: boolean) {
          _Change.call(this, _forward)
          const self = this as unknown as {
            blockId: string
          }
          const block = this.getEventWorkspace_().getBlockById(
            self.blockId
          ) as ScratchBlocks.BlockSvg | null
          if (block instanceof Blockly.BlockSvg) {
            block.initSvg()
            block.render()
          }
        }
        // Patch: undo bug -- silent fail if block is not exist
        const _Move = Events.Move.prototype.run
        Events.Move.prototype.run = function (_forward: boolean) {
          // pre-check before run
          const self = this as unknown as {
            blockId: string
          }
          const block = this.getEventWorkspace_().getBlockById(
            self.blockId
          ) as ScratchBlocks.BlockSvg | null
          if (block) _Move.call(this, _forward)
        }
        const _Create = Events.Create.prototype.run
        Events.Create.prototype.run = function (_forward: boolean) {
          // patch before run
          const self = this as unknown as {
            ids: string[]
          }
          const res: string[] = []
          const workspace = this.getEventWorkspace_()
          for (const id of self.ids) {
            if (workspace.getBlockById(id)) res.push(id)
          }
          self.ids = res
          _Create.call(this, _forward)
        }
      }
      // Ignore SAY and QUESTION calls on dummy target.
      const _emit = runtime.emit
      runtime.emit = (event: string, ...args: unknown[]) => {
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
        ).call(runtime, event, ...args)
      }
      // Patch visualReport.
      const _visualReport = runtime.visualReport
      runtime.visualReport = (blockId: string, value: unknown) => {
        const unwrappedValue = Wrapper.unwrap(value)
        if (
          (unwrappedValue instanceof LppValue ||
            unwrappedValue instanceof LppReference ||
            unwrappedValue instanceof LppBoundArg) &&
          this.Blockly
        ) {
          const actualValue =
            unwrappedValue instanceof LppBoundArg
              ? unwrappedValue
              : asValue(unwrappedValue)
          Dialog.show(
            this.Blockly as BlocklyInstance,
            blockId,
            [
              Inspector(
                this.Blockly,
                this.vm,
                this.formatMessage.bind(this),
                actualValue
              )
            ],
            actualValue instanceof LppConstant ? 'center' : 'left'
          )
        } else {
          return _visualReport.call(runtime, blockId, value)
        }
      }
      const _requestUpdateMonitor = runtime.requestUpdateMonitor
      if (_requestUpdateMonitor) {
        const patchMonitorValue = (element: HTMLElement, value: unknown) => {
          const valueElement = element.querySelector('[class*="value"]')
          if (valueElement instanceof HTMLElement) {
            const internalInstance = Object.values(valueElement).find(
              v =>
                typeof v === 'object' &&
                v !== null &&
                Reflect.has(v, 'stateNode')
            )
            if (value instanceof LppValue) {
              const inspector = Inspector(
                this.Blockly,
                this.vm,
                this.formatMessage.bind(this),
                value
              )
              valueElement.style.textAlign = 'left'
              valueElement.style.backgroundColor = 'rgb(30, 30, 30)'
              valueElement.style.color = '#eeeeee'
              while (valueElement.firstChild)
                valueElement.removeChild(valueElement.firstChild)
              valueElement.append(inspector)
            } else {
              if (internalInstance) {
                valueElement.style.textAlign = ''
                valueElement.style.backgroundColor =
                  internalInstance.memoizedProps?.style?.background ?? ''
                valueElement.style.color =
                  internalInstance.memoizedProps?.style?.color ?? ''
                while (valueElement.firstChild)
                  valueElement.removeChild(valueElement.firstChild)
                valueElement.append(String(value))
              }
            }
          }
        }
        const getMonitorById = (id: string): HTMLElement | null => {
          const elements = document.querySelectorAll(
            `[class*="monitor_monitor-container"]`
          )
          for (const element of Object.values(elements)) {
            const internalInstance = Object.values(element).find(
              v =>
                typeof v === 'object' &&
                v !== null &&
                Reflect.has(v, 'children')
            )
            if (internalInstance) {
              const props = internalInstance?.children?.props
              if (id === props?.id) return element as HTMLElement
            }
          }
          return null
        }
        const monitorMap: Map<
          string,
          {
            value?: LppValue | LppBoundArg
            mode: string
          }
        > = new Map()
        runtime.requestUpdateMonitor = state => {
          const id = state.get('id')
          if (typeof id === 'string') {
            const monitorValue = state.get('value')
            const monitorMode = state.get('mode')
            const monitorVisible = state.get('visible')
            const cache = monitorMap.get(id)
            if (typeof monitorMode === 'string' && cache) {
              // Update the monitor when the mode changes.
              // Since value update is followed by monitorMode, we just set value to `undefined`.
              cache.mode = monitorMode
              cache.value = undefined
            } else if (monitorValue !== undefined) {
              // Update the monitor when the value changes.
              const unwrappedValue = Wrapper.unwrap(monitorValue)
              if (
                unwrappedValue instanceof LppValue ||
                unwrappedValue instanceof LppReference ||
                unwrappedValue instanceof LppBoundArg
              ) {
                const actualValue =
                  unwrappedValue instanceof LppBoundArg
                    ? unwrappedValue
                    : asValue(unwrappedValue)
                if (!cache || cache.value !== actualValue) {
                  requestAnimationFrame(() => {
                    const monitor = getMonitorById(id)
                    if (monitor) {
                      patchMonitorValue(monitor, actualValue)
                    }
                  })
                  if (!cache) {
                    monitorMap.set(id, {
                      value: actualValue,
                      mode: (() => {
                        if (runtime.getMonitorState) {
                          const monitorCached = runtime
                            .getMonitorState()
                            .get(id) as Map<string, unknown> | undefined
                          if (monitorCached) {
                            const mode = monitorCached.get('mode')
                            return typeof mode === 'string' ? mode : 'normal'
                          }
                        }
                        return 'normal'
                      })()
                    })
                  } else cache.value = actualValue
                }
                return true
              } else {
                // Remove cachedValue from database.
                if (monitorMap.has(id)) {
                  const monitor = getMonitorById(id)
                  if (monitor) {
                    patchMonitorValue(monitor, monitorValue)
                  }
                  monitorMap.delete(id)
                }
              }
            } else if (monitorVisible !== undefined) {
              if (!monitorVisible) monitorMap.delete(id)
            }
          }
          return _requestUpdateMonitor.call(runtime, state)
        }
      }
      // Patch Function.
      Global.Function.set(
        'serialize',
        LppFunction.native(({ args }) => {
          const fn = args[0]
          if (
            !fn ||
            !(fn instanceof LppFunction) ||
            !Metadata.hasMetadata(fn) ||
            !(fn.metadata instanceof Serialization.ScratchMetadata)
          ) {
            return async(function* () {
              return raise(
                yield (Global.IllegalInvocationError as LppFunction).construct(
                  []
                )
              )
            })
          }
          const v = fn.metadata.blocks[0]?.getBlock(fn.metadata.blocks[1])
          if (!v) throw new Error('lpp: serialize blockId invalid')
          return new LppReturn(
            LppExtension.serializeFunction(
              v,
              fn.metadata.blocks[0],
              fn.metadata.signature
            )
          )
        })
      )
      Global.Function.set(
        'deserialize',
        LppFunction.native(({ args }) => {
          const val: unknown = ffi.toObject(args[0] ?? new LppConstant(null))
          if (Serialization.Validator.isInfo(val)) {
            const Blocks = runtime.flyoutBlocks.constructor as BlocksConstructor
            const blocks = new Blocks(runtime, true)
            Serialization.deserializeBlock(blocks, val.script)
            const Target = runtime.getTargetForStage()
              ?.constructor as TargetConstructor
            if (!Target) throw new Error('lpp: project is disposed')
            return new LppReturn(
              Metadata.attach(
                new LppFunction(this.executeScratch.bind(this, Target)),
                new Serialization.ScratchMetadata(
                  val.signature,
                  [blocks, val.block],
                  undefined,
                  undefined,
                  undefined
                )
              )
            )
          }
          return async(function* () {
            return raise(
              yield (Global.SyntaxError as LppFunction).construct([
                new LppConstant('Invalid value')
              ])
            )
          })
        })
      )
      attachType()
      // Export
      runtime.lpp = {
        Core,
        Metadata: Metadata,
        Wrapper,
        version
      }
      console.groupCollapsed('💫 lpp', version)
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
      for (const v of developers) {
        console.log(v)
      }
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
      if (this.Blockly) this.extension.inject(this.Blockly)
      return {
        id: 'lpp',
        name: this.formatMessage('lpp.name'),
        color1: color,
        blocks: this.extension.export(),
        menus: {
          dummy: {
            acceptReporters: false,
            items: []
          }
        }
      }
    }
    /**
     * Opens documentation.
     */
    documentation() {
      window.open(this.formatMessage('lpp.documentation.url'))
    }
    /**
     * Builtin types.
     * @param param0 Function name.
     * @returns Class.
     */
    builtinType(
      args: { value: string },
      util: VM.BlockUtility
    ): Wrapper<LppValue> {
      this.util = util
      const instance = (Global as Record<string, LppValue | undefined>)[
        args.value
      ]
      if (instance) {
        return new Wrapper(instance)
      }
      throw new Error('lpp: not implemented')
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @param util Scratch util.
     * @returns Class.
     */
    builtinError(
      args: { value: string },
      util: VM.BlockUtility
    ): Wrapper<LppValue> {
      return this.builtinType(args, util)
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @param util Scratch util.
     * @returns Class.
     */
    builtinUtility(
      args: { value: string },
      util: VM.BlockUtility
    ): Wrapper<LppValue> {
      return this.builtinType(args, util)
    }
    /**
     * Get literal value.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Constant value.
     */
    constructLiteral(
      args: { value: unknown },
      util: VM.BlockUtility
    ): Wrapper<LppConstant> {
      this.util = util
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
        throw new Error('lpp: unknown literal')
      })()
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
      util: VM.BlockUtility
    ): Wrapper<LppValue> | Wrapper<LppReference> {
      this.util = util
      try {
        const lhs = Wrapper.unwrap(args.lhs)
        const rhs = Wrapper.unwrap(args.rhs)
        const res = (() => {
          if (args.op === '.') {
            if (lhs instanceof LppValue || lhs instanceof LppReference) {
              if (typeof rhs === 'string' || typeof rhs === 'number') {
                return lhs.get(`${rhs}`)
              } else if (
                rhs instanceof LppValue ||
                rhs instanceof LppReference
              ) {
                const n = asValue(rhs)
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
                return lhs.calc(args.op, asValue(rhs))
              }
              case 'in': {
                const left = asValue(lhs)
                const right = asValue(rhs)
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
      util: VM.BlockUtility
    ):
      | PromiseProxy<Wrapper<LppValue>>
      | Wrapper<LppValue | LppReference | LppBoundArg> {
      /**
       * ['+', '+'],
         ['-', '-'],
         ['!', '!'],
         ['~', '~'],
         ['...', '...'],
         ['delete', 'delete'],
         ['await', 'await'],
         ['yield', 'yield'],
         ['yield*', 'yield*']
       */
      this.util = util
      try {
        const value = Wrapper.unwrap(args.value)
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
            case '...': {
              // TODO: Iterable (generator) support
              if (!(value instanceof LppArray)) {
                throw new LppError('syntaxError')
              }
              return new LppBoundArg(value.value)
            }
            // case 'await': {
            //   const v = asValue(value)
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
      util: VM.BlockUtility
    ): PromiseProxy<Wrapper<LppValue>> | Wrapper<LppValue> {
      const { thread } = util
      this.util = util
      try {
        let { fn } = args
        fn = Wrapper.unwrap(fn)
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (value instanceof LppBoundArg)
            actualArgs.push(
              ...value.value.map(val => val ?? new LppConstant(null))
            )
          else if (value instanceof LppValue || value instanceof LppReference)
            actualArgs.push(asValue(value))
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppReference))
          throw new LppError('syntaxError')
        const func = asValue(fn)
        const lppThread = thread as Thread
        if (!(func instanceof LppFunction)) throw new LppError('notCallable')
        return this.asap(
          async(
            function* (this: LppExtension) {
              return new Wrapper(
                this.processApplyValue(
                  yield func.apply(
                    fn instanceof LppReference
                      ? fn.parent.deref() ?? new LppConstant(null)
                      : lppThread.lpp?.unwind()?.self ?? new LppConstant(null),
                    actualArgs
                  ),
                  thread
                )
              )
            }.bind(this)
          ),
          thread
        )
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
    ): PromiseProxy<Wrapper<LppValue>> | Wrapper<LppValue> {
      const { thread } = util
      this.util = util
      try {
        let { fn } = args
        fn = Wrapper.unwrap(fn)
        // runtime hack by @FurryR.
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (value instanceof LppBoundArg)
            actualArgs.push(
              ...value.value.map(val => val ?? new LppConstant(null))
            )
          else if (value instanceof LppValue || value instanceof LppReference)
            actualArgs.push(asValue(value))
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppReference))
          throw new LppError('syntaxError')
        fn = asValue(fn)
        return this.asap(
          async(
            function* (this: LppExtension) {
              if (!(fn instanceof LppFunction))
                throw new LppError('notCallable')
              return new Wrapper(
                this.processApplyValue(yield fn.construct(actualArgs), thread)
              )
            }.bind(this)
          ),
          thread
        )
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return self object.
     * @param _ Unnecessary argument.
     * @param util Scratch util.
     * @returns Result.
     */
    self(_: object, util: VM.BlockUtility): Wrapper<LppValue> {
      try {
        const { thread } = util
        this.util = util
        const lppThread = thread as Thread
        if (lppThread.lpp) {
          const unwind = lppThread.lpp.unwind()
          if (unwind) {
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
      util: VM.BlockUtility
    ): Wrapper<LppConstant<number>> {
      const obj = new LppConstant(Number(args.value))
      this.util = util
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
      util: VM.BlockUtility
    ): Wrapper<LppConstant<string>> {
      const obj = new LppConstant(String(args.value))
      this.util = util
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
      util: VM.BlockUtility
    ): Wrapper<LppArray> {
      try {
        const { thread } = util
        this.util = util
        const arr = new LppArray()
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = Wrapper.unwrap(args[`ARG_${i}`])
          if (value instanceof LppBoundArg) arr.value.push(...value.value)
          else if (value instanceof LppValue || value instanceof LppReference)
            arr.value.push(asValue(value))
          else throw new LppError('syntaxError')
        }
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
      util: VM.BlockUtility
    ): Wrapper<LppObject> {
      try {
        const { thread } = util
        this.util = util
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
          obj.set(key as string, asValue(value))
        }
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
      util: VM.BlockUtility
    ): Wrapper<LppFunction> {
      try {
        const { thread, target } = util
        this.util = util
        const Target = target.constructor as TargetConstructor
        // runtime hack by @FurryR.
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
        const blocks = thread.target.blocks
        const lppThread = thread as Thread
        return new Wrapper(
          Metadata.attach(
            new LppFunction(this.executeScratch.bind(this, Target)),
            new Serialization.ScratchMetadata(
              signature,
              [blocks, block.id],
              target.sprite.clones[0].id,
              target.id,
              lppThread.lpp
            )
          )
        )
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
    var(args: { name: string }, util: VM.BlockUtility): Wrapper<LppReference> {
      try {
        const { thread } = util
        this.util = util
        const lppThread = thread as Thread
        if (lppThread.lpp) {
          const v = lppThread.lpp.get(args.name)
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
    return({ value }: { value: unknown }, util: VM.BlockUtility) {
      try {
        const { thread } = util
        this.util = util
        value = Wrapper.unwrap(value)
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const val = asValue(value)
        const lppThread = thread as Thread
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
    throw({ value }: { value: unknown }, util: VM.BlockUtility) {
      try {
        const { thread } = util
        this.util = util
        value = Wrapper.unwrap(value)
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const val = asValue(value)
        const result = new LppException(val)
        const lppThread = thread as Thread
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
      util: VM.BlockUtility
    ): PromiseProxy<undefined> | undefined {
      const { thread, target } = util
      this.util = util
      try {
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        if (!this.util) throw new Error('lpp: util used initialization')
        const controller = new ThreadController(
          this.vm.runtime as LppCompatibleRuntime,
          this.util
        )
        const parentThread = thread as Thread
        return this.asap(
          ImmediatePromise.sync(
            new ImmediatePromise<undefined>(resolve => {
              const scopeThread = controller.create(id, target)
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
              resolve(controller.wait(scopeThread).then(() => undefined))
            })
          ),
          thread
        )
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
    ): PromiseProxy<undefined> | undefined {
      const { thread, target } = util
      this.util = util
      try {
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const dest = Wrapper.unwrap(args.var)
        if (!(dest instanceof LppReference)) throw new LppError('syntaxError')
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        if (!this.util) throw new Error('lpp: util used before initialization')
        const controller = new ThreadController(
          this.vm.runtime as LppCompatibleRuntime,
          this.util
        )
        const captureId = block.inputs.SUBSTACK_2?.block
        const parentThread = thread as Thread
        const tryThread = controller.create(id, target)
        let triggered = false
        return this.asap(
          ImmediatePromise.sync(
            new ImmediatePromise<undefined>(resolve => {
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
                    resolve(undefined)
                    return
                  }
                  const error = value.value
                  // Optimize: only set stack when the error catched.
                  if (error.instanceof(Global.Error as LppFunction)) {
                    const traceback = new LppArray(
                      value.stack.map(v => new LppConstant(v.toString()))
                    )
                    error.set('stack', traceback)
                  }
                  dest.assign(error)
                  const catchThread = controller.create(captureId, target)
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
                  controller.wait(catchThread).then(() => {
                    resolve(undefined)
                  })
                }
              )
              controller.wait(tryThread).then(() => {
                if (!triggered) {
                  resolve(undefined)
                }
              })
            })
          ),
          thread
        )
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Drops the value of specified expression.
     * @param args Unneccessary argument.
     * @param util Scratch util.
     */
    nop({ value }: { value: unknown }, util: VM.BlockUtility): unknown {
      const { thread } = util
      this.util = util
      if (
        thread.stackClick &&
        thread.atStackTop() &&
        !thread.target.blocks.getBlock(thread.peekStack())?.next &&
        value !== undefined
      ) {
        if ((thread as Thread).isCompiled) {
          this.vm.runtime.visualReport(thread.peekStack(), value)
        } else {
          return value
        }
      }
      return undefined
    }

    /**
     * Handle syntax error.
     * @param e Error object.
     */
    private handleError(e: unknown): never {
      if (e instanceof LppError) {
        const thread = this.util?.thread
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
            this.vm.runtime.stopAll()
          }
        }
      }
      throw e
    }
    /**
     * Handle unhandled exceptions.
     * @param e LppException object.
     */
    private handleException(e: LppException): never {
      warnException(this.Blockly, this.vm, this.formatMessage.bind(this), e)
      this.vm.runtime.stopAll()
      throw new Error('lpp: user exception')
    }
    /**
     * Process return value.
     * @param result Result value.
     * @param thread Caller thread.
     * @returns processed value.
     */
    private processApplyValue(result: LppResult, thread: Thread): LppValue {
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
          return void thread.stopThisScript() as never
        }
        this.handleException(result)
      }
    }
    /**
     * Get active block instance of specified thread.
     * @param args Block arguments.
     * @param thread Thread.
     * @returns Block instance.
     */
    private getActiveBlockInstance(args: object, thread: Thread): VM.Block {
      const container = thread.target.blocks as Blocks
      const id = thread.isCompiled
        ? thread.peekStack()
        : container._cache._executeCached[thread.peekStack()]?._ops?.find(
            v => args === v._argValues
          )?.id
      const block = id
        ? container.getBlock(id) ?? this.vm.runtime.flyoutBlocks.getBlock(id)
        : undefined
      if (!block) {
        throw new Error('lpp: cannot get active block')
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
      const target = new Target(
        {
          blocks,
          name: ''
        },
        this.vm.runtime
      )
      target.id = ''
      const warnFn = () => {
        this.handleError(new LppError('useAfterDispose'))
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
     * Process result as soon as possible.
     * @param res Result.
     * @param thread Caller thread.
     * @returns Processed promise or value.
     */
    private asap<T>(
      res: T | PromiseLike<T>,
      thread: Thread
    ): T | PromiseProxy<T> {
      if (!this.util) throw new Error('lpp: util used before initialization')
      const controller = new ThreadController(
        this.vm.runtime as LppCompatibleRuntime,
        this.util
      )
      const postProcess = () => {
        controller.step(thread)
      }
      return isPromise(res)
        ? new PromiseProxy<T>(res, postProcess, postProcess)
        : res
    }
    private executeScratch(
      Target: TargetConstructor,
      ctx: LppHandle
    ): LppResult | PromiseLike<LppResult> {
      if (
        Metadata.hasMetadata(ctx.fn) &&
        ctx.fn.metadata instanceof Serialization.ScratchMetadata
      ) {
        const metadata = ctx.fn.metadata
        let target: VM.Target | undefined
        if (metadata.target)
          target = this.vm.runtime.getTargetById(metadata.target)
        if (!target) target = this.createDummyTarget(Target, metadata.blocks[0])
        const id = metadata.blocks[0].getBlock(metadata.blocks[1])?.inputs
          .SUBSTACK?.block
        if (!id) return new LppReturn(new LppConstant(null))
        if (!this.util) throw new Error('lpp: util used before initialization')
        const controller = new ThreadController(
          this.vm.runtime as LppCompatibleRuntime,
          this.util
        )
        const thread = controller.create(id, target)
        return ImmediatePromise.sync(
          new ImmediatePromise(resolve => {
            thread.lpp = new LppFunctionContext(
              metadata.closure,
              ctx.self ?? new LppConstant(null),
              val => {
                resolve(val)
              },
              val => {
                resolve(val)
              }
            )
            for (const [key, value] of metadata.signature.entries()) {
              if (key < ctx.args.length)
                thread.lpp.closure.set(value, ctx.args[key])
              else thread.lpp.closure.set(value, new LppConstant(null))
            }
            // TODO: no reserved variable names!
            // builtin.Array.apply(null, args).then(value => {
            //   thread.lpp.closure.set('arguments', value)
            // })
            // Call callback (if exists) when the thread is finished.
            controller.wait(thread).then(() => {
              ;(thread as Thread)?.lpp?.returnCallback(
                new LppReturn(new LppConstant(null))
              )
            })
          })
        )
      }
      return new LppReturn(new LppConstant(null))
    }
    /**
     * Serialize function.
     * @param block Function block instance.
     * @param blocks Blocks instance.
     * @param signature Function signature.
     * @returns LppFunction result.
     */
    private static serializeFunction(
      block: VM.Block,
      blocks: VM.Blocks,
      signature: string[]
    ): LppValue {
      const info: Serialization.SerializationInfo = {
        signature,
        script: Serialization.serializeBlock(blocks as Blocks, block),
        block: block.id
      }
      return ffi.fromObject(info)
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
        iconURL: icon,
        featured: true,
        disabled: false,
        collaboratorList: [
          {
            collaborator: '熊谷 凌',
            collaboratorURL: 'https://github.com/FurryR'
          },
          {
            collaborator: '...',
            collaboratorURL: 'https://github.com/FurryR/lpp-scratch'
          }
        ]
      },
      // CCW doesn't support languages like ja-jp, so we do not need to add other translations.
      l10n: {
        'zh-cn': {
          'lpp.name': 'lpp',
          'lpp.desc': '🛠️ (实验性) 一门基于 Scratch 的高级编程语言。'
        },
        en: {
          'lpp.name': 'lpp',
          'lpp.desc':
            '🛠️ (Experimental) A high-level programming language based on Scratch'
        }
      }
    })
  }
})(Scratch)
