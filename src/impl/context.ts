import { LppContext, LppTraceback as CoreTraceback } from '../core'
export namespace LppTraceback {
  export import Base = CoreTraceback.Base
  export import NativeFn = CoreTraceback.NativeFn
  export class Block extends CoreTraceback.Base {
    /**
     * Construct a traceback object.
     * @param block Block ID.
     * @param context Context.
     */
    constructor(
      /** Block ID. */
      public block: string,
      /** Context. */
      public context?: LppContext
    ) {
      super()
    }
    toString(): string {
      return this.block
    }
  }
}
