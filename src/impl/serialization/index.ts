import type VM from 'scratch-vm'
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
   * Function entry point.
   */
  entry: string
}
// export function serializeBlock(
//   container: VM.Blocks,
//   block: VM.Block
// ): Record<string, VM.Block> {
//   const v: Record<string, VM.Block> = {}
//   v[block.id] = block
//   for (const v of Object.values(block.inputs)) {
//     const subBlock = container.getBlock(v.block)
//     if (subBlock) Object.assign(v, serializeBlock(container, subBlock))
//   }
//   if (block.next) {
//     const nextBlock = container.getBlock(block.next)
//     if (nextBlock) Object.assign(v, serializeBlock(container, nextBlock))
//   }
//   return v
// }
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
export function deserializeBlock(
  container: VM.Blocks,
  blocks: Record<string, VM.Block>
) {
  container._blocks = blocks
}
export namespace Validator {
  export function isField(value: unknown): value is VM.Field {
    if (!(value instanceof Object)) return false
    const v = value as Record<string, unknown>
    if (v.id !== null && typeof v.id !== 'string') return false
    if (typeof v.name !== 'string') return false
    if (typeof v.value !== 'string') return false
    return true
  }
  export function isInput(
    container: Record<string, unknown>,
    value: unknown
  ): value is VM.Input {
    if (!(value instanceof Object)) return false
    const v = value as Record<string, unknown>
    if (v.shadow !== null && typeof v.shadow !== 'string') return false
    if (typeof v.name !== 'string') return false
    if (typeof v.block !== 'string' || !(v.block in container)) return false
    return true
  }
  export function isBlock(
    container: Record<string, unknown>,
    id: string,
    value: unknown
  ): value is VM.Block {
    if (!(value instanceof Object)) return false
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
      !(v.inputs instanceof Object) ||
      !Object.values(v.inputs).every(elem => isInput(container, elem))
    )
      return false
    if (
      !(v.fields instanceof Object) ||
      !Object.values(v.fields).every(v => isField(v))
    )
      return false
    if (
      v.mutation !== undefined &&
      (!(v.mutation instanceof Object) ||
        !Object.values(v.mutation).every(v => typeof v === 'string'))
    )
      return false
    return true
  }
  export function isInfo(value: unknown): value is SerializationInfo {
    if (!(value instanceof Object)) return false
    const v = value as Record<string, unknown>
    if (
      !(v.signature instanceof Array) ||
      !v.signature.every(v => typeof v === 'string')
    )
      return false
    if (
      !(v.script instanceof Object) ||
      !Object.entries(v.script).every(elem =>
        isBlock(v.script as Record<string, unknown>, elem[0], elem[1])
      )
    )
      return false
    if (typeof v.entry !== 'string' || !(v.entry in v.script)) return false
    return true
  }
}
