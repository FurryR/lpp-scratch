import { LppValue } from '../../type'
import Error from './Error'
import IllegalInvocationError from './IllegalInvocationError'
import SyntaxError from './SyntaxError'

export default function (global: Record<string, LppValue>) {
  Error(global)
  IllegalInvocationError(global)
  SyntaxError(global)
}
