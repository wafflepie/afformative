type Suggestion = "abbreviated" | "icon" | "primitive" | "verbose"

interface FormatterOptions {
  /** Formatter name, useful for debugging or advanced pattern matching. */
  displayName?: string
}

type DataContext = Record<string, any>

interface FormatDefinition<TInput, TOutput> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions passed by the consumer of a formatter. */
    usageSuggestions: Suggestion[],
    /** Additional data context to be used by the formatter. */
    dataContext: DataContext,
  ): TOutput
}

interface FormatMethod<TInput, TOutput> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions?: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext?: DataContext,
  ): TOutput
}

interface FormatChainDefinition<TInnerInput, TInnerOutput, TOuterInput, TOuterOutput> {
  (
    /**
     * The `formatter.format` method which can be used to delegate the formatting
     * to the wrapped formatter. Delegation is simplified so if no suggestions or contextual
     * props are passed, the original ones are used instead.
     */
    delegate: FormatMethod<TInnerInput, TInnerOutput>,
    /** Value to format. */
    value: TOuterInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext: DataContext,
  ): TOuterOutput
}

interface FormatterProps<TInput> {
  /** Value to format. */
  children: TInput
  /** Suggestions the formatter should take note of. */
  suggestions?: Suggestion[]
  /** Additional data context to be used by the formatter. */
  [dataContextPropName: string]: any
}

export interface Formatter<TInput, TOutput> {
  /** Formatter name, useful for debugging or advanced pattern matching. */
  displayName?: string
  /** Formats a value. */
  format: FormatMethod<TInput, TOutput>
  /** The callee of the `.wrap` method used to produce this formatter. */
  innerFormatter?: Formatter<any, any>
  /**
   * Creates a new formatter from an existing one. Allows overriding of formatter behaviour
   * for certain values.
   */
  wrap: <TNextInput = TInput, TNextOutput = TOutput>(
    /**
     * Function used to format the value. Has the same signature as the one passed to `makeFormatter`,
     * except a `format` function is passed in the first position to simplify delegation.
     */
    nextFormat: FormatChainDefinition<TInput, TOutput, TNextInput, TNextOutput>,
    /** New formatter options, replacing the original ones. */
    nextFormatterOptions?: FormatterOptions,
  ) => Formatter<TNextInput, TNextOutput>
  /** Backwards-compatible way to use the formatter as a React component. */
  (props: FormatterProps<TInput>): TOutput
}

/**
 * Creates a new formatter.
 *
 * @param format Function used to format the value.
 * @param formatterOptions Additional options for the formatter.
 */
export const makeFormatter = <TInput, TOutput>(
  format: FormatDefinition<TInput, TOutput>,
  formatterOptions?: FormatterOptions,
): Formatter<TInput, TOutput> => {
  const formatter: Formatter<TInput, TOutput> = ({ children, suggestions = [], ...dataContext }) =>
    format(children, suggestions, dataContext)

  formatter.displayName = formatterOptions?.displayName

  formatter.format = (value, usageSuggestions = [], dataContext = {}) =>
    format(value, usageSuggestions, dataContext)

  formatter.wrap = <TNextInput, TNextOutput>(
    nextFormat: FormatChainDefinition<TInput, TOutput, TNextInput, TNextOutput>,
    nextFormatterOptions?: FormatterOptions,
  ) => {
    const nextFormatter: Formatter<TNextInput, TNextOutput> = makeFormatter(
      (value, usageSuggestions, dataContext) => {
        const delegate: FormatMethod<TInput, TOutput> = (
          delegatedValue,
          delegatedUsageSuggestions,
          delegatedDataContext,
        ) =>
          formatter.format(
            delegatedValue,
            delegatedUsageSuggestions ?? usageSuggestions,
            delegatedDataContext ?? dataContext,
          )

        return nextFormat(delegate, value, usageSuggestions, dataContext)
      },
      nextFormatterOptions ?? formatterOptions,
    )

    nextFormatter.innerFormatter = formatter

    return nextFormatter
  }

  return formatter
}
