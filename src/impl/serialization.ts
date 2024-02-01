import { LppContext } from 'src/core'
import { TypeMetadata } from './metadata'

export interface SerializationInfo {
  /**
   * Function signature.
   */
  signature: string[]
  /**
   * Scratch blocks.
   */
  script: Record<string, VM.Block>
  /**
   * Function ID.
   */
  block: string
}
export class ScratchMetadata extends TypeMetadata {
  /**
   * Construct a Scratch metadata object.
   * @param signature Function's signature.
   * @param blocks Runtime blocks instance (for serialize/deserialize) and Block ID (refers to lpp_constructFunction).
   * @param sprite Original sprite ID of block container.
   * @param target Target ID.
   * @param closure Function's closure.
   */
  constructor(
    signature: string[],
    public blocks: [VM.Blocks, string],
    public sprite?: string,
    public target?: string,
    public closure?: LppContext
  ) {
    super(signature)
  }
}
/**
 * Serialize all blocks related to specified block, including the block itself.
 * @param container Block container.
 * @param block Specified block.
 * @returns Block list.
 */
export function serializeBlock(
  container: VM.Blocks,
  block: VM.Block
): Record<string, VM.Block> {
  function serializeBlockInternal(
    container: VM.Blocks,
    block: VM.Block
  ): Record<string, VM.Block> {
    const v: Record<string, VM.Block> = {}
    v[block.id] = structuredClone(block)
    for (const elem of Object.values(block.inputs)) {
      const subBlock = container.getBlock(elem.block)
      if (subBlock)
        Object.assign(v, serializeBlockInternal(container, subBlock))
    }
    if (block.next) {
      const nextBlock = container.getBlock(block.next)
      if (nextBlock)
        Object.assign(v, serializeBlockInternal(container, nextBlock))
    }
    return v
  }
  const res = serializeBlockInternal(container, block)
  res[block.id].parent = null
  return res
}
/**
 * Deserialize blocks to a container.
 * @param container Block container.
 * @param blocks Blocks to deserialize.
 */
export function deserializeBlock(
  container: VM.Blocks,
  blocks: Record<string, VM.Block>
) {
  container._blocks = blocks
}
/**
 * Validator of serialized block JSON.
 */
export namespace Validator {
  /**
   * Check if value is a Field.
   * @param value Value to check.
   * @returns True if value is a Field, false otherwise.
   */
  export function isField(value: unknown): value is VM.Field {
    if (!(typeof value === 'object' && value !== null)) return false
    const v = value as Record<string, unknown>
    if (v.id !== null && typeof v.id !== 'string') return false
    if (typeof v.name !== 'string') return false
    if (typeof v.value !== 'string') return false
    return true
  }
  /**
   * Check if value is an Input.
   * @param value Value to check.
   * @returns True if value is an Input, false otherwise.
   */
  export function isInput(
    container: Record<string, unknown>,
    value: unknown
  ): value is VM.Input {
    if (!(typeof value === 'object' && value !== null)) return false
    const v = value as Record<string, unknown>
    if (v.shadow !== null && typeof v.shadow !== 'string') return false
    if (typeof v.name !== 'string') return false
    if (typeof v.block !== 'string' || !(v.block in container)) return false
    return true
  }
  /**
   * Check if value is a Block.
   * @param value Value to check.
   * @returns True if value is a Block, false otherwise.
   */
  export function isBlock(
    container: Record<string, unknown>,
    id: string,
    value: unknown
  ): value is VM.Block {
    if (!(typeof value === 'object' && value !== null)) return false
    const v = value as Record<string, unknown>
    if (v.id !== id) return false
    if (typeof v.opcode !== 'string') return false
    if (v.parent !== null) {
      if (
        typeof v.parent !== 'string' ||
        !(v.parent in container) ||
        v.parent === id
      )
        return false
    }
    if (v.next !== null) {
      if (typeof v.next !== 'string' || !(v.next in container) || v.next === id)
        return false
    }
    if (typeof v.shadow !== 'boolean') return false
    if (typeof v.topLevel !== 'boolean') return false
    if (
      !(typeof v.inputs === 'object' && v.inputs !== null) ||
      (!Object.values(v.inputs).every(elem => isInput(container, elem)) &&
        Object.keys(v.inputs).length !== 0)
    )
      return false
    if (
      !(typeof v.fields === 'object' && v.fields !== null) ||
      (!Object.values(v.fields).every(v => isField(v)) &&
        Object.keys(v.fields).length !== 0)
    )
      return false
    if (
      v.mutation !== undefined &&
      !(typeof v.mutation === 'object' && v.mutation !== null)
    )
      return false
    return true
  }
  /**
   * Check if value is valid serialized data.
   * @param value Value to check.
   * @returns True if value is valid, false otherwise.
   */
  export function isInfo(value: unknown): value is SerializationInfo {
    if (!(typeof value === 'object' && value !== null)) return false
    const v = value as Record<string, unknown>
    if (
      !(v.signature instanceof Array) ||
      (!v.signature.every(v => typeof v === 'string') &&
        v.signature.length !== 0)
    )
      return false
    if (
      !(typeof v.script === 'object' && v.script !== null) ||
      (!Object.entries(v.script).every(elem =>
        isBlock(v.script as Record<string, unknown>, elem[0], elem[1])
      ) &&
        Object.keys(v.script).length !== 0)
    )
      return false
    if (typeof v.block !== 'string' || !(v.block in v.script)) return false
    return true
  }
}
