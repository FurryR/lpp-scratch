import type * as ScratchBlocks from 'blockly/core'
import {
  BlocklyInstance,
  Block,
  Category,
  Extension,
  Reporter,
  Input,
  Command
} from './blockly'

/**
 * Compatible interface for FieldImageButton.
 */
interface FieldImageButton {
  new (
    src: string,
    width: number,
    height: number,
    callback: () => void,
    opt_alt: string,
    flip_rtl: boolean,
    noPadding: boolean
  ): ScratchBlocks.Field<string>
}
/**
 * Interface for mutable blocks.
 */
interface MutableBlock extends Block {
  length: number
}
/**
 * Detect if the specified block is mutable.
 * @param block Block to detect.
 * @returns True if the block is mutable, false otherwise.
 */
function isMutableBlock(block: Block): block is MutableBlock {
  const v = block as MutableBlock
  return typeof v.length === 'number'
}

/**
 * Generate FieldImageButton.
 * @param Blockly Blockly Blockly.
 * @returns FieldImageButton Blockly.
 * @warning This section is ported from raw JavaScript.
 * @author CST1229
 */
const initalizeField = (() => {
  let cache: FieldImageButton
  return function initalizeField(Blockly: BlocklyInstance) {
    interface Size {
      height: number
      width: number
    }
    type SizeConstructor = {
      new (width: number, height: number): Size
    }
    const scratchBlocks = Blockly as BlocklyInstance & {
      bindEventWithChecks_(
        a: unknown,
        b: unknown,
        c: unknown,
        d: unknown
      ): unknown
      BlockSvg: {
        SEP_SPACE_X: number
      }
    }
    const v = Blockly.FieldImage as unknown as ScratchBlocks.FieldImage & {
      new (...args: unknown[]): {
        fieldGroup_: unknown
        mouseDownWrapper_: unknown
        onMouseDown_: unknown
        init(): void
        getSvgRoot(): SVGGElement | null
        render_(): void
        size_: Size
      }
    }
    // TODO: hover effect just like legacy one
    /**
     * @author CST1229
     */
    return (
      cache ??
      (cache = class FieldImageButton extends v {
        /**
         * Construct a FieldImageButton field.
         * @param src Image source URL.
         * @param width Image width.
         * @param height Image height.
         * @param callback Click callback.
         * @param opt_alt Alternative text of the image.
         * @param flip_rtl Whether to filp the image horizontally when in RTL mode.
         * @param padding Whether the field has padding.
         */
        constructor(
          src: string,
          width: number,
          height: number,
          private callback: () => void,
          opt_alt: string,
          flip_rtl: boolean,
          private padding: boolean
        ) {
          super(src, width, height, opt_alt, flip_rtl)
        }
        /**
         * Initalize the field.
         */
        init() {
          if (this.fieldGroup_) {
            // Image has already been initialized once.
            return
          }
          super.init()
          this.mouseDownWrapper_ = scratchBlocks.bindEventWithChecks_(
            this.getSvgRoot(),
            'mousedown',
            this,
            this.onMouseDown_
          )
          const svgRoot = this.getSvgRoot()
          if (svgRoot) {
            svgRoot.style.cursor = 'pointer'
          }
        }
        /**
         * Click handler.
         */
        showEditor_() {
          if (this.callback) {
            this.callback()
          }
        }
        /**
         * Calculates the size of the field.
         * @returns Size of the field.
         */
        getSize(): Size {
          if (!this.size_.width) {
            this.render_()
          }
          if (this.padding) return this.size_
          return new (this.size_.constructor as SizeConstructor)(
            Math.max(1, this.size_.width - scratchBlocks.BlockSvg.SEP_SPACE_X),
            this.size_.height
          )
        }
        EDITABLE = true
      } as unknown as FieldImageButton)
    )
  }
})()

/// Image from https://github.com/google/blockly-samples/tree/master/plugins/block-plus-minus

/**
 * Image of plus icon.
 */
const plusImage =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
  '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
  'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
  'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
  'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
  '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg=='
/**
 * Image of minus icon.
 */
const minusImage =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
  'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
  'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
  'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K'

/**
 * Defines extension.
 * @param color Extension color.
 * @param runtime Runtime Blockly.
 * @param formatMessage Function to format message.
 * @returns Extension.
 */
