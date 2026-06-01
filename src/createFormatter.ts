/**
 * Formats a value into its output representation.
 *
 * @typeParam TInput - The type of value to format.
 * @typeParam TOutput - The type of the formatted output (e.g. `ReactNode`).
 * @typeParam TContext - Optional context passed in by the consumer.
 */
export interface FormatterFormat<TInput, TOutput, TContext = unknown> {
  (value: TInput, ctx?: TContext): TOutput
}

/**
 * Returns a plain-text representation of a value.
 * Useful for scenarios such as matching items against typed input in a combobox.
 *
 * @typeParam TInput - The type of value to stringify.
 * @typeParam TContext - Optional context passed in by the consumer.
 */
export interface FormatterStringify<TInput, TContext = unknown> {
  (value: TInput, ctx?: TContext): string
}

/**
 * Compares two values for sorting purposes, optionally using context.
 * Compatible with `Array.prototype.sort`.
 *
 * @typeParam TInput - The type of values to compare.
 * @typeParam TContext - Optional context passed in by the consumer.
 */
export interface FormatterCompare<TInput, TContext = unknown> {
  (a: TInput, b: TInput, ctx?: TContext): number
}

/**
 * Extensible metadata interface for passing information from the formatter to its consumer.
 * Extend this interface via declaration merging to attach custom flags or properties.
 *
 * @typeParam TInput - The type of value the formatter accepts.
 * @typeParam TOutput - The type of the formatted output (e.g. `ReactNode`).
 * @typeParam TContext - Optional context passed in by the consumer.
 *
 * @example
 * ```ts
 * declare module "afformative" {
 *   interface FormatterMeta<TInput, TOutput, TContext> {
 *     isPrintFriendly?: boolean
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
export interface FormatterMeta<TInput, TOutput, TContext = unknown> {}

/**
 * A standardized formatter object with `format`, `stringify`, `compare`, and optional `meta`.
 *
 * Use the `format` method to produce a rich output (e.g. a React element) and `stringify`
 * for a plain-text representation. Pass formatters via a conventional `formatter` prop in
 * UI components.
 *
 * @typeParam TInput - The type of value the formatter accepts.
 * @typeParam TOutput - The type of the formatted output (e.g. `ReactNode`).
 * @typeParam TContext - Optional context passed in by the consumer.
 *
 * @example
 * ```tsx
 * interface ListProps<TItem> {
 *   formatter: Formatter<TItem, ReactNode>
 *   items: TItem[]
 * }
 * ```
 */
export interface Formatter<TInput, TOutput, TContext = unknown> {
  compare: FormatterCompare<TInput, TContext>
  format: FormatterFormat<TInput, TOutput, TContext>
  meta?: FormatterMeta<TInput, TOutput, TContext>
  stringify: FormatterStringify<TInput, TContext>
}

/**
 * Parameter object accepted by `createFormatter`.
 *
 * `format` is always required. `stringify` is required when `TOutput` is not `string`,
 * since there is no safe default in that case. `compare` and `meta` are always optional.
 *
 * @typeParam TInput - The type of value the formatter accepts.
 * @typeParam TOutput - The type of the formatted output (e.g. `ReactNode`).
 * @typeParam TContext - Optional context passed in by the consumer.
 */
export type CreateFormatterParam<TInput, TOutput, TContext = unknown> = {
  /** Compares two values for sorting. Defaults to `localeCompare` of the stringified values. */
  compare?: FormatterCompare<TInput, TContext>
  /** Produces the formatted output for a value. */
  format: FormatterFormat<TInput, TOutput, TContext>
  /** Optional metadata passed from the formatter to its consumer. */
  meta?: FormatterMeta<TInput, TOutput, TContext>
} & ([TOutput] extends [string]
  ? {
      /** Produces a plain-text representation of a value. Defaults to `String(format(value, ctx))`. */
      stringify?: FormatterStringify<TInput, TContext>
    }
  : {
      /** Produces a plain-text representation of a value. */
      stringify: FormatterStringify<TInput, TContext>
    })

/**
 * Creates a {@link Formatter}.
 *
 * @typeParam TInput - The type of value the formatter accepts.
 * @typeParam TOutput - The type of the formatted output (e.g. `ReactNode`).
 * @typeParam TContext - Optional context passed in by the consumer.
 *
 * @example
 * ```tsx
 * const dateFormatter = createFormatter<Date, ReactNode>({
 *   format: value => <time dateTime={value.toISOString()}>{value.toLocaleDateString()}</time>,
 *   stringify: value => value.toLocaleDateString(),
 *   compare: (a, b) => a.valueOf() - b.valueOf(),
 * })
 * ```
 */
export const createFormatter = <TInput, TOutput, TContext = unknown>(
  param: CreateFormatterParam<TInput, TOutput, TContext>,
): Formatter<TInput, TOutput, TContext> => {
  const { compare: compareParam, format, meta, stringify: stringifyParam } = param

  const stringify: FormatterStringify<TInput, TContext> =
    stringifyParam ?? ((value, ctx) => String(format(value, ctx)))

  const compare: FormatterCompare<TInput, TContext> =
    compareParam ?? ((a, b, ctx) => stringify(a, ctx).localeCompare(stringify(b, ctx)))

  return {
    compare,
    format,
    meta,
    stringify,
  }
}
