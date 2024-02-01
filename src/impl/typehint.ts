import { LppFunction, LppReference, LppValue, ensureValue } from 'src/core'
import { Global } from '../core/global'
import { attach, TypeMetadata } from './metadata'
/**
 * Attach type hint to builtin functions.
 */
export function attachType() {
  function attachType(fn: LppValue | LppReference, signature: string[]) {
    const v = ensureValue(fn)
    if (v instanceof LppFunction) attach(v, new TypeMetadata(signature))
  }
  attachType(Global.Function.get('prototype').get('apply'), ['self', 'args'])
  attachType(Global.Function.get('deserialize'), ['obj'])
  attachType(Global.Function.get('serialize'), ['fn'])
  attachType(Global.Promise, ['executor'])
  attachType(Global.Promise.get('prototype').get('then'), [
    'onFulfilled?',
    'onRejected?'
  ])
  attachType(Global.Promise.get('resolve'), ['value?'])
  attachType(Global.Promise.get('reject'), ['reason?'])
  attachType(Global.Promise.get('prototype').get('catch'), ['onRejected'])
  attachType(Global.JSON.get('parse'), ['json'])
  attachType(Global.JSON.get('stringify'), ['value'])
}
