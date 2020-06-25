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
