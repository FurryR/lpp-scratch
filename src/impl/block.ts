import type * as ScratchBlocks from 'blockly/core'
import {
  BlocklyInstance,
  Block,
  Category,
  Extension,
  Reporter,
  Input,
  Command,
  Button
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

/// Code from https://github.com/google/blockly-samples/tree/master/plugins/block-plus-minus originally by Google & Blockly contributors.
/// Disclaimer: Blockly is licensed under the Apache-2.0 License.
/*

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
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
      /// Documentation
      new Button(
        'documentation',
        () => `📄 ${formatMessage('lpp.documentation')}`
      )
    )
    .register(
      /// Builtin
      new Category(() => `#️⃣ ${formatMessage('lpp.category.builtin')}`)
        .register(
          'builtinType',
          Reporter.Round((Blockly, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.builtin.type'))
            block.appendDummyInput().appendField(
              new Blockly.FieldDropdown([
                ['Boolean', 'Boolean'],
                ['Number', 'Number'],
                ['String', 'String'],
                ['Array', 'Array'],
                ['Object', 'Object'],
                ['Function', 'Function'],
                ['Promise', 'Promise']
              ]) as ScratchBlocks.Field<string>,
              'value'
            )
          })
        )
        .register(
          'builtinError',
          Reporter.Round((Blockly, block) => () => {
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
          Reporter.Round((Blockly, block) => () => {
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
          Reporter.Round((Blockly, block) => () => {
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
                ['...', '...'],
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
          Reporter.Round((_, block) => () => {
            block.setTooltip(formatMessage('lpp.tooltip.operator.self'))
            block.setCheckboxInFlyout(false)
            Input.Text(block, 'LABEL', formatMessage('lpp.block.operator.self'))
          })
        )
        .register(
          'var',
          Reporter.Round((_, block) => () => {
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
