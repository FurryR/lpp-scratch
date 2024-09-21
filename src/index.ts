/**
 * Copyright (c) 2024 凌.
 * This program is licensed under the LGPL-3.0 license.
 */

import {
  BlocksConstructor,
  Blocks,
  LppCompatibleRuntime,
  Thread,
  TargetConstructor,
  type VM
} from './impl/typing'
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
  raise,
  LppAsyncFunctionContext
} from './core'
import { version, developers } from '../package.json'
import * as Core from './core'
// import locale from './impl/l10n'
import { Dialog, Inspector, warnError, warnException } from './impl/traceback'
import { BlocklyInstance, Extension } from './impl/blockly'
import { defineExtension } from './impl/block'
import { LppTraceback } from './impl/context'
import * as Metadata from './impl/metadata'
import * as Serialization from './impl/serialization'
import { attachType } from './impl/typehint'
import { ImmediatePromise, PromiseProxy } from './impl/promise'
import { ThreadController } from './impl/thread'
import { LppBoundArg } from './impl/boundarg'
;(function (Scratch) {
  const color = '#808080'
  const id = 'lpp'
  // Translations.

  if (Scratch.extensions.unsandboxed === false) {
    throw new Error('lpp must be loaded in unsandboxed mode.')
  }

  const vm = Scratch.vm as VM
  const runtime = vm.runtime as LppCompatibleRuntime
  const BlocklyExtension = defineExtension(
    id,
    color,
    runtime,
    Scratch.translate
  )

  let Blockly: BlocklyInstance | undefined = undefined
  Scratch.gui.getBlockly().then(ScratchBlocks => {
    Blockly = ScratchBlocks as unknown as BlocklyInstance
    function patchBlockly(Blockly: BlocklyInstance, extension: Extension) {
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
      extension.inject(Blockly)
    }
    patchBlockly(Blockly, BlocklyExtension)
  })
  /**
   * The extension class.
   */
  class LppExtension implements Scratch.Extension {
    /**
     * Scratch util.
     */
    util?: VM.BlockUtility
    /**
     * Construct a new instance of lpp.
     */
    constructor() {
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
        if (
          (value instanceof LppValue ||
            value instanceof LppReference ||
            value instanceof LppBoundArg) &&
          Blockly
        ) {
          const actualValue =
            value instanceof LppBoundArg ? value : asValue(value)
          Dialog.show(
            Blockly as BlocklyInstance,
            blockId,
            [Inspector(Blockly, vm, Scratch.translate, actualValue)],
            actualValue instanceof LppConstant ? 'center' : 'left'
          )
        } else {
          return _visualReport.call(runtime, blockId, value)
        }
      }
      const _requestUpdateMonitor = runtime.requestUpdateMonitor
      const monitorMap: Map<
        string,
        {
          value?: LppValue
          mode: string
        }
      > = new Map()
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
              const inspector = Inspector(Blockly, vm, Scratch.translate, value)
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
              if (monitorValue instanceof LppValue) {
                if (!cache || cache.value !== monitorValue) {
                  requestAnimationFrame(() => {
                    const monitor = getMonitorById(id)
                    if (monitor) {
                      patchMonitorValue(monitor, monitorValue)
                    }
                  })
                  if (!cache) {
                    monitorMap.set(id, {
                      value: monitorValue,
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
                  } else cache.value = monitorValue
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
      // Extra checks for variables
      const patchVariable = (variable: VM.Variable) => {
        let value: unknown = variable.value
        Object.defineProperty(variable, 'value', {
          get() {
            return value
          },
          set: (v: unknown) => {
            if (v instanceof LppBoundArg) {
              this.handleError(new LppError('syntaxError'))
            } else if (v instanceof LppValue || v instanceof LppReference) {
              value = asValue(v)
            } else {
              value = v
            }
          }
        })
      }
      const proxyVariable = (target: VM.Target) => {
        target.variables = new Proxy(target.variables, {
          set(target, p, variable: VM.Variable) {
            patchVariable(variable)
            return Reflect.set(target, p, variable)
          }
        })
      }
      const patchTarget = (target: VM.Target) => {
        Object.values(target.variables).forEach(variable => {
          patchVariable(variable)
        })
        proxyVariable(target)
      }
      for (const target of runtime.targets) {
        patchTarget(target)
      }
      const _addTarget = runtime.addTarget
      runtime.addTarget = function (target) {
        patchTarget(target)
        return _addTarget.call(this, target)
      }
      // Fix for PenguinMod.
      const _stepThread = runtime.sequencer.stepThread
      runtime.sequencer.stepThread = function (thread) {
        try {
          return _stepThread.call(this, thread)
        } catch (e) {
          if (!(e instanceof LppError)) throw e
        }
      }
      // Patch Function.
      // TODO: These functions are deprecated and will be moved in future versions.
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
            const blockId = val.script[val.block]?.id
            const Target = runtime.getTargetForStage()
              ?.constructor as TargetConstructor
            const idMap: Record<string, Metadata.FunctionType> = {
              constructFunction: 'function',
              constructAsyncFunction: 'asyncFunction',
              // TODO: implement generator
              constructGeneratorFunction: 'generatorFunction',
              constructAsyncGeneratorFunction: 'asyncGeneratorFunction'
            }
            if (!Target) throw new Error('lpp: project is disposed')
            if (blockId in idMap) {
              return new LppReturn(
                Metadata.attach(
                  new LppFunction(
                    (blockId === 'constructAsyncFunction'
                      ? this.executeScratchAsync
                      : this.executeScratch
                    ).bind(this, Target)
                  ),
                  new Serialization.ScratchMetadata(
                    idMap[blockId],
                    val.signature,
                    [blocks, val.block],
                    undefined,
                    undefined,
                    undefined
                  )
                )
              )
            }
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
        version
      }
      console.groupCollapsed('💫 lpp', version)
      console.log(
        '🌟',
        Scratch.translate({
          id: 'lpp.about.summary',
          default:
            'lpp is a high-level programming language developed by @FurryR.',
          description: 'Extension summary.'
        })
      )
      console.log(
        '🤖',
        Scratch.translate({
          id: 'lpp.about.github',
          default: 'GitHub repository',
          description: 'GitHub repository hint.'
        }),
        '-> https://github.com/FurryR/lpp-scratch'
      )
      console.log(
        '💞',
        Scratch.translate({
          id: 'lpp.about.afdian',
          default: 'Sponsor',
          description: 'Sponsor hint.'
        }),
        '-> https://afdian.net/a/FurryR'
      )
      console.group(
        '👾',
        Scratch.translate({
          id: 'lpp.about.staff.1',
          default: 'lpp developers staff',
          description: 'Staff list.'
        })
      )
      for (const v of developers) {
        console.log(v)
      }
      console.log(
        '🥰',
        Scratch.translate({
          id: 'lpp.about.staff.2',
          default: "lpp won't be created without their effort.",
          description: 'Staff list ending.'
        })
      )
      console.groupEnd()
      console.groupEnd()
    }

    /**
     * Get extension info.
     * @returns Extension info.
     */
    getInfo(): Scratch.Info {
      // if (blockly) this.extension.inject(blockly)
      return {
        id,
        name: Scratch.translate({
          id: 'lpp.name',
          default: 'lpp',
          description: 'Extension name.'
        }),
        color1: color,
        blocks: BlocklyExtension.export()
      }
    }
    /**
     * Opens documentation.
     */
    documentation() {
      window.open(
        Scratch.translate({
          id: 'lpp.documentation.url',
          default: 'https://github.com/FurryR/lpp-scratch/blob/main/README.md',
          description: 'Documentation URL.'
        })
      )
    }
    /**
     * Builtin types.
     * @param args Function name.
     * @returns Class.
     */
    builtinType(args: { value: string }, util: VM.BlockUtility): LppValue {
      this.util = util
      const instance = (Global as Record<string, LppValue | undefined>)[
        args.value
      ]
      if (instance) {
        return instance
      }
      throw new Error('lpp: not implemented')
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @param util Scratch util.
     * @returns Class.
     */
    builtinError(args: { value: string }, util: VM.BlockUtility): LppValue {
      return this.builtinType(args, util)
    }
    /**
     * Same as builtinType.
     * @param args Function name.
     * @param util Scratch util.
     * @returns Class.
     */
    builtinUtility(args: { value: string }, util: VM.BlockUtility): LppValue {
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
    ): LppConstant {
      this.util = util
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
    }
    /**
     * Make binary calculations.
     * @param param0 Arguments.
     * @param util Scratch util.
     * @returns Result.
     */
    binaryOp(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): LppValue | LppReference {
      const { thread } = util
      this.util = util
      // Original algorithm from: lpp C++ implementation
      // Ported by: FurryR
      class Operator {
        get priority(): number {
          return (
            new Map<string, number>([
              ['.', 18],
              ['?.', 18],
              ['**', 14],
              ['*', 13],
              ['/', 13],
              ['%', 13],
              ['+', 12],
              ['-', 12],
              ['<<', 11],
              ['>>', 11],
              ['>>>', 11],
              ['<', 10],
              ['<=', 10],
              ['>', 10],
              ['>=', 10],
              ['in', 10],
              ['instanceof', 10],
              ['==', 9],
              ['!=', 9],
              ['&', 8],
              ['^', 7],
              ['|', 6],
              ['&&', 5],
              ['||', 4],
              ['=', 2],
              [',', 1]
            ]).get(this.value) ?? -1
          )
        }
        constructor(public value: string) {}
      }
      function intoRPN(input: (string | Operator | LppValue | LppReference)[]) {
        const stack: Operator[] = []
        const result: (string | Operator | LppValue | LppReference)[] = []
        for (const value of input) {
          if (!(value instanceof Operator)) {
            result.push(value)
          } else {
            let op: Operator | undefined
            while (
              (op = stack[stack.length - 1]) &&
              op.priority >= value.priority
            ) {
              result.push(op)
              stack.pop()
            }
            stack.push(value)
          }
        }
        let op: Operator | undefined
        while ((op = stack.pop())) {
          result.push(op)
        }
        return result
      }
      function evaluate(
        expr: (string | Operator | LppValue | LppReference)[]
      ): LppValue | LppReference | string {
        function evaluateInternal(
          op: string,
          lhs: LppValue | LppReference | string,
          rhs: LppValue | LppReference | string
        ): LppValue | LppReference {
          if (op === '.' || op === '?.') {
            if (lhs instanceof LppValue || lhs instanceof LppReference) {
              if (
                lhs instanceof LppConstant &&
                lhs.value === null &&
                op === '?.'
              )
                return new LppConstant(null)
              if (typeof rhs === 'string' || typeof rhs === 'number') {
                const res = lhs.get(`${rhs}`)
                return op === '?.' ? asValue(res) : res
              } else if (
                rhs instanceof LppValue ||
                rhs instanceof LppReference
              ) {
                const res = lhs.get(String(asValue(rhs)))
                return op === '?.' ? asValue(res) : res
              }
              throw new LppError('invalidIndex')
            }
            throw new LppError('syntaxError')
          } else if (
            (lhs instanceof LppValue || lhs instanceof LppReference) &&
            (rhs instanceof LppValue || rhs instanceof LppReference)
          ) {
            switch (op) {
              case '=':
              case '+':
              case '*':
              case '**':
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
                return lhs.calc(op, asValue(rhs))
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
        }
        const stack: (string | LppValue | LppReference)[] = []
        for (const value of expr) {
          if (value instanceof Operator) {
            const rhs = stack.pop()
            const lhs = stack.pop()
            if (lhs !== undefined && rhs !== undefined) {
              stack.push(evaluateInternal(value.value, lhs, rhs))
            } else throw new Error('lpp: invalid expression')
          } else stack.push(value)
        }
        const res = stack.pop()
        if (res === undefined) throw new Error('lpp: invalid expression')
        return res
      }
      try {
        const token: (string | Operator | LppValue | LppReference)[] = []
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const op = args[`OP_${i}`]
          const value = args[`ARG_${i}`]
          if (typeof op === 'string') {
            token.push(new Operator(op))
          }
          token.push(
            value instanceof LppValue ||
              value instanceof LppReference ||
              typeof value === 'string'
              ? value
              : String(value)
          )
        }
        const res = evaluate(intoRPN(token))
        if (typeof res === 'string') throw new Error('lpp: invalid expression')
        return res
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
      | PromiseProxy<LppValue | LppReference | LppBoundArg>
      | LppValue
      | LppReference
      | LppBoundArg {
      /**
       *  ['+', '+'],
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
        const value = args.value
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
            case 'await': {
              const thread = util.thread as Thread
              if (!thread.lpp) throw new LppError('useOutsideAsyncFunction')
              const lpp = thread.lpp.unwind()
              if (!(lpp instanceof LppAsyncFunctionContext))
                throw new LppError('useOutsideAsyncFunction')
              const v = asValue(value)
              const then = v.get('then')
              let thenFn: LppFunction
              let thenSelf: LppValue
              if (then instanceof LppReference) {
                if (!(then.value instanceof LppFunction)) return v
                thenFn = then.value
                thenSelf = then.parent.deref() ?? new LppConstant(null)
              } else {
                if (!(then instanceof LppFunction)) return v
                thenFn = then
                thenSelf = new LppConstant(null)
              }
              lpp.detach()
              return ImmediatePromise.sync(
                new ImmediatePromise<LppValue>(resolve => {
                  thenFn.apply(thenSelf, [
                    new LppFunction(ctx => {
                      resolve(ctx.args[0] ?? new LppConstant(null))
                      return new LppReturn(new LppConstant(null))
                    }),
                    new LppFunction(ctx => {
                      thread.lpp?.resolve(
                        new LppException(ctx.args[0] ?? new LppConstant(null))
                      )
                      vm.runtime.sequencer.retireThread(thread)
                      resolve(new LppConstant(null))
                      return new LppReturn(new LppConstant(null))
                    })
                  ])
                })
              )
            }
            default:
              throw new Error('lpp: unknown operand')
          }
        })()
        return this.asap(
          ImmediatePromise.sync(ImmediatePromise.resolve(res)),
          util.thread
        )
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
    ): PromiseProxy<LppValue> | LppValue {
      const { thread } = util
      this.util = util
      try {
        const { fn } = args
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
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
              return this.processApplyValue(
                yield func.apply(
                  fn instanceof LppReference
                    ? (fn.parent.deref() ?? new LppConstant(null))
                    : (lppThread.lpp?.unwind()?.self ?? new LppConstant(null)),
                  actualArgs
                ),
                thread
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
    ): PromiseProxy<LppValue> | LppValue {
      const { thread } = util
      this.util = util
      try {
        let { fn } = args
        // runtime hack by @FurryR.
        const actualArgs: LppValue[] = []
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
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
              return this.processApplyValue(
                yield fn.construct(actualArgs),
                thread
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
    self(_: object, util: VM.BlockUtility): LppValue {
      try {
        const { thread } = util
        this.util = util
        const lppThread = thread as Thread
        if (lppThread.lpp) {
          const unwind = lppThread.lpp.unwind()
          if (unwind) {
            return unwind.self
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
    ): LppConstant<number> {
      const obj = new LppConstant(Number(args.value))
      this.util = util
      return obj
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
    ): LppConstant<string> {
      const obj = new LppConstant(String(args.value))
      this.util = util
      return obj
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
    ): LppArray {
      try {
        const { thread } = util
        this.util = util
        const arr = new LppArray()
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (value instanceof LppBoundArg) arr.value.push(...value.value)
          else if (value instanceof LppValue || value instanceof LppReference)
            arr.value.push(asValue(value))
          else throw new LppError('syntaxError')
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
    ): LppObject {
      try {
        const { thread } = util
        this.util = util
        const obj = new LppObject()
        const block = this.getActiveBlockInstance(args, thread)
        const len = parseInt(this.getMutation(block)?.length ?? '0', 10)
        for (let i = 0; i < len; i++) {
          let key = args[`KEY_${i}`]
          const value = args[`VALUE_${i}`]
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
    ): LppFunction {
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
        return Metadata.attach(
          new LppFunction(this.executeScratch.bind(this, Target)),
          new Serialization.ScratchMetadata(
            'function',
            signature,
            [blocks, block.id],
            target.sprite.clones[0].id,
            target.id,
            lppThread.lpp
          )
        )
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct an asynchronous Function.
     * @param args ID for finding where the function is.
     * @param util Scratch util.
     * @returns A function object.
     */
    constructAsyncFunction(
      args: Record<string, unknown>,
      util: VM.BlockUtility
    ): LppFunction {
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
        return Metadata.attach(
          new LppFunction(this.executeScratchAsync.bind(this, Target)),
          new Serialization.ScratchMetadata(
            'asyncFunction',
            signature,
            [blocks, block.id],
            target.sprite.clones[0].id,
            target.id,
            lppThread.lpp
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
    var(args: { name: string }, util: VM.BlockUtility): LppReference {
      try {
        const { thread } = util
        this.util = util
        const lppThread = thread as Thread
        if (lppThread.lpp) {
          const v = lppThread.lpp.get(args.name)
          return v
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
        if (!(value instanceof LppValue || value instanceof LppReference))
          throw new LppError('syntaxError')
        const val = asValue(value)
        const lppThread = thread as Thread
        if (lppThread.lpp) {
          const lpp = lppThread.lpp.unwind()
          if (lpp instanceof LppAsyncFunctionContext) {
            const then = val.get('then')
            let thenFn: LppFunction
            let thenSelf: LppValue
            if (then instanceof LppReference) {
              if (!(then.value instanceof LppFunction)) {
                lpp.detach()
                lpp.promise?.resolve(val)
                return vm.runtime.sequencer.retireThread(thread)
              }
              thenFn = then.value
              thenSelf = then.parent.deref() ?? new LppConstant(null)
            } else {
              if (!(then instanceof LppFunction)) {
                lpp.detach()
                lpp.promise?.resolve(val)
                return vm.runtime.sequencer.retireThread(thread)
              }
              thenFn = then
              thenSelf = new LppConstant(null)
            }
            lpp.detach()
            return this.asap(
              ImmediatePromise.sync(
                new ImmediatePromise<void>(resolve => {
                  thenFn.apply(thenSelf, [
                    new LppFunction(ctx => {
                      lpp.promise?.resolve(ctx.args[0] ?? new LppConstant(null))
                      vm.runtime.sequencer.retireThread(thread)
                      resolve()
                      return new LppReturn(new LppConstant(null))
                    }),
                    new LppFunction(ctx => {
                      lpp.promise?.reject(ctx.args[0] ?? new LppConstant(null))
                      vm.runtime.sequencer.retireThread(thread)
                      resolve()
                      return new LppReturn(new LppConstant(null))
                    })
                  ])
                })
              ),
              util.thread
            )
          } else if (lpp instanceof LppFunctionContext) {
            lpp.resolve(new LppReturn(val))
            return vm.runtime.sequencer.retireThread(thread)
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
          lppThread.lpp.resolve(result)
          return vm.runtime.sequencer.retireThread(thread)
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
          vm.runtime as LppCompatibleRuntime,
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
                    parentThread.lpp.resolve(value)
                  } else throw new LppError('useOutsideFunction')
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
        const dest = args.var
        if (!(dest instanceof LppReference)) throw new LppError('syntaxError')
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        if (!this.util) throw new Error('lpp: util used before initialization')
        const controller = new ThreadController(
          vm.runtime as LppCompatibleRuntime,
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
                  if (value instanceof LppReturn) {
                    if (parentThread.lpp) {
                      parentThread.lpp.resolve(value)
                    } else throw new LppError('useOutsideFunction')
                  } else {
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
                          parentThread.lpp.resolve(value)
                        } else {
                          if (value instanceof LppReturn)
                            throw new LppError('useOutsideFunction')
                          this.handleException(value)
                        }
                      }
                    )
                    controller.wait(catchThread).then(() => {
                      resolve(undefined)
                    })
                  }
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
          vm.runtime.visualReport(thread.peekStack(), value)
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
              Blockly,
              vm,
              Scratch.translate,
              e.id,
              stack,
              thread.target.sprite.clones[0].id
            )
            vm.runtime.stopAll()
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
      warnException(Blockly, vm, Scratch.translate, e)
      vm.runtime.stopAll()
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
          thread.lpp.resolve(result)
          return new LppConstant(null)
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
        ? (container.getBlock(id) ?? vm.runtime.flyoutBlocks.getBlock(id))
        : vm.runtime.flyoutBlocks.getBlock(thread.peekStack())
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
        vm.runtime
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
        vm.runtime as LppCompatibleRuntime,
        this.util
      )
      const postProcess = () => {
        controller.step(thread)
      }
      return isPromise(res)
        ? new PromiseProxy<T>(res, postProcess, postProcess)
        : res
    }
    private executeScratchAsync(
      Target: TargetConstructor,
      ctx: LppHandle
    ): LppResult | PromiseLike<LppResult> {
      if (
        Metadata.hasMetadata(ctx.fn) &&
        ctx.fn.metadata instanceof Serialization.ScratchMetadata
      ) {
        const metadata = ctx.fn.metadata
        let target: VM.Target | undefined
        if (metadata.target) target = vm.runtime.getTargetById(metadata.target)
        if (!target) target = this.createDummyTarget(Target, metadata.blocks[0])
        const id = metadata.blocks[0].getBlock(metadata.blocks[1])?.inputs
          .SUBSTACK?.block
        if (!id) return new LppReturn(new LppConstant(null))
        if (!this.util) throw new Error('lpp: util used before initialization')
        const controller = new ThreadController(
          vm.runtime as LppCompatibleRuntime,
          this.util
        )
        const thread = controller.create(id, target)
        return ImmediatePromise.sync(
          new ImmediatePromise(resolve => {
            const lpp = (thread.lpp = new LppAsyncFunctionContext(
              metadata.closure,
              ctx.self ?? new LppConstant(null),
              val => {
                resolve(val)
              }
            ))
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
              lpp.detach()
              lpp.promise?.resolve(new LppConstant(null))
            })
          })
        )
      }
      return new LppReturn(new LppConstant(null))
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
        if (metadata.target) target = vm.runtime.getTargetById(metadata.target)
        if (!target) target = this.createDummyTarget(Target, metadata.blocks[0])
        const id = metadata.blocks[0].getBlock(metadata.blocks[1])?.inputs
          .SUBSTACK?.block
        if (!id) return new LppReturn(new LppConstant(null))
        if (!this.util) throw new Error('lpp: util used before initialization')
        const controller = new ThreadController(
          vm.runtime as LppCompatibleRuntime,
          this.util
        )
        const thread = controller.create(id, target)
        return ImmediatePromise.sync(
          new ImmediatePromise(resolve => {
            const lpp = (thread.lpp = new LppFunctionContext(
              metadata.closure,
              ctx.self ?? new LppConstant(null),
              val => {
                resolve(val)
              }
            ))
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
              lpp.resolve(new LppReturn(new LppConstant(null)))
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
  Scratch.extensions.register(new LppExtension())
})(Scratch)
