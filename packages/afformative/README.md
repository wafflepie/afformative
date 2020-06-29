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

A formatter is a React component which accepts a value as its `children` prop. Formatters should be created solely using the `makeFormatter` utility function.

```js
import { makeFormatter } from "afformative"

const UpperCaseFormatter = makeFormatter(value => value.toUpperCase())

renderToString(<UpperCaseFormatter>foo</UpperCaseFormatter>)
// "FOO"
```

Consume formatters in your UI component library using a conventional `formatter` prop.

```js
import { makeFormatter } from "afformative"

// This is usually the best default formatter.
const IdentityFormatter = makeFormatter(value => value)

const Select = ({ formatter: Formatter = IdentityFormatter, items, ...otherProps }) => (
  <select {...otherProps}>
    {items.map(item => {
      // `option` elements only accept strings, `<Formatter>{item}</Formatter>` won't work here.
      const text = Formatter.format(item)

      return (
        <option key={item} value={item}>
          {text}
        </option>
      )
    })}
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

const UpperCaseFormatter = makeFormatter(value => value.toUpperCase())

UpperCaseFormatter.format("foo")
// "FOO"
```

### Suggestion Mechanism

Formatters are React components, meaning that they can render icons or custom translation components. That being said, receiving React elements from the `.format` method is undesirable (we cannot reliably access the text that would be rendered). This is where the suggestion mechanism comes into play.

Suggestions can be used to tell formatters that a value needs to be rendered with some special care. For example, use `SUGGESTIONS.abbreviated` to tell a formatter that it is being used in a narrow table column.

```js
import { makeFormatter, SUGGESTIONS } from "afformative"

const BooleanFormatter = makeFormatter((value, { isSuggested }) => {
  if (isSuggested(SUGGESTIONS.primitive)) {
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
```

### Providing Data Context

Using the `makeFormatter` factory statically is sufficient if your values do not depend on any external context. Things get a bit trickier once you e.g. need to statically format values which depend on Redux state (or React context in general).

```js
const useEnumFormatter = enumType => {
  // Resolve your data context here via React hooks.
  // `useSelector` is from `react-redux`, `useIntl` from `react-intl`.
  // `getEnumTranslationKeys` is a made-up Redux selector factory.
  const enumTranslationKeys = useSelector(getEnumTranslationKeys(enumType))
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

const SomeEnumFormatter = useEnumFormatter(EnumTypes.SOME_ENUM)
```

`SomeEnumFormatter` is now usable even for static formatting, it has access to React context via a closure.

Awesome, right?

### Consuming Formatters

As mentioned earlier, formatters should be passed to components using the conventional `formatter` prop. Alternatively, if you need to pass multiple formatters (e.g. in case of column definitions), pass an array of objects where each object has a `formatter` property.

All formatters also expose the `.wrap` static method. You can use this method to alter the behaviour of the formatter for some specific values.

```js
const useSnowflakeAwareFormatter = formatter => {
  const intl = useIntl()

  return useMemo(
    () =>
      formatter.wrap((format, value) => {
        if (isSnowflake(value)) {
          return intl.formatMessage(messages.snowflake)
        }

        return format(value)
      }),
    [formatter, intl],
  )
}
```

## API Reference

The type signatures are written using intuitive Flow-like syntax.

### \<Formatter />

Formatters are React components returned by `makeFormatter`.

#### Props

- `children: any` The value to format.
- `suggestions?: string[]` Suggestions the formatter should take note of.

Any additional props will be passed to the `format` argument `makeFormatter` inside the second parameter (alongside suggestion tools).

#### Statics

- `format: (value: any, suggestions?: string[], otherProps?: Object) => React.Node` A static method that can be used to format values without them being rendered as React elements.
- `wrap: (outerFormat?: OuterFormat, nextFormatterOptions?: FormatterOptions) => Formatter` A static method that can be used to alter the behaviour of any formatter, returning a new formatter. The first parameter has the same signature as when using `makeFormatter`, except it receives the original `format` function as the first parameter to make defaulting easier.

---

### makeFormatter

A factory for creating new formatters.

```js
type SuggestionTools = {
  isSuggested: (suggestion: string) => boolean,
  suggestions: string[],
}

type Format = (value: any, suggestionTools: SuggestionTools) => React.Node

type FormatterOptions = {
  displayName?: string,
}

type MakeFormatter = (format: Format, formatterOptions?: FormatterOptions) => Formatter
```

---

### SUGGESTIONS

A wrapper object for string constants you can use as formatter suggestions.

- `SUGGESTIONS.abbreviated`
  - Indicating that the formatter should render abbreviated content.
  - Example usage: you are rendering a table with many columns that have limited width.
- `SUGGESTIONS.icon`
  - Indicating that an icon should be rendered based on the value.
  - Example usage: you need to render an icon alongside the formatted value. Formatters should not be responsible for the layout markup.
- `SUGGESTIONS.primitive`
  - Indicating that the formatter should not return React elements.
  - Example usage: you need to access the rendered text for lexicographic sorting, autocompletion, or use the text as a URL slug.
- `SUGGESTIONS.verbose`
  - Indicating that the formatter should render verbose content.
  - Example usage: N/A.

Please [submit an issue](https://github.com/wafflepie/afformative/issues/new) or open a pull request if you want to add a suggestion.

## Changelog

See the [CHANGELOG.md](https://github.com/wafflepie/afformative/blob/master/CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/wafflepie/afformative/blob/master/LICENSE).
