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
    <img src="https://flat.badgen.net/npm/dm/afformative" alt="Monthly Downloads" />
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

## Tutorial

I'll try not to bore you too much, I promise.

### The Holy Standard

> Thou shalt not format thy values without afformative.

A formatter is a React component which accepts a value as its `children` prop. Formatters must be created solely using the `makeFormatter` and `makeUseFormatter` utility functions.

```js
import { makeFormatter } from "afformative"

const TrimFormatter = makeFormatter(value => value.trim())

renderToString(<TrimFormatter>{"     foo     "}</TrimFormatter>)
// "foo"
```

Consume formatters in your UI component library using a `formatter` prop.

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

### Suggestions

Formatters are React components, meaning that they can render icons or custom translation components. That being said, receiving React elements from the `.format` method is undesirable (we cannot reliably access the value that would be rendered). This is where the suggestion mechanism comes into play.

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
// "True"

BooleanFormatter.format(true, [SUGGESTIONS.primitive])
// "True", `SUGGESTIONS.primitive` is passed automatically when using `.format`
```

Suggestions can be used to tell formatters that a value needs to be rendered with some special care. For example, use `SUGGESTIONS.abbreviated` to indicate to the formatter that it is being used in a narrow component.

### Providing Context

Work in progress. Use `makeUseFormatter`.

## API Reference

Work in progress. For now, here's a list of what's exported by the `afformative` package.

- `makeFormatter` (function)
- `makeUseFormatter` (function)
- `SUGGESTIONS` (object)

Work in progress.

## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/wafflepie/afformative/blob/master/LICENSE).
