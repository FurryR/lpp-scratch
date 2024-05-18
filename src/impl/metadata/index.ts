import type { LppFunction, LppObject } from '../../core'

export type FunctionType =
  | 'function'
  | 'asyncFunction'
  | 'generatorFunction'
  | 'asyncGeneratorFunction'
export interface Metadata {
  metadata: unknown
}
export class TypeMetadata {
  /**
   * Construct a type metadata object.
   * @param signature Function's signature.
   */
  constructor(
    public type: FunctionType,
    public signature: string[]
  ) {}
}
export function hasMetadata<T extends LppObject | LppFunction>(
  obj: T
): obj is Metadata & T {
  const v = obj as Metadata & T
  return !!v.metadata
}
export function attach<T extends LppObject | LppFunction>(
  obj: T,
  metadata: unknown
): Metadata & T {
  const v = obj as Metadata & T
  v.metadata = metadata
  return v
}
