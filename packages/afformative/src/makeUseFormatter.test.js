import { mount } from "enzyme"
import React, { useCallback, useMemo } from "react"

import { SUGGESTIONS } from "./constants"
import makeUseFormatter from "./makeUseFormatter"

const toUpperCase = string => string.toUpperCase()
const useToUpperCase = () => toUpperCase

const makeFormattedFoo = useFormatter => {
  // eslint-disable-next-line react/prop-types
  const FormattedFoo = ({ suggestions }) => {
    const Formatter = useFormatter()

    return <Formatter suggestions={suggestions}>foo</Formatter>
  }

  return FormattedFoo
}

const makeStaticallyFormattedFoo = useFormatter => {
  const FormattedFoo = ({ suggestions }) => {
    const Formatter = useFormatter()

    return Formatter.format("foo", suggestions)
  }

  return FormattedFoo
}

describe("makeUseFormatter", () => {
  it("handles trivial formatting", () => {
    const useFormatter = makeUseFormatter(useToUpperCase)
    const Test = makeFormattedFoo(useFormatter)
    const wrapper = mount(<Test />)
    expect(wrapper.text()).toBe("FOO")
  })

  it("accepts a `displayName` option", () => {
    const useFormatter = makeUseFormatter(useToUpperCase, { displayName: "UpperFormatter" })
    const Test = makeFormattedFoo(useFormatter)
    const wrapper = mount(<Test />)
    expect(wrapper.childAt(0).name()).toBe("UpperFormatter")
  })

  it("throws if first argument is not a function", () => {
    expect(() => makeUseFormatter("not a function")).toThrow()
  })

  it("throws if first argument does not return a function", () => {
    const useFormatter = makeUseFormatter(() => "not a function")
    const Test = makeFormattedFoo(useFormatter)
    const consoleError = console.error

    console.error = () => {}

    expect(() => mount(<Test />)).toThrow()
    console.error = consoleError
  })

  it("returns a formatter with a static `format` property", () => {
    const useFormatter = makeUseFormatter(useToUpperCase)
    const Test = makeStaticallyFormattedFoo(useFormatter)
    const wrapper = mount(<Test />)
    expect(wrapper.text()).toBe("FOO")
  })

  it("passes `isSuggested` to `format` when used as a component", () => {
    const useFormatter = makeUseFormatter(() => (value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    const Test = makeFormattedFoo(useFormatter)
    const wrapper = mount(<Test suggestions={[SUGGESTIONS.abbreviated]} />)
    expect(wrapper.text()).toBe("f")
  })

  it("passes `isSuggested` to `format` when used via the static `format` property", () => {
    const useFormatter = makeUseFormatter(() => (value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    const Test = makeStaticallyFormattedFoo(useFormatter)
    const wrapper = mount(<Test suggestions={[SUGGESTIONS.abbreviated]} />)
    expect(wrapper.text()).toBe("f")
  })

  it("passes hook arguments to `useFormat`", () => {
    const useFormatter = makeUseFormatter(index => value => value[index])

    const Test = () => {
      const Formatter = useFormatter(1)

      return <Formatter>foo</Formatter>
    }

    const wrapper = mount(<Test />)
    expect(wrapper.text()).toBe("o")
  })

  it("does not change formatter reference if `format` is stable", () => {
    // NOTE: We check the unstable variant so we know the test actually works.
    const useUnstableFormatter = makeUseFormatter(() => value => value)

    const UnstableTest = () => {
      const Formatter = useUnstableFormatter()

      return <Formatter>foo</Formatter>
    }

    const unstableWrapper = mount(<UnstableTest />)
    const firstUnstableFormatter = unstableWrapper.childAt(0).type()
    unstableWrapper.setProps({})
    expect(firstUnstableFormatter).not.toBe(unstableWrapper.childAt(0).type())

    const useStableFormatter = makeUseFormatter(() => {
      return useCallback(value => value, [])
    })

    const StableTest = () => {
      const Formatter = useStableFormatter()

      return <Formatter>foo</Formatter>
    }

    const stableWrapper = mount(<StableTest />)
    const firstStableFormatter = stableWrapper.childAt(0).type()
    stableWrapper.setProps({})
    expect(firstStableFormatter).toBe(stableWrapper.childAt(0).type())
  })

  it("handles `format` reference changes", () => {
    const useFormatter = makeUseFormatter(forcedValue => {
      return useCallback(() => forcedValue || null, [forcedValue])
    })

    // eslint-disable-next-line react/prop-types
    const Test = ({ forcedValue }) => {
      const Formatter = useFormatter(forcedValue)

      return <Formatter>foo</Formatter>
    }

    const wrapper = mount(<Test />)
    wrapper.setProps({ forcedValue: "one" })
    expect(wrapper.text()).toBe("one")
    wrapper.setProps({ forcedValue: "two" })
    expect(wrapper.text()).toBe("two")
  })

  it("handles hooks inside `format` when used as a component", () => {
    const useFormatter = makeUseFormatter(() => () => useMemo(() => "override", []))
    const Test = makeFormattedFoo(useFormatter)
    const wrapper = mount(<Test />)
    expect(wrapper.text()).toBe("override")
  })

  it("throws with hooks inside `format` when called statically", () => {
    // NOTE: This is more of a check that Enzyme works as advertised.
    const useFormatter = makeUseFormatter(() => () => useMemo(() => "override", []))
    let format

    const Test = () => {
      const Formatter = useFormatter()
      format = Formatter.format

      return null
    }

    mount(<Test />)
    expect(() => format("foo")).toThrow()
  })
})
