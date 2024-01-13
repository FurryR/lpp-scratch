import type VM from 'scratch-vm'
import type { Message } from 'format-message'

export interface ScratchExtension {
  getInfo(): unknown
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
