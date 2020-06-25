import invariant from "invariant"
import PropTypes from "prop-types"
import { useCallback } from "react"

import { SUGGESTIONS, FORMATTER_OVERRIDE } from "./constants"

const defaultStaticSuggestions = [SUGGESTIONS.primitive]

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
 * @param {Array} suggestionTools.suggestions suggestions passed to the formatter
 * @param {Function} suggestionTools.isSuggested predicate returning if a suggestion was passed
 * @returns {*} formatted value
 */

/**
 * Creates a new formatter, a React component with a `.format` static property.
 *
 * @param {Format} format function used to format the value
 * @param {Object} formatterOptions additional options for the formatter
 * @param {string} formatterOptions.displayName React display name of the formatter
 * @returns {React.Component}
 */
const makeFormatter = (format, formatterOptions = {}) => {
  invariant(
    typeof format === "function",
    "The first argument passed to `makeFormatter` must return a function.",
  )

  const formatWithOverriding = (...args) => {
    const value = args[0]

    if (value && typeof value[FORMATTER_OVERRIDE] === "function") {
      return value[FORMATTER_OVERRIDE](...args)
    }

    return format(...args)
  }

  const Formatter = ({ children: value, suggestions, ...otherProps }) => {
    const isSuggested = useCallback(safeFlipIncludes(suggestions), [suggestions])

    return (
      formatWithOverriding(value, {
        isSuggested,
        suggestions,
        ...otherProps,
      }) ?? null
    )
  }

  Formatter.format = (value, suggestions = defaultStaticSuggestions, otherProps) =>
    formatWithOverriding(value, {
      isSuggested: safeFlipIncludes(suggestions),
      suggestions,
      ...otherProps,
    }) ?? null

  Formatter.propTypes = {
    // NOTE: We want the formatter to format any arbitrary value.
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
    suggestions: PropTypes.arrayOf(PropTypes.string),
  }

  Formatter.displayName = formatterOptions.displayName || "Formatter"

  return Formatter
}

export default makeFormatter
