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

A formatter is an object with a `.format` method. Formatters should be created solely using the `makeFormatter` utility function.

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

> Formatters in older versions of afformative were intended to be used as React components. This usage is now deprecated in favour of always using the `.format` method. This is to make formatters more versatile, as the ability to use formatters as React components implies that hook usage within formatters is okay, when in reality it just makes using the formatters harder in some contexts.

### Usage Context

Although formatters can render icons or custom translation components, we often need to access primitive data instead of React elements. Lexicographic sorting of items based on translations is a typical real world example, especially when you are using a custom React component for visualising the translation keys alongside the actual translations. This is where the suggestion mechanism comes into play.

Suggestions can be used to tell formatters that a value needs to be rendered with some special care. For example, use `"abbreviated"` to tell a formatter that it is being used in a narrow table column.

```js
import { makeFormatter } from "afformative"

const booleanFormatter = makeFormatter((value, suggestions) => {
  if (suggestions.includes("primitive")) {
    return value ? "True" : "False"
  }

  return <Icon type={value ? "success" : "failure"} />
})

booleanFormatter.format(true) // <Icon type="success" />
booleanFormatter.format(true, ["primitive"]) // "True"
```

You can also pass arbitrary data to formatters as the third argument.

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

This allows the users of this table component to write purpose-built formatters, making it possible to take other values in the same row into account.

```js
const rowTrendFormatter = makeFormatter((value, suggestions, { row, cellIndex }) => {
  if (cellIndex === 0) {
    return <span>{value}</span>
  }

  const previousValue = row[cellIndex - 1]

  return <span style={{ color: value >= previousValue ? "green" : "red" }}>{value}</span>
})
```

Because `row` and `cellIndex` are passed in the data context, the formatter still receives just the cell value as its first parameter! This allows easy reuse of generic formatters in this table component.

### Accessing React Context Reliably

Using the `makeFormatter` factory statically is sufficient if your values do not depend on any external context. Things get a bit trickier once you need to statically format values which depend on React context.

```js
const useEnumFormatter = enumType => {
  // Resolve your data context here via React hooks.
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

`someEnumFormatter` is now usable even for static formatting, it has access to React context via a closure.

Awesome, right?

### Consuming Formatters

As mentioned earlier, formatters should be passed to components using the conventional `formatter` prop. Alternatively, if you need to pass multiple formatters (e.g. in case of column definitions), pass an array of objects where each object has a `formatter` property.

All formatters also expose the `.wrap` static method. You can use this method to alter the behaviour of the formatter for some specific values.

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
