import type OriginalVM from 'scratch-vm'
import type { Message } from 'format-message'
import type {
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
import type * as Serialization from '../serialization'
import { Wrapper } from '../wrapper'

/**
 * Definition of Scratch extension.
 */
export interface ScratchExtension {
  getInfo(): object
}
/**
 * Definition of Scratch.translate().
 */
export interface TranslateFn {
  (message: Message, args?: object | undefined): string
  setup(newTranslations: object | Message | null): void
}
/**
 * Definition of Scratch object.
 */
export interface ScratchContext {
  extensions: {
    register(ext: ScratchExtension): void
    unsandboxed: boolean
  }
  translate: TranslateFn
  vm?: VM
}
/**
 * Definition of runtime (with compiler support, for Turbowarp).
 */
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
    Serialization: typeof Serialization
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
/**
 * Definition of lpp compatible thread.
 */
export interface LppCompatibleThread extends VM.Thread {
  lpp?: LppContext
  isCompiled?: boolean
  generator?: {
    next(): unknown
  }
  tryCompile?(): void
}
/**
 * Definition of VM.
 */
export interface VM extends OriginalVM {
  _events: Record<
    keyof VM.RuntimeAndVirtualMachineEventMap,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
}
/**
 * Definition of Block container.
 */
export interface Blocks extends VM.Blocks {
  _cache: {
    _executeCached: Record<
      string,
      { _ops: { _argValues: object; id: string }[] }
    >
  }
}
/**
 * VM.Target constructor.
 */
export interface TargetConstructor {
  new ({ blocks }: { blocks: VM.Blocks }): VM.Target
}
/**
 * VM.Sequencer constructor.
 */
export interface SequencerConstructor {
  new (runtime: VM.Runtime): VM.Sequencer
}
/**
 * VM.Thread constructor.
 */
export interface ThreadConstructor {
  new (id: string): VM.Thread
  STATUS_DONE: number
  STATUS_RUNNING: number
}
/**
 * VM.Blocks constructor.
 */
export interface BlocksConstructor {
  new (runtime: VM.Runtime, optNoGlow?: boolean /** = false */): VM.Blocks
}
