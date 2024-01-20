import { LppFunction, LppReference, LppValue, ensureValue } from 'src/core'
import { Global } from '../core/global'
import { attachTypehint } from './serialization'
export function attachType() {
  function attachType(fn: LppValue | LppReference, signature: string[]) {
    const v = ensureValue(fn)
    if (v instanceof LppFunction) attachTypehint(v, signature)
  }
  attachType(Global.Function.get('prototype').get('apply'), ['self', 'args'])
  attachType(Global.Function.get('deserialize'), ['obj'])
  attachType(Global.Function.get('serialize'), ['fn'])
  attachType(Global.Promise, ['executor'])
  attachType(Global.Promise.get('prototype').get('then'), [
    'onFulfilled',
    'onRejected?'
  ])
  attachType(Global.Promise.get('prototype').get('catch'), ['onRejected'])
  attachType(Global.JSON.get('parse'), ['json'])
  attachType(Global.JSON.get('stringify'), ['value'])
}