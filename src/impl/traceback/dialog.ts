import type * as ScratchBlocks from 'blockly/core'
import { BlocklyInstance } from '../blockly'

/**
 * Show an advanced visualReport with HTML elements.
 * @param Blockly Blockly instance.
 * @param id Block ID.
 * @param value HTML Nodes.
 * @param textAlign Text alignment.
 * @returns Returns visualReport box element if available.
 */
export function show(
  Blockly: BlocklyInstance,
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
  contentDiv.append(elem)
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
/**
 * Generate an icon group.
 * @param icons Icon nodes.
 * @returns Element.
 */
export function IconGroup(icons: (string | Node)[]): HTMLDivElement {
  const iconGroup = document.createElement('div')
  iconGroup.style.float = 'right'
  iconGroup.append(...icons)
  return iconGroup
}
/**
 * Generate a close icon.
 * @param Blockly Blockly instance.
 * @param title Alternative hint of the close icon.
 * @returns Element.
 */
export function CloseIcon(
  Blockly: BlocklyInstance,
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
/**
 * Generate a help icon.
 * @param title Alternative hint of the show icon.
 * @param hideTitle Alternative hint of the hide icon.
 * @param onShow Handles show behavior.
 * @param onHide Handles hide behavior.
 * @returns Element.
 */
export function HelpIcon(
  title: string,
  hideTitle: string,
  onShow: () => void,
  onHide: () => void
): HTMLSpanElement {
  let state = false
  const icon = document.createElement('span')
  icon.classList.add('lpp-traceback-icon')
  icon.textContent = '❓'
  icon.title = `❓ ${title}`
  icon.addEventListener('click', () => {
    if (state) {
      icon.textContent = '❓'
      icon.title = `❓ ${title}`
      onHide()
    } else {
      icon.textContent = '➖'
      icon.title = `➖ ${hideTitle}`
      onShow()
    }
    state = !state
  })
  return icon
}
/**
 * Generate title of visualReport window.
 * @param value Title text.
 * @returns Element.
 */
export function Title(value: string): HTMLDivElement {
  const text = document.createElement('div')
  text.style.textAlign = 'left'
  text.style.whiteSpace = 'nowrap'
  text.style.overflow = 'hidden'
  text.style.textOverflow = 'ellipsis'
  text.title = text.textContent = value
  return text
}
/**
 * Generate a text element.
 * @param value Text value.
 * @param className Element class name.
 * @returns Element.
 */
export function Text(value: string, className?: string): HTMLSpanElement {
  const text = document.createElement('span')
  if (className) text.className = className
  text.textContent = value
  return text
}
/**
 * Generate an element group (aka div).
 * @param value Nodes.
 * @param className Group class name.
 * @returns Element.
 */
export function Div(
  value: (Node | string)[],
  className?: string
): HTMLDivElement {
  const div = document.createElement('div')
  if (className) div.className = className
  div.append(...value)
  return div
}
/**
 * Global style for traceback module.
 */
export const globalStyle: HTMLStyleElement | undefined = document
  ? document.createElement('style')
  : undefined
if (globalStyle) {
  globalStyle.id = 'lpp-traceback-style'
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
  document.head.append(globalStyle)
}
