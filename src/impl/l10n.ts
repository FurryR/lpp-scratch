/**
 * Localization of lpp extension.
 */
export const locale = {
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
      "You used the block incorrectly. Please note that lpp doesn't allow direct usages of Scratch literals (index access is a exception).",
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
    'lpp.error.uncaughtException.summary': 'Uncaught exception.',
    'lpp.error.uncaughtException.detail':
      'Please use try-catch block to catch exceptions or the code will stop execution.',
    'lpp.error.uncaughtException.exception': 'Exception:',
    'lpp.error.uncaughtException.traceback': 'Traceback:',
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
    'lpp.error.hint': 'For further information please check DevTools Console.',
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
    'lpp.tooltip.statement.nop':
      'Does nothing. It is used to convert a Scratch reporter into a statement.',
    'lpp.tooltip.button.close': 'Close this hint.',
    'lpp.tooltip.button.help.more': 'Show detail.',
    'lpp.tooltip.button.help.less': 'Hide detail.',
    'lpp.tooltip.button.scrollToBlockEnabled': 'Scroll to this block.',
    'lpp.tooltip.button.scrollToBlockDisabled':
      'Unable to find this block in project.',
    'lpp.tooltip.button.nativeFn':
      'This is native function. For further information please check DevTools Console.',
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
    'lpp.error.useOutsideContext.summary': '无法在 lpp 上下文以外使用此积木。',
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
    'lpp.error.notCallable.detail': '您不可调用除了 Function 类型以外的对象。',
    'lpp.error.recursivePrototype.summary': '循环依赖 prototype 不被允许。',
    'lpp.error.recursivePrototype.detail': '请解决循环依赖。',
    'lpp.error.uncaughtException.summary': '有未被捕获的异常。',
    'lpp.error.uncaughtException.detail':
      '请使用尝试/捕获积木对错误进行捕获，否则代码将终止运行。',
    'lpp.error.uncaughtException.exception': '错误内容：',
    'lpp.error.uncaughtException.traceback': '栈回溯：',
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
    'lpp.tooltip.statement.nop': '无任何效果。用于将返回值积木转换为语句。',
    'lpp.tooltip.button.close': '关闭这个提示。',
    'lpp.tooltip.button.help.more': '显示详细信息。',
    'lpp.tooltip.button.help.less': '隐藏详细信息。',
    'lpp.tooltip.button.scrollToBlockEnabled': '转到这个积木。',
    'lpp.tooltip.button.scrollToBlockDisabled': '无法在项目中找到此积木。',
    'lpp.tooltip.button.nativeFn':
      '这是原生函数。详细内容在 DevTools Console 内。',
    // 关于
    'lpp.about.summary': 'lpp 是由 @FurryR 开发的高级程序设计语言。',
    'lpp.about.github': '本项目的 GitHub 仓库',
    'lpp.about.afdian': '赞助者',
    'lpp.about.staff.1': 'lpp 开发者名单',
    'lpp.about.staff.2': '如果没有他/她们，lpp 将不复存在。'
  }
}
