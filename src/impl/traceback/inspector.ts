import {
  LppValue,
  LppArray,
  LppObject,
  LppFunction,
  LppConstant,
  Global
} from '../../core'
import { Dialog } from '.'
import { BlocklyInstance } from '../blockly'
import { TypeMetadata, hasMetadata } from '../metadata'
import type { VM } from '../typing'
import type * as ScratchBlocks from 'blockly/core'
import { ScratchMetadata } from '../serialization'
import { LppBoundArg } from '../boundarg'

/**
 * Generate an inspector of specified object.
 * @param Blockly Blockly instance.
 * @param vm VM instance.
 * @param formatMessage Function to format message.
 * @param value The value to be inspected.
 * @returns Element.
 */
export function Inspector(
  Blockly: BlocklyInstance | undefined,
  vm: VM,
  formatMessage: (id: string) => string,
  value: LppValue | LppBoundArg
): HTMLSpanElement {
  /**
   * Generate an extend icon.
   * @param title Alternative hint of the show icon.
   * @param hideTitle Alternative hint of the hide icon.
   * @param onShow Handles show behavior.
   * @param onHide Handles hide behavior.
   * @returns Element.
   */
  function ExtendIcon(
    title: string,
    hideTitle: string,
    onShow: () => void,
    onHide: () => void
  ): HTMLSpanElement {
    let state = false
    const icon = document.createElement('span')
    icon.classList.add('lpp-traceback-icon')
    icon.textContent = '➕'
    icon.title = `➕ ${title}`
    icon.addEventListener('click', () => {
      if (state) {
        icon.textContent = '➕'
        icon.title = `➕ ${title}`
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
   * Internal function for member list.
   * @param value Object.
   * @returns List element.
   */
  function objView(
    value: LppArray | LppObject | LppFunction | LppBoundArg
  ): HTMLUListElement {
    function keyValue(
      index: string,
      value: LppValue | LppBoundArg,
      isArray: boolean
    ): HTMLLIElement {
      const subelem = document.createElement('li')
      subelem.append(
        isArray
          ? Dialog.Text(
              index,
              'lpp-code lpp-inspector-number lpp-inspector-key'
            )
          : /^[$_a-zA-Z][$_0-9a-zA-Z]*$/.test(index)
            ? Dialog.Text(
                index,
                `lpp-code lpp-inspector-key${['constructor', 'prototype'].includes(String(index)) ? `-${index}` : ''}`
              )
            : Dialog.Text(
                JSON.stringify(index),
                'lpp-code lpp-inspector-string lpp-inspector-key'
              ),
        Dialog.Text(` ➡️ `)
      )
      subelem.append(Inspector(Blockly, vm, formatMessage, value))
      return subelem
    }
    const metadata =
      (value instanceof LppObject || value instanceof LppFunction) &&
      hasMetadata(value)
    const div = document.createElement('ul')
    div.classList.add('lpp-list')
    for (const [index, v] of value.value.entries()) {
      if (
        (!(value instanceof LppFunction) || index !== 'prototype') &&
        index !== 'constructor'
      )
        div.append(
          keyValue(
            String(index),
            v ?? new LppConstant(null),
            value instanceof LppArray || value instanceof LppBoundArg
          )
        )
    }
    if (value instanceof LppFunction)
      div.append(
        keyValue(
          'prototype',
          value.value.get('prototype') ?? new LppConstant(null),
          false
        )
      )
    if (
      value instanceof LppArray ||
      value instanceof LppFunction ||
      value instanceof LppObject
    ) {
      div.append(
        keyValue(
          'constructor',
          value instanceof LppArray
            ? Global.Array
            : value.value.get('constructor') ??
                (value instanceof LppFunction
                  ? Global.Function
                  : Global.Object),
          false
        )
      )
    }
    if (metadata && value.metadata instanceof ScratchMetadata) {
      const subelem = document.createElement('li')
      subelem.append(
        Dialog.Text(
          '[[FunctionLocation]]',
          'lpp-code lpp-inspector-key-constructor'
        ),
        Dialog.Text(` ➡︎ `)
      )
      const traceback = document.createElement('span')
      traceback.classList.add('lpp-code')
      if (
        Blockly &&
        value.metadata.sprite &&
        vm.runtime.getTargetById(value.metadata.sprite)
      ) {
        const workspace =
          Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
        traceback.classList.add('lpp-traceback-stack-enabled')
        const { sprite, blocks } = value.metadata
        traceback.textContent = blocks[1]
        traceback.title = formatMessage(
          'lpp.tooltip.button.scrollToBlockEnabled'
        )
        traceback.addEventListener('click', () => {
          const box =
            Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
              'valueReportBox'
            )[0]
          vm.setEditingTarget(sprite)
          workspace.centerOnBlock(blocks[1], true)
          if (box) {
            Blockly.DropDownDiv.hideWithoutAnimation()
            Blockly.DropDownDiv.clearContent()
            Blockly.DropDownDiv.getContentDiv().append(box)
            Blockly.DropDownDiv.showPositionedByBlock(
              workspace as unknown as ScratchBlocks.Field<unknown>,
              workspace.getBlockById(blocks[1]) as ScratchBlocks.BlockSvg
            )
          }
        })
      } else {
        traceback.classList.add('lpp-inspector-null')
        traceback.textContent = 'null'
      }
      subelem.append(traceback)
      div.append(subelem)
    }
    return div
  }
  if (value instanceof LppConstant) {
    if (value.value === null)
      return Dialog.Text('null', 'lpp-code lpp-inspector-null')
    switch (typeof value.value) {
      case 'boolean':
      case 'number':
        return Dialog.Text(String(value.value), 'lpp-code lpp-inspector-number')
      case 'string':
        return Dialog.Text(
          JSON.stringify(value.value),
          'lpp-code lpp-inspector-string'
        )
    }
  } else if (
    value instanceof LppArray ||
    value instanceof LppObject ||
    value instanceof LppFunction ||
    value instanceof LppBoundArg
  ) {
    let v: HTMLUListElement | undefined
    const btn = ExtendIcon(
      formatMessage('lpp.tooltip.button.help.more'),
      formatMessage('lpp.tooltip.button.help.less'),
      () => {
        if (!v) span.appendChild((v = objView(value)))
        else v.style.display = 'block'
      },
      () => {
        if (v) v.style.display = 'none'
      }
    )
    const span = document.createElement('span')
    span.style.lineHeight = '80%'
    let code: HTMLSpanElement
    if (value instanceof LppArray) {
      code = Dialog.Text(value.value.length === 0 ? '[]' : '[...]', 'lpp-code')
    } else if (value instanceof LppFunction) {
      code = Dialog.Text(
        `f (${hasMetadata(value) && value.metadata instanceof TypeMetadata ? value.metadata.signature.join(', ') : ''})`,
        'lpp-code'
      )
      code.style.fontStyle = 'italic'
    } else if (value instanceof LppObject) {
      code = Dialog.Text(value.value.size === 0 ? '{}' : '{...}', 'lpp-code')
    } else {
      code = Dialog.Text(value.value.length === 0 ? '()' : '(...)', 'lpp-code')
    }
    if (
      Blockly &&
      (value instanceof LppFunction || value instanceof LppObject) &&
      hasMetadata(value) &&
      value.metadata instanceof ScratchMetadata &&
      value.metadata.sprite &&
      vm.runtime.getTargetById(value.metadata.sprite)
    ) {
      const workspace = Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
      const { sprite, blocks } = value.metadata
      code.title = formatMessage('lpp.tooltip.button.scrollToBlockEnabled')
      code.classList.add('lpp-traceback-stack-enabled')
      code.addEventListener('click', () => {
        const box =
          Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
            'valueReportBox'
          )[0]
        vm.setEditingTarget(sprite)
        workspace.centerOnBlock(blocks[1], true)
        if (box) {
          Blockly.DropDownDiv.hideWithoutAnimation()
          Blockly.DropDownDiv.clearContent()
          Blockly.DropDownDiv.getContentDiv().append(box)
          Blockly.DropDownDiv.showPositionedByBlock(
            workspace as unknown as ScratchBlocks.Field<unknown>,
            workspace.getBlockById(blocks[1]) as ScratchBlocks.BlockSvg
          )
        }
      })
    } else {
      code.addEventListener('click', () => {
        btn.click()
      })
    }
    span.append(btn, Dialog.Text(' '), code)
    return span
  }
  throw new Error('lpp: unknown value')
}
if (Dialog.globalStyle) {
  Dialog.globalStyle.textContent += `
.lpp-inspector-null {
  color: gray;
  user-select: text;
}
.lpp-inspector-key {
  font-weight: bold;
  user-select: text;
}
.lpp-inspector-key-prototype {
  font-weight: bold;
  color: gray;
  user-select: text;
}
.lpp-inspector-key-constructor {
  color: gray;
  user-select: text;
}
.lpp-inspector-number {
  color: blue;
  user-select: text;
}
.lpp-inspector-string {
  color: green;
  user-select: text;
}
`
}
