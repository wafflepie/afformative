import { mount } from "enzyme"
import React, { useMemo } from "react"

import { SUGGESTIONS, FORMATTER_OVERRIDE } from "./constants"
import makeFormatter from "./makeFormatter"

const toUpperCase = string => string.toUpperCase()

describe("makeFormatter", () => {
  it("handles trivial formatting", () => {
    const Formatter = makeFormatter(toUpperCase)
    const wrapper = mount(<Formatter>foo</Formatter>)
    expect(wrapper.text()).toBe("FOO")
  })

  it("accepts a `displayName` option", () => {
    const Formatter = makeFormatter(toUpperCase, { displayName: "UpperFormatter" })
    const wrapper = mount(<Formatter>foo</Formatter>)
    expect(wrapper.name()).toBe("UpperFormatter")
  })

  it("throws if first argument is not a function", () => {
    expect(() => makeFormatter("not a function")).toThrow()
  })

  it("returns a formatter with a static `format` property", () => {
    const Formatter = makeFormatter(toUpperCase)
    expect(Formatter.format("foo")).toBe("FOO")
  })

  it("passes `isSuggested` to `format` when used as a component", () => {
    const Formatter = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    const wrapperAbbreviatedSuggestion = mount(
      <Formatter suggestions={[SUGGESTIONS.abbreviated]}>foo</Formatter>,
    )

    expect(wrapperAbbreviatedSuggestion.text()).toBe("f")

    const wrapperEmptySuggestions = mount(<Formatter suggestions={[]}>foo</Formatter>)
    expect(wrapperEmptySuggestions.text()).toBe("foo")

    const wrapperMissingSuggestions = mount(<Formatter>foo</Formatter>)
    expect(wrapperMissingSuggestions.text()).toBe("foo")
  })

  it("passes `isSuggested` to `format` when used via the static `format` property", () => {
    const Formatter = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    expect(Formatter.format("foo", [SUGGESTIONS.abbreviated])).toBe("f")
    expect(Formatter.format("foo", [])).toBe("foo")
    expect(Formatter.format("foo")).toBe("foo")
  })

  it("handles hooks inside `format` when used as a component", () => {
    const Formatter = makeFormatter(() => useMemo(() => "override", []))
    const wrapper = mount(<Formatter>foo</Formatter>)
    expect(wrapper.text()).toBe("override")
  })

  it("throws with hooks inside `format` when called statically", () => {
    // NOTE: This is more of a check that Enzyme works as advertised.
    const Formatter = makeFormatter(() => useMemo(() => "override", []))
    expect(() => Formatter.format("foo")).toThrow()
  })

  it("passes the `primitive` suggestion when called statically without suggestions", () => {
    const Formatter = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.primitive)) {
        return "primitive"
      }

      return value
    })

    expect(Formatter.format("foo")).toBe("primitive")
    expect(Formatter.format("foo", [])).toBe("foo")
    expect(Formatter.format("foo", [SUGGESTIONS.primitive])).toBe("primitive")

    const wrapper = mount(<Formatter>foo</Formatter>)
    expect(wrapper.text()).toBe("foo")

    const wrapperPrimitiveSuggestion = mount(
      <Formatter suggestions={[SUGGESTIONS.primitive]}>foo</Formatter>,
    )

    expect(wrapperPrimitiveSuggestion.text()).toBe("primitive")
  })

  it("detects the `FORMATTER_OVERRIDE` prop on values when used as a component", () => {
    const Formatter = makeFormatter(toUpperCase)
    const wrapper = mount(<Formatter>{{ [FORMATTER_OVERRIDE]: () => "bar" }}</Formatter>)
    expect(wrapper.text()).toBe("bar")
  })

  it("detects the `FORMATTER_OVERRIDE` prop on values when called statically", () => {
    const Formatter = makeFormatter(toUpperCase)
    expect(Formatter.format({ [FORMATTER_OVERRIDE]: () => "bar" })).toBe("bar")
  })
})
