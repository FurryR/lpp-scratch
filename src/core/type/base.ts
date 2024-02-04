import { LppReference } from './reference'
import { LppFunction } from './function'

export class LppError extends Error {
  /**
   * Construct a new Lpp error.
   * @param id Error ID.
   */
  constructor(public id: string) {
    super(`lpp: Error ${id}`)
  }
}
export type LppBinaryOperator =
  | '='
  | '+'
  | '*'
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | '&&'
  | '||'
  | '-'
  | '/'
  | '%'
  | '<<'
  | '>>'
  | '>>>'
  | '&'
  | '|'
  | '^'
  | 'instanceof'
export type LppUnaryOperator = '+' | '-' | '!' | '~' | 'delete'
/**
 * Lpp compatible object.
 */
export abstract class LppValue {
  /**
   * @abstract Get a value.
   * @param key Key to get.
   * @returns Value if exist.
   */
  abstract get(key: string): LppValue | LppReference
  /**
   * @abstract Set a value.
   * @param key Key to set.
   * @param value Value to set.
   * @returns Value.
   */
  abstract set(key: string, value: LppValue): LppReference
  /**
   * Detect whether a value exists.
   * @param key Key to detect.
   * @returns Whether the value exists.
   */
  abstract has(key: string): boolean
  /**
   * Delete a value from the object.
   * @param key Key to delete.
   * @returns Whether the value exists.
   */
  abstract delete(key: string): boolean
  /**
   * Detect whether a value is constructed from fn.
   * @param fn Function.
   * @returns Whether the value is constructed from fn.
   */
  abstract instanceof(fn: LppFunction): boolean
  /**
   * toString for visualReport.
   * @returns Human readable string.
   */
  abstract toString(): string
  /**
   * Do arithmetic operations.
   * @param op Binary operator.
   * @param rhs Right hand side of the operation.
   */
  abstract calc(
    op: LppBinaryOperator | LppUnaryOperator,
    rhs?: LppValue
  ): LppValue | LppReference
}
