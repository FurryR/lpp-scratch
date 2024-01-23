import { LppContext, LppTraceback as CoreTraceback } from '../core'
/**
 * Extended traceback namespace.
 */
export namespace LppTraceback {
  export import Base = CoreTraceback.Base
  export import NativeFn = CoreTraceback.NativeFn
  /**
   * Block traceback.
   */
  export class Block extends CoreTraceback.Base {
    /**
     * Construct a traceback object.
     * @param target Target ID.
     * @param block Block ID.
     * @param context Context.
     */
    constructor(
      public target: string,
      public block: string,
      public context?: LppContext
    ) {
      super()
    }
    toString(): string {
      return this.block
    }
  }
}
