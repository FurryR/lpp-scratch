import type { LppReference, LppValue } from '../core'
import { LppFunction, asValue } from '../core'
import { Global } from '../core'
import { attach, TypeMetadata } from './metadata'
/**
 * Attach type hint to builtin functions.
 */
export function attachType() {
  function attachType(fn: LppValue | LppReference, signature: string[]) {
    const v = asValue(fn)
    if (v instanceof LppFunction) attach(v, new TypeMetadata(signature))
  }
  attachType(Global.Number, ['value?'])
  attachType(Global.Boolean, ['value?'])
  attachType(Global.String, ['value?'])
  attachType(Global.Array, ['value?'])
  attachType(Global.Object, ['value?'])
  attachType(Global.Function, ['value?'])

  attachType(Global.Array.get('prototype').get('map'), ['predict'])
  attachType(Global.Array.get('prototype').get('every'), ['predict'])
  attachType(Global.Array.get('prototype').get('any'), ['predict'])
  attachType(Global.Array.get('prototype').get('slice'), ['start?', 'end?'])
  attachType(Global.Function.get('prototype').get('bind'), ['self'])
  attachType(Global.Function.get('deserialize'), ['obj'])
  attachType(Global.Function.get('serialize'), ['fn'])
  attachType(Global.Promise, ['executor'])
  attachType(Global.Promise.get('prototype').get('then'), [
    'onfulfilled?',
    'onrejected?'
  ])
  attachType(Global.Promise.get('resolve'), ['value?'])
  attachType(Global.Promise.get('reject'), ['reason?'])
  attachType(Global.Promise.get('prototype').get('catch'), ['onrejected'])
  // JSON
  attachType(Global.JSON.get('parse'), ['json'])
  attachType(Global.JSON.get('stringify'), ['value'])
  // Math
  attachType(Global.Math.get('sin'), ['x'])
  attachType(Global.Math.get('sinh'), ['x'])
  attachType(Global.Math.get('asin'), ['x'])
  attachType(Global.Math.get('asinh'), ['x'])
  attachType(Global.Math.get('cos'), ['x'])
  attachType(Global.Math.get('cosh'), ['x'])
  attachType(Global.Math.get('acos'), ['x'])
  attachType(Global.Math.get('acosh'), ['x'])
  attachType(Global.Math.get('tan'), ['x'])
  attachType(Global.Math.get('tanh'), ['x'])
  attachType(Global.Math.get('atan'), ['x'])
  attachType(Global.Math.get('atanh'), ['x'])
  attachType(Global.Math.get('atan2'), ['x', 'y'])
}
