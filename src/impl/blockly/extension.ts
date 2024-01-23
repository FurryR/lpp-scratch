import { Block, BlocklyInstance } from './typing'

/**
 * getInfo() metadata map.
 */
interface MetadataMap {
  label: {
    text: string
  }
  reporter: {
    opcode: string
    text: string
    arguments: Record<string, never>
  }
  button: {
    text: string
    onClick: () => void
  }
}
/**
 * Metadata for Scratch of a block.
 */
export type BlockMetadata<T extends keyof MetadataMap = keyof MetadataMap> = {
  blockType: T
} & MetadataMap[T]
/**
 * Metadata for Blockly block.
 */
export interface BlockDescriptor {
  [key: string]: (
    this: BlockDescriptor,
    Blockly: BlocklyInstance,
    block: Block,
    ...args: never[]
  ) => unknown
}
/**
 * Insertable block.
 */
export interface ExtensionBlock {
  inject(Blockly: BlocklyInstance, extension: Extension): void
  export(): BlockMetadata[]
}
/**
 * Button (for documentation, etc.)
 */
export class Button implements ExtensionBlock {
  inject() {}
  export(): BlockMetadata[] {
    return [
      {
        blockType: 'button',
        text: this.lazyText(),
        onClick: this.onClick
      }
    ]
  }
  /**
   * Construct a button.
   * @param lazyText A function that returns button text.
   * @param onClick click handler.
   */
  constructor(
    public lazyText: () => string,
    public onClick: () => void
  ) {}
}
/**
 * Block category.
 */
export class Category {
  private block: Map<string, BlockDescriptor>
  /**
   * Inject blocks to Blockly. Can be called multiple times for mixin.
   * @param Blockly Blockly instance.
   * @param extension Parent extension.
   */
  inject(Blockly: BlocklyInstance, extension: Extension) {
    for (const [key, value] of this.block.entries()) {
      const res: Record<string, unknown> = {}
      for (const [key, originalFn] of Object.entries(value)) {
        res[key] = function (this: Block, ...args: never[]) {
          if (key === 'init') {
            // Prepatch (color, icon, etc.)
            this.setCategory(extension.id)
            this.setInputsInline(true)
            this.setColour(extension.color)
          }
          return originalFn.call(value, Blockly, this, ...args)
        }
      }
      Reflect.defineProperty(Blockly.Blocks, `${extension.id}_${key}`, {
        get() {
          return res
        },
        set() {},
        configurable: true
      })
    }
  }
  /**
   * Register a block under a category.
   * @param name Block name (ID).
   * @param block Block descriptor.
   * @returns This for chaining.
   */
  register(
    name: string,
    block: BlockDescriptor | BlockDescriptor[string]
  ): this {
    this.block.set(name, block instanceof Function ? { init: block } : block)
    return this
  }
  /**
   * Export blocks as Scratch metadata.
   * @returns Scratch metadata.
   */
  export(): BlockMetadata[] {
    return [
      {
        blockType: 'label',
        text: this.lazyLabel()
      }
    ].concat(
      Array.from(this.block.keys()).map(opcode => ({
        blockType: 'reporter',
        opcode,
        text: '',
        arguments: {}
      }))
    ) as BlockMetadata[]
  }
  /**
   * Construct a category.
   * @param lazyLabel A function that returns category label.
   */
  constructor(public lazyLabel: () => string) {
    this.block = new Map()
  }
}
/**
 * Extension.
 */
export class Extension {
  private blocks: ExtensionBlock[] = []
  /**
   * Register an button, category, etc.
   * @param block Object to register.
   * @returns This for chaining.
   */
  register(block: ExtensionBlock): this {
    this.blocks.push(block)
    return this
  }
  /**
   * Inject blocks to Blockly. Can be called multiple times for mixin.
   * @param Blockly
   */
  inject(Blockly: BlocklyInstance) {
    for (const v of this.blocks) {
      v.inject(Blockly, this)
    }
  }
  /**
   * Export blocks as Scratch metadata.
   * @returns Scratch metadata.
   */
  export(): BlockMetadata[] {
    return this.blocks.map(v => v.export()).flat(1)
  }
  /**
   * Construct an extension.
   * @param id Extension id.
   * @param color Block color (experimental).
   */
  constructor(
    public id: string,
    public color: string
  ) {}
}
