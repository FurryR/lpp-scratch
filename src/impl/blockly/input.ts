import type * as ScratchBlocks from 'blockly/core'

type Shadowable = ScratchBlocks.Input & {
  connection: { setShadowDom(a: unknown): void; respawnShadow_(): void }
}
type Gesture = ScratchBlocks.Workspace & {
  currentGesture_?: {
    isDraggingBlock_: boolean
    targetBlock_?: ScratchBlocks.Block
  }
}
/**
 * Append string shadow to the field.
 * @param field Blockly field.
 * @param value Value.
 * @returns Field.
 */
function addShadow(field: Shadowable, value: string): Shadowable {
  const elem = document.createElement('shadow')
  const child = document.createElement('field')
  elem.setAttribute('type', 'text')
  child.setAttribute('name', 'TEXT')
  child.textContent = value
  elem.appendChild(child)
  field.connection.setShadowDom(elem)
  field.connection.respawnShadow_()
  return field
}
/**
 * Append null shadow to the field.
 * @param field Blockly field.
 * @returns Field.
 */
function addNullShadow(field: Shadowable) {
  field.connection.setShadowDom(null)
  field.connection.respawnShadow_()
  return field
}
/**
 * Generate an input that allows string.
 * @param block Target block.
 * @param name Input name.
 * @param value Input (default) value.
 * @returns Input.
 */
export function String(
  block: ScratchBlocks.Block,
  name: string,
  value: string
): ScratchBlocks.Input {
  const field = block.appendValueInput(name) as Shadowable
  const workspace = block.workspace as Gesture
  if (
    block.isInsertionMarker() ||
    (workspace.currentGesture_?.isDraggingBlock_ &&
      workspace.currentGesture_?.targetBlock_?.type === block.type)
  )
    return field
  return addShadow(field, value)
}
/**
 * Generate an input that allows anything (not directly).
 * @param block Target block.
 * @param name Input name.
 * @returns Input.
 */
export function Any(
  block: ScratchBlocks.Block,
  name: string
): ScratchBlocks.Input {
  const field = block.appendValueInput(name) as Shadowable
  const workspace = block.workspace as Gesture
  if (
    block.isInsertionMarker() ||
    (workspace.currentGesture_?.isDraggingBlock_ &&
      workspace.currentGesture_?.targetBlock_?.type === block.type)
  )
    return field
  return addNullShadow(field)
}
/**
 * Generate text.
 * @param block Target text.
 * @param name Input name.
 * @param value Text value.
 * @returns Input.
 */
export function Text(
  block: ScratchBlocks.Block,
  name: string,
  value: string | string[]
): ScratchBlocks.Input {
  if (typeof value === 'string') return Text(block, name, [value])
  const input = block.appendDummyInput(name)
  value.forEach(value => input.appendField(value))
  return input
}
/**
 * Generate a statement input.
 * @param block Target block.
 * @param name Input name.
 * @returns Input.
 */
export function Statement(
  block: ScratchBlocks.Block,
  name: string
): ScratchBlocks.Input {
  return block.appendStatementInput(name)
}
