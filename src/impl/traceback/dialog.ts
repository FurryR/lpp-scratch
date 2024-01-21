import type ScratchBlocks from 'blockly/core'
import { LppCompatibleBlockly } from '../blockly/definition'

export function show(
  Blockly: LppCompatibleBlockly,
  id: string,
  value: (string | Node)[],
  textAlign: string
): HTMLDivElement | undefined {
  const workspace = Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
  const block = workspace.getBlockById(id) as ScratchBlocks.BlockSvg | null
  if (!block) return
  Blockly.DropDownDiv.hideWithoutAnimation()
  Blockly.DropDownDiv.clearContent()
  const contentDiv = Blockly.DropDownDiv.getContentDiv(),
    elem = document.createElement('div')
  elem.setAttribute('class', 'valueReportBox')
  elem.append(...value)
  elem.style.maxWidth = 'none'
  elem.style.maxHeight = 'none'
  elem.style.textAlign = textAlign
  elem.style.userSelect = 'none'
  contentDiv.appendChild(elem)
  Blockly.DropDownDiv.setColour(
    Blockly.Colours.valueReportBackground,
    Blockly.Colours.valueReportBorder
  )
  Blockly.DropDownDiv.showPositionedByBlock(
    workspace as unknown as ScratchBlocks.Field<unknown>,
    block
  )
  return elem
}
export function IconGroup(icons: (string | Node)[]): HTMLDivElement {
  const iconGroup = document.createElement('div')
  iconGroup.style.float = 'right'
  iconGroup.append(...icons)
  return iconGroup
}
export function CloseIcon(
  Blockly: LppCompatibleBlockly,
  title: string
): HTMLSpanElement {
  const icon = document.createElement('span')
  icon.classList.add('lpp-traceback-icon')
  icon.addEventListener('click', () => {
    Blockly.DropDownDiv.hide()
  })
  icon.title = `❌ ${title}`
  icon.textContent = '❌'
  return icon
}
export function HelpIcon(
  title: string,
  closeTitle: string,
  onOpen: () => void,
  onClose: () => void
) {
  let state = false
  const icon = document.createElement('span')
  icon.classList.add('lpp-traceback-icon')
  icon.textContent = '❓'
  icon.title = `❓ ${title}`
  icon.addEventListener('click', () => {
    if (state) {
      icon.textContent = '❓'
      icon.title = `❓ ${title}`
      onClose()
    } else {
      icon.textContent = '➖'
      icon.title = `➖ ${closeTitle}`
      onOpen()
    }
    state = !state
  })
  return icon
}
export function Title(value: string): HTMLDivElement {
  const text = document.createElement('div')
  text.style.textAlign = 'left'
  text.style.whiteSpace = 'nowrap'
  text.style.overflow = 'hidden'
  text.style.textOverflow = 'ellipsis'
  text.title = text.textContent = value
  return text
}
export function Text(value: string, className?: string): HTMLSpanElement {
  const text = document.createElement('span')
  if (className) text.className = className
  text.textContent = value
  return text
}
export function Div(
  value: (Node | string)[],
  className?: string
): HTMLDivElement {
  const div = document.createElement('div')
  if (className) div.className = className
  div.append(...value)
  return div
}
export const globalStyle = document.createElement('style')
globalStyle.textContent = `
.lpp-traceback-icon {
  transition: text-shadow 0.25s ease-out;
  color: transparent;
  text-shadow: 0 0 0 gray;
}
.lpp-traceback-icon:hover {
  cursor: pointer;
  text-shadow: 0 0 0 gray, 0px 0px 5px silver;
}
`
document.head.appendChild(globalStyle)
