import Array from './Array'
import Boolean from './Boolean'
import Number from './Number'
import Object from './Object'
import String from './String'
import Function from './Function'
import Promise from './Promise'
import { LppValue } from '../../type'
export default function (global: Record<string, LppValue>) {
  Number(global)
  Boolean(global)
  String(global)
  Array(global)
  Object(global)
  Function(global)
  Promise(global)
}
