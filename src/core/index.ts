/**
 * Lpp core (standard) implementation.
 */

import InternalGlobal from './global'
export * from './type'
export * from './context'
export const Global = InternalGlobal
export { asValue, asBoolean, isPromise, async, raise } from './helper'
export * as ffi from './ffi'
