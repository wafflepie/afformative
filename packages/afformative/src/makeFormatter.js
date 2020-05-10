import invariant from "invariant"

import makeUseFormatter from "./makeUseFormatter"

const makeFormatter = (format, formatterOptions) => {
  invariant(
    typeof format === "function",
    "The first argument passed to `makeFormatter` must be a function.",
  )

  const useFormatter = makeUseFormatter(() => format, {
    ...formatterOptions,
    callee: "makeFormatter",
  })

  // HACK: We're kind of cheating here, but it's all for a good cause. By supplying the `callee`
  // prop to `makeUseFormatter`, we expect that calling `useFormatter` won't result in any React
  // hooks being registered.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFormatter()
}

export default makeFormatter
