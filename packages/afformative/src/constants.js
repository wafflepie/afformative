/**
 * Suggestions that can be passed to formatters externally, indicating the context in which
 * they are being used. Based on these suggestions, formatters may produce a different output.
 *
 * @example Formatter.format(value, [SUGGESTIONS.abbreviated])
 */
export const SUGGESTIONS = {
  // NOTE: Order suggestions alphabetically.
  abbreviated: "abbreviated",
  icon: "icon",
  primitive: "primitive",
  verbose: "verbose",
}

/**
 * Assign a function to a value under this key to override the behaviour of all formatters.
 * This is mainly useful if your components supply some of their own data which should have
 * special treatment when being rendered.
 *
 * @example Formatter.format({ [FORMATTER_OVERRIDE]: () => 'N/A' })
 */
export const FORMATTER_OVERRIDE = "@afformative/FORMATTER_OVERRIDE"
