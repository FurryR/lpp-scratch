// @ts-check
/**
 * Warning! lpp does not support sandboxed mode. Please load it as unsandboxed extension.
 * 注意！lpp 不支持隔离模式，请将其作为非隔离插件加载。
 * 注意！lpp はサンドボックスモードをサポートされていません。非サンドボックス拡張機能でロードしてください。
 * ちゅうい！lpp はサンドボックスモードをサポートされていません。ひサンドボックスかくちょうきのうでロードしてください。
 */
/**
 * Copyright (c) 2023 凌.
 * This program is licensed under the MIT license.
 */
/**
 * Staff:
 * Nights from CCW
 * FurryR belongs to VeroFess (https://github.com/VeroFess) from GitHub (https://github.com/FurryR)
 * Simon Shiki from GitHub (https://github.com/SimonShiki)
 */
// Polyfill for Non-ES2021 editors
/**
 * @template {Object} T Element type.
 * @typedef {{ deref(): T | undefined }} WeakRef Weak reference.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
 */
/**
 * @type {any}
 */
;(function (Scratch) {
  const color = '#808080'
  const lppVersion = 'Development (for Turbowarp / Cocrea users)'
  // Translations.
  const locale = {
    en: {
      // Name
      'lpp.name': 'lpp',
      // Block
      /// Construction
      'lpp.block.construct.Number': 'Number',
      'lpp.block.construct.String': 'String',
      'lpp.block.construct.Function': 'function',
      /// Operator
      'lpp.block.operator.var': 'var',
      'lpp.block.operator.self': 'self',
      /// Statement
      'lpp.block.statement.return': 'return',
      'lpp.block.statement.throw': 'throw',
      'lpp.block.statement.scope': 'scope',
      'lpp.block.statement.try.1': 'try',
      'lpp.block.statement.try.2': 'catch',
      // Error
      'lpp.error.useAfterDispose.summary':
        'Cannot operate sprite on a disposed target.',
      'lpp.error.useAfterDispose.detail':
        'This error happens when you call a function which belongs to a disposed target, whose sprite is operated on. Please review your code.',
      'lpp.error.useOutsideFunction.summary':
        'Cannot use this block outside a function context.',
      'lpp.error.useOutsideFunction.detail':
        'Block outside a function context is used. Please note that this block must be used in function contexts.',
      'lpp.error.useOutsideContext.summary':
        'Cannot use this block outside a lpp context.',
      'lpp.error.useOutsideContext.detail':
        'You used the block outside a lpp context. Please create a lpp context use "scope" block first.',
      'lpp.error.syntaxError.summary': 'Syntax error.',
      'lpp.error.syntaxError.detail':
        "You used the block incorrectly. Please note that lpp doesn't allow direct use of Scratch literals (index access is a exception).",
      'lpp.error.accessOfNull.summary': 'Invalid access of null.',
      'lpp.error.accessOfNull.detail':
        'Please validate the object before you use.',
      'lpp.error.assignOfConstant.summary':
        'Assigning to a constant is not allowed.',
      'lpp.error.assignOfConstant.detail':
        'Please note that you cannot assign a value to a constant.',
      'lpp.error.invalidIndex.summary': 'Invalid index.',
      'lpp.error.invalidIndex.detail':
        'Please note that you cannot use complex objects like Array, Object or Function as index.',
      'lpp.error.notCallable.summary': 'Object is not callable.',
      'lpp.error.notCallable.detail':
        'Please note that you can only call Function objects.',
      'lpp.error.recursivePrototype.summary':
        'Recursive prototype is not allowed.',
      'lpp.error.recursivePrototype.detail':
        'Please resolve recursive dependency.',
      'lpp.error.unhandledException.summary': 'Uncaught exception.',
      'lpp.error.unhandledException.detail':
        'Please use try-catch block to catch exceptions or the code will stop execution.',
      'lpp.error.unhandledException.exception': 'Exception:',
      'lpp.error.unhandledException.traceback': 'Traceback:',
      'lpp.error.releaseMode.summary':
        'The code encountered an error while running.',
      'lpp.error.releaseMode.detail':
        'The program may not work as intended. Please contact project maintainers with this message for help.',
      'lpp.error.blockNotFound':
        'Unable to find the block in Blockly workspace. The block might not belong to the target that you are currently editing.',
      'lpp.error.position': 'Position:',
      'lpp.error.context': 'Context:',
      'lpp.error.self': 'Self:',
      'lpp.error.arguments': 'Arguments:',
      'lpp.error.hint':
        'For further information please check DevTools Console.',
      // Category
      'lpp.category.builtin': 'Builtin',
      'lpp.category.construct': 'Construction',
      'lpp.category.operator': 'Operator',
      'lpp.category.statement': 'Statement',
      // Tooltip
      'lpp.tooltip.builtin.type':
        'Predefined builtin data types. Includes everything which language feature requires.',
      'lpp.tooltip.builtin.error':
        'Predefined builtin error types. Includes all errors which builtin classes throw.',
      'lpp.tooltip.builtin.utility':
        'Predefined builtin utility types. Includes methods to process data.',
      'lpp.tooltip.construct.literal': 'Construct special literals in lpp.',
      'lpp.tooltip.construct.Number':
        'Construct a Number object by Scratch literal.',
      'lpp.tooltip.construct.String':
        'Construct a String object by Scratch literal.',
      'lpp.tooltip.construct.Array':
        'Construct an Array object with specified structure. Use "+" to add or "-" to remove an element.',
      'lpp.tooltip.construct.Object':
        'Construct an Object object with specified structure. Use "+" to add or "-" to remove an element.',
      'lpp.tooltip.construct.Function':
        'Construct an Function object. Use "+" to add or "-" to remove an argument.',
      'lpp.tooltip.operator.get': 'Get specified member of specified object.',
      'lpp.tooltip.operator.binaryOp': 'Do binary operations.',
      'lpp.tooltip.operator.unaryOp': 'Do unary operations.',
      'lpp.tooltip.operator.call':
        'Call function with given arguments. Use "+" to add or "-" to remove an argument.',
      'lpp.tooltip.operator.new':
        'Construct an instance with given constructor and arguments. Use "+" to add or "-" to remove an argument.',
      'lpp.tooltip.operator.self':
        'Get the reference of self object in function context.',
      'lpp.tooltip.operator.var':
        'Get the reference of a specified local variable or an argument.',
      'lpp.tooltip.statement.return': 'Return a value from the function.',
      'lpp.tooltip.statement.throw':
        'Throw a value. It will interrupt current control flow immediately.',
      'lpp.tooltip.statement.scope':
        'Create a lpp scope and execute the code in it.',
      'lpp.tooltip.statement.try':
        'Try capturing exceptions in specified statements. If an exception is thrown, set the specified reference to error object, then execute exception handling code.',
      'lpp.tooltip.statement.semi':
        'Semi. It is used to convert a Scratch reporter into a statement.',
      // About
      'lpp.about.summary':
        'lpp is a high-level programming language developed by @FurryR.',
      'lpp.about.github': 'GitHub repository',
      'lpp.about.afdian': 'Sponsor',
      'lpp.about.staff.1': 'lpp developers staff',
      'lpp.about.staff.2': "lpp won't be created without their effort."
    },
    'zh-cn': {
      // 名称
      'lpp.name': 'lpp',
      // 积木
      /// 构造
      'lpp.block.construct.Number': '数字',
      'lpp.block.construct.String': '字符串',
      'lpp.block.construct.Function': '函数',
      /// 运算符
      'lpp.block.operator.var': '变量',
      'lpp.block.operator.self': '自身',
      /// 语句
      'lpp.block.statement.return': '返回',
      'lpp.block.statement.throw': '抛出',
      'lpp.block.statement.scope': '作用域',
      'lpp.block.statement.try.1': '尝试',
      'lpp.block.statement.try.2': '捕获',
      // 报错
      'lpp.error.useAfterDispose.summary': '无法在已销毁的目标上操作角色。',
      'lpp.error.useAfterDispose.detail':
        '如果您调用一个属于已销毁角色的函数并在其上操作角色，则会发生此错误。请检查您的代码。',
      'lpp.error.useOutsideFunction.summary': '无法在函数之外使用此积木。',
      'lpp.error.useOutsideFunction.detail':
        '在函数上下文之外使用了函数专用的积木。请注意一定要在函数内使用此类积木。',
      'lpp.error.useOutsideContext.summary':
        '无法在 lpp 上下文以外使用此积木。',
      'lpp.error.useOutsideContext.detail':
        '无法在 lpp 上下文以外对变量进行访问。请首先使用作用域积木来创建作用域。',
      'lpp.error.syntaxError.summary': '积木语法错误。',
      'lpp.error.syntaxError.detail':
        '您错误地使用了积木。请注意 lpp 不允许（在下标访问以外的情况下）直接使用 Scratch 字面量。',
      'lpp.error.accessOfNull.summary': '访问了 null 的成员。',
      'lpp.error.accessOfNull.detail': '请在使用对象前检查对象是否为空。',
      'lpp.error.assignOfConstant.summary': '对常量进行了赋值操作。',
      'lpp.error.assignOfConstant.detail':
        '您可能混淆了左值和右值。请注意您无法对右值进行赋值操作。',
      'lpp.error.invalidIndex.summary': '对象下标无效。',
      'lpp.error.invalidIndex.detail':
        '请注意诸如 Array，Object，Function 等复杂数据类型无法作为下标使用。',
      'lpp.error.notCallable.summary': '对象不可调用。',
      'lpp.error.notCallable.detail':
        '您不可调用除了 Function 类型以外的对象。',
      'lpp.error.recursivePrototype.summary': '循环依赖 prototype 不被允许。',
      'lpp.error.recursivePrototype.detail': '请解决循环依赖。',
      'lpp.error.unhandledException.summary': '有未被捕获的异常。',
      'lpp.error.unhandledException.detail':
        '请使用尝试-捕获块对错误进行捕获，否则代码将终止运行。',
      'lpp.error.unhandledException.exception': '错误内容：',
      'lpp.error.unhandledException.traceback': '栈回溯：',
      'lpp.error.releaseMode.summary': '代码在运行过程中发生错误。',
      'lpp.error.releaseMode.detail':
        '程序可能无法按预期正常运行。请联系项目维护者以获得帮助。请注意同时附上此消息。',
      'lpp.error.blockNotFound':
        '无法在 Blockly 工作区中找到积木。该积木可能并不属于当前正编辑的角色。',
      'lpp.error.position': '位置：',
      'lpp.error.context': '上下文：',
      'lpp.error.self': '自身：',
      'lpp.error.arguments': '参数：',
      'lpp.error.hint': '详细内容在 DevTools Console 内。',
      // 分类
      'lpp.category.builtin': '内嵌',
      'lpp.category.construct': '构造',
      'lpp.category.operator': '运算',
      'lpp.category.statement': '语句',
      // 帮助
      'lpp.tooltip.builtin.type':
        '预定义的内嵌数据类型。包含了语言特性所需要的全部类。',
      'lpp.tooltip.builtin.error':
        '预定义的内嵌错误类型。包含了语言内嵌类会抛出的全部错误。',
      'lpp.tooltip.builtin.utility':
        '预定义的实用工具类型。包含了处理数据需要的各种方法。',
      'lpp.tooltip.construct.literal': '构造 lpp 中特殊的字面量。',
      'lpp.tooltip.construct.Number': '以 Scratch 字面量构造一个 Number 对象。',
      'lpp.tooltip.construct.String': '以 Scratch 字面量构造一个 String 对象。',
      'lpp.tooltip.construct.Array':
        '以指定结构构造 Array 对象。可使用“+”或“-”对元素进行增减。',
      'lpp.tooltip.construct.Object':
        '以指定结构构造 Object 对象。可使用“+”或“-”对元素进行增减。',
      'lpp.tooltip.construct.Function':
        '构造 Function 对象。可使用“+”或“-”对参数进行增减。',
      'lpp.tooltip.operator.get': '获得对象下的某个成员。',
      'lpp.tooltip.operator.binaryOp': '进行二元运算。',
      'lpp.tooltip.operator.unaryOp': '进行一元运算。',
      'lpp.tooltip.operator.call':
        '以给定的参数调用函数。可使用“+”或“-”对参数进行增减。',
      'lpp.tooltip.operator.new':
        '以指定的参数和构造器构造一个实例。可使用“+”或“-”对参数进行增减。',
      'lpp.tooltip.operator.self': '获得 Function 对象上下文中自身的引用。',
      'lpp.tooltip.operator.var': '获得当前作用域中局部变量或参数的引用。',
      'lpp.tooltip.statement.return': '从函数返回一个值。',
      'lpp.tooltip.statement.throw': '抛出一个值。这将立即中断当前控制流。',
      'lpp.tooltip.statement.scope': '新建 lpp 作用域，并在作用域内执行代码。',
      'lpp.tooltip.statement.try':
        '尝试在指定的语句块中捕获错误。若有错误被抛出，将指定的变量引用赋值为错误对象，然后执行错误处理代码。',
      'lpp.tooltip.statement.semi': '分号。用于将返回值积木转换为语句。',
      // 关于
      'lpp.about.summary': 'lpp 是由 @FurryR 开发的高级程序设计语言。',
      'lpp.about.github': '本项目的 GitHub 仓库',
      'lpp.about.afdian': '赞助者',
      'lpp.about.staff.1': 'lpp 开发者名单',
      'lpp.about.staff.2': '如果没有他/她们，lpp 将不复存在。'
    }
  }
  if (Scratch.extensions.unsandboxed === false) {
    throw new Error('lpp must be loaded in unsandboxed mode.')
  }
  /// L++ engine developed by FurryR (programmer)
  /// "L" means lightweight.
  /**
   * @type {Map<string, LppValue>} Global builtins.
   */
  const global = new Map()
  class LppError extends Error {
    /**
     * @type {string} error message ID.
     */
    id
    /**
     * Construct a new Lpp error.
     * @param {string} id Error format message ID.
     */
    constructor(id) {
      super(`Error ${id}`)
      this.id = id
    }
  }
  /**
   * Lpp compatible object.
   */
  class LppValue extends String {
    /**
     * @abstract Get a value.
     * @param {string} key Key to get.
     * @returns {LppValue | LppChildValue} Value if exist.
     */
    get(key) {
      throw new Error('Not implemented')
    }
    /**
     * @abstract Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      throw new Error('Not implemented')
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      throw new Error('Not implemented')
    }
    /**
     * Delete a value from the object.
     * @param {string | undefined} key Key to delete. May be undefined.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      throw new Error('Not implemented')
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param {LppFunction} fn Function.
     * @returns {boolean} Whether the value is constructed from fn.
     */
    instanceof(fn) {
      throw new Error('Not implemented')
    }
    /**
     * toString for visualReport.
     * @returns {string} Human readable string.
     */
    toString() {
      throw new Error('Not implemented')
    }
    /**
     * valueOf for compatibility with other extensions.
     * @returns {unknown} Value.
     */
    // @ts-expect-error
    valueOf() {
      return this
    }
    /**
     * Construct a Lpp compatible object.
     * @param {string} display Display in Scratch.
     */
    constructor(display) {
      super(display)
    }
  }
  /**
   * Lpp compatible object (with scope).
   */
  class LppChildValue extends String {
    /**
     * @type {WeakRef<LppValue>} Parent object.
     */
    parent
    /**
     * @type {LppValue} Current object.
     */
    value
    /**
     * @type {string} Key name.
     */
    name
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @param {LppValue | LppChildValue} key Child object.
     */
    get(key) {
      return this.value.get(key)
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      return this.value.set(key, value)
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      return this.value.has(key)
    }
    /**
     * Delete a value from the object or just delete itself.
     * @param {string | undefined} key Key to delete. May be undefined.
     * @returns {boolean} Whether the value exists.
     */
    delete(key = undefined) {
      const parent = this.parent.deref()
      if (!parent) throw new LppError('assignOfConstant')
      if (key) return parent.delete(this.name)
      return this.value.delete(key)
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param {LppFunction} fn Function.
     * @returns {boolean} Whether the value is constructed from fn.
     */
    instanceof(fn) {
      return this.value.instanceof(fn)
    }
    /**
     * Assign current value.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} New value.
     */
    assign(value) {
      const parent = this.parent.deref()
      if (!parent) throw new LppError('assignOfConstant')
      parent.set(this.name, value)
      this.value = value
      return this
    }
    /**
     * toString for visualReport.
     * @returns {string} Human readable string.
     */
    toString() {
      return this.value.toString()
    }
    /**
     * valueOf for compatibility with other extensions.
     * @returns {unknown} Value.
     */
    // @ts-expect-error
    valueOf() {
      return this.value.valueOf()
    }
    /**
     * Construct a new LppChildObject object.
     * @param {LppValue} parent parent.
     * @param {string} name key in parent.
     * @param {LppValue} value value.
     */
    constructor(parent, name, value) {
      super(value.toString())
      // @ts-expect-error
      this.parent = new WeakRef(parent)
      this.name = name
      this.value = value
    }
  }
  /**
   * Traceback for native functions.
   */
  class LppNativeFnTraceback {
    /** @type {LppFunction} Called function. */
    fn
    /** @type {LppValue} Self. */
    self
    /** @type {LppValue[]} Arguments. */
    args
    /**
     * Construct a traceback object.
     * @param {LppFunction} fn Called function.
     * @param {LppValue} self Self.
     * @param {LppValue[]} args Arguments.
     */
    constructor(fn, self, args) {
      this.fn = fn
      this.self = self
      this.args = args
    }
  }
  class LppBlockTraceback {
    /** @type {string} Block ID. */
    block
    /** @type {LppContext?} Context. */
    context
    /**
     * Construct a traceback object.
     * @param {string} block Block ID.
     * @param {LppContext?} context Context.
     */
    constructor(block, context) {
      this.block = block
      this.context = context
    }
  }
  /**
   * LppFunction return value.
   */
  class LppReturn {
    /**
     * @type {LppValue} Result.
     */
    value
    /**
     * Construct a new LppReturn instance.
     * @param {LppValue} value Result.
     */
    constructor(value) {
      this.value = value
    }
  }
  /**
   * LppFunction exception value.
   */
  class LppException {
    /**
     * @type {LppValue} Result.
     */
    value
    /**
     * @type {(LppBlockTraceback | LppNativeFnTraceback)[]} Traceback.
     */
    stack
    /**
     * Push stack into traceback.
     * @param {LppBlockTraceback | LppNativeFnTraceback} stack Current stack.
     */
    pushStack(stack) {
      this.stack.push(stack)
    }
    /**
     * Construct a new LppException instance.
     * @param {LppValue} value Result.
     */
    constructor(value) {
      this.value = value
      this.stack = []
    }
  }
  /**
   * Lookup for a property in prototype.
   * @param {LppObject} proto Object.
   * @param {string} name Property name.
   * @returns {LppValue | null} Result value.
   */
  function lookupPrototype(proto, name) {
    /**
     * @type {WeakSet<LppObject>}
     */
    const cache = new WeakSet()
    /**
     * Lookup for a property in prototype.
     * @param {LppObject} proto Object.
     * @param {string} name Property name.
     * @returns {LppValue | null} Result value.
     */
    function lookupPrototypeInternal(proto, name) {
      if (proto instanceof LppObject) {
        const res = proto.value.get(name)
        if (res) {
          return res
        } else {
          // recursive
          const v = proto.value.get('prototype')
          if (v instanceof LppObject) {
            if (cache.has(v)) throw new LppError('recursivePrototype')
            else cache.add(v)
            return lookupPrototype(v, name)
          }
        }
      }
      return null
    }
    return lookupPrototypeInternal(proto, name)
  }
  /**
   * Ensure result is a LppValue.
   * @param {LppValue | LppChildValue} obj Object.
   * @returns {LppValue} Ensured result.
   */
  function ensureValue(obj) {
    return obj instanceof LppChildValue ? obj.value : obj
  }
  /**
   * Detect whether prototype1 equals to prototype2 or contains prototype2.
   * @param {LppObject} prototype1 lhs.
   * @param {LppObject} prototype2 rhs.
   * @returns {boolean} Result.
   */
  function comparePrototype(prototype1, prototype2) {
    if (prototype1 === prototype2) return true
    if (prototype1.value.has('prototype')) {
      const v = prototype1.value.get('prototype')
      // recursive
      if (v instanceof LppObject) return comparePrototype(v, prototype2)
    }
    return false
  }
  /** @type {Notification?} */
  let lastNotification = null
  /**
   * Warn by notification.
   * @param {{title: string, body: string, tag: string, silent: boolean }} param0 Config.
   */
  function notificationAlert({ title, body, tag, silent }) {
    Notification.requestPermission().then(value => {
      if (value === 'granted') {
        if (lastNotification) {
          lastNotification.close()
          lastNotification = null
          setTimeout(() => notificationAlert({ title, body, tag, silent }))
        } else {
          lastNotification = new Notification(title, {
            body,
            tag,
            silent
          })
          lastNotification.addEventListener('close', () => {
            lastNotification = null
          })
        }
      }
    })
  }
  /**
   * @template {boolean | number | string | null} T Type of the value.
   */
  class LppConstant extends LppValue {
    /**
     * @type {Map<boolean | number | string | null, WeakRef<LppConstant<number | string>>>}
     */
    static cache = new Map()
    /**
     * Make constant value.
     * @template {boolean | number | string | null} T Type of the value.
     * @param {T} value Value.
     * @returns {LppConstant<T>} Instance.
     */
    static init(value) {
      const v = LppConstant.cache.get(value)
      if (v) {
        const deref = v.deref()
        // @ts-expect-error
        if (deref) return deref
      }
      const obj = new LppConstant(value)
      // @ts-expect-error
      LppConstant.cache.set(value, new WeakRef(obj))
      return obj
    }
    /**
     * @type {T} The stored value.
     */
    value
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @returns {LppValue | LppChildValue} Child object.
     */
    get(key) {
      if (this.value === null) throw new LppError('accessOfNull')
      if (key === 'constructor') {
        switch (typeof this.value) {
          case 'string':
            return global.get('String') ?? LppConstant.init(null)
          case 'number':
            return global.get('Number') ?? LppConstant.init(null)
          case 'boolean':
            return global.get('Boolean') ?? LppConstant.init(null)
        }
      } else if (key === 'prototype') {
        // patch: disable access to constructor prototype.
        return LppConstant.init(null)
      } else {
        if (typeof this.value === 'string') {
          const idx = parseInt(key)
          if (!isNaN(idx)) {
            const v = this.value[idx]
            return v !== undefined
              ? LppConstant.init(v)
              : LppConstant.init(null)
          }
        }
        const constructor = ensureValue(this.get('constructor'))
        if (!(constructor instanceof LppFunction))
          throw new Error(
            'Lpp: Unexpected constructor -- must be a LppFunction instance'
          )
        const proto = ensureValue(constructor.get('prototype'))
        if (!(proto instanceof LppObject))
          throw new Error(
            'Lpp: Unexpected prototype -- must be a LppObject instance'
          )
        const member = lookupPrototype(proto, key)
        if (member === null) return LppConstant.init(null)
        return new LppChildValue(this, key, member)
      }
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      throw new LppError('assignOfConstant')
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      if (this.value === null) throw new LppError('accessOfNull')
      if (key === 'constructor') return true
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'Lpp: Unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'Lpp: Unexpected prototype -- must be a LppObject instance'
        )
      return lookupPrototype(proto, key) !== null
    }
    /**
     * Delete a value from the object.
     * @param {string} key Key to delete. May be undefined.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      if (this.value === null) throw new LppError('accessOfNull')
      throw new LppError('assignOfConstant')
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param {LppFunction} fn Function.
     */
    instanceof(fn) {
      if (this.value === null) return false
      // We assume that builtin functions are not dervied types.
      switch (typeof this.value) {
        case 'string':
          return fn === global.get('String')
        case 'number':
          return fn === global.get('Number')
        case 'boolean':
          return fn === global.get('Boolean')
      }
    }
    /**
     * toString for visualReport.
     * @returns {string} Human readable string.
     */
    toString() {
      return `${this.value}`
    }
    /**
     * valueOf for compatibility with other extensions.
     * @returns {T} Value.
     */
    valueOf() {
      return this.value
    }
    /**
     * Constructs a value.
     * @param {T} value The value.
     */
    constructor(value) {
      // Don't use this constructor directly! Use initalize() instead.
      super(`${value}`)
      if (
        !['string', 'number', 'boolean'].includes(typeof value) &&
        value !== null
      ) {
        throw new Error(
          'Lpp: Unexpected construct -- use LppObject or else instead.'
        )
      }
      this.value = value
    }
  }
  class LppObject extends LppValue {
    /**
     * @type {Map<string, LppValue>}
     */
    value
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @returns {LppValue | LppChildValue} Child object.
     */
    get(key) {
      if (key === 'constructor') {
        return (
          this.value.get(key) ?? global.get('Object') ?? LppConstant.init(null)
        )
      } else {
        const res = this.value.get(key)
        // patch: disable access to constructor prototype.
        if (res || key == 'prototype')
          return new LppChildValue(this, key, res ?? LppConstant.init(null))
        const constructor = ensureValue(this.get('constructor'))
        if (!(constructor instanceof LppFunction))
          throw new Error(
            'Lpp: Unexpected constructor -- must be a LppFunction instance'
          )
        const proto = ensureValue(constructor.get('prototype'))
        if (!(proto instanceof LppObject))
          throw new Error(
            'Lpp: Unexpected prototype -- must be a LppObject instance'
          )
        const member = lookupPrototype(proto, key)
        if (member === null)
          return new LppChildValue(this, key, LppConstant.init(null))
        return new LppChildValue(this, key, member)
      }
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      this.value.set(key, value)
      return new LppChildValue(this, key, value)
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      if (key === 'constructor' || this.value.has(key)) return true
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'Lpp: Unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'Lpp: Unexpected prototype -- must be a LppObject instance'
        )
      return lookupPrototype(proto, key) !== null
    }
    /**
     * Delete a value from the object.
     * @param {string} key Key to delete.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      return this.value.delete(key)
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param {LppFunction} fn Function.
     * @returns {boolean} Whether the value is constructed from fn.
     */
    instanceof(fn) {
      const constructor = this.get('constructor')
      const prototype1 = ensureValue(constructor.get('prototype'))
      const prototype2 = ensureValue(fn.get('prototype'))
      if (prototype1 instanceof LppObject && prototype2 instanceof LppObject)
        return comparePrototype(prototype1, prototype2)
      return false // should never happen
    }
    /**
     * @returns {string} toString for visualReport.
     */
    toString() {
      return '<Lpp Object>'
    }
    /**
     * Construct a object value.
     * @param {Map<string, LppValue> | undefined} value Object content.
     * @param {undefined | LppFunction} constructor Constructor function. Defaults to Object.
     * @param {undefined | string} display The object display for Scratch.
     */
    constructor(
      value = undefined,
      constructor = undefined,
      display = undefined
    ) {
      super(display ?? '<Lpp Object>')
      this.value = value ?? new Map()
      if (constructor) this.value.set('constructor', constructor)
    }
  }
  class LppArray extends LppValue {
    /**
     * @type {(LppValue | undefined)[]} Array of values.
     */
    value
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @returns {LppValue | LppChildValue} Child object.
     */
    get(key) {
      if (key === 'constructor') {
        return global.get('Array') ?? LppConstant.init(null)
      } else {
        const idx = parseInt(key, 10)
        if (idx >= 0) {
          const res = this.value[idx]
          if (res) return new LppChildValue(this, key, res)
          else return new LppChildValue(this, key, LppConstant.init(null))
        } else {
          const constructor = ensureValue(this.get('constructor'))
          if (!(constructor instanceof LppFunction))
            throw new Error(
              'Lpp: Unexpected constructor -- must be a LppFunction instance'
            )
          const proto = ensureValue(constructor.get('prototype'))
          if (!(proto instanceof LppObject))
            throw new Error(
              'Lpp: Unexpected prototype -- must be a LppObject instance'
            )
          const member = lookupPrototype(proto, key)
          if (member === null) throw new LppError('invalidIndex')
          return new LppChildValue(this, key, member)
        }
      }
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      const idx = parseInt(key, 10)
      if (idx >= 0) {
        this.value[idx] = value
        return new LppChildValue(this, key, value)
      } else throw new LppError('invalidIndex')
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      if (key === 'constructor') return true
      const idx = parseInt(key, 10)
      if (idx >= 0 && idx in this.value) return true
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'Lpp: Unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'Lpp: Unexpected prototype -- must be a LppObject instance'
        )
      return lookupPrototype(proto, key) !== null
    }
    /**
     * Delete a value from the object.
     * @param {string} key Key to delete.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      const idx = parseInt(key, 10)
      if (idx >= 0 && idx in this.value) {
        delete this.value[idx]
        return true
      }
      return false
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param {LppFunction} fn Function.
     * @returns {boolean} Whether the value is constructed from fn.
     */
    instanceof(fn) {
      return fn === global.get('Array')
    }
    /**
     * @returns {string} toString for visualReport.
     */
    toString() {
      return '<Lpp Array>'
    }
    /**
     * Construct an array object.
     * @param {LppValue[] | undefined} value Array of values.
     */
    constructor(value = undefined) {
      super('<Lpp Array>')
      this.value = value ?? []
    }
  }
  class LppClosure extends LppValue {
    /**
     * @type {Map<string, LppValue>} Value.
     */
    value
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @returns {LppChildValue} Child object.
     */
    get(key) {
      return new LppChildValue(
        this,
        key,
        this.value.get(key) ?? LppConstant.init(null)
      )
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      this.value.set(key, value)
      return new LppChildValue(this, key, value)
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      return this.value.has(key)
    }
    /**
     * Delete a value from the object.
     * @param {string} key Key to delete.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      return this.value.delete(key)
    }
    toString() {
      return '<Lpp Closure>'
    }
    constructor() {
      super('<Lpp Closure>')
      this.value = new Map()
    }
  }
  /**
   * Lpp Scope.
   */
  class LppContext {
    /**
     * @type {LppClosure} Closure.
     */
    closure
    /**
     * @type {LppContext?} Parent closure.
     */
    parent
    /**
     * @type {(value: LppException) => void} Callback if function throws.
     */
    _exceptionCallback
    /**
     * @type {(value: LppReturn) => void} Callback if function returns.
     */
    _returnCallback
    /**
     * Exception callback wrapper.
     * @param {LppException} value
     */
    exceptionCallback(value) {
      this._exceptionCallback(value)
      this.clearCallbacks()
    }
    /**
     * Return callback wrapper.
     * @param {LppReturn} value
     */
    returnCallback(value) {
      this._returnCallback(value)
      this.clearCallbacks()
    }
    /**
     * Get variable.
     * @param {string} name Variable name.
     * @returns {LppChildValue} Variable result.
     */
    get(name) {
      if (this.closure.has(name)) return this.closure.get(name)
      else return this.parent ? this.parent.get(name) : this.closure.get(name)
    }
    /**
     * @virtual Clear callbacks.
     */
    clearCallbacks() {
      this._exceptionCallback = () => {}
      this._returnCallback = () => {}
    }

    /**
     * Unwind to a parent function context.
     * @returns {LppFunctionContext?} Result.
     */
    unwind() {
      return this.parent ? this.parent.unwind() : null
    }
    /**
     * Construct a new context.
     * @param {LppContext?} parent Parent closure.
     * @param {(value: LppReturn) => void} returnCallback Callback if function returns.
     * @param {(value: LppException) => void} exceptionCallback Callback if function throws.
     */
    constructor(parent, returnCallback, exceptionCallback) {
      this.closure = new LppClosure()
      this.parent = parent
      // For return blocks
      this._returnCallback = returnCallback
      // For try-catch blocks
      this.exceptionCallback = exceptionCallback
    }
  }
  /**
   * Function context extended from LppContext.
   */
  class LppFunctionContext extends LppContext {
    /**
     * @type {LppValue} Self object.
     */
    self
    /**
     * @virtual Clear callbacks.
     */
    clearCallbacks() {
      super.clearCallbacks()
    }
    /**
     * Unwind to a parent function context.
     * @returns {LppFunctionContext} Result.
     */
    unwind() {
      return this
    }
    /**
     * @param {LppFunctionContext?} parent Parent context.
     * @param {LppValue} self Self object.
     * @param {(value: LppReturn) => void} returnCallback Callback if function returns.
     * @param {(value: LppException) => void} exceptionCallback Callback if function throws.
     */
    constructor(parent, self, returnCallback, exceptionCallback) {
      super(parent, returnCallback, exceptionCallback)
      this.self = self
    }
  }
  /**
   * @typedef {LppReturn | LppException} LppReturnOrException
   */
  class LppFunction extends LppObject {
    /**
     * @type {(self: LppValue, args: LppValue[]) => LppReturnOrException | Promise<LppReturnOrException>} Function to execute.
     */
    execute
    /**
     * Construct a native function.
     * @param {(self: LppValue, args: LppValue[]) => LppReturnOrException | Promise<LppReturnOrException>} execute Function to execute.
     * @param {LppObject | undefined} prototype Function prototype.
     * @returns {LppFunction} Constructed function.
     */
    static native(execute, prototype = undefined) {
      /**
       * Add a stack to exception.
       * @param {LppReturnOrException} exception Exception.
       * @param {LppFunction} fn Called function.
       * @param {LppValue} self Self object.
       * @param {LppValue[]} args Arguments.
       * @returns {LppReturnOrException} Result.
       */
      function addNativeTraceback(exception, fn, self, args) {
        if (exception instanceof LppException)
          exception.pushStack(new LppNativeFnTraceback(fn, self, args))
        return exception
      }
      const obj = new LppFunction((self, args) => {
        const res = execute(self, args)
        if (res instanceof Promise) {
          return res.then(value =>
            addNativeTraceback(value, obj, self ?? LppConstant.init(null), args)
          )
        }
        return addNativeTraceback(
          res,
          obj,
          self ?? LppConstant.init(null),
          args
        )
      }, prototype)
      return obj
    }
    /**
     * Get a value.
     * @param {string} key Value to get.
     * @returns {LppValue | LppChildValue} Child object.
     */
    get(key) {
      if (key === 'constructor') {
        return global.get('Function') ?? LppConstant.init(null)
      } else if (key === 'prototype') {
        const res = this.value.get(key)
        if (res) return res
        else throw new Error('Lpp: unexpected get -- prototype is null')
      } else {
        const res = this.value.get(key)
        if (res) return new LppChildValue(this, key, res)
        const constructor = ensureValue(this.get('constructor'))
        if (!(constructor instanceof LppFunction))
          throw new Error(
            'Lpp: Unexpected constructor -- must be a LppFunction instance'
          )
        const proto = ensureValue(constructor.get('prototype'))
        if (!(proto instanceof LppObject))
          throw new Error(
            'Lpp: Unexpected prototype -- must be a LppObject instance'
          )
        const member = lookupPrototype(proto, key)
        if (member === null)
          return new LppChildValue(this, key, LppConstant.init(null))
        return new LppChildValue(this, key, member)
      }
    }
    /**
     * Set a value.
     * @param {string} key Key to set.
     * @param {LppValue} value Value to set.
     * @returns {LppChildValue} Value.
     */
    set(key, value) {
      this.value.set(key, value)
      return new LppChildValue(this, key, value)
    }
    /**
     * Detect whether a value exists.
     * @param {string} key Key to detect.
     * @returns {boolean} Whether the value exists.
     */
    has(key) {
      if (key === 'constructor' || this.value.has(key)) return true
      const constructor = ensureValue(this.get('constructor'))
      if (!(constructor instanceof LppFunction))
        throw new Error(
          'Lpp: Unexpected constructor -- must be a LppFunction instance'
        )
      const proto = ensureValue(constructor.get('prototype'))
      if (!(proto instanceof LppObject))
        throw new Error(
          'Lpp: Unexpected prototype -- must be a LppObject instance'
        )
      return lookupPrototype(proto, key) !== null
    }
    /**
     * Delete a value from the object.
     * @param {string} key Key to delete.
     * @returns {boolean} Whether the value exists.
     */
    delete(key) {
      if (key === 'prototype') {
        throw new LppError('assignOfConstant')
      }
      return this.value.delete(key)
    }
    /**
     * Call function with arguments.
     * @param {LppValue} self Function self object. Might be null.
     * @param {LppValue[]} args Function arguments.
     * @returns {LppReturnOrException | Promise<LppReturnOrException>} Return value.
     */
    apply(self, args) {
      return this.execute(self, args)
    }
    /**
     * Call function as a constructor.
     * @param {LppValue[]} args Function arguments.
     * @returns {LppReturnOrException | Promise<LppReturnOrException>} Return value.
     */
    construct(args) {
      if (
        this === global.get('Number') ||
        this === global.get('String') ||
        this === global.get('Boolean') ||
        this === global.get('Array') ||
        this === global.get('Function') ||
        this === global.get('Object')
      )
        return this.apply(LppConstant.init(null), args)
      const obj = new LppObject(new Map(), this)
      const res = this.apply(obj, args)
      /**
       * Process return value.
       * @param {LppReturnOrException} result Result.
       * @returns {LppReturnOrException} Processed result.
       */
      const process = result => {
        if (result instanceof LppException) return result
        return new LppReturn(obj)
      }
      if (res instanceof Promise) {
        return res.then(result => {
          return process(result)
        })
      }
      return process(res)
    }
    /**
     * @returns {string} toString for visualReport.
     */
    toString() {
      return '<Lpp Function>'
    }
    /**
     * Construct a function object.
     * @warning Do not use this function directly unless you know what you are doing! Use LppFunction.native instead.
     * @param {(self: LppValue, args: LppValue[]) => LppReturnOrException | Promise<LppReturnOrException>} execute Function to execute.
     * @param {LppObject | undefined} prototype Function prototype.
     */
    constructor(execute, prototype = undefined) {
      super(new Map(), undefined, '<Lpp Function>')
      this.execute = execute
      this.value.set('prototype', prototype ?? new LppObject())
    }
  }
  ;(() => {
    const GlobalBoolean = LppFunction.native((self, args) => {
      /**
       * Convert args to boolean.
       * @param {LppValue[]} args Array to convert.
       * @returns {LppConstant<boolean>} Converted value.
       */
      function convertToBoolean(args) {
        if (args.length < 1) return LppConstant.init(false)
        const v = args[0]
        if (v instanceof LppConstant) {
          if (v === LppConstant.init(null)) return LppConstant.init(false)
          switch (typeof v.value) {
            case 'string':
              return v.value !== ''
                ? LppConstant.init(true)
                : LppConstant.init(false)
            case 'number':
              return v.value !== 0
                ? LppConstant.init(true)
                : LppConstant.init(false)
            case 'boolean':
              return v.value ? LppConstant.init(true) : LppConstant.init(false)
          }
        } else if (v instanceof LppFunction) {
          return LppConstant.init(true)
        } else if (v instanceof LppObject) {
          return v.value.size !== 0
            ? LppConstant.init(true)
            : LppConstant.init(false)
        }
        return LppConstant.init(false) // should never happen
      }
      return new LppReturn(convertToBoolean(args))
    }, new LppObject(new Map()))
    const GlobalNumber = LppFunction.native((self, args) => {
      /**
       * Convert args to number.
       * @param {LppValue[]} args Array to convert.
       * @returns {LppConstant<number>} Converted value.
       */
      function convertToNumber(args) {
        if (args.length < 1) return LppConstant.init(0)
        const v = args[0]
        if (v instanceof LppConstant) {
          if (v === LppConstant.init(null)) return LppConstant.init(0)
          switch (typeof v.value) {
            case 'string':
              return LppConstant.init(Number(v.value))
            case 'number':
              return LppConstant.init(v.value)
            case 'boolean':
              return v.value ? LppConstant.init(1) : LppConstant.init(0)
          }
        } else if (v instanceof LppFunction) {
          return LppConstant.init(NaN)
        } else if (v instanceof LppObject) {
          return LppConstant.init(NaN)
        }
        return LppConstant.init(NaN) // should never happen
      }
      return new LppReturn(convertToNumber(args))
    }, new LppObject(new Map()))
    const GlobalString = LppFunction.native(
      (self, args) => {
        /**
         * Convert args to string.
         * @param {LppValue[]} args Array to convert.
         * @returns {LppConstant<string>} Converted value.
         */
        function convertToString(args) {
          if (args.length < 1) return LppConstant.init('')
          const v = args[0]
          return LppConstant.init(v.toString()) // should never happen
        }
        return new LppReturn(convertToString(args))
      },
      new LppObject(
        new Map([
          [
            'length',
            LppFunction.native(self => {
              if (
                self instanceof LppConstant &&
                typeof self.value === 'string'
              ) {
                return new LppReturn(LppConstant.init(self.value.length))
              }
              const res = GlobalIllegalInvocationError.construct([])
              if (res instanceof Promise)
                throw new Error(
                  'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            })
          ]
        ])
      )
    )
    const GlobalArray = LppFunction.native(
      (self, args) => {
        /**
         * Convert args to Array object.
         * @param {LppValue[]} args Array to convert.
         * @returns {LppArray} Converted value.
         */
        function convertToArray(args) {
          if (args.length < 1) return new LppArray()
          if (args.length === 1 && args[0] instanceof LppArray) {
            return args[0]
          }
          return new LppArray(args)
        }
        return new LppReturn(convertToArray(args))
      },
      new LppObject(
        new Map([
          [
            'length',
            LppFunction.native(self => {
              if (self instanceof LppArray) {
                return new LppReturn(LppConstant.init(self.value.length))
              }
              const res = GlobalIllegalInvocationError.construct([])
              if (res instanceof Promise)
                throw new Error(
                  'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            })
          ]
        ])
      )
    )
    const GlobalObject = LppFunction.native((self, args) => {
      /**
       * Convert args to object.
       * @param {LppValue[]} args Array to convert.
       * @returns {LppValue} Converted value.
       */
      function convertToObject(args) {
        if (args.length < 1) return new LppObject()
        return args[0]
      }
      return new LppReturn(convertToObject(args))
    }, new LppObject(new Map()))
    const GlobalFunction = LppFunction.native((self, args) => {
      if (args.length < 1)
        return new LppReturn(
          new LppFunction(() => {
            return new LppReturn(LppConstant.init(null))
          })
        )
      if (args[0] instanceof LppFunction) return new LppReturn(args[0])
      const res = GlobalIllegalInvocationError.construct([])
      if (res instanceof Promise)
        throw new Error(
          'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
        )
      if (res instanceof LppException) return res
      return new LppException(res.value)
    }, new LppObject(new Map([['prototype', ensureValue(GlobalObject.get('prototype'))]])))
    const GlobalError = LppFunction.native((self, args) => {
      if (self.instanceof(GlobalError)) {
        self.set('value', args[0] ?? LppConstant.init(null))
        self.set('stack', LppConstant.init(null))
        return new LppReturn(new LppArray())
      } else {
        const res = GlobalIllegalInvocationError.construct([])
        if (res instanceof Promise)
          throw new Error(
            'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    }, new LppObject(new Map()))
    const GlobalIllegalInvocationError = LppFunction.native((self, args) => {
      if (self.instanceof(GlobalIllegalInvocationError)) {
        const res = GlobalError.apply(self, args)
        if (res instanceof Promise)
          throw new Error('Lpp: GlobalError constructor should be synchronous')
        if (res instanceof LppException) return res
        return new LppReturn(LppConstant.init(null))
      } else {
        const res = GlobalIllegalInvocationError.construct([])
        if (res instanceof Promise)
          throw new Error(
            'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    }, new LppObject(new Map([['prototype', ensureValue(GlobalError.get('prototype'))]])))
    const GlobalSyntaxError = LppFunction.native((self, args) => {
      if (self.instanceof(GlobalSyntaxError)) {
        const res = GlobalError.apply(self, args)
        if (res instanceof Promise)
          throw new Error('Lpp: GlobalError constructor should be synchronous')
        if (res instanceof LppException) return res
        return new LppReturn(LppConstant.init(null))
      } else {
        const res = GlobalIllegalInvocationError.construct([])
        if (res instanceof Promise)
          throw new Error(
            'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
          )
        if (res instanceof LppException) return res
        return new LppException(res.value)
      }
    }, new LppObject(new Map([['prototype', ensureValue(GlobalError.get('prototype'))]])))
    /**
     * Convert Lpp object to JavaScript object.
     * @param {LppValue} value Object.
     * @returns {any} Return value.
     */
    function serialize(value) {
      /**
       * @type {WeakMap<LppValue, object>}
       */
      const map = new WeakMap()
      /**
       * Convert Lpp object to JavaScript object.
       * @param {LppValue} value Object.
       * @returns {any} Return value.
       */
      function serializeInternal(value) {
        if (value instanceof LppConstant) return value.value
        if (value instanceof LppArray) {
          const cache = map.get(value)
          if (cache) return cache
          const res = value.value.map(v => (v ? serialize(v) : null))
          map.set(value, res)
          return res
        }
        if (value instanceof LppObject) {
          const cache = map.get(value)
          if (cache) return cache
          const res = {}
          for (const [k, v] of value.value.entries()) {
            if (k === 'constructor') continue
            res[k] = serialize(v)
          }
          map.set(value, res)
          return res
        }
        return null
      }
      return serializeInternal(value)
    }
    /**
     * Convert JavaScript object to Lpp object.
     * @param {any} value Object.
     * @returns {LppValue} Return value.
     */
    function deserialize(value) {
      /**
       * @type {WeakMap<object, LppValue>}
       */
      const map = new WeakMap()
      /**
       * Convert JavaScript object to Lpp object.
       * @param {any} value Object.
       * @returns {LppValue} Return value.
       */
      function deserializeInternal(value) {
        if (value === null || value === undefined) return LppConstant.init(null)
        switch (typeof value) {
          case 'string':
          case 'number':
          case 'boolean':
            return LppConstant.init(value)
          case 'object': {
            const v = map.get(value)
            if (v) return v
            if (value instanceof Array) {
              const res = new LppArray(
                value.map(value => deserializeInternal(value))
              )
              map.set(v, res)
              return res
            }
            const obj = new LppObject()
            for (const [k, v] of Object.entries(value)) {
              obj.set(k, deserializeInternal(v))
            }
            map.set(v, obj)
            return obj
          }
        }
        return LppConstant.init(null)
      }
      return deserializeInternal(value)
    }
    const GlobalJSON = new LppObject(
      new Map([
        [
          'parse',
          LppFunction.native((self, args) => {
            if (self != GlobalJSON) {
              const res = GlobalIllegalInvocationError.construct([])
              if (res instanceof Promise)
                throw new Error(
                  'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            }
            if (
              args.length < 1 ||
              !(args[0] instanceof LppConstant) ||
              !(typeof args[0].value === 'string')
            ) {
              return GlobalSyntaxError.construct([
                LppConstant.init('Invalid JSON')
              ])
            }
            try {
              return new LppReturn(deserialize(JSON.parse(args[0].value)))
            } catch (e) {
              if (e instanceof Error) {
                return GlobalSyntaxError.construct([
                  LppConstant.init(e.message)
                ])
              } else throw e
            }
          })
        ],
        [
          'stringify',
          LppFunction.native((self, args) => {
            if (self != GlobalJSON) {
              const res = GlobalIllegalInvocationError.construct([])
              if (res instanceof Promise)
                throw new Error(
                  'Lpp: GlobalIllegalInvocationError constructor should be synchronous'
                )
              if (res instanceof LppException) return res
              return new LppException(res.value)
            }
            if (args.length < 1) {
              return GlobalSyntaxError.construct([
                LppConstant.init('Invalid value')
              ])
            }
            try {
              return new LppReturn(
                LppConstant.init(JSON.stringify(serialize(args[0])))
              )
            } catch (e) {
              if (e instanceof Error) {
                return GlobalSyntaxError.construct([
                  LppConstant.init(e.message)
                ])
              } else throw e
            }
          })
        ]
      ])
    )
    // Type
    global.set('Boolean', GlobalBoolean)
    global.set('Number', GlobalNumber)
    global.set('String', GlobalString)
    global.set('Array', GlobalArray)
    global.set('Object', GlobalObject)
    global.set('Function', GlobalFunction)
    // Error
    global.set('Error', GlobalError)
    global.set('IllegalInvocationError', GlobalIllegalInvocationError)
    global.set('SyntaxError', GlobalSyntaxError)
    // Utility
    global.set('JSON', GlobalJSON)
  })()
  // hijack Function.prototype.apply to get React element instance.
  /**
   * @template T thisArg type.
   * @param {() => any} fn
   * @returns
   */
  function hijack(fn) {
    const _orig = Function.prototype.apply
    /**
     * Hijack the Function.prototype.apply function.
     * @param {T} thisArg
     * @returns {T} thisArg.
     */
    Function.prototype.apply = function (thisArg) {
      return thisArg
    }
    const result = fn()
    Function.prototype.apply = _orig
    return result
  }
  /**
   * The extension class.
   */
  class LppExtension {
    /**
     * @type {any} Scratch runtime.
     */
    runtime
    /**
     * @type {any} Virtual machine instance.
     */
    vm
    /**
     * @type {any?} ScratchBlocks instance.
     */
    Blockly
    /**
     * @type {boolean} Whether the extension is initalized.
     */
    initalized
    /**
     * @type {any?} Constructor of Target class.
     */
    targetConstructor
    /**
     * @type {any?} Constructor of Thread class.
     */
    threadConstructor
    /**
     * @type {boolean} Whether the extension is running on early Scratch versions.
     */
    isEarlyScratch
    /**
     * @type {boolean} Shared isMutatorClick state.
     */
    mutatorClick
    /**
     * Constructs a new instance of lpp.
     * @param {any} runtime Scratch runtime.
     */
    constructor(runtime) {
      this.initalized = false
      this.targetConstructor = this.threadConstructor = null
      this.runtime = runtime
      this.targetConstructor = this.Blockly = this.threadConstructor = null
      this.mutatorClick = false
      Scratch.translate.setup(locale)
      // step 1: get virtual machine instance
      if (this.runtime._events['QUESTION'] instanceof Array) {
        for (const value of this.runtime._events['QUESTION']) {
          const v = hijack(value)
          if (v?.props?.vm) {
            this.vm = v?.props?.vm
            break
          }
        }
      } else if (this.runtime._events['QUESTION']) {
        this.vm = hijack(this.runtime._events['QUESTION'])?.props?.vm
      }
      if (!this.vm) throw new Error('lpp cannot get Virtual Machine instance.')
      // step 2: get ScratchBlocks instance
      if (this.vm._events['EXTENSION_ADDED'] instanceof Array) {
        for (const value of this.vm._events['EXTENSION_ADDED']) {
          const v = hijack(value)
          if (v?.ScratchBlocks) {
            this.Blockly = v?.ScratchBlocks
            break
          }
        }
      } else if (this.vm._events['EXTENSION_ADDED']) {
        this.Blockly = hijack(this.vm._events['EXTENSION_ADDED'])?.ScratchBlocks
      }
      // if (!this.Blockly)
      //   throw new Error('lpp cannot get ScratchBlocks instance.')
      this.runtime = runtime
      // Ignore SAY and QUESTION calls on dummy target.
      const _emit = this.runtime.emit
      /**
       * @param {string} event Event name.
       * @param {unknown[]} args Arguments.
       * @returns {boolean}
       */
      this.runtime.emit = (event, ...args) => {
        const blacklist = ['SAY', 'QUESTION']
        if (
          blacklist.includes(event) &&
          args.length >= 1 &&
          typeof args[0] === 'object' &&
          args[0] !== null &&
          Reflect.get(args[0], 'id') === ''
        ) {
          this.handleError(new LppError('useAfterDispose'))
        }
        return _emit.call(this.runtime, event, ...args)
      }
      const _stepThread =
        this.runtime.sequencer.constructor.prototype.stepThread
      // Patch for early Scratch 3 versions (before commit 39b18fe by @mzgoddard, Apr 12, 2019).
      if (!('activeThread' in this.runtime.sequencer)) {
        this.isEarlyScratch = true
        this.runtime.sequencer.constructor.prototype.stepThread = function (
          thread
        ) {
          _stepThread.call(this, (this.activeThread = thread))
        }
      } else this.isEarlyScratch = false
      // Export
      this.runtime.lpp = {
        LppValue,
        LppChildValue,
        LppConstant,
        LppArray,
        LppObject,
        LppFunction,
        LppReturn,
        LppException,
        version: lppVersion,
        global
      }
      console.groupCollapsed(`💫 lpp`, lppVersion)
      console.log('🌟', this.formatMessage('lpp.about.summary'))
      console.log(
        '🤖',
        this.formatMessage('lpp.about.github'),
        '-> https://github.com/FurryR/lpp-scratch'
      )
      console.log(
        '💞',
        this.formatMessage('lpp.about.afdian'),
        '-> https://afdian.net/a/FurryR'
      )
      console.group('👾', this.formatMessage('lpp.about.staff.1'))
      console.log(
        '🐺 @FurryR https://github.com/FurryR - Developer, Test, Translation, Documentation'
      )
      console.log(
        '🤔 @SimonShiki https://github.com/SimonShiki - Test, Technical support'
      )
      console.log('😄 @Nights https://github.com/Nightre - Technical support')
      console.log(
        '🐺 @VeroFess https://github.com/VeroFess - Technical support'
      )
      console.log('🥰', this.formatMessage('lpp.about.staff.2'))
      console.groupEnd()
      console.groupEnd()
    }

    /**
     * Show visual traceback
     * @param {SVGAElement} svgRoot SVG element.
     */
    showTraceback(svgRoot) {
      let container = document.getElementById('tmpSVGContainer')
      const temp = svgRoot.outerHTML.replace(/&nbsp;/g, ' ')
      if (!container) {
        container = document.createElement('div')
        container.id = 'tmpSVGContainer'
        container.innerHTML =
          '<svg id="tmpSVG" xmlns="http://www.w3.org/2000/svg" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" class="blocklySvg"><style type="text/css" ><![CDATA[.blocklyDraggable{font-family: "Helvetica Neue", Helvetica, sans-serif;font-size: 12pt;font-weight: 500;}.blocklyText {fill: #fff;box-sizing: border-box;}.blocklyEditableText .blocklyText{fill: #000;}.blocklyDropdownText.blocklyText{fill: #fff;}]]></style><g id="tmpSVGContent"></g></svg>'
        document.body.appendChild(container)
      }
      const content = document.getElementById('tmpSVGContent')
      if (content && content instanceof SVGGElement) {
        content.innerHTML = temp
        content.children[0].setAttribute('transform', '')
        const shape = content.children[0].getAttribute('data-shapes') ?? '',
          shape_hat = shape.includes('hat'),
          ishat = 'hat' !== shape && shape_hat,
          bbox = content.getBBox()
        let length = shape_hat ? 18 : 0
        length = ishat ? 21 : length
        const width = Math.max(750, bbox.width + 1),
          height = bbox.height + length,
          svg = document.getElementById('tmpSVG')
        if (svg) {
          svg.setAttribute('width', width.toString())
          svg.setAttribute('height', height.toString())
          svg.setAttribute(
            'viewBox',
            `-1 ${shape_hat ? -length : 0} ${width} ${height}`
          )
          let html = svg.outerHTML
          html = (html = (html = (html = (html = html.replace(
            /"[\S]+?dropdown-arrow\.svg"/gm,
            '"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4="'
          )).replace(
            /"[\S]+?green-flag\.svg"/gm,
            '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImdyZWVuZmxhZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0NTk5M0Q7fQoJLnN0MXtmaWxsOiM0Q0JGNTY7fQo8L3N0eWxlPgo8dGl0bGU+Z3JlZW5mbGFnPC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIwLjgsMy43Yy0wLjQtMC4yLTAuOS0wLjEtMS4yLDAuMmMtMiwxLjYtNC44LDEuNi02LjgsMGMtMi4zLTEuOS01LjYtMi4zLTguMy0xVjIuNWMwLTAuNi0wLjUtMS0xLTEKCXMtMSwwLjQtMSwxdjE4LjhjMCwwLjUsMC41LDEsMSwxaDAuMWMwLjUsMCwxLTAuNSwxLTF2LTYuNGMxLTAuNywyLjEtMS4yLDMuNC0xLjNjMS4yLDAsMi40LDAuNCwzLjQsMS4yYzIuOSwyLjMsNywyLjMsOS44LDAKCWMwLjMtMC4yLDAuNC0wLjUsMC40LTAuOVY0LjdDMjEuNiw0LjIsMjEuMywzLjgsMjAuOCwzLjd6IE0yMC41LDEzLjlDMjAuNSwxMy45LDIwLjUsMTMuOSwyMC41LDEzLjlDMTgsMTYsMTQuNCwxNiwxMS45LDE0CgljLTEuMS0wLjktMi41LTEuNC00LTEuNGMtMS4yLDAuMS0yLjMsMC41LTMuNCwxLjFWNEM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwCgljMCwwLDAuMSwwLjEsMC4xLDAuMUwyMC41LDEzLjl6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yMC42LDQuOGwtMC4xLDkuMWMwLDAsMCwwLjEsMCwwLjFjLTIuNSwyLTYuMSwyLTguNiwwYy0xLjEtMC45LTIuNS0xLjQtNC0xLjRjLTEuMiwwLjEtMi4zLDAuNS0zLjQsMS4xVjQKCUM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwQzIwLjUsNC43LDIwLjYsNC43LDIwLjYsNC44eiIvPgo8L3N2Zz4K"'
          )).replace(
            /"[\S]+?repeat\.svg"/gm,
            '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9InJlcGVhdCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNDRjhCMTc7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8dGl0bGU+cmVwZWF0PC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIzLjMsMTFjLTAuMywwLjYtMC45LDEtMS41LDFoLTEuNmMtMC4xLDEuMy0wLjUsMi41LTEuMSwzLjZjLTAuOSwxLjctMi4zLDMuMi00LjEsNC4xCgljLTEuNywwLjktMy42LDEuMi01LjUsMC45Yy0xLjgtMC4zLTMuNS0xLjEtNC45LTIuM2MtMC43LTAuNy0wLjctMS45LDAtMi42YzAuNi0wLjYsMS42LTAuNywyLjMtMC4ySDdjMC45LDAuNiwxLjksMC45LDIuOSwwLjkKCXMxLjktMC4zLDIuNy0wLjljMS4xLTAuOCwxLjgtMi4xLDEuOC0zLjVoLTEuNWMtMC45LDAtMS43LTAuNy0xLjctMS43YzAtMC40LDAuMi0wLjksMC41LTEuMmw0LjQtNC40YzAuNy0wLjYsMS43LTAuNiwyLjQsMEwyMyw5LjIKCUMyMy41LDkuNywyMy42LDEwLjQsMjMuMywxMXoiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxLjgsMTFoLTIuNmMwLDEuNS0wLjMsMi45LTEsNC4yYy0wLjgsMS42LTIuMSwyLjgtMy43LDMuNmMtMS41LDAuOC0zLjMsMS4xLTQuOSwwLjhjLTEuNi0wLjItMy4yLTEtNC40LTIuMQoJYy0wLjQtMC4zLTAuNC0wLjktMC4xLTEuMmMwLjMtMC40LDAuOS0wLjQsMS4yLTAuMWwwLDBjMSwwLjcsMi4yLDEuMSwzLjQsMS4xczIuMy0wLjMsMy4zLTFjMC45LTAuNiwxLjYtMS41LDItMi42CgljMC4zLTAuOSwwLjQtMS44LDAuMi0yLjhoLTIuNGMtMC40LDAtMC43LTAuMy0wLjctMC43YzAtMC4yLDAuMS0wLjMsMC4yLTAuNGw0LjQtNC40YzAuMy0wLjMsMC43LTAuMywwLjksMEwyMiw5LjgKCWMwLjMsMC4zLDAuNCwwLjYsMC4zLDAuOVMyMiwxMSwyMS44LDExeiIvPgo8L3N2Zz4K"'
          )).replace(
            /"[\S]+?rotate-left\.svg"/gm,
            '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNsb2Nrd2lzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojM2Q3OWNjO30uY2xzLTJ7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48dGl0bGU+cm90YXRlLWNsb2Nrd2lzZTwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjAuMzQsMTguMjFhMTAuMjQsMTAuMjQsMCwwLDEtOC4xLDQuMjIsMi4yNiwyLjI2LDAsMCwxLS4xNi00LjUyaDBhNS41OCw1LjU4LDAsMCwwLDQuMjUtMi41Myw1LjA2LDUuMDYsMCwwLDAsLjU0LTQuNjJBNC4yNSw0LjI1LDAsMCwwLDE1LjU1LDlhNC4zMSw0LjMxLDAsMCwwLTItLjhBNC44Miw0LjgyLDAsMCwwLDEwLjQsOWwxLjEyLDEuNDFBMS41OSwxLjU5LDAsMCwxLDEwLjM2LDEzSDIuNjdhMS41NiwxLjU2LDAsMCwxLTEuMjYtLjYzQTEuNTQsMS41NCwwLDAsMSwxLjEzLDExTDIuODUsMy41N0ExLjU5LDEuNTksMCwwLDEsNC4zOCwyLjQsMS41NywxLjU3LDAsMCwxLDUuNjIsM0w2LjcsNC4zNWExMC42NiwxMC42NiwwLDAsMSw3LjcyLTEuNjhBOS44OCw5Ljg4LDAsMCwxLDE5LDQuODEsOS42MSw5LjYxLDAsMCwxLDIxLjgzLDksMTAuMDgsMTAuMDgsMCwwLDEsMjAuMzQsMTguMjFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTkuNTYsMTcuNjVhOS4yOSw5LjI5LDAsMCwxLTcuMzUsMy44MywxLjMxLDEuMzEsMCwwLDEtLjA4LTIuNjIsNi41Myw2LjUzLDAsMCwwLDUtMi45Miw2LjA1LDYuMDUsMCwwLDAsLjY3LTUuNTEsNS4zMiw1LjMyLDAsMCwwLTEuNjQtMi4xNiw1LjIxLDUuMjEsMCwwLDAtMi40OC0xQTUuODYsNS44NiwwLDAsMCw5LDguODRMMTAuNzQsMTFhLjU5LjU5LDAsMCwxLS40MywxSDIuN2EuNi42LDAsMCwxLS42LS43NUwzLjgxLDMuODNhLjU5LjU5LDAsMCwxLDEtLjIxbDEuNjcsMi4xYTkuNzEsOS43MSwwLDAsMSw3Ljc1LTIuMDcsOC44NCw4Ljg0LDAsMCwxLDQuMTIsMS45Miw4LjY4LDguNjgsMCwwLDEsMi41NCwzLjcyQTkuMTQsOS4xNCwwLDAsMSwxOS41NiwxNy42NVoiLz48L3N2Zz4="'
          )).replace(
            /"[\S]+?rotate-right\.svg"/gm,
            '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNvdW50ZXItY2xvY2t3aXNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMzZDc5Y2M7fS5jbHMtMntmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5yb3RhdGUtY291bnRlci1jbG9ja3dpc2U8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIyLjY4LDEyLjJhMS42LDEuNiwwLDAsMS0xLjI3LjYzSDEzLjcyYTEuNTksMS41OSwwLDAsMS0xLjE2LTIuNThsMS4xMi0xLjQxYTQuODIsNC44MiwwLDAsMC0zLjE0LS43Nyw0LjMxLDQuMzEsMCwwLDAtMiwuOCw0LjI1LDQuMjUsMCwwLDAtMS4zNCwxLjczLDUuMDYsNS4wNiwwLDAsMCwuNTQsNC42MkE1LjU4LDUuNTgsMCwwLDAsMTIsMTcuNzRoMGEyLjI2LDIuMjYsMCwwLDEtLjE2LDQuNTJBMTAuMjUsMTAuMjUsMCwwLDEsMy43NCwxOCwxMC4xNCwxMC4xNCwwLDAsMSwyLjI1LDguNzgsOS43LDkuNywwLDAsMSw1LjA4LDQuNjQsOS45Miw5LjkyLDAsMCwxLDkuNjYsMi41YTEwLjY2LDEwLjY2LDAsMCwxLDcuNzIsMS42OGwxLjA4LTEuMzVhMS41NywxLjU3LDAsMCwxLDEuMjQtLjYsMS42LDEuNiwwLDAsMSwxLjU0LDEuMjFsMS43LDcuMzdBMS41NywxLjU3LDAsMCwxLDIyLjY4LDEyLjJaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEuMzgsMTEuODNIMTMuNzdhLjU5LjU5LDAsMCwxLS40My0xbDEuNzUtMi4xOWE1LjksNS45LDAsMCwwLTQuNy0xLjU4LDUuMDcsNS4wNywwLDAsMC00LjExLDMuMTdBNiw2LDAsMCwwLDcsMTUuNzdhNi41MSw2LjUxLDAsMCwwLDUsMi45MiwxLjMxLDEuMzEsMCwwLDEtLjA4LDIuNjIsOS4zLDkuMywwLDAsMS03LjM1LTMuODJBOS4xNiw5LjE2LDAsMCwxLDMuMTcsOS4xMiw4LjUxLDguNTEsMCwwLDEsNS43MSw1LjQsOC43Niw4Ljc2LDAsMCwxLDkuODIsMy40OGE5LjcxLDkuNzEsMCwwLDEsNy43NSwyLjA3bDEuNjctMi4xYS41OS41OSwwLDAsMSwxLC4yMUwyMiwxMS4wOEEuNTkuNTksMCwwLDEsMjEuMzgsMTEuODNaIi8+PC9zdmc+"'
          )
          const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            html
          )}`
          document.body.removeChild(container)
          console.log(
            '%c ',
            `font-size: 1px; padding-right: ${width}px; padding-bottom: ${height}px; background-image: url('${svgUrl}'); background-repeat: no-repeat; background-size: contain; color: transparent;`
          )
        }
      }
    }
    /**
     * Warn syntax errors with specified ID.
     * @param {string} error Error ID.
     * @param {string} id Block ID.
     */
    warnError(error, id) {
      const hasBlockly =
        this.Blockly && this.Blockly.getMainWorkspace().getToolbox() !== null
      if (hasBlockly) {
        notificationAlert({
          title: `❌ ${this.formatMessage(`lpp.error.${error}.summary`)}`,
          body: `📌 ${this.formatMessage(
            'lpp.error.position'
          )} ${id}\n🔍 ${this.formatMessage('lpp.error.hint')}`,
          tag: 'lppError',
          silent: false
        })
      } else {
        notificationAlert({
          title: `❌ ${this.formatMessage('lpp.error.releaseMode.summary')}`,
          body: `ℹ️ ${this.formatMessage(
            'lpp.error.releaseMode.detail'
          )}\n🔍 ${this.formatMessage('lpp.error.hint')}`,
          tag: 'lppError',
          silent: true
        })
      }
      console.groupCollapsed(
        `❌ ${this.formatMessage(`lpp.error.${error}.summary`)}`
      )
      if (hasBlockly) {
        console.log(`💡 ${this.formatMessage(`lpp.error.${error}.detail`)}`)
        const svgRoot = this.Blockly.getMainWorkspace()
          .getBlockById(this.runtime.sequencer.activeThread.peekStack())
          ?.getSvgRoot()
        console.groupCollapsed(
          `📌 ${this.formatMessage('lpp.error.position')} ${id}`
        )
        if (svgRoot) {
          this.showTraceback(svgRoot)
          console.log(svgRoot)
        } else {
          console.log(`❓ ${this.formatMessage('lpp.error.blockNotFound')}`)
        }
        console.groupEnd()
      } else {
        console.log(`ℹ️ ${this.formatMessage('lpp.error.releaseMode.detail')}`)
        console.log(`📌 ${this.formatMessage('lpp.error.position')} ${id}`)
      }
      console.groupEnd()
    }
    /**
     * Warn exception.
     * @param {LppException} exception Exception instance.
     */
    warnException(exception) {
      const hasBlockly =
        this.Blockly && this.Blockly.getMainWorkspace().getToolbox() !== null
      if (hasBlockly) {
        notificationAlert({
          title: `❌ ${this.formatMessage(
            'lpp.error.unhandledException.summary'
          )}`,
          body: `💡 ${this.formatMessage(
            'lpp.error.unhandledException.detail'
          )}\n🔍 ${this.formatMessage('lpp.error.hint')}`,
          tag: 'lppError',
          silent: false
        })
      } else {
        notificationAlert({
          title: `❌ ${this.formatMessage('lpp.error.releaseMode.summary')}`,
          body: `ℹ️ ${this.formatMessage(
            'lpp.error.releaseMode.detail'
          )}\n🔍 ${this.formatMessage('lpp.error.hint')}`,
          tag: 'lppError',
          silent: true
        })
      }
      console.groupCollapsed(
        `❌ ${this.formatMessage('lpp.error.unhandledException.summary')}`
      )
      if (hasBlockly)
        console.log(
          `💡 ${this.formatMessage('lpp.error.unhandledException.detail')}`
        )
      else
        console.log(`ℹ️ ${this.formatMessage('lpp.error.releaseMode.detail')}`)
      console.log(
        `🤔 ${this.formatMessage('lpp.error.unhandledException.exception')}`,
        exception.value
      )
      console.groupCollapsed(
        `👾 ${this.formatMessage('lpp.error.unhandledException.traceback')}`
      )
      for (const [idx, value] of exception.stack.entries()) {
        if (hasBlockly) {
          if (value instanceof LppBlockTraceback) {
            const svgRoot = this.Blockly.getMainWorkspace()
              .getBlockById(value.block)
              ?.getSvgRoot()
            console.groupCollapsed(`📌 ${idx + 1} ->`, value.block)
            if (svgRoot) {
              this.showTraceback(svgRoot)
              console.log(svgRoot)
            } else {
              console.log(`❓ ${this.formatMessage('lpp.error.blockNotFound')}`)
            }
            if (value.context)
              console.log(
                `🛠️ ${this.formatMessage('lpp.error.context')}`,
                value.context
              )
            console.groupEnd()
          } else {
            console.groupCollapsed(`📌 ${idx + 1} ->`, value.fn)
            console.log(
              `🛠️ ${this.formatMessage('lpp.error.self')}`,
              value.self
            )
            console.log(
              `🛠️ ${this.formatMessage('lpp.error.arguments')}`,
              value.args
            )
            console.groupEnd()
          }
        } else {
          if (value instanceof LppBlockTraceback) {
            console.log(`📌 ${idx + 1} ->`, value.block)
          } else {
            console.log(`📌 ${idx + 1} -> <Native Function>`)
          }
        }
      }
      console.groupEnd()
      console.groupEnd()
    }
    /**
     * Multi-language formatting support.
     * @param {string} id key of the translation.
     * @returns {string} Formatted string.
     */
    formatMessage(id) {
      return Scratch.translate({
        id,
        default: id,
        description: id
      })
    }
    /**
     * Get extension info.
     * @returns {unknown} Extension info.
     */
    getInfo() {
      // Sometimes getInfo() is called multiple times due to engine defects.
      if (!this.initalized) {
        this.initalized = true
        const simpleBlock = fn => ({
          get: () => ({ init: fn }),
          set: () => void 0
        })
        const advancedBlock = v => ({
          get: () => v,
          set: () => void 0
        })
        if (this.Blockly) {
          const Blockly = this.Blockly
          const self = this
          /// code from https://github.com/google/blockly-samples/blob/master/plugins/block-plus-minus & Open Roberta Lab
          function getExtraBlockState(block) {
            const state = block.mutationToDom()
            return state ? Blockly.Xml.domToText(state) : ''
          }
          Blockly.MutatorPlus = class MutatorPlus extends Blockly.Mutator {
            drawIcon_(a) {
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
            iconClick_(a) {
              if (
                !(
                  this.block_.workspace.isDragging() ||
                  Blockly.utils.isRightButton(a)
                )
              ) {
                const block = this.block_
                self.mutatorClick = true
                Blockly.Events.setGroup(true)
                const oldExtraState = getExtraBlockState(block)
                block.plus()
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
          Blockly.MutatorMinus = class MutatorMinus extends Blockly.Mutator {
            drawIcon_(a) {
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
            iconClick_(a) {
              if (
                !(
                  this.block_.workspace.isDragging() ||
                  Blockly.utils.isRightButton(a)
                )
              ) {
                const block = this.block_
                self.mutatorClick = true
                Blockly.Events.setGroup(true)
                const oldExtraState = getExtraBlockState(block)
                block.minus()
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
          Blockly.BlockSvg.prototype.setMutatorPlus = function (a) {
            if (this.mutatorPlus && this.mutatorPlus !== a) {
              this.mutatorPlus.dispose()
            }
            this.mutatorPlus = a
            if (a) {
              a.block_ = this
              if (this.rendered) this.mutatorPlus.createIcon()
            }
          }
          Blockly.BlockSvg.prototype.setMutatorMinus = function (a) {
            if (this.mutatorMinus && this.mutatorMinus !== a) {
              this.mutatorMinus.dispose()
            }
            this.mutatorMinus = a
            if (a) {
              a.block_ = this
              if (this.rendered) this.mutatorMinus.createIcon()
            }
          }
          const _update = Blockly.InsertionMarkerManager.prototype.update
          Blockly.InsertionMarkerManager.prototype.update = function (a, b) {
            if (
              this.firstMarker_.mutatorPlus ||
              this.firstMarker_.mutatorMinus
            ) {
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
            this.mutatorPlus && res.push(this.mutatorPlus)
            this.mutatorMinus && res.push(this.mutatorMinus)
            return res
          }
          /**
           * Append the shadow to the field.
           * @param {any} field Blockly field.
           * @param {string | undefined} defaultValue default value.
           * @returns Field.
           */
          function addShadow(field, defaultValue = undefined) {
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
           * @param {any} field Blockly field.
           * @returns Field.
           */
          function addNullShadow(field) {
            field.connection.setShadowDom(null)
            field.connection.respawnShadow_()
            return field
          }
          const formatMessage = this.formatMessage.bind(this)
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
              this.setOutput('String')
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
              this.setOutput('String')
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
              init: function () {
                this.setCategory('lpp')
                this.setMutatorPlus(new Blockly.MutatorPlus())
                this.setColour(color)
                this.setOutput('String')
                this.setInputsInline(true)
                this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
                this.appendDummyInput().appendField('[')
                this.appendDummyInput('ENDBRACE').appendField(']')
                this.setTooltip(formatMessage('lpp.tooltip.construct.Array'))
                this.length = 0
              },
              mutationToDom: function () {
                const elem = document.createElement('mutation')
                elem.setAttribute('length', this.length)
                return elem
              },
              domToMutation: function (mutation) {
                const attr = parseInt(mutation.getAttribute('length'), 10)
                // The following line also detects that attr is a number -- NaN > 0 will return false.
                if (attr > 0) {
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                  for (let i = 0; i < attr; i++) {
                    const input = this.appendValueInput(`ARG_${i}`)
                    if (!this.isInsertionMarker()) addNullShadow(input)
                    this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
                    if (i < attr - 1) {
                      this.appendDummyInput(`COMMA_${i}`).appendField(',')
                      this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
                    }
                  }
                }
                this.length = attr
              },
              plus: function () {
                const arg = this.length++
                this.mutatorMinus ??
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                if (arg != 0) {
                  this.appendDummyInput(`COMMA_${arg}`).appendField(',')
                  this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
                }
                addNullShadow(this.appendValueInput(`ARG_${arg}`))
                this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
                this.initSvg()
                this.render(false)
              },
              minus: function () {
                if (this.length > 0) {
                  this.length--
                  if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
                  else this.setMutatorMinus()
                  this.removeInput(`ARG_${this.length}`)
                  this.initSvg()
                  this.render(false)
                }
              }
            }),
            lpp_constructObject: advancedBlock({
              init: function () {
                this.setCategory('lpp')
                this.setMutatorPlus(new Blockly.MutatorPlus())
                this.setColour(color)
                this.setOutput('String')
                this.setInputsInline(true)
                this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
                this.appendDummyInput().appendField('{')
                this.length = 0
                this.appendDummyInput('ENDBRACE').appendField('}')
                this.setTooltip(formatMessage('lpp.tooltip.construct.Object'))
              },
              mutationToDom: function () {
                const elem = document.createElement('mutation')
                elem.setAttribute('length', this.length)
                return elem
              },
              domToMutation: function (mutation) {
                const attr = parseInt(mutation.getAttribute('length'), 10)
                // The following line also detects that attr is a number -- NaN > 0 will return false.
                if (attr > 0) {
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                  for (let i = 0; i < attr; i++) {
                    const key = this.appendValueInput(`KEY_${i}`)
                    const value = this.appendValueInput(`VALUE_${i}`)
                    this.appendDummyInput(`COLON_${i}`).appendField(':')
                    if (!this.isInsertionMarker()) {
                      addShadow(key)
                      addNullShadow(value)
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
              plus: function () {
                const arg = this.length++
                this.mutatorMinus ??
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                if (arg != 0) {
                  this.appendDummyInput(`COMMA_${arg}`).appendField(',')
                  this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
                }
                this.appendDummyInput(`COLON_${arg}`).appendField(':')
                addShadow(this.appendValueInput(`KEY_${arg}`))
                addNullShadow(this.appendValueInput(`VALUE_${arg}`))
                this.moveInputBefore(`VALUE_${arg}`, 'ENDBRACE')
                this.moveInputBefore(`COLON_${arg}`, `VALUE_${arg}`)
                this.moveInputBefore(`KEY_${arg}`, `COLON_${arg}`)
                this.initSvg()
                this.render(false)
              },
              minus: function () {
                if (this.length > 0) {
                  this.length--
                  if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
                  else this.setMutatorMinus()
                  this.removeInput(`KEY_${this.length}`)
                  this.removeInput(`COLON_${this.length}`)
                  this.removeInput(`VALUE_${this.length}`)
                  this.initSvg()
                  this.render(false)
                }
              }
            }),
            lpp_constructFunction: advancedBlock({
              init: function () {
                this.setCategory('lpp')
                this.setMutatorPlus(new Blockly.MutatorPlus())
                this.setColour(color)
                this.setOutput('String')
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
              mutationToDom: function () {
                const elem = document.createElement('mutation')
                elem.setAttribute('length', this.length)
                return elem
              },
              domToMutation: function (mutation) {
                const attr = parseInt(mutation.getAttribute('length'), 10)
                // The following line also detects that attr is a number -- NaN > 0 will return false.
                if (attr > 0) {
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                  for (let i = 0; i < attr; i++) {
                    const input = this.appendValueInput(`ARG_${i}`)
                    if (!this.isInsertionMarker()) addShadow(input)
                    this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
                    if (i < attr - 1) {
                      this.appendDummyInput(`COMMA_${i}`).appendField(',')
                      this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
                    }
                  }
                }
                this.length = attr
              },
              plus: function () {
                const arg = this.length++
                this.mutatorMinus ??
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                if (arg != 0) {
                  this.appendDummyInput(`COMMA_${arg}`).appendField(',')
                  this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
                }
                addShadow(this.appendValueInput(`ARG_${arg}`))
                this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
                this.initSvg()
                this.render(false)
              },
              minus: function () {
                if (this.length > 0) {
                  this.length--
                  if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
                  else this.setMutatorMinus()
                  this.removeInput(`ARG_${this.length}`)
                  this.initSvg()
                  this.render(false)
                }
              }
            }),
            // Operators
            lpp_var: simpleBlock(function () {
              this.setCategory('lpp')
              this.setInputsInline(true)
              this.setColour(color)
              this.setOutput('String')
              this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
              this.setTooltip(formatMessage('lpp.tooltip.operator.var'))
              this.appendDummyInput().appendField(
                formatMessage('lpp.block.operator.var')
              )
              this.appendValueInput('name')
            }),
            lpp_get: simpleBlock(function () {
              this.setCategory('lpp')
              this.setInputsInline(true)
              this.setColour(color)
              this.setOutput('String')
              this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
              this.setTooltip(formatMessage('lpp.tooltip.operator.get'))
              this.appendValueInput('value')
              this.appendDummyInput().appendField('[')
              this.appendValueInput('name')
              this.appendDummyInput().appendField(']')
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
                      ['<<<', '<<<'],
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
                    name: 'obj'
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
              init: function () {
                this.setCategory('lpp')
                this.setMutatorPlus(new Blockly.MutatorPlus())
                this.setColour(color)
                this.setOutput('String')
                this.setInputsInline(true)
                this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
                this.appendValueInput('fn')
                this.appendDummyInput().appendField('(')
                this.length = 0
                this.appendDummyInput('ENDBRACE').appendField(')')
                this.setTooltip(formatMessage('lpp.tooltip.operator.call'))
              },
              mutationToDom: function () {
                const elem = document.createElement('mutation')
                elem.setAttribute('length', this.length)
                return elem
              },
              domToMutation: function (mutation) {
                const attr = parseInt(mutation.getAttribute('length'), 10)
                // The following line also detects that attr is a number -- NaN > 0 will return false.
                if (attr > 0) {
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                  for (let i = 0; i < attr; i++) {
                    if (!this.isInsertionMarker())
                      addNullShadow(this.appendValueInput(`ARG_${i}`))
                    this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
                    if (i < attr - 1) {
                      this.appendDummyInput(`COMMA_${i}`).appendField(',')
                      this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
                    }
                  }
                }
                this.length = attr
              },
              plus: function () {
                const arg = this.length++
                this.mutatorMinus ??
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                if (arg != 0) {
                  this.appendDummyInput(`COMMA_${arg}`).appendField(',')
                  this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
                }
                addNullShadow(this.appendValueInput(`ARG_${arg}`))
                this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
                this.initSvg()
                this.render(false)
              },
              minus: function () {
                if (this.length > 0) {
                  this.length--
                  if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
                  else this.setMutatorMinus()
                  this.removeInput(`ARG_${this.length}`)
                  this.initSvg()
                  this.render(false)
                }
              }
            }),
            lpp_new: advancedBlock({
              init: function () {
                this.setCategory('lpp')
                this.setMutatorPlus(new Blockly.MutatorPlus())
                this.setColour(color)
                this.setOutput('String')
                this.setInputsInline(true)
                this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
                this.appendDummyInput().appendField('new ')
                this.appendValueInput('fn')
                this.appendDummyInput().appendField('(')
                this.length = 0
                this.appendDummyInput('ENDBRACE').appendField(')')
                this.setTooltip(formatMessage('lpp.tooltip.operator.new'))
              },
              mutationToDom: function () {
                const elem = document.createElement('mutation')
                elem.setAttribute('length', this.length)
                return elem
              },
              domToMutation: function (mutation) {
                const attr = parseInt(mutation.getAttribute('length'), 10)
                // The following line also detects that attr is a number -- NaN > 0 will return false.
                if (attr > 0) {
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                  for (let i = 0; i < attr; i++) {
                    if (!this.isInsertionMarker())
                      addNullShadow(this.appendValueInput(`ARG_${i}`))
                    this.moveInputBefore(`ARG_${i}`, 'ENDBRACE')
                    if (i < attr - 1) {
                      this.appendDummyInput(`COMMA_${i}`).appendField(',')
                      this.moveInputBefore(`COMMA_${i}`, 'ENDBRACE')
                    }
                  }
                }
                this.length = attr
              },
              plus: function () {
                const arg = this.length++
                this.mutatorMinus ??
                  this.setMutatorMinus(new Blockly.MutatorMinus())
                if (arg != 0) {
                  this.appendDummyInput(`COMMA_${arg}`).appendField(',')
                  this.moveInputBefore(`COMMA_${arg}`, 'ENDBRACE')
                }
                addNullShadow(this.appendValueInput(`ARG_${arg}`))
                this.moveInputBefore(`ARG_${arg}`, 'ENDBRACE')
                this.initSvg()
                this.render(false)
              },
              minus: function () {
                if (this.length > 0) {
                  this.length--
                  if (this.length != 0) this.removeInput(`COMMA_${this.length}`)
                  else this.setMutatorMinus()
                  this.removeInput(`ARG_${this.length}`)
                  this.initSvg()
                  this.render(false)
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
            lpp_semi: simpleBlock(function () {
              this.setCategory('lpp')
              this.setInputsInline(true)
              this.setColour(color)
              this.setInputsInline(true)
              this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
              this.setTooltip(formatMessage('lpp.tooltip.statement.semi'))
              this.setPreviousStatement(true, null)
              this.setNextStatement(true, null)
              this.appendValueInput('value')
              this.appendDummyInput().appendField(';')
            })
          })
        }
      }
      return {
        id: 'lpp',
        name: this.formatMessage('lpp.name'),
        color1: color,
        blocks: [
          {
            blockType: 'label',
            text: `#️⃣ ${this.formatMessage('lpp.category.builtin')}`
          },
          {
            opcode: 'builtinType',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'builtinError',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'builtinUtility',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            blockType: 'label',
            text: `🚧 ${this.formatMessage('lpp.category.construct')}`
          },
          {
            opcode: 'constructLiteral',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                menu: 'dummy'
              }
            }
          },
          {
            opcode: 'constructNumber',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                defaultValue: '10'
              }
            }
          },
          {
            opcode: 'constructString',
            blockType: 'reporter',
            text: '[value]',
            arguments: {
              value: {
                type: 'string',
                defaultValue: '🌟'
              }
            }
          },
          {
            opcode: 'constructArray',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'constructObject',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'constructFunction',
            blockType: 'reporter',
            text: ''
          },
          {
            blockType: 'label',
            text: `🔢 ${this.formatMessage('lpp.category.operator')}`
          },
          {
            opcode: 'get',
            blockType: 'reporter',
            text: '[value][name]',
            arguments: {
              value: {
                type: 'any'
              },
              name: {
                type: 'string',
                defaultValue: 'foo'
              }
            }
          },
          {
            opcode: 'binaryOp',
            blockType: 'reporter',
            text: '[lhs][op][rhs]',
            arguments: {
              lhs: { type: 'any' },
              op: {
                type: 'string',
                menu: 'dummy'
              },
              rhs: { type: 'any' }
            }
          },
          {
            opcode: 'unaryOp',
            blockType: 'reporter',
            text: '[op][obj]',
            arguments: {
              op: {
                type: 'string',
                menu: 'dummy'
              },
              obj: { type: 'any' }
            }
          },
          {
            opcode: 'call',
            blockType: 'reporter',
            text: '[fn]',
            arguments: {
              fn: { type: 'any' }
            }
          },
          {
            opcode: 'new',
            blockType: 'reporter',
            text: '[fn]',
            arguments: {
              fn: { type: 'any' }
            }
          },
          {
            opcode: 'self',
            blockType: 'reporter',
            text: ''
          },
          {
            opcode: 'var',
            blockType: 'reporter',
            text: '[name]',
            arguments: {
              name: {
                type: 'string',
                defaultValue: '🐺'
              }
            }
          },
          {
            blockType: 'label',
            text: `🤖 ${this.formatMessage('lpp.category.statement')}`
          },
          {
            opcode: 'return',
            isTerminal: true,
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          },
          {
            opcode: 'throw',
            isTerminal: true,
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          },
          {
            opcode: 'scope',
            blockType: 'command',
            text: ''
          },
          {
            opcode: 'try',
            blockType: 'command',
            text: '[var]',
            arguments: {
              var: { type: 'any' }
            }
          },
          {
            opcode: 'semi',
            blockType: 'command',
            text: '[value]',
            arguments: {
              value: { type: 'any' }
            }
          }
        ],
        menus: {
          dummy: {
            acceptReporters: false,
            items: []
          }
        }
      }
    }
    /**
     * Builtin types.
     * @param {{value: string}} param0 Function name.
     * @returns {LppValue} Class.
     */
    builtinType({ value }) {
      const instance = global.get(value)
      if (instance) return instance
      throw new Error('Lpp: Not implemented')
    }
    /**
     * Same as builtinType.
     * @param {{value: string}} args Function name.
     * @returns {LppValue} Class.
     */
    builtinError(args) {
      return this.builtinType(args)
    }
    /**
     * Same as builtinType.
     * @param {{value: string}} args Function name.
     * @returns {LppValue} Class.
     */
    builtinUtility(args) {
      return this.builtinType(args)
    }
    /**
     * Get literal value.
     * @param {{ value: unknown }} args Arguments.
     * @param {any} util Scratch util.
     * @returns {LppConstant | undefined} Constant value.
     */
    constructLiteral(args, util) {
      const { value } = args
      if (this.shouldExit(args, util)) return util.thread.stopThisScript()
      switch (value) {
        case 'null':
          return LppConstant.init(null)
        case 'true':
          return LppConstant.init(true)
        case 'false':
          return LppConstant.init(false)
        case 'NaN':
          return LppConstant.init(NaN)
        case 'Infinity':
          return LppConstant.init(Infinity)
      }
      throw new Error('Lpp: Unknown literal')
    }
    /**
     * Get member from value.
     * @param {{ value: unknown, name: unknown }} args Arguments.
     * @param {any} util Scratch util.
     * @returns {LppValue | LppChildValue | undefined} Result.
     */
    get(args, util) {
      const { value, name } = args
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (value instanceof LppValue || value instanceof LppChildValue) {
          if (typeof name === 'string' || typeof name === 'number') {
            return value.get(`${name}`)
          } else if (name instanceof LppConstant) {
            return value.get(name.toString())
          } else if (name instanceof LppChildValue) {
            if (name.value instanceof LppConstant)
              return value.get(name.value.toString())
          }
          throw new LppError('invalidIndex')
        }
        throw new LppError('syntaxError')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Make binary calculations.
     * @param {{lhs: unknown, op: string | number, rhs: unknown}} args Arguments.
     * @param {any} util Scratch util.
     * @returns {LppValue | LppChildValue | undefined} Result.
     */
    binaryOp(args, util) {
      const { lhs, op, rhs } = args
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (
          (lhs instanceof LppValue || lhs instanceof LppChildValue) &&
          (rhs instanceof LppValue || rhs instanceof LppChildValue)
        ) {
          switch (op) {
            case '=': {
              if (!(lhs instanceof LppChildValue))
                throw new LppError('assignOfConstant')
              return lhs.assign(ensureValue(rhs))
            }
            case '==': {
              const left = ensureValue(lhs)
              const right = ensureValue(rhs)
              return left === right
                ? LppConstant.init(true)
                : LppConstant.init(false)
            }
            case '!=': {
              const left = ensureValue(lhs)
              const right = ensureValue(rhs)
              return left !== right
                ? LppConstant.init(true)
                : LppConstant.init(false)
            }
            case 'instanceof': {
              if (rhs instanceof LppFunction) {
                return lhs.instanceof(rhs)
                  ? LppConstant.init(true)
                  : LppConstant.init(false)
              } else if (rhs instanceof LppChildValue) {
                if (rhs.value instanceof LppFunction) {
                  return lhs.instanceof(rhs.value)
                    ? LppConstant.init(true)
                    : LppConstant.init(false)
                } else throw new LppError('notCallable')
              } else throw new LppError('notCallable')
            }
          }
        } else {
          throw new LppError('syntaxError')
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Call function with arguments.
     * @param {{fn: unknown, mutation: { length: string }} & Record<string, unknown>} args The function and arguments.
     * @param {any} util Scratch util.
     * @returns {Promise<LppValue> | LppValue | undefined} Function result.
     */
    call(args, util) {
      try {
        const thread = util.thread
        const { fn } = args
        /**
         * @type {LppValue[]}
         */
        const actualArgs = []
        // runtime hack by @FurryR.
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        const len = parseInt(this.getMutation(args, util.thread).length, 10)
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (value instanceof LppValue || value instanceof LppChildValue)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppChildValue))
          throw new LppError('syntaxError')
        const func = ensureValue(fn)
        if (func instanceof LppFunction) {
          const res = func.apply(
            fn instanceof LppChildValue
              ? fn.parent.deref() ?? LppConstant.init(null)
              : LppConstant.init(null),
            actualArgs
          )
          if (res instanceof Promise) {
            return res.then(result => {
              return this.processApplyValue(result, thread)
            })
          } else {
            return this.processApplyValue(res, thread)
          }
        } else throw new LppError('notCallable')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Generate a new object by function with arguments.
     * @param {{fn: unknown, mutation: { length: string }} & Record<string, unknown>} args The function and arguments.
     * @param {any} util Scratch util.
     * @returns {Promise<LppValue> | LppValue | undefined} Result.
     */
    new(args, util) {
      try {
        const thread = util.thread
        let { fn } = args
        // runtime hack by @FurryR.
        /**
         * @type {LppValue[]}
         */
        const actualArgs = []
        // runtime hack by @FurryR.
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        const len = parseInt(this.getMutation(args, util.thread).length, 10)
        for (let i = 0; i < len; i++) {
          const value = args[`ARG_${i}`]
          if (value instanceof LppValue || value instanceof LppChildValue)
            actualArgs[i] = ensureValue(value)
          else throw new LppError('syntaxError')
        }
        if (!(fn instanceof LppValue || fn instanceof LppChildValue))
          throw new LppError('syntaxError')
        fn = ensureValue(fn)
        if (!(fn instanceof LppFunction)) throw new LppError('notCallable')
        const res = fn.construct(actualArgs)
        if (res instanceof Promise) {
          return res.then(result => {
            return this.processApplyValue(result, thread)
          })
        } else {
          return this.processApplyValue(res, thread)
        }
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return self object.
     * @param {unknown} args unnecessary argument.
     * @param {any} util Scratch util.
     * @returns {LppValue | undefined} Result.
     */
    self(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (util.thread.lpp) {
          const unwind = util.thread.lpp.unwind()
          if (unwind) return unwind.self
        }
        throw new LppError('useOutsideFunction')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct a Number.
     * @param {{value: string | number}} param0 Arguments.
     * @returns {LppConstant<number>} Result object.
     */
    constructNumber({ value }) {
      return LppConstant.init(Number(value))
    }
    /**
     * Construct a String.
     * @param {{value: string | number}} param0 Arguments.
     * @returns {LppConstant<string>} Result object.
     */
    constructString({ value }) {
      return LppConstant.init(`${value}`)
    }
    /**
     * Construct an Array.
     * @param {any} args ID for finding where the array is.
     * @param {any} util Scratch util.
     * @returns {LppArray | undefined} An array.
     */
    constructArray(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        const arr = new LppArray()
        const len = parseInt(this.getMutation(args, util.thread).length, 10)
        for (let i = 0; i < len; i++) {
          let value = args[`ARG_${i}`]
          if (!(value instanceof LppValue || value instanceof LppChildValue))
            throw new LppError('syntaxError')
          value = ensureValue(value)
          arr.value.push(value)
        }
        return arr
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct an Object.
     * @param {any} args ID for finding where the object is.
     * @param {any} util Scratch util.
     * @returns {LppObject | undefined} An object.
     */
    constructObject(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        const obj = new LppObject()
        const len = parseInt(this.getMutation(args, util.thread).length, 10)
        for (let i = 0; i < len; i++) {
          let key = args[`KEY_${i}`]
          let value = args[`VALUE_${i}`]
          if (typeof key === 'string' || typeof key === 'number') {
            key = `${key}`
          } else if (key instanceof LppConstant) {
            key = key.toString()
          } else if (
            key instanceof LppChildValue &&
            key.value instanceof LppConstant
          ) {
            key = key.value.toString()
          } else throw new LppError('invalidIndex')
          if (!(value instanceof LppValue || value instanceof LppChildValue))
            throw new LppError('syntaxError')
          value = ensureValue(value)
          obj.set(key, value)
        }
        return obj
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Construct a Function.
     * @param {any} args ID for finding where the function is.
     * @param {any} util Scratch util.
     * @returns {LppFunction | undefined} A function object.
     */
    constructFunction(args, util) {
      try {
        this.prepareConstructor(util)
        // runtime hack by @FurryR.
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        const block = this.getActiveBlockInstance(args, util.thread)
        /**
         * @type {string[]}
         */
        const signature = []
        const len = parseInt(block.mutation.length, 10)
        for (let i = 0; i < len; i++) {
          if (typeof args[`ARG_${i}`] !== 'object')
            signature[i] = `${args[`ARG_${i}`]}`
          else throw new LppError('syntaxError')
        }
        let closure = null
        const blocks = util.thread.blockContainer
        const targetId = util.target.id
        if (util.thread.lpp) {
          closure = util.thread.lpp
        }
        return new LppFunction((self, args) => {
          /** @type {((v: LppReturnOrException) => void)?} */
          let resolveFn = null
          /** @type {LppReturnOrException?} */
          let syncResult = null
          let target = this.runtime.getTargetById(targetId)
          if (target === undefined) {
            // Use a dummy target instead of the original disposed target
            target = new this.targetConstructor({
              blocks: blocks
            })
            target.id = ''
            target.runtime = this.runtime
            const warnFn = () => {
              this.handleError(new LppError('useAfterDispose'))
            }
            // Patch some functions to disable user's ability to access the dummy's sprite, which is not exist.
            for (const key of Reflect.ownKeys(target.constructor.prototype)) {
              if (typeof key === 'string' && key.startsWith('set')) {
                Reflect.set(target, key, warnFn)
              }
            }
            // Also, clones.
            target.makeClone = warnFn
          }
          if (!block.inputs.SUBSTACK)
            return new LppReturn(LppConstant.init(null))
          const id = block.inputs.SUBSTACK.block
          const thread = this.createThread(id, target)
          thread.lpp = new LppFunctionContext(
            closure,
            self ?? LppConstant.init(null),
            val => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            },
            val => {
              if (!syncResult) {
                if (resolveFn) resolveFn(val)
                else syncResult = val
              }
            }
          )
          for (const [key, value] of signature.entries()) {
            if (key < args.length) thread.lpp.closure.set(value, args[key])
            else thread.lpp.closure.set(value, LppConstant.init(null))
          }
          // TODO: no reserved variable names!
          // builtin.Array.apply(null, args).then(value => {
          //   thread.lpp.closure.set('arguments', value)
          // })
          // Call callback (if exists) when the thread is finished.
          this.bindThread(thread, () => {
            thread.lpp.returnCallback(new LppReturn(LppConstant.init(null)))
          })
          const seq = new this.runtime.sequencer.constructor(this.runtime)
          seq.stepThread(thread)
          return (
            syncResult ??
            new Promise(
              /** @type {(resolve: (v: LppReturnOrException) => void) => void} */ resolve => {
                resolveFn = resolve
              }
            )
          )
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Get value of specified function variable.
     * @param {{name: string}} args Variable name.
     * @param {any} util Scratch util.
     * @returns {LppChildValue | undefined} The value of the variable. If it is not exist, returns null instead.
     */
    var(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (util.thread.lpp) {
          return util.thread.lpp.get(args.name)
        }
        throw new LppError('useOutsideContext')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Return a value from the function.
     * @param {{value: unknown}} args Return value.
     * @param {any} util Scratch util.
     */
    return(args, util) {
      const { value } = args
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (!(value instanceof LppValue || value instanceof LppChildValue))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const thread = util.thread
        if (thread.lpp) {
          const ctx = thread.lpp.unwind()
          if (ctx instanceof LppFunctionContext)
            ctx.returnCallback(new LppReturn(val))
          return thread.stopThisScript()
        }
        throw new LppError('useOutsideFunction')
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Throw a value from the function.
     * @param {{value: unknown}} args Exception.
     * @param {any} util Scratch util.
     */
    throw(args, util) {
      const { value } = args
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        if (!(value instanceof LppValue || value instanceof LppChildValue))
          throw new LppError('syntaxError')
        const val = ensureValue(value)
        const result = new LppException(val)
        const thread = util.thread
        result.pushStack(
          new LppBlockTraceback(thread.peekStack(), thread.lpp ?? null)
        )
        if (thread.lpp) {
          thread.lpp.exceptionCallback(result)
          return thread.stopThisScript()
        }
        this.handleException(result)
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Execute in new scope.
     * @param {any} args ID for finding where the branch is.
     * @param {any} util Scratch util.
     * @returns {void | Promise<void>} Wait for the branch to finish.
     */
    scope(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        this.prepareConstructor(util)
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, util.thread)
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const thread = util.thread
        const target = util.target
        const thread1 = this.createThread(id, target)
        /** @type {(() => void)?} */
        let resolveFn = null
        let resolved = false
        thread1.lpp = new LppContext(
          thread.lpp ?? null,
          value => {
            if (thread.lpp) {
              thread.lpp.returnCallback(value)
              return thread1.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          value => {
            value.pushStack(
              new LppBlockTraceback(thread.peekStack(), thread.lpp ?? null)
            )
            if (thread.lpp) {
              // interrupt the thread.
              thread.lpp.exceptionCallback(value)
              return thread.stopThisScript()
            }
            this.handleException(value)
          }
        )
        this.bindThread(thread1, () => {
          if (resolveFn) resolveFn()
          else resolved = true
        })
        const seq = new this.runtime.sequencer.constructor(this.runtime)
        seq.stepThread(thread1)
        if (resolved) return
        return new Promise(resolve => {
          resolveFn = resolve
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Catch exceptions.
     * @param {any} args ID for finding where the branch is.
     * @param {any} util Scratch util.
     * @returns {void | Promise<void>} Wait for the function to finish.
     */
    try(args, util) {
      try {
        if (this.shouldExit(args, util)) return util.thread.stopThisScript()
        this.prepareConstructor(util)
        // runtime hack by @FurryR.
        const block = this.getActiveBlockInstance(args, util.thread)
        const dest = args.var
        if (!(dest instanceof LppChildValue)) throw new LppError('syntaxError')
        const id = block.inputs.SUBSTACK?.block
        if (!id) return
        const captureId = block.inputs.SUBSTACK_2?.block
        const thread = util.thread
        const target = util.target
        const thread1 = this.createThread(id, target)
        let triggered = false
        /** @type {(() => void)?} */
        let resolveFn = null
        let resolved = false
        thread1.lpp = new LppContext(
          thread.lpp ?? null,
          value => {
            if (thread.lpp) {
              thread.lpp.returnCallback(value)
              return thread1.stopThisScript()
            } else throw new LppError('useOutsideFunction')
          },
          value => {
            triggered = true
            if (!captureId) {
              if (resolveFn) resolveFn()
              else resolved = true
              return
            }
            const GlobalError = global.get('Error')
            if (!(GlobalError instanceof LppFunction))
              throw new Error('Lpp: Not implemented')
            const error = value.value
            if (error.instanceof(GlobalError)) {
              const traceback = new LppArray(
                value.stack.map(v =>
                  v instanceof LppBlockTraceback
                    ? LppConstant.init(v.block)
                    : LppConstant.init('<Native Function>')
                )
              )
              error.set('stack', traceback)
            }
            dest.assign(error)
            const thread2 = this.createThread(captureId, target)
            thread2.lpp = new LppContext(
              thread.lpp ?? null,
              value => {
                if (thread.lpp) {
                  thread.lpp.returnCallback(value)
                  return thread1.stopThisScript()
                } else throw new LppError('useOutsideFunction')
              },
              value => {
                value.pushStack(
                  new LppBlockTraceback(thread.peekStack(), thread.lpp ?? null)
                )
                if (thread.lpp) {
                  // interrupt the thread.
                  thread.lpp.exceptionCallback(value)
                  return thread.stopThisScript()
                }
                this.handleException(value)
              }
            )
            this.bindThread(thread2, () => {
              if (resolveFn) resolveFn()
              else resolved = true
            })
            const seq = new this.runtime.sequencer.constructor(this.runtime)
            seq.stepThread(thread2)
          }
        )
        this.bindThread(thread1, () => {
          if (!triggered) {
            if (resolveFn) resolveFn()
            else resolved = true
          }
        })
        const seq = new this.runtime.sequencer.constructor(this.runtime)
        seq.stepThread(thread1)
        if (resolved) return
        return new Promise(resolve => {
          resolveFn = resolve
        })
      } catch (e) {
        this.handleError(e)
      }
    }
    /**
     * Drops the value of specified expression.
     * @param {unknown} args Unneccessary argument.
     * @param {any} util Scratch util.
     */
    semi(args, util) {
      if (this.shouldExit(args, util)) return util.thread.stopThisScript()
    }

    /**
     * Handle syntax error.
     * @param {Error} e Error object.
     * @returns {never}
     */
    handleError(e) {
      if (e instanceof LppError) {
        this.warnError(e.id, this.runtime.sequencer.activeThread.peekStack())
        this.runtime.stopAll()
      }
      throw e
    }
    /**
     * Handle unhandled exceptions.
     * @param {LppException} e LppException object.
     * @returns {never}
     */
    handleException(e) {
      this.warnException(e)
      this.runtime.stopAll()
      throw new Error('Lpp: Uncaught Lpp exception')
    }
    /**
     * Create a new thread (without compiling).
     * @param {string} id Top block id.
     * @param {any} target Thread target.
     * @returns {any} Thread instance.
     */
    createThread(id, target) {
      const thread = new this.threadConstructor(id)
      thread.target = target
      thread.blockContainer = target.blocks
      thread.pushStack(id)
      this.runtime.threads.push(thread)
      this.runtime.threadMap?.set(thread.getId(), thread)
      return thread
    }
    /**
     * Bind fn to thread. Fn will be called when the thread exits.
     * @param {any} thread Thread object.
     * @param {() => void} fn Dedicated function.
     */
    bindThread(thread, fn) {
      // Call callback (if exists) when the thread is finished.
      let status = thread.status
      let flag = false
      let alreadyCalled = false
      Reflect.defineProperty(thread, 'status', {
        get: () => {
          return status
        },
        set: newStatus => {
          status = newStatus
          if (status === this.threadConstructor.STATUS_DONE) {
            if (!alreadyCalled) {
              alreadyCalled = true
              fn()
            }
          } else if (
            status === this.threadConstructor.STATUS_RUNNING &&
            !flag
          ) {
            // Lazy compilation in order to step thread immediately.
            if (
              thread.peekStack() &&
              !thread.isCompiled &&
              this.runtime.compilerOptions?.enabled
            ) {
              const nextBlock = thread.blockContainer.getNextBlock(
                thread.topBlock
              )
              if (nextBlock) {
                thread.topBlock = nextBlock
                thread.tryCompile()
              }
            }
            flag = true
          }
        }
      })
      if (this.isEarlyScratch) {
        /**
         * Patched pushStack().
         * @param {string} blockId
         */
        thread.pushStack = blockId => {
          if (blockId === null && !alreadyCalled) {
            alreadyCalled = true
            fn()
          }
          return this.threadConstructor.prototype.pushStack.call(
            thread,
            blockId
          )
        }
      }
    }
    /**
     * Process return value.
     * @param {LppReturnOrException} result Result value.
     * @param {any} thread Caller thread.
     * @returns {LppValue | never} processed value.
     */
    processApplyValue(result, thread) {
      if (result instanceof LppReturn) {
        return result.value
      } else {
        result.pushStack(
          new LppBlockTraceback(thread.peekStack(), thread.lpp ?? null)
        )
        if (thread.lpp) {
          // interrupt the thread.
          thread.lpp.exceptionCallback(result)
          return thread.stopThisScript()
        }
        this.handleException(result)
      }
    }
    /**
     * Prepare constructors for injection.
     * @param {any} util Scratch util.
     */
    prepareConstructor(util) {
      if (!this.targetConstructor) {
        this.targetConstructor = util.target.constructor
      }
      if (!this.threadConstructor) {
        this.threadConstructor = util.thread.constructor
      }
    }
    /**
     * Detect if the block should exit directly.
     * @param {object} args Block arguments.
     * @param {any} util Scratch util.
     * @returns {boolean} Whether the block is triggered by clicking on the mutator icon.
     */
    shouldExit(args, util) {
      this.prepareConstructor(util)
      // const workspace = this.Blockly.getMainWorkspace()
      let parent = util.thread.blockContainer._cache._executeCached[
        util.thread.peekStack()
      ]?._ops?.find(
        (/** @type {{ _argValues: unknown; }} */ v) => args === v._argValues
      )?.id
      if (!parent && util.thread.isCompiled) {
        // patch: In TurboWarp, we can simply use thread.peekStack() to get the block's ID.
        parent = util.thread.peekStack()
      }
      if (this.mutatorClick) {
        if (parent === util.thread.topBlock) this.mutatorClick = false
        if (util.thread.stackClick) return true
      }
      if (util.thread.status === this.threadConstructor.STATUS_DONE) return true
      return false
    }
    /**
     * Get active block instance of specified thread.
     * @warning Avoid where possible. Only use it if you need to get substack.
     * @param {object} args Block arguments.
     * @param {any} thread Thread.
     * @returns {any} Block instance.
     */
    getActiveBlockInstance(args, thread) {
      let block = thread.blockContainer._cache._executeCached[
        thread.peekStack()
      ]?._ops?.find(
        (/** @type {{ _argValues: unknown; }} */ v) => args === v._argValues
      )
      if (!block && thread.isCompiled) {
        // patch: In TurboWarp, we can simply use thread.peekStack() to get the lambda's ID.
        block = thread.blockContainer.getBlock(thread.peekStack())
      } else if (!thread.isCompiled) {
        block = thread.blockContainer.getBlock(block.id)
      }
      if (!block) block = this.runtime.flyoutBlocks.getBlock(thread.peekStack())
      if (!block) {
        throw new Error('Lpp: Cannot get active block')
      }
      return block
    }
    /**
     * Get mutation of dedicated block.
     * @param {object} args Block arguments.
     * @param {any} thread Thread.
     * @returns {any} mutation object.
     */
    getMutation(args, thread) {
      return args.mutation ?? this.getActiveBlockInstance(args, thread).mutation
    }
  }
  if (Scratch.vm) {
    Scratch.extensions.register(new LppExtension(Scratch.vm?.runtime))
  } else {
    // Compatible with CCW
    Reflect.set(window, 'tempExt', {
      Extension: LppExtension,
      info: {
        name: 'lpp.name',
        description: 'lpp.desc',
        extensionId: 'lpp',
        featured: true,
        disabled: false,
        collaborator: 'FurryR'
      },
      // CCW doesn't support languages like ja-jp, so we do not need to add other translations.
      l10n: {
        'zh-cn': {
          'lpp.name': 'lpp',
          'lpp.desc': '🛠️ (实验性) 向 Scratch 引入 OOP。'
        },
        en: {
          'lpp.name': 'lpp',
          'lpp.desc': '🛠️ (Experimental) Introduces OOP to Scratch.'
        }
      }
    })
  }
  // @ts-ignore
})(Scratch)
