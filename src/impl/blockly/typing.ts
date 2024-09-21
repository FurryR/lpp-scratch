import type * as ScratchBlocks from 'blockly/core'
type _BlocklyInstance = typeof ScratchBlocks
/**
 * Blockly instance type.
 */
export interface BlocklyInstance extends _BlocklyInstance {
  MutatorPlus?: {
    new (): object
  }
  MutatorMinus?: {
    new (): object
  }
  Mutator: {
    new (_: null): ScratchBlocks.IIcon & {
      block_: Block
      createIcon(): void
    }
  }
  utils: {
    createSvgElement(a: string, b: unknown, c: unknown): unknown
    isRightButton(a: unknown): boolean
  } & typeof ScratchBlocks.utils
  Colours: {
    valueReportBackground: string
    valueReportBorder: string
  }
  OUTPUT_SHAPE_SQUARE: number
  OUTPUT_SHAPE_ROUND: number
  OUTPUT_SHAPE_HEXAGONAL: number
}
/**
 * extended ScratchBlocks.BlockSvg interface.
 */
export interface Block extends ScratchBlocks.BlockSvg {
  setCategory(category: string): void
  setCheckboxInFlyout(isInFlyout: boolean): void
}
