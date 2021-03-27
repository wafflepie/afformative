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

A formatter is an object with a `format` method. Formatters should be created solely using the `makeFormatter` factory.

```js
import { makeFormatter } from "afformative"

const upperCaseFormatter = makeFormatter(value => value.toUpperCase())

upperCaseFormatter.format("foo") // "FOO"
```

Consume formatters in your UI component library using a conventional `formatter` prop.

```js
import { makeFormatter } from "afformative"

// This is usually the best default formatter.
const identityFormatter = makeFormatter(value => value)

const Select = ({ formatter = identityFormatter, items, ...otherProps }) => (
  <select {...otherProps}>
    {items.map(item => {
      const text = formatter.format(item)

      return (
        <option key={item} value={item}>
          {text}
        </option>
      )
    })}
  </select>
)
```

### Usage Context

Although formatters can render icons or custom translation components, we often need to access primitive data instead of React elements.

> Lexicographic sorting of items based on translations is a typical real world example, especially when you are using a custom React component for visualising the translation keys alongside the actual translations.

This is where usage suggestions comes into play. Suggestions can be used to tell formatters that a value needs to be rendered with some special care. For example, pass `"primitive"` to tell a formatter that it should return a primitive value, such as a string.

```js
import { makeFormatter } from "afformative"

const booleanFormatter = makeFormatter((value, usageSuggestions) => {
  if (usageSuggestions.includes("primitive")) {
    return value ? "True" : "False"
  }

  return <Icon type={value ? "success" : "failure"} />
})

booleanFormatter.format(true) // <Icon type="success" />
booleanFormatter.format(true, ["primitive"]) // "True"
```

All formatters also have the `formatAsPrimitive` method, which automatically passes the primitive suggestion in addition to all other suggestions.

```js
booleanFormatter.formatAsPrimitive(true) // "True"
booleanFormatter.formatAsPrimitive(true, ["abbreviated"]) // "True"
```

You can also pass arbitrary data to formatters as the third argument: data context. Let's use a dummy table component as an example.

```js
const Table = ({ rows, formatter = identityFormatter }) => (
  <table>
    {rows.map(row => (
      <tr>
        {row.map((cell, cellIndex) => (
          <td>{formatter.format(cell, [], { row, cellIndex })}</td>
        ))}
      </tr>
    ))}
  </table>
)
```

Data context allows the users of this table component to write purpose-built formatters, making it possible to take other values in the same row into account. For example, the following formatter would change the color of the cell value based on the previous value in the same row.

```js
const rowTrendFormatter = makeFormatter((value, suggestions, { row, cellIndex }) => {
  if (cellIndex === 0) {
    return <span>{value}</span>
  }

  const previousValue = row[cellIndex - 1]

  return <span style={{ color: value >= previousValue ? "green" : "red" }}>{value}</span>
})
```

Of course, this formatter only makes sense for our table component, nowhere else.

Because `row` and `cellIndex` are passed as the data context, the formatter still receives just the cell value as its first parameter! This allows us to pass other generic formatters (e.g. a currency formatter) to the table component without having to worry about the value structure.

### Accessing React Context Reliably

Use hooks.

```js
const useEnumFormatter = enumType => {
  // `useSelector` is from `react-redux`, `useIntl` from `react-intl`.
  // `makeSelectEnumTranslationKeys` is a made-up Redux selector factory.
  const enumTranslationKeys = useSelector(makeSelectEnumTranslationKeys(enumType))
  const intl = useIntl()

  return useMemo(
    () =>
      makeFormatter(value =>
        intl.formatMessage({
          defaultMessage: value,
          id: enumTranslationKeys[value],
        }),
      ),
    [intl, enumTranslationKeys],
  )
}

const someEnumFormatter = useEnumFormatter("someEnum")
```

### Consuming Formatters

As mentioned earlier, formatters should be passed to components using the conventional `formatter` prop. Alternatively, if you need to pass multiple formatters (e.g. in case of column definitions), pass an array of objects where each object has a `formatter` property.

All formatters also expose the `wrap` method. You can use this method to alter the behaviour of the formatter for some specific values.

```js
const useSnowflakeAwareFormatter = formatter => {
  const intl = useIntl()

  return useMemo(
    () =>
      formatter.wrap((delegate, value) => {
        if (isSnowflake(value)) {
          return intl.formatMessage(messages.snowflake)
        }

        return delegate(value)
      }),
    [formatter, intl],
  )
}
```

## Changelog

See the [CHANGELOG.md](https://github.com/wafflepie/afformative/blob/master/CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/wafflepie/afformative/blob/master/LICENSE).
