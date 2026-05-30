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
  stringify: FormatterStringify<TInput, TContext>
  meta?: FormatterMeta<TInput, TOutput, TContext>
}

export interface CreateFormatterParam<TInput, TOutput, TContext = unknown> {
  compare?: FormatterCompare<TInput, TContext>
  format: FormatterFormat<TInput, TOutput, TContext>
  stringify?: FormatterStringify<TInput, TContext>
  meta?: FormatterMeta<TInput, TOutput, TContext>
}

export const createFormatter = <TInput, TOutput, TContext = unknown>(
  param: CreateFormatterParam<TInput, TOutput, TContext>,
): Formatter<TInput, TOutput, TContext> => {
  const { format: formatParam, stringify: stringifyParam, compare: compareParam, meta } = param

  const format: FormatterFormat<TInput, TOutput, TContext> = (value, ctx) => formatParam(value, ctx)

  const stringify: FormatterStringify<TInput, TContext> = stringifyParam
    ? (value, ctx) => stringifyParam(value, ctx)
    : (value, ctx) => String(format(value, ctx))

  const compare: FormatterCompare<TInput, TContext> = compareParam
    ? (a, b, ctx) => compareParam(a, b, ctx)
    : (a, b, ctx) => stringify(a, ctx).localeCompare(stringify(b, ctx))

  return {
    compare,
    format,
    stringify,
    meta,
  }
}
