import {
  LppValue,
  LppArray,
  LppObject,
  LppFunction,
  LppConstant,
  Global
} from 'src/core'
import { Dialog } from '.'
import { BlocklyInstance } from '../blockly/definition'
import { hasMetadata } from '../serialization'
import type VM from 'scratch-vm'
import type ScratchBlocks from 'blockly/core'

export function Inspector(
  Blockly: BlocklyInstance,
  vm: VM,
  formatMessage: (id: string) => string,
  value: LppValue
): HTMLSpanElement {
  function ExtendIcon(
    title: string,
    closeTitle: string,
    onOpen: () => void,
    onClose: () => void
  ) {
    let state = false
    const icon = document.createElement('span')
    icon.classList.add('lpp-traceback-icon')
    icon.textContent = '➕'
    icon.title = `➕ ${title}`
    icon.addEventListener('click', () => {
      if (state) {
        icon.textContent = '➕'
        icon.title = `➕ ${title}`
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
  function objView(
    value: LppArray | LppObject | LppFunction
  ): HTMLUListElement {
    function keyValue(
      index: string,
      value: LppValue,
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
    const metadata = value instanceof LppFunction && hasMetadata(value)
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
            value instanceof LppArray
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
    if (metadata && !value.isTypehint) {
      const subelem = document.createElement('li')
      subelem.append(
        Dialog.Text(
          '[[FunctionLocation]]',
          'lpp-code lpp-inspector-key-constructor'
        ),
        Dialog.Text(` ➡️ `)
      )
      const traceback = document.createElement('span')
      traceback.classList.add('lpp-code')
      if (
        value.target &&
        value.block &&
        vm.runtime.getTargetById(value.target)
      ) {
        const workspace =
          Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
        traceback.classList.add('lpp-traceback-stack-enabled')
        const { target, block } = value
        traceback.textContent = block
        traceback.title = formatMessage(
          'lpp.tooltip.button.scrollToBlockEnabled'
        )
        traceback.addEventListener('click', () => {
          const box =
            Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
              'valueReportBox'
            )[0]
          vm.setEditingTarget(target)
          workspace.centerOnBlock(block, true)
          Blockly.DropDownDiv.hideWithoutAnimation()
          Blockly.DropDownDiv.clearContent()
          Blockly.DropDownDiv.getContentDiv().append(box)
          Blockly.DropDownDiv.showPositionedByBlock(
            workspace as unknown as ScratchBlocks.Field<unknown>,
            workspace.getBlockById(block) as ScratchBlocks.BlockSvg
          )
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
    value instanceof LppFunction
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
        `f (${hasMetadata(value) ? value.signature.join(', ') : ''})`,
        'lpp-code'
      )
      code.style.fontStyle = 'italic'
    } else {
      code = Dialog.Text(value.value.size === 0 ? '{}' : '{...}', 'lpp-code')
    }
    if (
      value instanceof LppFunction &&
      hasMetadata(value) &&
      value.target &&
      value.block &&
      vm.runtime.getTargetById(value.target)
    ) {
      const workspace = Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
      const { target, block } = value
      code.title = formatMessage('lpp.tooltip.button.scrollToBlockEnabled')
      code.classList.add('lpp-traceback-stack-enabled')
      code.addEventListener('click', () => {
        const box =
          Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
            'valueReportBox'
          )[0]
        vm.setEditingTarget(target)
        workspace.centerOnBlock(block, true)
        Blockly.DropDownDiv.hideWithoutAnimation()
        Blockly.DropDownDiv.clearContent()
        Blockly.DropDownDiv.getContentDiv().append(box)
        Blockly.DropDownDiv.showPositionedByBlock(
          workspace as unknown as ScratchBlocks.Field<unknown>,
          workspace.getBlockById(block) as ScratchBlocks.BlockSvg
        )
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
