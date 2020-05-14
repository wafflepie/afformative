<h1 align="center">
afformative
</h1>

<h3 align="center">
✅ ✍️ 👀
</h3>

<h3 align="center">
A standardized way to format values in your React components.
</h3>

<p align="center">
Afformative helps UI component libraries visualise arbitrary data in a reusable, plug-and-play fashion. Formatting dates and enumeration translations in your select fields and data grids has never been easier.
</p>

<p align="center">
  <a href="https://github.com/wafflepie/affomative/blob/master/LICENSE">
    <img src="https://flat.badgen.net/badge/license/MIT/blue" alt="MIT License" />
  </a>

  <a href="https://npmjs.com/package/afformative">
    <img src="https://flat.badgen.net/npm/v/afformative" alt="Version" />
  </a>
</p>

## Installation

Use either of these commands, depending on the package manager you prefer:

```sh
yarn add afformative

npm i afformative
```

## Quick Start

I'll try not to bore you too much, I promise.

### The Holy Standard

> Thou shalt not format thy values without afformative.

A formatter is a React component which accepts a value as its `children` prop. Formatters should be created solely using the `makeFormatter` and `makeUseFormatter` utility functions.

```js
import { makeFormatter } from "afformative"

const TrimFormatter = makeFormatter(value => value.trim())

renderToString(<TrimFormatter>{"     foo     "}</TrimFormatter>)
// "foo"
```

Consume formatters in your UI component library using a conventional `formatter` prop.

```js
import { makeFormatter } from "afformative"

const IdentityFormatter = makeFormatter(value => value)

const Select = ({ items, formatter: Formatter = IdentityFormatter, ...otherProps }) => (
  <select {...otherProps}>
    {items.map(item => (
      <option key={item} value={item}>
        <Formatter>{item}</Formatter>
      </option>
    ))}
  </select>
)

Select.propTypes = {
  formatter: PropTypes.elementType,
  items: PropTypes.array.isRequired,
}
```

### Static Formatting

All formatters have a `.format` static method, behaving similarly to using them as React components. This is to enable using formatters e.g. for lexicographical sorting of items in select fields.

```js
import { makeFormatter } from "afformative"

const TrimFormatter = makeFormatter(value => value.trim())

TrimFormatter.format("     foo     ")
// "foo"
```

### Suggestion Mechanism

Formatters are React components, meaning that they can render icons or custom translation components. That being said, receiving React elements from the `.format` method is undesirable (we cannot reliably access the text that would be rendered). This is where the suggestion mechanism comes into play.

Suggestions can be used to tell formatters that a value needs to be rendered with some special care. For example, use `SUGGESTIONS.abbreviated` to tell a formatter that it is being used in a narrow table column.

```js
import { makeFormatter, SUGGESTIONS } from "afformative"

const BooleanFormatter = makeFormatter((value, { isSuggested }) => {
  const primitive = isSuggested(SUGGESTIONS.primitive)

  if (primitive) {
    return value ? "True" : "False"
  }

  return <Icon type={value ? "success" : "failure"} />
})

renderToString(<BooleanFormatter>{true}</BooleanFormatter>)
// <Icon type="success" />

renderToString(<BooleanFormatter suggestions={[SUGGESTIONS.primitive]}>{true}</BooleanFormatter>)
// "True"

BooleanFormatter.format(true)
// "True", `SUGGESTIONS.primitive` is passed automatically when using `.format`

BooleanFormatter.format(true, [SUGGESTIONS.primitive])
// "True", `SUGGESTIONS.primitive` is passed automatically when using `.format`
```

### Providing Data Context

The `makeFormatter` factory is sufficient if your values do not depend on any external context. Things get a bit trickier once you e.g. need to statically format values which depend on Redux state (or React context in general). Enter `makeUseFormatter`.

```js
const useEnumFormatter = makeUseFormatter(enumType => {
  // Resolve your data context here via React hooks.
  // `useSelector` is from `react-redux`, `useIntl` from `react-intl`.
  const enumTranslationKeys = useSelector(getEnumTranslationKeys(enumType))
  const intl = useIntl()

  return value =>
    intl.formatMessage({
      defaultMessage: value,
      id: enumTranslationKeys[value],
    })
})

const SomeEnumFormatter = useEnumFormatter(EnumTypes.SOME_ENUM)
```

`SomeEnumFormatter` is now usable even for static formatting because it has access to React context via a closure. Awesome, right?

## API Reference

### Formatters

Formatters are the React components that are returned by `makeFormatter` and factories created by `makeUseFormatter`.

#### Props

- `children` (_any_): The value to format.
- `suggestions` (_string[]_): Suggestions the formatter should take note of.

#### `Formatter.format()`

A static method that can be used to format values without them being rendered by React.

Signature: `(value, SuggestionTools) -> React.Node`

#### `SuggestionTools` type

Utility object passed to the formatting function.

- `isSuggested` (_string -> boolean_): Predicate returning whether a suggestion was passed to the formatter.
- `suggestions` (_string[]_): Suggestions passed to the formatter.

---

### `makeFormatter()`

A factory for creating formatters which do not rely on external context.

Signature: `((value, SuggestionTools) -> React.Node) -> Formatter`

---

### `makeUseFormatter()`

A factory for creating formatters which can rely on external context.

Signature: `((...hookArgs) -> (value, SuggestionTools) -> React.Node) -> (...hookArgs) -> Formatter`

---

### `SUGGESTIONS`

A wrapper object for string constants you can use as formatter suggestions.

- `SUGGESTIONS.abbreviated`, indicating that the formatter should render abbreviated content.
  - Example usage: you are rendering a table with many columns that have limited width.
- `SUGGESTIONS.icon`, indicating that an icon should be rendered based on the value.
  - Example usage: you need to render an icon alongside the formatted value. Formatters should not be responsible for the layout markup.
- `SUGGESTIONS.primitive`, indicating that the formatter should not return React elements.
  - Example usage: you need to access the rendered text for lexicographic sorting, autocompletion, or use the text as a URL slug.
- `SUGGESTIONS.verbose`, indicating that the formatter should render verbose content.
  - Example usage: N/A.

Please [submit an issue](https://github.com/wafflepie/afformative/issues/new) or open a pull request if you want to add a suggestion.

## Changelog

See the [CHANGELOG.md](https://github.com/wafflepie/afformative/blob/master/CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/wafflepie/afformative/blob/master/LICENSE).
