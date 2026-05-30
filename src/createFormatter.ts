export interface FormatterFormat<TInput, TOutput, TContext = unknown> {
  (value: TInput, ctx?: TContext): TOutput
}

export interface FormatterStringify<TInput, TContext = unknown> {
  (value: TInput, ctx?: TContext): string
}

export interface FormatterCompare<TInput, TContext = unknown> {
  (a: TInput, b: TInput, ctx?: TContext): number
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
export interface FormatterMeta<TInput, TOutput, TContext = unknown> {}

export interface Formatter<TInput, TOutput, TContext = unknown> {
  compare: FormatterCompare<TInput, TContext>
  format: FormatterFormat<TInput, TOutput, TContext>
  meta?: FormatterMeta<TInput, TOutput, TContext>
  stringify: FormatterStringify<TInput, TContext>
}

export interface CreateFormatterParam<TInput, TOutput, TContext = unknown> {
  compare?: FormatterCompare<TInput, TContext>
  format: FormatterFormat<TInput, TOutput, TContext>
  meta?: FormatterMeta<TInput, TOutput, TContext>
  stringify?: FormatterStringify<TInput, TContext>
}

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
