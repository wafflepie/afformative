type PrimitiveSuggestion = "primitive"
type SemanticSuggestion = "abbreviated" | "icon" | "verbose"
type Suggestion = PrimitiveSuggestion | SemanticSuggestion

interface FormatterOptions {
  /** Formatter name, useful for debugging or advanced pattern matching. */
  displayName?: string
}

type DataContext = Record<string, any>

// TODO: Update `FormatDefinition` type based on this snippet. Sadly, TypeScript cannot correctly
// verify the return type of the format definition based on the suggestions, printing errors such
// as `Type 'string' is not assignable to type '"primitive" extends TSuggestion ? string : string'`
// which is, of course, nonsense. Same applies to `FormatChainDefinition`.
//
//   interface FormatDefinition<TInput, TOutput, TPrimitiveOutput> {
//     <TSuggestion extends Suggestion>(
//       value: TInput,
//       usageSuggestions: TSuggestion[],
//       dataContext: DataContext,
//     ): PrimitiveSuggestion extends TSuggestion ? TPrimitiveOutput : TOutput
//   }

interface FormatDefinition<TInput, TOutput, TPrimitiveOutput> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions passed by the consumer of a formatter. */
    usageSuggestions: Suggestion[],
    /** Additional data context to be used by the formatter. */
    dataContext: DataContext,
  ): TOutput | TPrimitiveOutput
}

interface FormatMethod<TInput, TOutput, TPrimitiveOutput> {
  <TSuggestion extends Suggestion>(
    /** Value to format. */
    value: TInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions?: TSuggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext?: DataContext,
  ): PrimitiveSuggestion extends TSuggestion ? TPrimitiveOutput : TOutput
}

interface FormatAsPrimitiveMethod<TInput, TPrimitiveOutput> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions the formatter should take note of in addition to `primitive`. */
    usageSuggestions?: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext?: DataContext,
  ): TPrimitiveOutput
}

interface FormatChainDefinition<
  TInnerInput,
  TInnerOutput,
  TInnerPrimitiveInput,
  TOuterInput,
  TOuterOutput,
  TOuterPrimitiveOutput
> {
  (
    /**
     * The `formatter.format` method which can be used to delegate the formatting
     * to the wrapped formatter. Delegation is simplified so if no suggestions or contextual
     * props are passed, the original ones are used instead.
     */
    delegate: FormatMethod<TInnerInput, TInnerOutput, TInnerPrimitiveInput>,
    /** Value to format. */
    value: TOuterInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext: DataContext,
  ): TOuterOutput | TOuterPrimitiveOutput
}

interface FormatterProps<TInput> {
  /** Value to format. */
  children: TInput
  /** Suggestions the formatter should take note of. */
  suggestions?: Suggestion[]
  /** Additional data context to be used by the formatter. */
  [dataContextPropName: string]: any
}

export interface Formatter<TInput, TOutput, TPrimitiveOutput = TOutput> {
  /** Formatter name, useful for debugging or advanced pattern matching. */
  displayName?: string
  /** Formats a value. */
  format: FormatMethod<TInput, TOutput, TPrimitiveOutput>
  /** Formats a value with the `primitive` suggestion. */
  formatAsPrimitive: FormatAsPrimitiveMethod<TInput, TPrimitiveOutput>
  /** The callee of the `.wrap` method used to produce this formatter. */
  innerFormatter?: Formatter<any, any, any>
  /**
   * Creates a new formatter from an existing one. Allows overriding of formatter behaviour
   * for certain values.
   */
  wrap: <TNextInput = TInput, TNextOutput = TOutput, TNextPrimitiveOutput = TPrimitiveOutput>(
    /**
     * Function used to format the value. Has the same signature as the one passed
     * to `makeFormatter`, except a `delegate` function is passed in the first position.
     * This function can be used to delegate formatting to the original (inner) formatter.
     */
    nextFormat: FormatChainDefinition<
      TInput,
      TOutput,
      TPrimitiveOutput,
      TNextInput,
      TNextOutput,
      TNextPrimitiveOutput
    >,
    /** New formatter options, replacing the original ones. */
    nextFormatterOptions?: FormatterOptions,
  ) => Formatter<TNextInput, TNextOutput, TNextPrimitiveOutput>
  /**
   * Backwards-compatible way to use the formatter as a React component.
   *
   * @deprecated Since v0.6.0. Prefer using the `Formatter.format` method instead.
   */
  (props: FormatterProps<TInput>): TOutput | TPrimitiveOutput | null
}

/**
 * Creates a new formatter.
 *
 * @param format Function used to format the value.
 * @param formatterOptions Additional options for the formatter.
 */
export const makeFormatter = <TInput, TOutput, TPrimitiveOutput = TOutput>(
  format: FormatDefinition<TInput, TOutput, TPrimitiveOutput>,
  formatterOptions?: FormatterOptions,
): Formatter<TInput, TOutput, TPrimitiveOutput> => {
  const formatter: Formatter<TInput, TOutput, TPrimitiveOutput> = ({
    children,
    suggestions = [],
    ...dataContext
  }) => format(children, suggestions, dataContext) ?? null

  formatter.displayName = formatterOptions?.displayName

  formatter.format = (value, usageSuggestions = [], dataContext = {}) =>
    format(value, usageSuggestions, dataContext) as any

  formatter.formatAsPrimitive = (value, usageSuggestions = [], dataContext = {}) =>
    format(value, ["primitive", ...usageSuggestions], dataContext) as any

  formatter.wrap = <TNextInput, TNextOutput, TNextPrimitiveOutput>(
    nextFormat: FormatChainDefinition<
      TInput,
      TOutput,
      TPrimitiveOutput,
      TNextInput,
      TNextOutput,
      TNextPrimitiveOutput
    >,
    nextFormatterOptions?: FormatterOptions,
  ) => {
    const nextFormatter: Formatter<TNextInput, TNextOutput, TNextPrimitiveOutput> = makeFormatter(
      (value, usageSuggestions, dataContext) => {
        const delegate: FormatMethod<TInput, TOutput, TPrimitiveOutput> = (
          delegatedValue,
          delegatedUsageSuggestions,
          delegatedDataContext,
        ) =>
          formatter.format(
            delegatedValue,
            delegatedUsageSuggestions ?? usageSuggestions,
            delegatedDataContext ?? dataContext,
          ) as any

        return nextFormat(delegate, value, usageSuggestions, dataContext) as any
      },
      nextFormatterOptions ?? formatterOptions,
    )

    nextFormatter.innerFormatter = formatter

    return nextFormatter
  }

  return formatter
}
