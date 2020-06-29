import invariant from "invariant"
import PropTypes from "prop-types"
import { useCallback } from "react"

import { SUGGESTIONS } from "./constants"

const defaultStaticSuggestions = [SUGGESTIONS.primitive]

const defaultOuterFormat = (format, ...formatArgs) => format(...formatArgs)

// NOTE: We're not using Ramda for bundle-size purposes, so no currying or `R_.flipIncludes`.
const safeFlipIncludes = array => item => {
  if (!Array.isArray(array)) {
    return false
  }

  return array.includes(item)
}

/**
 * @callback Format
 * @param {*} value value to format
 * @param {Object} suggestionTools props based on formatter usage context
 * @param {string[]} suggestionTools.suggestions suggestions passed to the formatter
 * @param {Function} suggestionTools.isSuggested predicate returning if a suggestion was passed
 */

/**
 * Creates a new formatter, a React component with a `.format` static property.
 *
 * @param {Format} format function used to format the value
 * @param {Object} formatterOptions additional options for the formatter
 * @param {string} formatterOptions.displayName React display name of the formatter
 */
const makeFormatter = (format, formatterOptions = {}) => {
  invariant(
    typeof format === "function",
    "The first argument passed to `makeFormatter` must return a function.",
  )

  /**
   * An afformative formatter.
   *
   * @param {Object} props React component props
   * @param {*} props.value value to format
   * @param {string[]} props.suggestions contextual suggestions which the formatter should take note of
   */
  const Formatter = ({ children: value, suggestions, ...otherProps }) => {
    const isSuggested = useCallback(safeFlipIncludes(suggestions), [suggestions])

    return (
      format(value, {
        isSuggested,
        suggestions,
        ...otherProps,
      }) ?? null
    )
  }

  /**
   * Statically formats a value. Useful if you need to work with primitive values,
   * not React elements.
   *
   * @param {*} value value to format
   * @param {string[]} suggestions contextual suggestions which the formatter should take note of
   * @param {Object} otherProps additional contextual props
   */
  Formatter.format = (value, suggestions = defaultStaticSuggestions, otherProps) =>
    format(value, {
      isSuggested: safeFlipIncludes(suggestions),
      suggestions,
      ...otherProps,
    }) ?? null

  // TODO: Instead of documenting this method via a JSDoc, typings would be much more useful.
  Formatter.wrap = (outerFormat = defaultOuterFormat, nextFormatterOptions = {}) => {
    const WrappedFormatter = makeFormatter(
      (value, suggestionTools) =>
        outerFormat(
          (delegatedValue, delegatedSuggestionTools) =>
            // NOTE: Passing `format` instead of `Formatter.format` to `outerFormat` in order to make it
            // as easy as possible to delegate formatting.
            format(delegatedValue, delegatedSuggestionTools ?? suggestionTools),
          value,
          suggestionTools,
        ),
      {
        ...formatterOptions,
        ...nextFormatterOptions,
      },
    )

    // NOTE: This is mainly useful for debugging.
    WrappedFormatter.innerFormatter = Formatter

    return WrappedFormatter
  }

  Formatter.propTypes = {
    // NOTE: We want the formatter to format any arbitrary value.
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
    suggestions: PropTypes.arrayOf(PropTypes.oneOf(Object.values(SUGGESTIONS))),
  }

  Formatter.displayName = formatterOptions.displayName || "Formatter"

  return Formatter
}

export default makeFormatter
