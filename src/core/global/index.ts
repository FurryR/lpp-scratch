import { LppValue } from '../type'
import Type from './type'
import Error from './error'
import JSON from './JSON'
import Math from './Math'

const global: Record<string, LppValue> = {}
Type(global)
Error(global)
JSON(global)
Math(global)
export default global
