import { makeFormatter } from "./makeFormatter"

const toUpperCase = (string: string) => string.toUpperCase()

describe("makeFormatter", () => {
  it("handles trivial formatting", () => {
    const formatter = makeFormatter<string, string>(toUpperCase)
    expect(formatter.format("foo")).toBe("FOO")
  })

  it("accepts a `name` option", () => {
    const formatter = makeFormatter<string, string>(toUpperCase, { displayName: "UpperFormatter" })
    expect(formatter.displayName).toBe("UpperFormatter")
  })

  it("passes `suggestions` to `format`", () => {
    const formatter = makeFormatter<string, string>((value, suggestions) => {
      if (suggestions.includes("abbreviated")) {
        return value[0]
      }

      return value
    })

    expect(formatter.format("foo", ["abbreviated"])).toBe("f")
    expect(formatter.format("foo", [])).toBe("foo")
    expect(formatter.format("foo")).toBe("foo")
  })

  it("supports simple behavior wrapping", () => {
    const formatter = makeFormatter<string, string>(toUpperCase)

    const wrappedFormatter = formatter.wrap((delegate, value) =>
      value === "foo" ? "override" : delegate(value),
    )

    expect(wrappedFormatter.format("foo")).toBe("override")
    expect(wrappedFormatter.format("bar")).toBe("BAR")
  })

  it("supports simple behavior wrapping with suggestions", () => {
    const formatter = makeFormatter<string, string>(toUpperCase)

    const wrappedFormatter = formatter.wrap((delegate, value, suggestions) =>
      value === "foo" && suggestions.includes("abbreviated") ? "f" : delegate(value),
    )

    expect(wrappedFormatter.format("foo")).toBe("FOO")
    expect(wrappedFormatter.format("foo", ["abbreviated"])).toBe("f")
    expect(wrappedFormatter.format("bar")).toBe("BAR")
  })

  it("supports simple behavior wrapping with data context", () => {
    const formatter = makeFormatter<string, string>(toUpperCase)

    const wrappedFormatter = formatter.wrap(
      (delegate, value, suggestions, { forcedValue }) => forcedValue ?? delegate(value),
    )

    expect(wrappedFormatter.format("foo")).toBe("FOO")
    expect(wrappedFormatter.format("foo", undefined, { forcedValue: "override" })).toBe("override")
  })

  it("passes the original suggestions when they are not passed manually to `format` when wrapping", () => {
    const formatter = makeFormatter<string, string>((value, suggestions) => {
      if (suggestions.includes("abbreviated")) {
        return value[0]
      }

      return value
    })

    const wrappedFormatter = formatter.wrap((delegate, value) => delegate(value))
    expect(wrappedFormatter.format("foo", ["abbreviated"])).toBe("f")
  })

  it("sets the `innerFormatter` static property when wrapping", () => {
    const formatter = makeFormatter<string, string>(toUpperCase)
    const wrappedFormatter = formatter.wrap((delegate, value) => delegate(value))
    expect(wrappedFormatter.innerFormatter).toBe(formatter)
  })
})
