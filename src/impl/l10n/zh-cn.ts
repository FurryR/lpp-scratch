export default {
  // 名称
  'lpp.name': 'lpp',
  // 文档
  'lpp.documentation': '打开文档',
  'lpp.documentation.url':
    'https://github.com/FurryR/lpp-scratch/blob/main/README-zh_CN.md',
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
  'lpp.error.useOutsideFunction.detail': '请注意一定要在函数内使用此类积木。',
  'lpp.error.useOutsideContext.summary': '无法在 lpp 上下文以外使用此积木。',
  'lpp.error.useOutsideContext.detail': '请首先使用作用域积木来创建作用域。',
  'lpp.error.syntaxError.summary': '积木语法错误。',
  'lpp.error.syntaxError.detail':
    '您错误地使用了积木。请重新检查是否有直接使用 Scratch 字面量或错误使用展开运算符的情况。',
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
