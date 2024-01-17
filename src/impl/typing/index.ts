import type VM from 'scratch-vm'
import type { Message } from 'format-message'
import {
  LppArray,
  LppReference,
  LppConstant,
  LppContext,
  LppException,
  LppFunction,
  LppObject,
  LppPromise,
  LppReturn,
  LppValue,
  global
} from 'src/core'
import { Wrapper } from '../wrapper'

export interface ScratchExtension {
  getInfo(): object
}
export interface TranslateFn {
  (message: Message, args?: object | undefined): string
  setup(newTranslations: object | Message | null): void
}
export interface ScratchContext {
  extensions: {
    register(ext: ScratchExtension): void
    unsandboxed: boolean
  }
  translate: TranslateFn
  vm?: VM
}
export interface LppCompatibleRuntime extends VM.Runtime {
  lpp?: {
    LppValue: typeof LppValue
    LppReference: typeof LppReference
    LppConstant: typeof LppConstant
    LppArray: typeof LppArray
    LppObject: typeof LppObject
    LppFunction: typeof LppFunction
    LppPromise: typeof LppPromise
    LppReturn: typeof LppReturn
    LppException: typeof LppException
    Wrapper: typeof Wrapper
    version: string
    global: typeof global
  }
  compilerOptions?: {
    enabled: boolean
  }
  _events: Record<
    keyof VM.RuntimeEventMap,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
}
export interface LppCompatibleThread extends VM.Thread {
  lpp?: LppContext
  isCompiled?: boolean
  generator?: {
    next(): unknown
  }
  tryCompile?(): void
}
export interface LppCompatibleVM extends VM {
  _events: Record<
    keyof VM.RuntimeAndVirtualMachineEventMap,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
}
export interface LppCompatibleBlocks extends VM.Blocks {
  _cache: {
    _executeCached: Record<
      string,
      { _ops: { _argValues: object; id: string }[] }
    >
  }
}
export interface TargetConstructor {
  new ({ blocks }: { blocks: VM.Blocks }): VM.Target
}
export interface ThreadConstructor {
  new (id: string): VM.Thread
  STATUS_DONE: number
  STATUS_RUNNING: number
}
export interface BlocksConstructor {
  new (runtime: VM.Runtime, optNoGlow?: boolean /** = false */): VM.Blocks
}
