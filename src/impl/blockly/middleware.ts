import { BlockDescriptor } from './extension'
import { Block, BlocklyInstance } from './typing'

function _ReporterBase(
  fn: (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) => void,
  type: 'square' | 'round'
): (
  this: BlockDescriptor,
  instance: BlocklyInstance,
  block: Block,
  ...args: never[]
) => void {
  return function (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) {
    block.setOutput(true, 'String')
    block.setOutputShape(
      type === 'square'
        ? instance.OUTPUT_SHAPE_SQUARE
        : instance.OUTPUT_SHAPE_ROUND
    )
    return fn.call(this, instance, block, ...args)
  }
}
/**
 * Middleware to set a block as command.
 * @param fn Function.
 * @returns Processed function.
 */
export function Command(
  fn: (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) => void
): (
  this: BlockDescriptor,
  instance: BlocklyInstance,
  block: Block,
  ...args: never[]
) => void {
  return function (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) {
    block.setNextStatement(true)
    block.setPreviousStatement(true)
    block.setOutputShape(instance.OUTPUT_SHAPE_SQUARE)
    return fn.call(this, instance, block, ...args)
  }
}
/**
 * Middlewares to set a block as reporter.
 */
export namespace Reporter {
  export function Square(
    fn: (
      this: BlockDescriptor,
      instance: BlocklyInstance,
      block: Block,
      ...args: never[]
    ) => void
  ): (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) => void {
    return _ReporterBase(fn, 'square')
  }
  /**
   * Middleware to set a block as reporter with round shape.
   * @param fn Function.
   * @returns Processed function.
   */
  export function Round(
    fn: (
      this: BlockDescriptor,
      instance: BlocklyInstance,
      block: Block,
      ...args: never[]
    ) => void
  ): (
    this: BlockDescriptor,
    instance: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) => void {
    return _ReporterBase(fn, 'round')
  }
}
