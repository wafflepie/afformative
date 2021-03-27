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

  it("handles formatting with the `primitive` suggestion", () => {
    type Structure = { value: string }

    const formatter = makeFormatter<Structure, Structure, string>((value, suggestions) => {
      if (suggestions.includes("primitive")) {
        return value.value
      }

      return value
    })

    expect(formatter.format({ value: "foo" }, ["primitive"])).toBe("foo")
    expect(formatter.formatAsPrimitive({ value: "foo" })).toBe("foo")
    expect(formatter.formatAsPrimitive({ value: "foo" }, ["primitive"])).toBe("foo")
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

  it("supports simple behavior wrapping with the `primitive` suggestion", () => {
    type Structure = { value: string }

    const formatter = makeFormatter<string, string>(toUpperCase)

    const wrappedFormatter = formatter.wrap<Structure, Structure, string>(
      (delegate, value, suggestions) => (suggestions.includes("primitive") ? value.value : value),
    )

    expect(wrappedFormatter.format({ value: "foo" }, ["primitive"])).toBe("foo")
    expect(wrappedFormatter.formatAsPrimitive({ value: "foo" })).toBe("foo")
    expect(wrappedFormatter.formatAsPrimitive({ value: "foo" }, ["primitive"])).toBe("foo")
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
