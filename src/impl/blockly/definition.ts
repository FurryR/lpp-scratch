import type * as ScratchBlocks from 'blockly/core'
type BlocklyInstance = typeof ScratchBlocks
import type VM from 'scratch-vm'
export interface LppCompatibleBlock extends ScratchBlocks.BlockSvg {
  plus?(): void
  minus?(): void
  setCategory(category: string): void
}
export interface LppCompatibleBlockly extends BlocklyInstance {
  MutatorPlus?: {
    new (): object
  }
  MutatorMinus?: {
    new (): object
  }
  Mutator: {
    new (_: null): ScratchBlocks.IIcon & {
      block_: LppCompatibleBlock
      createIcon(): void
    }
  }
  utils: {
    createSvgElement(a: string, b: unknown, c: unknown): unknown
    isRightButton(a: unknown): boolean
  } & typeof ScratchBlocks.utils
  Colours: {
    valueReportBackground: string
    valueReportBorder: string
  }
  OUTPUT_SHAPE_SQUARE: number
  OUTPUT_SHAPE_ROUND: number
}
export function defineBlocks(
  Blockly: LppCompatibleBlockly,
  color: string,
  state: { mutatorClick: boolean },
  vm: VM,
  formatMessage: (id: string) => string
) {
  const simpleBlock = (fn: (this: LppCompatibleBlock) => unknown) => ({
    get: () => ({ init: fn }),
    set: () => void 0
  })
  const advancedBlock = (v: Record<string, unknown>) => ({
    get: () => v,
    set: () => void 0
  })
  /// code from https://github.com/google/blockly-samples/blob/master/plugins/block-plus-minus & Open Roberta Lab
  function getExtraBlockState(block: ScratchBlocks.Block) {
    return block.mutationToDom
      ? Blockly.Xml.domToText(block.mutationToDom())
      : ''
  }
  class MutatorPlus extends Blockly.Mutator {
    drawIcon_(a: unknown) {
      Blockly.utils.createSvgElement(
        'path',
        {
          class: 'blocklyIconSymbol',
          height: '15',
          width: '15',
          opacity: '1',
          d: 'M18 10h-4v-4c0-1.104-.896-2-2-2s-2 .896-2 2l.071 4h-4.071c-1.104 0-2 .896-2 2s.896 2 2 2l4.071-.071-.071 4.071c0 1.104.896 2 2 2s2-.896 2-2v-4.071l4 .071c1.104 0 2-.896 2-2s-.896-2-2-2z',
          transform: 'scale(0.67) translate(0,8.45)' // 0.67
        },
        a
      )
    }
    iconClick_(a: unknown) {
      if (
        !(
          (
            this.block_.workspace as ScratchBlocks.Workspace & {
              isDragging(): boolean
            }
          ).isDragging() || Blockly.utils.isRightButton(a)
        )
      ) {
        const block = this.block_
        state.mutatorClick = true
        Blockly.Events.setGroup(true)
        const oldExtraState = getExtraBlockState(block)
        if (block.plus) block.plus()
        const newExtraState = getExtraBlockState(block)
        if (oldExtraState != newExtraState) {
          Blockly.Events.fire(
            new Blockly.Events.BlockChange(
              block,
              'mutation',
              null,
              oldExtraState,
              newExtraState
            )
          )
        }
        Blockly.Events.setGroup(false)
      }
    }
    constructor() {
      super(null)
    }
  }
  class MutatorMinus extends Blockly.Mutator {
    drawIcon_(a: unknown) {
      Blockly.utils.createSvgElement(
        'path',
        {
          class: 'blocklyIconSymbol',
          height: '15',
          width: '15',
          opacity: '1',
          d: 'M18 11h-12c-1.104 0-2 .896-2 2s.896 2 2 2h12c1.104 0 2-.896 2-2s-.896-2-2-2z',
          transform: 'scale(0.67) translate(0,8.45)' // 0.67
        },
        a
      )
    }
    iconClick_(a: unknown) {
      if (
        !(
          (
            this.block_.workspace as ScratchBlocks.Workspace & {
              isDragging(): boolean
            }
          ).isDragging() || Blockly.utils.isRightButton(a)
        )
      ) {
        const block = this.block_
        state.mutatorClick = true
        Blockly.Events.setGroup(true)
        const oldExtraState = getExtraBlockState(block)
        if (block.minus) block.minus()
        const newExtraState = getExtraBlockState(block)
        if (oldExtraState != newExtraState) {
          Blockly.Events.fire(
            new Blockly.Events.BlockChange(
              block,
              'mutation',
              null,
              oldExtraState,
              newExtraState
            )
          )
        }
        Blockly.Events.setGroup(false)
      }
    }
    constructor() {
      super(null)
    }
  }
  Blockly.MutatorPlus = MutatorPlus
  Blockly.MutatorMinus = MutatorMinus
  type PatchedBlock = LppCompatibleBlock & {
    setMutatorPlus(a?: MutatorPlus): void
    setMutatorMinus(a?: MutatorMinus): void
    mutatorPlus?: MutatorPlus
    mutatorMinus?: MutatorMinus
    length: number
  }
  ;(Blockly.BlockSvg.prototype as PatchedBlock).setMutatorPlus = function (
    a?: MutatorPlus
  ) {
    if (this.mutatorPlus && this.mutatorPlus !== a) {
      this.mutatorPlus.dispose()
    }
    if ((this.mutatorPlus = a)) {
      this.mutatorPlus.block_ = this
      if (this.rendered) this.mutatorPlus.createIcon()
    }
  }
  ;(Blockly.BlockSvg.prototype as PatchedBlock).setMutatorMinus = function (
    a?: MutatorMinus
  ) {
    if (this.mutatorMinus && this.mutatorMinus !== a) {
      this.mutatorMinus.dispose()
    }
    if ((this.mutatorMinus = a)) {
      this.mutatorMinus.block_ = this
      if (this.rendered) this.mutatorMinus.createIcon()
    }
  }
  const _update = Blockly.InsertionMarkerManager.prototype.update
  Blockly.InsertionMarkerManager.prototype.update = function (a, b) {
    const firstMarker = (this as unknown as { firstMarker_: PatchedBlock })
      .firstMarker_
    if (firstMarker.mutatorPlus || firstMarker.mutatorMinus) {
      try {
        return _update.call(this, a, b)
      } catch (e) {
        Blockly.Events.enable()
        return
      }
    }
    return _update.call(this, a, b)
  }
  const _getIcons = Blockly.BlockSvg.prototype.getIcons
  Blockly.BlockSvg.prototype.getIcons = function () {
    const res = _getIcons.call(this)
    const self = this as PatchedBlock
    self.mutatorPlus &&
      res.push(self.mutatorPlus as unknown as ScratchBlocks.IIcon)
    self.mutatorMinus && res.push(self.mutatorMinus)
    return res
  }
  /**
   * Clean unused argument from vm.
   * @author CST1229
   */
  function cleanInputs(this: ScratchBlocks.BlockSvg) {
    const target = vm.editingTarget
    if (!target) return
    const vmBlock = target.blocks.getBlock(this.id)
    if (!vmBlock) return

    const usedInputs = new Set(this.inputList.map((i) => i?.name))

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
  type Shadowable = ScratchBlocks.Input & {
    connection: { setShadowDom(a: unknown): void; respawnShadow_(): void }
  }
  /**
   * Append the shadow to the field.
   * @param field Blockly field.
   * @param defaultValue default value.
   * @returns Field.
   */
  function addShadow(field: Shadowable, defaultValue?: string): Shadowable {
    const elem = document.createElement('shadow')
    const child = document.createElement('field')
    elem.setAttribute('type', 'text')
    child.setAttribute('name', 'TEXT')
    child.textContent = defaultValue ?? ''
    elem.appendChild(child)
    field.connection.setShadowDom(elem)
    field.connection.respawnShadow_()
    return field
  }
  /**
   * Append null shadow to the field.
   * @param field Blockly field.
   * @returns Field.
   */
  function addNullShadow(field: Shadowable) {
    field.connection.setShadowDom(null)
    field.connection.respawnShadow_()
    return field
  }
  Object.defineProperties(Blockly.Blocks, {
    // Builtins
    lpp_builtinType: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_builtinType',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'field_dropdown',
            name: 'value',
            options: [
              ['Boolean', 'Boolean'],
              ['Number', 'Number'],
              ['String', 'String'],
              ['Array', 'Array'],
              ['Object', 'Object'],
              ['Function', 'Function'],
              ['Promise', 'Promise'],
              ['Generator', 'Generator'],
              ['AsyncGenerator', 'AsyncGenerator']
            ]
          }
        ],
        message0: '%1',
        tooltip: formatMessage('lpp.tooltip.builtin.type')
      })
    }),
    lpp_builtinError: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_builtinError',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'field_dropdown',
            name: 'value',
            options: [
              ['Error', 'Error'],
              ['IllegalInvocationError', 'IllegalInvocationError'],
              ['SyntaxError', 'SyntaxError']
            ]
          }
        ],
        message0: '%1',
        tooltip: formatMessage('lpp.tooltip.builtin.error')
      })
    }),
    lpp_builtinUtility: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_builtinError',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'field_dropdown',
            name: 'value',
            options: [
              ['JSON', 'JSON'],
              ['Math', 'Math']
            ]
          }
        ],
        message0: '%1',
        tooltip: formatMessage('lpp.tooltip.builtin.utility')
      })
    }),
    // Constructors
    lpp_constructLiteral: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_constructLiteral',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'field_dropdown',
            name: 'value',
            options: [
              ['null', 'null'],
              ['true', 'true'],
              ['false', 'false'],
              ['NaN', 'NaN'],
              ['Infinity', 'Infinity']
            ]
          }
        ],
        message0: '%1',
        tooltip: formatMessage('lpp.tooltip.construct.literal')
      })
    }),
    lpp_constructNumber: simpleBlock(function () {
      this.setCategory('lpp')
      this.setColour(color)
      this.setOutput(true, 'String')
      this.setInputsInline(true)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.appendDummyInput()
        .appendField(formatMessage('lpp.block.construct.Number'))
        .appendField('(')
      this.appendValueInput('value')
      this.appendDummyInput().appendField(')')
      this.setTooltip(formatMessage('lpp.tooltip.construct.Number'))
    }),
    lpp_constructString: simpleBlock(function () {
      this.setCategory('lpp')
      this.setColour(color)
      this.setOutput(true, 'String')
      this.setInputsInline(true)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.appendDummyInput()
        .appendField(formatMessage('lpp.block.construct.String'))
        .appendField('(')
      this.appendValueInput('value')
      this.appendDummyInput().appendField(')')
      this.setTooltip(formatMessage('lpp.tooltip.construct.String'))
    }),
    lpp_constructArray: advancedBlock({
      init: function (this: PatchedBlock) {
        this.setCategory('lpp')
        this.setMutatorPlus(new MutatorPlus())
        this.setColour(color)
        this.setOutput(true, 'String')
        this.setInputsInline(true)
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
        this.appendDummyInput().appendField('[')
        this.appendDummyInput('ENDBRACE').appendField(']')
        this.setTooltip(formatMessage('lpp.tooltip.construct.Array'))
        this.length = 0
      },
      mutationToDom: function () {
        const elem = document.createElement('mutation')
        elem.setAttribute('length', String(this.length))
        return elem
      },
      domToMutation: function (this: PatchedBlock, mutation: HTMLElement) {
        const attr = parseInt(mutation.getAttribute('length') ?? '0', 10)
        // The following line also detects that attr is a number -- NaN > 0 will return false.
        if (attr > 0) {
          this.setMutatorMinus(new MutatorMinus())
          for (let i = 0; i < attr; i++) {
            const input = this.appendValueInput(`ARG_${i}`)
            if (!this.isInsertionMarker()) addNullShadow(input as Shadowable)
            this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
            if (i < attr - 1) {
              this.appendDummyInput(`COMMA_${i}`).appendField(',')
              this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
            }
          }
        }
        this.length = attr
      },
      plus: function (this: PatchedBlock) {
        const arg = this.length++
        this.mutatorMinus ?? this.setMutatorMinus(new MutatorMinus())
        if (arg != 0) {
          this.appendDummyInput(`COMMA_${arg}`).appendField(',')
          this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
        }
        addNullShadow(this.appendValueInput(`ARG_${arg}`) as Shadowable)
        this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
        this.initSvg()
        this.render()
      },
      minus: function (this: PatchedBlock) {
        if (this.length > 0) {
          this.length--
          if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
          else this.setMutatorMinus()
          this.removeInput(`ARG_${this.length}`)
          cleanInputs.call(this)
          this.initSvg()
          this.render()
        }
      }
    }),
    lpp_constructObject: advancedBlock({
      init: function (this: PatchedBlock) {
        this.setCategory('lpp')
        this.setMutatorPlus(new MutatorPlus())
        this.setColour(color)
        this.setOutput(true, 'String')
        this.setInputsInline(true)
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
        this.appendDummyInput().appendField('{')
        this.length = 0
        this.appendDummyInput('ENDBRACE').appendField('}')
        this.setTooltip(formatMessage('lpp.tooltip.construct.Object'))
      },
      mutationToDom: function (this: PatchedBlock) {
        const elem = document.createElement('mutation')
        elem.setAttribute('length', String(this.length))
        return elem
      },
      domToMutation: function (this: PatchedBlock, mutation: HTMLElement) {
        const attr = parseInt(mutation.getAttribute('length') ?? '0', 10)
        // The following line also detects that attr is a number -- NaN > 0 will return false.
        if (attr > 0) {
          this.setMutatorMinus(new MutatorMinus())
          for (let i = 0; i < attr; i++) {
            const key = this.appendValueInput(`KEY_${i}`)
            const value = this.appendValueInput(`VALUE_${i}`)
            this.appendDummyInput(`COLON_${i}`).appendField(':')
            if (!this.isInsertionMarker()) {
              addShadow(key as Shadowable)
              addNullShadow(value as Shadowable)
            }
            this.moveInputBefore(`VALUE_${i}`, 'ENDBRACE')
            this.moveInputBefore(`COLON_${i}`, `VALUE_${i}`)
            this.moveInputBefore(`KEY_${i}`, `COLON_${i}`)
            if (i < attr - 1) {
              this.appendDummyInput(`COMMA_${i}`).appendField(',')
              this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
            }
          }
        }
        this.length = attr
      },
      plus: function (this: PatchedBlock) {
        const arg = this.length++
        this.mutatorMinus ?? this.setMutatorMinus(new MutatorMinus())
        if (arg != 0) {
          this.appendDummyInput(`COMMA_${arg}`).appendField(',')
          this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
        }
        this.appendDummyInput(`COLON_${arg}`).appendField(':')
        addShadow(this.appendValueInput(`KEY_${arg}`) as Shadowable)
        addNullShadow(this.appendValueInput(`VALUE_${arg}`) as Shadowable)
        this.moveInputBefore(`VALUE_${arg}`, 'ENDBRACE')
        this.moveInputBefore(`COLON_${arg}`, `VALUE_${arg}`)
        this.moveInputBefore(`KEY_${arg}`, `COLON_${arg}`)
        this.initSvg()
        this.render()
      },
      minus: function (this: PatchedBlock) {
        if (this.length > 0) {
          this.length--
          if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
          else this.setMutatorMinus()
          this.removeInput(`KEY_${this.length}`)
          this.removeInput(`COLON_${this.length}`)
          this.removeInput(`VALUE_${this.length}`)
          cleanInputs.call(this)
          this.initSvg()
          this.render()
        }
      }
    }),
    lpp_constructFunction: advancedBlock({
      init: function (this: PatchedBlock) {
        this.setCategory('lpp')
        this.setMutatorPlus(new MutatorPlus())
        this.setColour(color)
        this.setOutput(true, 'String')
        this.setInputsInline(true)
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
        this.appendDummyInput()
          .appendField(formatMessage('lpp.block.construct.Function'))
          .appendField('(')
        this.appendDummyInput('ENDBRACE').appendField(')')
        this.appendStatementInput('SUBSTACK')
        this.setTooltip(formatMessage('lpp.tooltip.construct.Function'))
        this.length = 0
      },
      mutationToDom: function (this: PatchedBlock) {
        const elem = document.createElement('mutation')
        elem.setAttribute('length', String(this.length))
        return elem
      },
      domToMutation: function (this: PatchedBlock, mutation: HTMLElement) {
        const attr = parseInt(mutation.getAttribute('length') ?? '0', 10)
        // The following line also detects that attr is a number -- NaN > 0 will return false.
        if (attr > 0) {
          this.setMutatorMinus(new MutatorMinus())
          for (let i = 0; i < attr; i++) {
            const input = this.appendValueInput(`ARG_${i}`)
            if (!this.isInsertionMarker()) addShadow(input as Shadowable)
            this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
            if (i < attr - 1) {
              this.appendDummyInput(`COMMA_${i}`).appendField(',')
              this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
            }
          }
        }
        this.length = attr
      },
      plus: function (this: PatchedBlock) {
        const arg = this.length++
        this.mutatorMinus ?? this.setMutatorMinus(new MutatorMinus())
        if (arg != 0) {
          this.appendDummyInput(`COMMA_${arg}`).appendField(',')
          this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
        }
        addShadow(this.appendValueInput(`ARG_${arg}`) as Shadowable)
        this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
        this.initSvg()
        this.render()
      },
      minus: function (this: PatchedBlock) {
        if (this.length > 0) {
          this.length--
          if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
          else this.setMutatorMinus()
          this.removeInput(`ARG_${this.length}`)
          cleanInputs.call(this)
          this.initSvg()
          this.render()
        }
      }
    }),
    // Operators
    lpp_var: simpleBlock(function () {
      this.setCategory('lpp')
      this.setInputsInline(true)
      this.setColour(color)
      this.setOutput(true, 'String')
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setTooltip(formatMessage('lpp.tooltip.operator.var'))
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.operator.var')
      )
      this.appendValueInput('name')
    }),
    lpp_binaryOp: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_binaryOp',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'input_value',
            name: 'lhs'
          },
          {
            type: 'field_dropdown',
            name: 'op',
            options: [
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
            ]
          },
          {
            type: 'input_value',
            name: 'rhs'
          }
        ],
        message0: '%1%2%3',
        tooltip: formatMessage('lpp.tooltip.operator.binaryOp')
      })
    }),
    lpp_unaryOp: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_unaryOp',
        inputsInline: true,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        args0: [
          {
            type: 'field_dropdown',
            name: 'op',
            options: [
              ['+', '+'],
              ['-', '-'],
              ['!', '!'],
              ['~', '~'],
              ['delete', 'delete'],
              ['await', 'await'],
              ['yield', 'yield'],
              ['yield*', 'yield*']
            ]
          },
          {
            type: 'input_value',
            name: 'value'
          }
        ],
        message0: '%1%2',
        tooltip: formatMessage('lpp.tooltip.operator.unaryOp')
      })
    }),
    lpp_self: simpleBlock(function () {
      this.jsonInit({
        type: 'lpp_self',
        inputsInline: true,
        checkboxInFlyout: false,
        category: 'lpp',
        colour: color,
        output: 'String',
        outputShape: Blockly.OUTPUT_SHAPE_SQUARE,
        message0: formatMessage('lpp.block.operator.self'),
        tooltip: formatMessage('lpp.tooltip.operator.self')
      })
    }),
    lpp_call: advancedBlock({
      init: function (this: PatchedBlock) {
        this.setCategory('lpp')
        this.setMutatorPlus(new MutatorPlus())
        this.setColour(color)
        this.setOutput(true, 'String')
        this.setInputsInline(true)
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
        this.appendValueInput('fn')
        this.appendDummyInput().appendField('(')
        this.length = 0
        this.appendDummyInput('ENDBRACE').appendField(')')
        this.setTooltip(formatMessage('lpp.tooltip.operator.call'))
      },
      mutationToDom: function (this: PatchedBlock) {
        const elem = document.createElement('mutation')
        elem.setAttribute('length', String(this.length))
        return elem
      },
      domToMutation: function (this: PatchedBlock, mutation: HTMLElement) {
        const attr = parseInt(mutation.getAttribute('length') ?? '0', 10)
        // The following line also detects that attr is a number -- NaN > 0 will return false.
        if (attr > 0) {
          this.setMutatorMinus(new MutatorMinus())
          for (let i = 0; i < attr; i++) {
            if (!this.isInsertionMarker())
              addNullShadow(this.appendValueInput(`ARG_${i}`) as Shadowable)
            this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
            if (i < attr - 1) {
              this.appendDummyInput(`COMMA_${i}`).appendField(',')
              this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
            }
          }
        }
        this.length = attr
      },
      plus: function (this: PatchedBlock) {
        const arg = this.length++
        this.mutatorMinus ?? this.setMutatorMinus(new MutatorMinus())
        if (arg != 0) {
          this.appendDummyInput(`COMMA_${arg}`).appendField(',')
          this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
        }
        addNullShadow(this.appendValueInput(`ARG_${arg}`) as Shadowable)
        this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
        this.initSvg()
        this.render()
      },
      minus: function (this: PatchedBlock) {
        if (this.length > 0) {
          this.length--
          if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
          else this.setMutatorMinus()
          this.removeInput(`ARG_${this.length}`)
          cleanInputs.call(this)
          this.initSvg()
          this.render()
        }
      }
    }),
    lpp_new: advancedBlock({
      init: function (this: PatchedBlock) {
        this.setCategory('lpp')
        this.setMutatorPlus(new MutatorPlus())
        this.setColour(color)
        this.setOutput(true, 'String')
        this.setInputsInline(true)
        this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
        this.appendDummyInput().appendField('new ')
        this.appendValueInput('fn')
        this.appendDummyInput().appendField('(')
        this.length = 0
        this.appendDummyInput('ENDBRACE').appendField(')')
        this.setTooltip(formatMessage('lpp.tooltip.operator.new'))
      },
      mutationToDom: function (this: PatchedBlock) {
        const elem = document.createElement('mutation')
        elem.setAttribute('length', String(this.length))
        return elem
      },
      domToMutation: function (this: PatchedBlock, mutation: HTMLElement) {
        const attr = parseInt(mutation.getAttribute('length') ?? '0', 10)
        // The following line also detects that attr is a number -- NaN > 0 will return false.
        if (attr > 0) {
          this.setMutatorMinus(new MutatorMinus())
          for (let i = 0; i < attr; i++) {
            if (!this.isInsertionMarker())
              addNullShadow(this.appendValueInput(`ARG_${i}`) as Shadowable)
            this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
            if (i < attr - 1) {
              this.appendDummyInput(`COMMA_${i}`).appendField(',')
              this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
            }
          }
        }
        this.length = attr
      },
      plus: function (this: PatchedBlock) {
        const arg = this.length++
        this.mutatorMinus ?? this.setMutatorMinus(new MutatorMinus())
        if (arg != 0) {
          this.appendDummyInput(`COMMA_${arg}`).appendField(',')
          this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
        }
        addNullShadow(this.appendValueInput(`ARG_${arg}`) as Shadowable)
        this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
        this.initSvg()
        this.render()
      },
      minus: function (this: PatchedBlock) {
        if (this.length > 0) {
          this.length--
          if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
          else this.setMutatorMinus()
          this.removeInput(`ARG_${this.length}`)
          cleanInputs.call(this)
          this.initSvg()
          this.render()
        }
      }
    }),
    // Statements
    lpp_return: simpleBlock(function () {
      this.setCategory('lpp')
      this.setInputsInline(true)
      this.setColour(color)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setTooltip(formatMessage('lpp.tooltip.statement.return'))
      this.setPreviousStatement(true, null)
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.statement.return')
      )
      this.appendValueInput('value')
    }),
    lpp_throw: simpleBlock(function () {
      this.setCategory('lpp')
      this.setInputsInline(true)
      this.setColour(color)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setTooltip(formatMessage('lpp.tooltip.statement.throw'))
      this.setPreviousStatement(true, null)
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.statement.throw')
      )
      this.appendValueInput('value')
    }),
    lpp_scope: simpleBlock(function () {
      this.setCategory('lpp')
      this.setColour(color)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.statement.scope')
      )
      this.appendStatementInput('SUBSTACK')
      this.setTooltip(formatMessage('lpp.tooltip.statement.scope'))
    }),
    lpp_try: simpleBlock(function () {
      this.setCategory('lpp')
      this.setColour(color)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.statement.try.1')
      )
      this.appendStatementInput('SUBSTACK')
      this.appendDummyInput().appendField(
        formatMessage('lpp.block.statement.try.2')
      )
      this.appendValueInput('var')
      this.appendStatementInput('SUBSTACK_2')
      this.setTooltip(formatMessage('lpp.tooltip.statement.try'))
    }),
    lpp_nop: simpleBlock(function () {
      this.setCategory('lpp')
      this.setInputsInline(true)
      this.setColour(color)
      this.setInputsInline(true)
      this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
      this.setTooltip(formatMessage('lpp.tooltip.statement.nop'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.appendValueInput('value')
    })
  })
}
