import type { LppReference, LppValue } from '../core'
import { LppFunction, asValue } from '../core'
import { Global } from '../core'
import { attach, FunctionType, TypeMetadata } from './metadata'
/**
 * Attach type hint to builtin functions.
 */
export function attachType() {
  function attachType(
    fn: LppValue | LppReference,
    type: FunctionType,
    signature: string[]
  ) {
    const v = asValue(fn)
    if (v instanceof LppFunction) attach(v, new TypeMetadata(type, signature))
  }
  attachType(Global.Number, 'function', ['value?'])
  attachType(Global.Boolean, 'function', ['value?'])
  attachType(Global.String, 'function', ['value?'])
  attachType(Global.Array, 'function', ['value?'])
  attachType(Global.Object, 'function', ['value?'])
  attachType(Global.Object.get('create'), 'function', ['proto'])
  attachType(Global.Function, 'function', ['value?'])

  attachType(Global.Array.get('prototype').get('map'), 'function', ['predict'])
  attachType(Global.Array.get('prototype').get('every'), 'function', [
    'predict'
  ])
  attachType(Global.Array.get('prototype').get('any'), 'function', ['predict'])
  attachType(Global.Array.get('prototype').get('slice'), 'function', [
    'start?',
    'end?'
  ])
  attachType(Global.Function.get('prototype').get('bind'), 'function', ['self'])
  attachType(Global.Function.get('deserialize'), 'function', ['obj'])
  attachType(Global.Function.get('serialize'), 'function', ['fn'])
  attachType(Global.Promise, 'function', ['executor'])
  attachType(Global.Promise.get('prototype').get('then'), 'function', [
    'onfulfilled?',
    'onrejected?'
  ])
  attachType(Global.Promise.get('resolve'), 'function', ['value?'])
  attachType(Global.Promise.get('reject'), 'function', ['reason?'])
  attachType(Global.Promise.get('prototype').get('catch'), 'function', [
    'onrejected'
  ])
  // JSON
  attachType(Global.JSON.get('parse'), 'function', ['json'])
  attachType(Global.JSON.get('stringify'), 'function', ['value'])
  // Math
  attachType(Global.Math.get('sin'), 'function', ['x'])
  attachType(Global.Math.get('sinh'), 'function', ['x'])
  attachType(Global.Math.get('asin'), 'function', ['x'])
  attachType(Global.Math.get('asinh'), 'function', ['x'])
  attachType(Global.Math.get('cos'), 'function', ['x'])
  attachType(Global.Math.get('cosh'), 'function', ['x'])
  attachType(Global.Math.get('acos'), 'function', ['x'])
  attachType(Global.Math.get('acosh'), 'function', ['x'])
  attachType(Global.Math.get('tan'), 'function', ['x'])
  attachType(Global.Math.get('tanh'), 'function', ['x'])
  attachType(Global.Math.get('atan'), 'function', ['x'])
  attachType(Global.Math.get('atanh'), 'function', ['x'])
  attachType(Global.Math.get('atan2'), 'function', ['x', 'y'])
}
