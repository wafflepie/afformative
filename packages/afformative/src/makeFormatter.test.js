import { mount } from "enzyme"
import React from "react"

import makeFormatter from "./makeFormatter"

describe("makeFormatter", () => {
  it("handles trivial formatting", () => {
    const Formatter = makeFormatter(string => string.toUpperCase())
    const wrapper = mount(<Formatter>foo</Formatter>)
    expect(wrapper.text()).toBe("FOO")
  })

  it("throws if first argument is not a function", () => {
    expect(() => makeFormatter("not a function")).toThrow()
  })

  it("returns a formatter with a static `format` property", () => {
    const Formatter = makeFormatter(string => string.toUpperCase())
    expect(Formatter.format("foo")).toEqual("FOO")
  })
})
