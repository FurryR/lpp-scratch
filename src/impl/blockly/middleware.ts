import { BlockDescriptor, BlockMap } from './extension'
import { Block, BlocklyInstance } from './typing'

function _ReporterBase(
  fn: (
    Blockly: BlocklyInstance,
    block: Block
  ) => BlockMap | ((...args: never[]) => unknown),
  type: 'square' | 'round' | 'hexagon'
): BlockDescriptor {
  const prepatch = (Blockly: BlocklyInstance, block: Block) => {
    const SHAPE_MAP = {
      square: Blockly.OUTPUT_SHAPE_ROUND,
      round: Blockly.OUTPUT_SHAPE_ROUND,
      hexagon: Blockly.OUTPUT_SHAPE_HEXAGONAL
    } as const
    block.setOutput(true, type === 'hexagon' ? 'Boolean' : 'String')
    block.setOutputShape(SHAPE_MAP[type])
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
  /**
   * Middleware to set a block as reporter with square shape.
   * @param fn Function.
   * @returns Processed function.
   */
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
  /**
   * Middleware to set a block as reporter with hexagon shape.
   * @param fn Function.
   * @returns Processed function.
   */
  export function Hexagon(
    fn: (
      Blockly: BlocklyInstance,
      block: Block
    ) => BlockMap | ((...args: never[]) => unknown)
  ): BlockDescriptor {
    return _ReporterBase(fn, 'hexagon')
  }
}
