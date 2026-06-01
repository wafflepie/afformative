<h1 align="center">
afformative
</h1>

<h3 align="center">
✅ ✍️ 👀
</h3>

<h3 align="center">
A standardized way to format values in React components.
</h3>

<p align="center">
Afformative helps UI component libraries display arbitrary data in a reusable, plug-and-play fashion. Formatting dates and enum values in select fields and data grids has never been easier.
</p>

<p align="center">
  <a href="https://github.com/wafflepie/afformative/blob/master/LICENSE">
    <img src="https://flat.badgen.net/badge/license/MIT/blue" alt="MIT License" />
  </a>

  <a href="https://npmjs.com/package/afformative">
    <img src="https://flat.badgen.net/npm/v/afformative" alt="Version" />
  </a>
</p>

## Installation

Use one of the following commands, depending on your preferred package manager:

```sh
yarn add afformative

pnpm add afformative

npm i afformative
```

## Quick Start

Afformative is framework-agnostic, but this section will assume usage with React.

A formatter is an object with `format`, `stringify`, and `compare` methods. Formatters are created using the `createFormatter` function.

`createFormatter` accepts a single object parameter. `format` is always required. `stringify` is required when the formatted output is not a `string` or `number`, since there is no safe plain-text default in that case.

```tsx
import { createFormatter } from "afformative"
import { ReactNode } from "react"

const dateFormatter = createFormatter<Date, ReactNode>({
  format: value => <time dateTime={value.toISOString()}>{value.toLocaleDateString()}</time>,
  stringify: value => value.toLocaleDateString(),
  compare: value => value.valueOf(),
})

dateFormatter.format(new Date()) // <time dateTime="2026-05-30T09:17:26.263Z">30/05/2026</time>
dateFormatter.stringify(new Date()) // "30/05/2026"
```

Consume formatters in your UI component library through a conventional `formatter` prop.

```tsx
import { Formatter } from "afformative"
import { ReactNode } from "react"

interface ListProps<TItem> {
  formatter: Formatter<TItem, ReactNode>
  items: TItem[]
}

const List = <TItem extends unknown>({ formatter, items }: ListProps<TItem>) => (
  <ul>
    {items.map(item => (
      <li key={formatter.stringify(item)}>{formatter.format(item)}</li>
    ))}
  </ul>
)
```

The `stringify` method is useful when you need a plain-text representation of a value. For example, a combobox component can use it to match items against the user's typed input. The default implementation of `stringify` is `String(format(value))`.

## Accessing State

Create formatters inside hooks to access React context.

```tsx
const useEnumFormatter = (enumType: string): Formatter<string, ReactNode> => {
  const enumTranslationKeys = useSelector(selectEnumTranslationKeys(enumType))
  const intl = useIntl()

  return useMemo(
    () =>
      createFormatter<string, ReactNode>({
        format: value => (
          <FormattedMessage defaultMessage={value} id={enumTranslationKeys[value]} />
        ),
        stringify: value =>
          intl.formatMessage({ defaultMessage: value, id: enumTranslationKeys[value] }),
      }),
    [intl, enumTranslationKeys],
  )
}
```

## Comparing Values

Every formatter exposes a `compare` method that can be passed directly to `Array.prototype.sort`. The default implementation compares the return values of `stringify` using `localeCompare`.

In the following example, `Amount` objects are sorted first by currency, then by value.

```tsx
import { createFormatter } from "afformative"
import { ReactNode } from "react"

interface Amount {
  currency: string
  value: number
}

const amountFormatter = createFormatter<Amount, ReactNode>({
  format: ({ currency, value }) => (
    <span className="currency">{`${currency} ${value.toFixed(2)}`}</span>
  ),
  stringify: ({ currency, value }) => `${currency} ${value.toFixed(2)}`,
  compare: (a, b) => a.currency.localeCompare(b.currency) || a.value - b.value,
})

const amounts: Amount[] = [
  { currency: "USD", value: 3 },
  { currency: "EUR", value: 1 },
  { currency: "EUR", value: 5 },
  { currency: "USD", value: 2 },
]

amounts.sort(amountFormatter.compare)
// [{ EUR, 1 }, { EUR, 5 }, { USD, 2 }, { USD, 3 }]
```

## Formatter Context

You can pass context to all formatter methods. Consider the following table component as an example.

```tsx
import { Formatter } from "afformative"
import { ReactNode } from "react"

interface TableFormatterContext {
  row: number[]
  cellIndex: number
}

interface TableProps {
  rows: number[][]
  formatter: Formatter<number, ReactNode, TableFormatterContext>
}

const Table = ({ rows, formatter }: TableProps) => (
  <table>
    {rows.map(row => (
      <tr>
        {row.map((cell, cellIndex) => (
          <td>{formatter.format(cell, { row, cellIndex })}</td>
        ))}
      </tr>
    ))}
  </table>
)
```

Context allows consumers of this table component to write purpose-built formatters that can take other values in the same row into account.

For example, the following formatter changes the color of the cell value based on the previous value in the same row.

```tsx
import { createFormatter } from "afformative"
import { ReactNode } from "react"

import { TableFormatterContext } from "./Table"

const rowTrendFormatter = createFormatter<number, ReactNode, TableFormatterContext>({
  format: (value, { row, cellIndex } = {}) => {
    if (!cellIndex || !row) {
      return <span>{value}</span>
    }

    const previousValue = row[cellIndex - 1]

    return <span style={{ color: value >= previousValue ? "green" : "red" }}>{value}</span>
  },
})
```

This formatter only makes sense within the context of our table component.

Because `row` and `cellIndex` are passed as context, the formatter still receives only the cell value as its first parameter. This means generic formatters (e.g. a currency formatter) can be passed to the table component unchanged.

## Formatter Meta

As explained above, context passes information from the consumer to the formatter. The `meta` property works in the opposite direction, passing information from the formatter to the consumer. The base `FormatterMeta` interface is extensible via declaration merging.

For example, formatters can explicitly mark themselves as print-friendly. Consumers can then decide to use `stringify` instead of `format` based on this flag.

```tsx
declare module "afformative" {
  interface FormatterMeta<TInput, TOutput, TContext> {
    isPrintFriendly?: boolean
  }
}

const colorfulFormatter = createFormatter<string, ReactNode>({
  format: value => <Colorful>{value}</Colorful>,
  stringify: value => value,
  meta: {
    isPrintFriendly: true,
  },
})

interface PrinterProps {
  content: string
  formatter: Formatter<string, ReactNode>
}

const Printer = ({ content, formatter }: PrinterProps) => {
  return formatter.meta?.isPrintFriendly ? formatter.format(content) : formatter.stringify(content)
}
```

## Changelog

See the [CHANGELOG.md](https://github.com/wafflepie/afformative/blob/master/CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/wafflepie/afformative/blob/master/LICENSE).
