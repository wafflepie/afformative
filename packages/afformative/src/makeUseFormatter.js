import invariant from "invariant"
import PropTypes from "prop-types"
import { useMemo as reactUseMemo, useCallback } from "react"

import { SUGGESTIONS } from "./constants"

// NOTE: We're not using Ramda for bundle-size purposes, so no currying or `R_.flipIncludes`.
const safeFlipIncludes = array => item => {
  if (!Array.isArray(array)) {
    return false
  }

  return array.includes(item)
}

const call = fn => fn()

const makeUseFormatter = (useFormat, formatterOptions = {}) => {
  invariant(
    typeof useFormat === "function",
    "The first argument passed to `makeUseFormatter` must be a function.",
  )

  const useFormatter = (...args) => {
    const format = useFormat(...args)

    invariant(
      typeof format === "function",
      "The first argument passed to `makeUseFormatter` must return a function.",
    )

    // HACK: We want to reuse this implementation in `makeFormatter` which must be callable
    // outside React component scope.
    const useMemo = formatterOptions.callee === "makeFormatter" ? call : reactUseMemo

    return useMemo(() => {
      const Formatter = ({ children: value, suggestions, ...otherProps }) => {
        const isSuggested = useCallback(safeFlipIncludes(suggestions), [suggestions])

        return format(value, {
          isSuggested,
          suggestions,
          ...otherProps,
        })
      }

      Formatter.format = (value, suggestions, otherProps) => {
        const staticSuggestions = [SUGGESTIONS.primitive, ...suggestions]

        return format(value, {
          isSuggested: safeFlipIncludes(staticSuggestions),
          suggestions: staticSuggestions,
          ...otherProps,
        })
      }

      Formatter.propTypes = {
        // NOTE: We want the formatter to format any arbitrary value.
        // eslint-disable-next-line react/forbid-prop-types
        children: PropTypes.any,
        suggestions: PropTypes.arrayOf(PropTypes.string),
      }

      Formatter.displayName = formatterOptions.displayName || "Formatter"

      return Formatter
    }, [format])
  }

  return useFormatter
}

export default makeUseFormatter
