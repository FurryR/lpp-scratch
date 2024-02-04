export default {
  // Name
  'lpp.name': 'lpp',
  // Documentation
  'lpp.documentation': 'Open documentation',
  'lpp.documentation.url':
    'https://github.com/FurryR/lpp-scratch/blob/main/README.md',
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
    'Please note that this block must be used in function contexts.',
  'lpp.error.useOutsideContext.summary':
    'Cannot use this block outside a lpp context.',
  'lpp.error.useOutsideContext.detail':
    'Please create a lpp context use "scope" block first.',
  'lpp.error.syntaxError.summary': 'Syntax error.',
  'lpp.error.syntaxError.detail':
    'You used the block incorrectly. Please recheck if you used Scratch literals directly or misused expand operator.',
  'lpp.error.accessOfNull.summary': 'Invalid access of null.',
  'lpp.error.accessOfNull.detail': 'Please validate the object before you use.',
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
  'lpp.error.recursivePrototype.summary': 'Recursive prototype is not allowed.',
  'lpp.error.recursivePrototype.detail': 'Please resolve recursive dependency.',
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
}