export function defineExtension(
  color: string,
  runtime: VM.Runtime,
  formatMessage: (id: string) => string
): Extension {
  /// code from https://github.com/google/blockly-samples/blob/master/plugins/block-plus-minus & Open Roberta Lab
  /**
   * Generates plus icon.
   * @param Blockly Blockly Blockly.
   * @param block Target block.
   * @returns Field.
   */
  const Plus = (
    Blockly: BlocklyInstance,
    block: MutableBlock
  ): ScratchBlocks.Field<string> => {
    const FieldImageButton = initalizeField(Blockly)
    return new FieldImageButton(
      plusImage,
      15,
      15,
      () => {
        Blockly.Events.setGroup(true)
        if (block.mutationToDom && block.domToMutation) {
          const state = block.mutationToDom()
          const oldExtraState = Blockly.Xml.domToText(state)
          const length = state.getAttribute('length')
          if (length !== null) {
            state.setAttribute('length', String(parseInt(length, 10) + 1))
          }
          block.domToMutation(state)
          block.initSvg()
          block.render()
          Blockly.Events.fire(
            new Blockly.Events.BlockChange(
              block,
              'mutation',
              'length',
              oldExtraState,
              Blockly.Xml.domToText(block.mutationToDom())
            )
          )
        }
        Blockly.Events.setGroup(false)
      },
      '+',
      false,
      true
    )
  }
  /**
   * Generates minus icon.
   * @param Blockly Blockly Blockly.
   * @param block Target block.
   * @returns Field.
   */
  const Minus = (
    Blockly: BlocklyInstance,
    block: MutableBlock
  ): ScratchBlocks.Field<string> => {
    const FieldImageButton = initalizeField(Blockly)
    return new FieldImageButton(
      minusImage,
      15,
      15,
      () => {
        Blockly.Events.setGroup(true)
        if (block.mutationToDom && block.domToMutation) {
          const state = block.mutationToDom()
          const oldExtraState = Blockly.Xml.domToText(state)
          const length = state.getAttribute('length')
          if (length !== null) {
            state.setAttribute(
              'length',
              String(Math.max(0, parseInt(length, 10) - 1))
            )
          }
          block.domToMutation(state)
          block.initSvg()
          block.render()
          Blockly.Events.fire(
            new Blockly.Events.BlockChange(
              block,
              'mutation',
              'length',
              oldExtraState,
              Blockly.Xml.domToText(block.mutationToDom())
            )
          )
        }
        Blockly.Events.setGroup(false)
      },
      '-',
      false,
      true
    )
  }
  /**
   * Update buttons for mutable blocks.
   * @param Blockly Blockly Blockly.
   * @param block Target block.
   */
  const updateButton = (Blockly: BlocklyInstance, block: MutableBlock) => {
    if (block.length !== undefined) {
      block.removeInput('MINUS', true)
      block.removeInput('PLUS', true)
      const start = block.inputList[0]?.name
      block.appendDummyInput('PLUS').appendField(Plus(Blockly, block))
      if (start) block.moveInputBefore('PLUS', start)
      if (block.length > 0) {
        block.appendDummyInput('MINUS').appendField(Minus(Blockly, block))
        if (start) block.moveInputBefore('MINUS', start)
      }
    }
  }
  // TODO: optimization: only delete changed inputs for performance
  /**
   * Clean unused argument from vm.
   * @param block Specified block.
   * @author CST1229
   */
  const cleanInputs = (block: ScratchBlocks.BlockSvg) => {
    const target = runtime.getEditingTarget()
    const vmBlock = target?.blocks.getBlock(block.id)
    if (!vmBlock || !target) return

    const usedInputs = new Set(block.inputList.map(i => i.name))

    const inputs = vmBlock.inputs
    for (const name of Object.keys(inputs)) {
      const input = inputs[name]
      if (!usedInputs.has(name)) {
        const blocks = target.blocks as unknown as {
          deleteBlock(input: unknown): unknown
        }
        blocks.deleteBlock(input.block)
        blocks.deleteBlock(input.shadow)
        delete inputs[name]
      }
    }
  }
  return new Extension('lpp', color)
    .register(
      /// Builtin
      new Category(() => `#️⃣ ${formatMessage('lpp.category.builtin')}`)
        .register(
          'builtinType',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.builtin.type'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['Boolean', 'Boolean'],
                ['Number', 'Number'],
                ['String', 'String'],
                ['Array', 'Array'],
                ['Object', 'Object'],
                ['Function', 'Function'],
                ['Promise', 'Promise'],
                ['Generator', 'Generator'],
                ['AsyncGenerator', 'AsyncGenerator']
              ]) as ScratchBlocks.Field<string>,
              'value'
            )
          })
        )
        .register(
          'builtinError',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.builtin.error'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['Error', 'Error'],
                ['IllegalInvocationError', 'IllegalInvocationError'],
                ['SyntaxError', 'SyntaxError']
              ]) as ScratchBlocks.Field<string>,
              'value'
            )
          })
        )
        .register(
          'builtinUtility',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.builtin.error'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['JSON', 'JSON'],
                ['Math', 'Math']
              ]) as ScratchBlocks.Field<string>,
              'value'
            )
          })
        )
    )
    .register(
      /// Construct
      new Category(() => `🚧 ${formatMessage('lpp.category.construct')}`)
        .register(
          'constructLiteral',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.construct.literal'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['null', 'null'],
                ['true', 'true'],
                ['false', 'false'],
                ['NaN', 'NaN'],
                ['Infinity', 'Infinity']
              ]) as ScratchBlocks.Field<string>,
              'value'
            )
          })
        )
        .register(
          'constructNumber',
          Reporter.Square((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.construct.Number'))
            Input.Text(block, 'BEGIN', [
              formatMessage('lpp.block.construct.Number'),
              '('
            ])
            Input.String(block, 'value', '10')
            Input.Text(block, 'END', `)`)
          })
        )
        .register(
          'constructString',
          Reporter.Square((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.construct.String'))
            Input.Text(block, 'BEGIN', [
              formatMessage('lpp.block.construct.String'),
              '('
            ])
            Input.String(block, 'value', '🌟')
            Input.Text(block, 'END', `)`)
          })
        )
        .register(
          'constructArray',
          Reporter.Square((Blockly, block) => ({
            init() {
              block.setTooltip(formatMessage('lpp.tooltip.construct.Array'))
              const property = block as MutableBlock
              Input.Text(block, 'BEGIN', '[')
              /// Member
              Input.Text(block, 'END', ']')
              property.length = 0
              updateButton(Blockly, property)
            },
            mutationToDom() {
              const elem = document.createElement('mutation')
              if (isMutableBlock(block)) {
                elem.setAttribute('length', String(block.length))
              }
              return elem
            },
            domToMutation(mutation: HTMLElement) {
              const length = parseInt(
                mutation.getAttribute('length') ?? '0',
                10
              )
              if (isMutableBlock(block)) {
                if (length > block.length) {
                  for (let i = block.length; i < length; i++) {
                    if (i > 0) {
                      block.appendDummyInput(`COMMA_${i}`).appendField(',')
                      block.moveInputBefore(`COMMA_${i}`, 'END')
                    }
                    Input.Any(block, `ARG_${i}`)
                    block.moveInputBefore(`ARG_${i}`, 'END')
                  }
                } else {
                  for (let i = length; i < block.length; i++) {
                    block.removeInput(`ARG_${i}`, true)
                    block.removeInput(`COMMA_${i}`, true)
                  }
                  cleanInputs(block)
                }
                block.length = length
                updateButton(Blockly, block)
              }
            }
          }))
        )
        .register(
          'constructObject',
          Reporter.Square((Blockly, block) => ({
            init() {
              block.setTooltip(formatMessage('lpp.tooltip.construct.Object'))
              const property = block as MutableBlock
              Input.Text(block, 'BEGIN', '{')
              /// Member
              Input.Text(block, 'END', '}')
              property.length = 0
              updateButton(Blockly, property)
            },
            mutationToDom() {
              const elem = document.createElement('mutation')
              if (isMutableBlock(block)) {
                elem.setAttribute('length', String(block.length))
              }
              return elem
            },
            domToMutation(mutation: HTMLElement) {
              const length = parseInt(
                mutation.getAttribute('length') ?? '0',
                10
              )
              if (isMutableBlock(block)) {
                if (length > block.length) {
                  for (let i = block.length; i < length; i++) {
                    if (i > 0) {
                      block.appendDummyInput(`COMMA_${i}`).appendField(',')
                      block.moveInputBefore(`COMMA_${i}`, 'END')
                    }
                    Input.String(block, `KEY_${i}`, '')
                    Input.Text(block, `COLON_${i}`, ':')
                    Input.Any(block, `VALUE_${i}`)
                    block.moveInputBefore(`VALUE_${i}`, 'END')
                    block.moveInputBefore(`COLON_${i}`, `VALUE_${i}`)
                    block.moveInputBefore(`KEY_${i}`, `COLON_${i}`)
                  }
                } else {
                  for (let i = length; i < block.length; i++) {
                    block.removeInput(`KEY_${i}`, true)
                    block.removeInput(`COLON_${i}`, true)
                    block.removeInput(`VALUE_${i}`, true)
                    block.removeInput(`COMMA_${i}`, true)
                  }
                  cleanInputs(block)
                }
                block.length = length
                updateButton(Blockly, block)
              }
            }
          }))
        )
        .register(
          'constructFunction',
          Reporter.Square((Blockly, block) => ({
            init() {
              block.setTooltip(formatMessage('lpp.tooltip.construct.Function'))
              const property = block as MutableBlock
              Input.Text(block, 'BEGIN', [
                formatMessage('lpp.block.construct.Function'),
                '('
              ])
              /// Signature
              Input.Text(block, 'END', ')')
              Input.Statement(block, 'SUBSTACK')
              property.length = 0
              updateButton(Blockly, property)
            },
            mutationToDom() {
              const elem = document.createElement('mutation')
              if (isMutableBlock(block)) {
                elem.setAttribute('length', String(block.length))
              }
              return elem
            },
            domToMutation(mutation: HTMLElement) {
              const length = parseInt(
                mutation.getAttribute('length') ?? '0',
                10
              )
              if (isMutableBlock(block)) {
                if (length > block.length) {
                  for (let i = block.length; i < length; i++) {
                    if (i > 0) {
                      block.appendDummyInput(`COMMA_${i}`).appendField(',')
                      block.moveInputBefore(`COMMA_${i}`, 'END')
                    }
                    Input.String(block, `ARG_${i}`, '')
                    block.moveInputBefore(`ARG_${i}`, 'END')
                  }
                } else {
                  for (let i = length; i < block.length; i++) {
                    block.removeInput(`ARG_${i}`, true)
                    block.removeInput(`COMMA_${i}`, true)
                  }
                  cleanInputs(block)
                }
                block.length = length
                updateButton(Blockly, block)
              }
            }
          }))
        )
    )
    .register(
      new Category(() => `🔢 ${formatMessage('lpp.category.operator')}`)
        .register(
          'binaryOp',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.operator.binaryOp'))
            Input.String(block, 'lhs', '')
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['=', '='],
                ['.', '.'],
                ['+', '+'],
                ['-', '-'],
                ['*', '*'],
                ['/', '/'],
                ['%', '%'],
                ['==', '=='],
                ['!=', '!='],
                ['>', '>'],
                ['<', '<'],
                ['>=', '>='],
                ['<=', '<='],
                ['&&', '&&'],
                ['||', '||'],
                ['<<', '<<'],
                ['>>', '>>'],
                ['>>>', '>>>'],
                ['&', '&'],
                ['|', '|'],
                ['^', '^'],
                ['instanceof', 'instanceof'],
                ['in', 'in']
              ]) as ScratchBlocks.Field<string>,
              'op'
            )
            Input.String(block, 'rhs', '')
          })
        )
        .register(
          'unaryOp',
          Reporter.Square((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.operator.unaryOp'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['+', '+'],
                ['-', '-'],
                ['!', '!'],
                ['~', '~'],
                ['delete', 'delete'],
                ['await', 'await'],
                ['yield', 'yield'],
                ['yield*', 'yield*']
              ]) as ScratchBlocks.Field<string>,
              'op'
            )
            Input.Any(block, 'value')
          })
        )
        .register(
          'new',
          Reporter.Square((Blockly, block) => ({
            init() {
              block.setTooltip(formatMessage('lpp.tooltip.operator.new'))
              const property = block as MutableBlock
              Input.Text(block, 'LABEL', 'new')
              Input.Any(block, 'fn')
              Input.Text(block, 'BEGIN', '(')
              /// Arguments
              Input.Text(block, 'END', ')')
              property.length = 0
              updateButton(Blockly, property)
            },
            mutationToDom() {
              const elem = document.createElement('mutation')
              if (isMutableBlock(block)) {
                elem.setAttribute('length', String(block.length))
              }
              return elem
            },
            domToMutation(mutation: HTMLElement) {
              const length = parseInt(
                mutation.getAttribute('length') ?? '0',
                10
              )
              if (isMutableBlock(block)) {
                if (length > block.length) {
                  for (let i = block.length; i < length; i++) {
                    if (i > 0) {
                      block.appendDummyInput(`COMMA_${i}`).appendField(',')
                      block.moveInputBefore(`COMMA_${i}`, 'END')
                    }
                    Input.Any(block, `ARG_${i}`)
                    block.moveInputBefore(`ARG_${i}`, 'END')
                  }
                } else {
                  for (let i = length; i < block.length; i++) {
                    block.removeInput(`ARG_${i}`, true)
                    block.removeInput(`COMMA_${i}`, true)
                  }
                  cleanInputs(block)
                }
                block.length = length
                updateButton(Blockly, block)
              }
            }
          }))
        )
        .register(
          'call',
          Reporter.Square((Blockly, block) => ({
            init() {
              block.setTooltip(formatMessage('lpp.tooltip.operator.call'))
              const property = block as MutableBlock
              Input.Any(block, 'fn')
              Input.Text(block, 'BEGIN', '(')
              /// Arguments
              Input.Text(block, 'END', ')')
              property.length = 0
              updateButton(Blockly, property)
            },
            mutationToDom() {
              const elem = document.createElement('mutation')
              if (isMutableBlock(block)) {
                elem.setAttribute('length', String(block.length))
              }
              return elem
            },
            domToMutation(mutation: HTMLElement) {
              const length = parseInt(
                mutation.getAttribute('length') ?? '0',
                10
              )
              if (isMutableBlock(block)) {
                if (length > block.length) {
                  for (let i = block.length; i < length; i++) {
                    if (i > 0) {
                      block.appendDummyInput(`COMMA_${i}`).appendField(',')
                      block.moveInputBefore(`COMMA_${i}`, 'END')
                    }
                    Input.Any(block, `ARG_${i}`)
                    block.moveInputBefore(`ARG_${i}`, 'END')
                  }
                } else {
                  for (let i = length; i < block.length; i++) {
                    block.removeInput(`ARG_${i}`, true)
                    block.removeInput(`COMMA_${i}`, true)
                  }
                  cleanInputs(block)
                }
                block.length = length
                updateButton(Blockly, block)
              }
            }
          }))
        )
        .register(
          'self',
          Reporter.Square((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.operator.self'))
            block.setCheckboxInFlyout(false)
            Input.Text(block, 'LABEL', formatMessage('lpp.block.operator.self'))
          })
        )
        .register(
          'var',
          Reporter.Square((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.operator.var'))
            Input.Text(block, 'LABEL', formatMessage('lpp.block.operator.var'))
            Input.String(block, 'name', '🐺')
          })
        )
    )
    .register(
      new Category(() => `🤖 ${formatMessage('lpp.category.statement')}`)
        .register(
          'return',
          Command(
            (_, block) => () => {
              block.setTooltip(formatMessage('lpp.tooltip.statement.return'))
              Input.Text(
                block,
                'LABEL',
                formatMessage('lpp.block.statement.return')
              )
              Input.Any(block, 'value')
            },
            true
          )
        )
        .register(
          'throw',
          Command(
            (_, block) => () => {
              block.setTooltip(formatMessage('lpp.tooltip.statement.throw'))
              Input.Text(
                block,
                'LABEL',
                formatMessage('lpp.block.statement.throw')
              )
              Input.Any(block, 'value')
            },
            true
          )
        )
        .register(
          'scope',
          Command((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.statement.scope'))
            Input.Text(
              block,
              'LABEL',
              formatMessage('lpp.block.statement.scope')
            )
            Input.Statement(block, 'SUBSTACK')
          })
        )
        .register(
          'try',
          Command((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.statement.try'))
            Input.Text(block, 'TRY', formatMessage('lpp.block.statement.try.1'))
            Input.Statement(block, 'SUBSTACK')
            Input.Text(
              block,
              'CATCH',
              formatMessage('lpp.block.statement.try.2')
            )
            Input.Any(block, 'var')
            Input.Statement(block, 'SUBSTACK_2')
          })
        )
        .register(
          'nop',
          Command((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.statement.nop'))
            Input.Any(block, 'value')
          })
        )
    )
}
