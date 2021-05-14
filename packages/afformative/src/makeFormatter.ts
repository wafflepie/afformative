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
//   interface FormatDefinition<TInput, TOutput, TPrimitiveOutput, TDataContext extends DataContext> {
//     <TSuggestion extends Suggestion>(
//       value: TInput,
//       usageSuggestions: TSuggestion[],
//       dataContext: Partial<TDataContext>,
//     ): PrimitiveSuggestion extends TSuggestion ? TPrimitiveOutput : TOutput
//   }

interface FormatDefinition<TInput, TOutput, TPrimitiveOutput, TDataContext extends DataContext> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions passed by the consumer of a formatter. */
    usageSuggestions: Suggestion[],
    /** Additional data context to be used by the formatter. */
    dataContext: Partial<TDataContext>,
  ): TOutput | TPrimitiveOutput
}

interface FormatMethod<TInput, TOutput, TPrimitiveOutput, TDataContext extends DataContext> {
  <TSuggestion extends Suggestion>(
    /** Value to format. */
    value: TInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions?: TSuggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext?: Partial<TDataContext>,
  ): PrimitiveSuggestion extends TSuggestion ? TPrimitiveOutput : TOutput
}

interface FormatAsPrimitiveMethod<TInput, TPrimitiveOutput, TDataContext extends DataContext> {
  (
    /** Value to format. */
    value: TInput,
    /** Suggestions the formatter should take note of in addition to `primitive`. */
    usageSuggestions?: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext?: Partial<TDataContext>,
  ): TPrimitiveOutput
}

interface FormatChainDefinition<
  TInnerInput,
  TInnerOutput,
  TInnerPrimitiveInput,
  TInnerDataContext extends DataContext,
  TOuterInput,
  TOuterOutput,
  TOuterPrimitiveOutput,
  TOuterDataContext extends DataContext
> {
  (
    /**
     * The `formatter.format` method which can be used to delegate the formatting
     * to the wrapped formatter. Delegation is simplified so if no suggestions or contextual
     * props are passed, the original ones are used instead.
     */
    delegate: FormatMethod<TInnerInput, TInnerOutput, TInnerPrimitiveInput, TInnerDataContext>,
    /** Value to format. */
    value: TOuterInput,
    /** Suggestions the formatter should take note of. */
    usageSuggestions: Suggestion[],
    /** Additional data context the formatter might find useful. */
    dataContext: Partial<TOuterDataContext>,
  ): TOuterOutput | TOuterPrimitiveOutput
}

type FormatterProps<TInput, TDataContext extends DataContext> = {
  /** Value to format. */
  children: TInput
  /** Suggestions the formatter should take note of. */
  suggestions?: Suggestion[]
} & Partial<TDataContext>

export interface Formatter<
  TInput,
  TOutput,
  TPrimitiveOutput = TOutput,
  TDataContext extends DataContext = DataContext
> {
  /** Formatter name, useful for debugging or advanced pattern matching. */
  displayName?: string
  /** Formats a value. */
  format: FormatMethod<TInput, TOutput, TPrimitiveOutput, TDataContext>
  /** Formats a value with the `primitive` suggestion. */
  formatAsPrimitive: FormatAsPrimitiveMethod<TInput, TPrimitiveOutput, TDataContext>
  /** The callee of the `.wrap` method used to produce this formatter. */
  innerFormatter?: Formatter<any, any, any, any>
  /**
   * Creates a new formatter from an existing one. Allows overriding of formatter behaviour
   * for certain values.
   */
  wrap: <
    TNextInput = TInput,
    TNextOutput = TOutput,
    TNextPrimitiveOutput = TPrimitiveOutput,
    TNextDataContext extends DataContext = TDataContext
  >(
    /**
     * Function used to format the value. Has the same signature as the one passed
     * to `makeFormatter`, except a `delegate` function is passed in the first position.
     * This function can be used to delegate formatting to the original (inner) formatter.
     */
    nextFormat: FormatChainDefinition<
      TInput,
      TOutput,
      TPrimitiveOutput,
      TDataContext,
      TNextInput,
      TNextOutput,
      TNextPrimitiveOutput,
      TNextDataContext
    >,
    /** New formatter options, replacing the original ones. */
    nextFormatterOptions?: FormatterOptions,
  ) => Formatter<TNextInput, TNextOutput, TNextPrimitiveOutput, TNextDataContext>
  /**
   * Backwards-compatible way to use the formatter as a React component.
   *
   * @deprecated Since v0.6.0. Prefer using the `Formatter.format` method instead.
   */
  (props: FormatterProps<TInput, TDataContext>): TOutput | TPrimitiveOutput | null
}

/**
 * Creates a new formatter.
 *
 * @param format Function used to format the value.
 * @param formatterOptions Additional options for the formatter.
 */
export const makeFormatter = <
  TInput,
  TOutput,
  TPrimitiveOutput = TOutput,
  TDataContext extends DataContext = DataContext
>(
  format: FormatDefinition<TInput, TOutput, TPrimitiveOutput, TDataContext>,
  formatterOptions?: FormatterOptions,
): Formatter<TInput, TOutput, TPrimitiveOutput, TDataContext> => {
  const formatter: Formatter<TInput, TOutput, TPrimitiveOutput, TDataContext> = ({
    children,
    suggestions = [],
    ...dataContext
  }) => format(children, suggestions, dataContext as any) ?? null

  formatter.displayName = formatterOptions?.displayName

  formatter.format = (value, usageSuggestions = [], dataContext = {}) =>
    format(value, usageSuggestions, dataContext) as any

  formatter.formatAsPrimitive = (value, usageSuggestions = [], dataContext = {}) =>
    format(value, ["primitive", ...usageSuggestions], dataContext) as any

  formatter.wrap = <
    TNextInput,
    TNextOutput,
    TNextPrimitiveOutput,
    TNextDataContext extends DataContext
  >(
    nextFormat: FormatChainDefinition<
      TInput,
      TOutput,
      TPrimitiveOutput,
      TDataContext,
      TNextInput,
      TNextOutput,
      TNextPrimitiveOutput,
      TNextDataContext
    >,
    nextFormatterOptions?: FormatterOptions,
  ) => {
    const nextFormatter: Formatter<
      TNextInput,
      TNextOutput,
      TNextPrimitiveOutput,
      TNextDataContext
    > = makeFormatter((value, usageSuggestions, dataContext) => {
      const delegate: FormatMethod<TInput, TOutput, TPrimitiveOutput, TDataContext> = (
        delegatedValue,
        delegatedUsageSuggestions,
        delegatedDataContext,
      ) =>
        formatter.format(
          delegatedValue,
          delegatedUsageSuggestions ?? usageSuggestions,
          (delegatedDataContext ?? dataContext) as any,
        ) as any

      return nextFormat(delegate, value, usageSuggestions, dataContext) as any
    }, nextFormatterOptions ?? formatterOptions)

    nextFormatter.innerFormatter = formatter

    return nextFormatter
  }

  return formatter
}
