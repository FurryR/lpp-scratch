import type * as OriginalVM from 'scratch-vm'
import type { Message } from 'format-message'
import type * as Core from '../../core'
import type * as Metadata from '../metadata'
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
    Core: typeof Core
    Metadata: typeof Metadata
    Wrapper: typeof Wrapper
    version: string
  }
  requestUpdateMonitor?(state: Map<string, unknown>): boolean
  getMonitorState?(): Map<string, unknown>
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
export interface Thread extends VM.Thread {
  lpp?: Core.LppContext
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
  new (
    { blocks, name }: { blocks: VM.Blocks; name: string },
    runtime: VM.Runtime
  ): VM.Target
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
