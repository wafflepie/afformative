export interface FormatterFormatDefinition<TInput, TOutput, TUsageContext extends object = object> {
  (value: TInput, usageContext: Partial<TUsageContext>): TOutput
}

export interface FormatterFormat<TInput, TOutput, TUsageContext extends object = object> {
  (value: TInput, usageContext?: Partial<TUsageContext>): TOutput
}

export interface FormatterStringifyDefinition<TInput, TUsageContext extends object = object> {
  (value: TInput, usageContext: Partial<TUsageContext>): string
}

export interface FormatterStringify<TInput, TUsageContext extends object = object> {
  (value: TInput, usageContext?: Partial<TUsageContext>): string
}

export interface FormatterCompareDefinition<TInput, TUsageContext extends object = object> {
  (a: TInput, b: TInput, usageContext: Partial<TUsageContext>): number
}

export interface FormatterCompare<TInput, TUsageContext extends object = object> {
  (a: TInput, b: TInput, usageContext?: Partial<TUsageContext>): number
}

export interface Formatter<TInput, TOutput, TUsageContext extends object = object> {
  compare: FormatterCompare<TInput, TUsageContext>
  format: FormatterFormat<TInput, TOutput, TUsageContext>
  stringify: FormatterStringify<TInput, TUsageContext>
  name?: string
}

export interface CreateFormatterParam<TInput, TOutput, TUsageContext extends object = object> {
  compare?: FormatterCompareDefinition<TInput, TUsageContext>
  format: FormatterFormatDefinition<TInput, TOutput, TUsageContext>
  stringify?: FormatterStringifyDefinition<TInput, TUsageContext>
}

export const createFormatter = <TInput, TOutput, TUsageContext extends object = object>(
  param: CreateFormatterParam<TInput, TOutput, TUsageContext>,
): Formatter<TInput, TOutput, TUsageContext> => {
  const { format: formatParam, stringify: stringifyParam, compare: compareParam, ...rest } = param

  const format: FormatterFormat<TInput, TOutput, TUsageContext> = (value, usageContext) =>
    formatParam(value, usageContext ?? {})

  const stringify: FormatterStringify<TInput, TUsageContext> = stringifyParam
    ? (value, usageContext) => stringifyParam(value, usageContext ?? {})
    : (value, usageContext) => String(format(value, usageContext ?? {}))

  const compare: FormatterCompare<TInput, TUsageContext> = compareParam
    ? (a, b, usageContext) => compareParam(a, b, usageContext ?? {})
    : (a, b, usageContext) =>
        stringify(a, usageContext ?? {}).localeCompare(stringify(b, usageContext ?? {}))

  return {
    compare,
    format,
    stringify,
    ...rest,
  }
}
