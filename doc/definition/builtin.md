# Builtin

There are several builtin classes / methods in lpp.

## Content

- [Builtin](#builtin)
  - [Content](#content)
  - [Function](#function)
  - [JSON](#json)

---

<table>
<tr><td>

## Function

lpp supports lambda functions and it is called `Function` instances.

Here is the definition of `Function` class.

```typescript
declare class Function {
  /**
   * @constructor Construct a function using new / without new.
   * @param fn The function.
   * @throws {IllegalInvocationError} If fn is not a function.
   */
  constructor(fn: Function)
  /**
   * Apply the function with specified self object and arguments.
   * @param self Self argument.
   * @param args Arguments.
   * @returns Function result.
   * @throws {IllegalInvocationError} If self is not a function.
   */
  apply(self: any, args: Array<any>): any
}
```

</td></tr>

<tr><td>

## JSON

`JSON` is a utility set for JSON serialization / deserialization.

Here is the definition of `JSON` namespace.

```typescript
declare namespace JSON {
  /**
   * Parse JSON string as lpp object.
   * @param json JSON string.
   * @returns Parsed lpp object.
   * @throws {IllegalInvocationError} If self is not JSON namespace.
   * @throws {SyntaxError} If json is not specified, or if JSON is invalid.
   */
  function parse(json: string): any
  /**
   * Convert value into JSON string.
   * @param value lpp object.
   * @returns JSON string.
   * @throws {IllegalInvocationError} If self is not JSON namespace.
   * @throws {SyntaxError} If value is not specified, or value is invalid (such as recursive objects, etc.).
   */
  function stringify(value: any): string
}
```

</td></tr>
</table>
