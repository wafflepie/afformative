import { mount } from "enzyme"
import React, { useMemo } from "react"

import { SUGGESTIONS } from "./constants"
import makeFormatter from "./makeFormatter"

const toUpperCase = string => string.toUpperCase()

describe("makeFormatter", () => {
  it("handles trivial formatting", () => {
    const F = makeFormatter(toUpperCase)
    expect(mount(<F>foo</F>).text()).toBe("FOO")
  })

  it("accepts a `displayName` option", () => {
    const F = makeFormatter(toUpperCase, { displayName: "UpperFormatter" })
    expect(mount(<F>foo</F>).name()).toBe("UpperFormatter")
  })

  it("throws if first argument is not a function", () => {
    expect(() => makeFormatter("not a function")).toThrow()
  })

  it("returns a formatter with a static `format` property", () => {
    const F = makeFormatter(toUpperCase)
    expect(F.format("foo")).toBe("FOO")
  })

  it("passes `isSuggested` to `format` when used as a component", () => {
    const F = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    expect(mount(<F suggestions={[SUGGESTIONS.abbreviated]}>foo</F>).text()).toBe("f")
    expect(mount(<F suggestions={[]}>foo</F>).text()).toBe("foo")
    expect(mount(<F>foo</F>).text()).toBe("foo")
  })

  it("passes `isSuggested` to `format` when used via the static `format` property", () => {
    const F = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    expect(F.format("foo", [SUGGESTIONS.abbreviated])).toBe("f")
    expect(F.format("foo", [])).toBe("foo")
    expect(F.format("foo")).toBe("foo")
  })

  it("handles hooks inside `format` when used as a component", () => {
    const F = makeFormatter(() => useMemo(() => "override", []))
    expect(mount(<F>foo</F>).text()).toBe("override")
  })

  it("throws with hooks inside `format` when called statically", () => {
    // NOTE: This is more of a check that Enzyme works as advertised.
    const F = makeFormatter(() => useMemo(() => "override", []))
    expect(() => F.format("foo")).toThrow()
  })

  it("passes the `primitive` suggestion when called statically without suggestions", () => {
    const F = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.primitive)) {
        return "primitive"
      }

      return value
    })

    expect(F.format("foo")).toBe("primitive")
    expect(F.format("foo", [])).toBe("foo")
    expect(F.format("foo", [SUGGESTIONS.primitive])).toBe("primitive")
  })

  it("does not crash when formatter returns undefined as a component", () => {
    const F = makeFormatter(() => undefined)
    expect(mount(<F>foo</F>).text()).toBe("")
  })

  it("does not crash when formatter returns undefined statically", () => {
    const F = makeFormatter(() => undefined)
    expect(mount(<div>{F.format("foo")}</div>).text()).toBe("")
  })

  it("allows simple behavior wrapping", () => {
    const F = makeFormatter(toUpperCase)
    const NF = F.wrap((format, value) => (value === "foo" ? "override" : format(value)))

    expect(NF.format("foo")).toBe("override")
    expect(mount(<NF>foo</NF>).text()).toBe("override")

    expect(NF.format("bar")).toBe("BAR")
    expect(mount(<NF>bar</NF>).text()).toBe("BAR")
  })

  it("allows simple behavior wrapping with suggestions", () => {
    const F = makeFormatter(toUpperCase)
    const NF = F.wrap((format, value, { isSuggested }) =>
      value === "foo" && isSuggested(SUGGESTIONS.abbreviated) ? "f" : format(value),
    )

    expect(NF.format("foo")).toBe("FOO")
    expect(mount(<NF>foo</NF>).text()).toBe("FOO")

    expect(NF.format("foo", [SUGGESTIONS.abbreviated])).toBe("f")
    expect(mount(<NF suggestions={[SUGGESTIONS.abbreviated]}>foo</NF>).text()).toBe("f")

    expect(NF.format("bar")).toBe("BAR")
    expect(mount(<NF>bar</NF>).text()).toBe("BAR")
  })

  it("allows simple behavior wrapping with other props", () => {
    const F = makeFormatter(toUpperCase)
    const NF = F.wrap((format, value, { forcedValue }) => forcedValue ?? format(value))

    expect(NF.format("foo")).toBe("FOO")
    expect(mount(<NF>foo</NF>).text()).toBe("FOO")

    expect(NF.format("foo", undefined, { forcedValue: "override" })).toBe("override")
    expect(mount(<NF forcedValue="override">foo</NF>).text()).toBe("override")
  })

  it("allows overriding of display names without specifying `outerFormat`", () => {
    const F = makeFormatter(toUpperCase)
    const NF = F.wrap(undefined, {
      displayName: `Next${F.displayName}`,
    })

    expect(mount(<NF>foo</NF>).text()).toBe("FOO")
    expect(mount(<NF>foo</NF>).name()).toBe("NextFormatter")
  })

  it("passes the original `suggestionTools` when they are not passed manually to `format` when wrapping", () => {
    const F = makeFormatter((value, { isSuggested }) => {
      if (isSuggested(SUGGESTIONS.abbreviated)) {
        return value[0]
      }

      return value
    })

    const NF = F.wrap((format, value) => format(value))

    expect(NF.format("foo", [SUGGESTIONS.abbreviated])).toBe("f")
    expect(mount(<NF suggestions={[SUGGESTIONS.abbreviated]}>foo</NF>).text()).toBe("f")
  })
})
