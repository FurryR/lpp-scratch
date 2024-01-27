import { BlockDescriptor, BlockMap } from './extension'
import { Block, BlocklyInstance } from './typing'

function _ReporterBase(
  fn: (
    Blockly: BlocklyInstance,
    block: Block
  ) => BlockMap | ((...args: never[]) => unknown),
  type: 'square' | 'round'
): BlockDescriptor {
  const prepatch = (Blockly: BlocklyInstance, block: Block) => {
    block.setOutput(true, 'String')
    block.setOutputShape(
      type === 'square'
        ? Blockly.OUTPUT_SHAPE_SQUARE
        : Blockly.OUTPUT_SHAPE_ROUND
    )
  }
  return {
    init(Blockly, block) {
      const map = fn(Blockly, block)
      if (typeof map === 'function') {
        return (...args: never[]) => {
          prepatch(Blockly, block)
          return map(...args)
        }
      } else if (map.init) {
        const _init = map.init
        map.init = (...args: never[]) => {
          prepatch(Blockly, block)
          return _init(...args)
        }
      }
      return map
    },
    type: 'reporter'
  }
}
/**
 * Middleware to set a block as command.
 * @param fn Function.
 * @param isTerminal True if the block is a terminal block. Defaults to false.
 * @returns Processed function.
 */
export function Command(
  fn: (
    Blockly: BlocklyInstance,
    block: Block
  ) => BlockMap | ((...args: never[]) => unknown),
  isTerminal: boolean = false
): BlockDescriptor {
  const prepatch = (Blockly: BlocklyInstance, block: Block) => {
    block.setNextStatement(!isTerminal)
    block.setPreviousStatement(true)
    block.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
  }
  return {
    init(Blockly, block) {
      const map = fn(Blockly, block)
      if (typeof map === 'function') {
        return (...args: never[]) => {
          prepatch(Blockly, block)
          return map(...args)
        }
      } else if (map.init) {
        const _init = map.init
        map.init = (...args: never[]) => {
          prepatch(Blockly, block)
          return _init(...args)
        }
      }
      return map
    },
    type: 'command'
  }
}
/**
 * Middlewares to set a block as reporter.
 */
export namespace Reporter {
  export function Square(
    fn: (
      Blockly: BlocklyInstance,
      block: Block
    ) => BlockMap | ((...args: never[]) => unknown)
  ): BlockDescriptor {
    return _ReporterBase(fn, 'square')
  }
  /**
   * Middleware to set a block as reporter with round shape.
   * @param fn Function.
   * @returns Processed function.
   */
  export function Round(
    fn: (
      Blockly: BlocklyInstance,
      block: Block
    ) => BlockMap | ((...args: never[]) => unknown)
  ): BlockDescriptor {
    return _ReporterBase(fn, 'round')
  }
}
