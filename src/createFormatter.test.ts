import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { type Formatter, createFormatter } from "./createFormatter"

describe("createFormatter", () => {
  describe("format", () => {
    it("returns the formatted value", () => {
      const formatter = createFormatter({ format: (value: number) => value * 2 })
      expect(formatter.format(5)).toBe(10)
    })

    it("passes usageContext to the format function", () => {
      const formatFn = vi.fn(
        (value: number, ctx: Partial<{ multiplier: number }>) => value * (ctx.multiplier ?? 1),
      )
      const formatter = createFormatter({ format: formatFn })
      formatter.format(3, { multiplier: 4 })
      expect(formatFn).toHaveBeenCalledWith(3, { multiplier: 4 })
    })

    it("passes an empty object when usageContext is omitted", () => {
      const formatFn = vi.fn((value: string) => value)
      const formatter = createFormatter({ format: formatFn })
      formatter.format("hello")
      expect(formatFn).toHaveBeenCalledWith("hello", {})
    })

    it("passes an empty object when usageContext is undefined", () => {
      const formatFn = vi.fn((value: string) => value)
      const formatter = createFormatter({ format: formatFn })
      formatter.format("hello", undefined)
      expect(formatFn).toHaveBeenCalledWith("hello", {})
    })

    it("supports non-string output types", () => {
      const formatter = createFormatter({ format: (value: string) => ({ label: value }) })
      expect(formatter.format("foo")).toEqual({ label: "foo" })
    })
  })

  describe("stringify", () => {
    describe("when a custom stringify is provided", () => {
      it("uses the provided stringify function", () => {
        const formatter = createFormatter({
          format: (value: number) => value,
          stringify: value => `#${value}`,
        })
        expect(formatter.stringify(42)).toBe("#42")
      })

      it("passes usageContext to the stringify function", () => {
        const stringifyFn = vi.fn(
          (value: number, ctx: Partial<{ prefix: string }>) => `${ctx.prefix ?? ""}${value}`,
        )
        const formatter = createFormatter({
          format: (value: number) => value,
          stringify: stringifyFn,
        })
        formatter.stringify(7, { prefix: "$" })
        expect(stringifyFn).toHaveBeenCalledWith(7, { prefix: "$" })
      })

      it("passes an empty object when usageContext is omitted", () => {
        const stringifyFn = vi.fn((value: number) => String(value))
        const formatter = createFormatter({ format: (v: number) => v, stringify: stringifyFn })
        formatter.stringify(1)
        expect(stringifyFn).toHaveBeenCalledWith(1, {})
      })

      it("passes an empty object when usageContext is undefined", () => {
        const stringifyFn = vi.fn((value: number) => String(value))
        const formatter = createFormatter({ format: (v: number) => v, stringify: stringifyFn })
        formatter.stringify(1, undefined)
        expect(stringifyFn).toHaveBeenCalledWith(1, {})
      })
    })

    describe("when no stringify is provided", () => {
      it("falls back to String() applied to the formatted value", () => {
        const formatter = createFormatter({ format: (value: number) => value * 3 })
        expect(formatter.stringify(4)).toBe("12")
      })

      it("uses the formatted value, not the raw input", () => {
        const formatter = createFormatter({
          format: (value: string) => value.toUpperCase(),
        })
        expect(formatter.stringify("hello")).toBe("HELLO")
      })

      it("passes usageContext through to the format function", () => {
        const formatter = createFormatter({
          format: (value: number, ctx: Partial<{ offset: number }>) => value + (ctx.offset ?? 0),
        })
        expect(formatter.stringify(10, { offset: 5 })).toBe("15")
      })

      it("handles non-string format output by coercing with String()", () => {
        const formatter = createFormatter({ format: (value: boolean) => !value })
        expect(formatter.stringify(false)).toBe("true")
      })
    })
  })

  describe("compare", () => {
    describe("when a custom compare is provided", () => {
      it("uses the provided compare function", () => {
        const formatter = createFormatter({
          format: (value: number) => value,
          compare: (a, b) => a - b,
        })
        expect(formatter.compare(1, 2)).toBeLessThan(0)
        expect(formatter.compare(2, 1)).toBeGreaterThan(0)
        expect(formatter.compare(3, 3)).toBe(0)
      })

      it("passes usageContext to the compare function", () => {
        const compareFn = vi.fn((a: number, b: number) => a - b)
        const formatter = createFormatter({ format: (v: number) => v, compare: compareFn })
        formatter.compare(1, 2, { someKey: true })
        expect(compareFn).toHaveBeenCalledWith(1, 2, { someKey: true })
      })

      it("passes an empty object when usageContext is omitted", () => {
        const compareFn = vi.fn((a: number, b: number) => a - b)
        const formatter = createFormatter({ format: (v: number) => v, compare: compareFn })
        formatter.compare(1, 2)
        expect(compareFn).toHaveBeenCalledWith(1, 2, {})
      })

      it("passes an empty object when usageContext is undefined", () => {
        const compareFn = vi.fn((a: number, b: number) => a - b)
        const formatter = createFormatter({ format: (v: number) => v, compare: compareFn })
        formatter.compare(1, 2, undefined)
        expect(compareFn).toHaveBeenCalledWith(1, 2, {})
      })
    })

    describe("when no compare is provided", () => {
      it("falls back to localeCompare on stringified values", () => {
        const formatter = createFormatter({ format: (value: string) => value })
        expect(formatter.compare("apple", "banana")).toBeLessThan(0)
        expect(formatter.compare("banana", "apple")).toBeGreaterThan(0)
        expect(formatter.compare("apple", "apple")).toBe(0)
      })

      it("uses the custom stringify when falling back", () => {
        const formatter = createFormatter({
          format: (value: number) => value,
          stringify: value => String(value).padStart(5, "0"),
        })
        expect(formatter.compare(1, 2)).toBeLessThan(0)
      })

      it("passes usageContext through to stringify when falling back", () => {
        const formatter = createFormatter({
          format: (value: number) => value,
          stringify: (value, ctx: Partial<{ multiplier: number }>) =>
            `${value * (ctx.multiplier ?? 1)}`,
        })
        expect(formatter.compare(1, 2, { multiplier: 6 })).toBeGreaterThan(0)
        expect(formatter.compare(2, 1, { multiplier: 6 })).toBeLessThan(0)
      })
    })
  })

  describe("extra properties", () => {
    it("preserves the name property on the returned formatter", () => {
      const formatter = createFormatter({ format: (v: string) => v, ...{ name: "MyFormatter" } })
      expect(formatter.name).toBe("MyFormatter")
    })

    it("returns a formatter without a name when none is provided", () => {
      const formatter = createFormatter({ format: (v: string) => v })
      expect(formatter.name).toBeUndefined()
    })
  })

  /* eslint-disable @typescript-eslint/no-unused-vars */
  describe("types", () => {
    describe("inference", () => {
      it("infers TInput from the format function", () => {
        const formatter = createFormatter({ format: (value: number) => String(value) })
        expectTypeOf(formatter.format).parameter(0).toEqualTypeOf<number>()
      })

      it("infers TOutput from the format function", () => {
        const formatter = createFormatter({ format: (value: number) => String(value) })
        expectTypeOf(formatter.format).returns.toEqualTypeOf<string>()
      })

      it("infers TUsageContext from the format function signature", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string }>) => value,
        })
        expectTypeOf(formatter.format)
          .parameter(1)
          .toEqualTypeOf<Partial<{ locale: string }> | undefined>()
      })

      it("format returns TOutput", () => {
        const formatter = createFormatter({ format: (value: boolean) => ({ flag: value }) })
        expectTypeOf(formatter.format).returns.toEqualTypeOf<{ flag: boolean }>()
      })

      it("stringify always returns string regardless of TOutput", () => {
        const formatter = createFormatter({ format: (value: number) => ({ n: value }) })
        expectTypeOf(formatter.stringify).returns.toEqualTypeOf<string>()
      })

      it("compare always returns number", () => {
        const formatter = createFormatter({ format: (value: number) => value })
        expectTypeOf(formatter.compare).returns.toEqualTypeOf<number>()
      })

      it("format usageContext parameter is Partial<TUsageContext> or undefined", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string; timezone: string }>) => value,
        })
        expectTypeOf(formatter.format)
          .parameter(1)
          .toEqualTypeOf<Partial<{ locale: string; timezone: string }> | undefined>()
      })

      it("stringify usageContext parameter is Partial<TUsageContext> or undefined", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string }>) => value,
        })
        expectTypeOf(formatter.stringify)
          .parameter(1)
          .toEqualTypeOf<Partial<{ locale: string }> | undefined>()
      })

      it("compare usageContext parameter is Partial<TUsageContext> or undefined", () => {
        const formatter = createFormatter({
          format: (value: number, ctx: Partial<{ locale: string }>) => value,
        })
        expectTypeOf(formatter.compare)
          .parameter(2)
          .toEqualTypeOf<Partial<{ locale: string }> | undefined>()
      })
    })

    describe("assignability", () => {
      it("a formatter with a specific context is assignable to one with empty context", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string }>) => value,
        })
        expectTypeOf(formatter).toExtend<Formatter<string, string>>()
      })

      it("a formatter with multiple context keys is assignable to one with a subset", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string; timezone: string }>) => value,
        })
        expectTypeOf(formatter).toExtend<Formatter<string, string, { locale: string }>>()
      })

      it("a formatter is not assignable to one with a different TInput", () => {
        const formatter = createFormatter({ format: (value: string) => value })
        expectTypeOf(formatter).not.toExtend<Formatter<number, string>>()
      })

      it("a formatter is not assignable to one with an incompatible TOutput", () => {
        const formatter = createFormatter({ format: (value: string) => value })
        expectTypeOf(formatter).not.toExtend<Formatter<string, number>>()
      })
    })

    describe("usage at call sites", () => {
      it("format can be called with a partial usageContext", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string; timezone: string }>) => value,
        })
        expectTypeOf(formatter.format).toBeCallableWith("hello", { locale: "en" })
        expectTypeOf(formatter.format).toBeCallableWith("hello", {})
        expectTypeOf(formatter.format).toBeCallableWith("hello")
      })

      it("stringify can be called with a partial usageContext", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string; timezone: string }>) => value,
        })
        expectTypeOf(formatter.stringify).toBeCallableWith("hello", { timezone: "UTC" })
        expectTypeOf(formatter.stringify).toBeCallableWith("hello")
      })

      it("compare can be called with a partial usageContext", () => {
        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string }>) => value,
        })
        expectTypeOf(formatter.compare).toBeCallableWith("a", "b", { locale: "en" })
        expectTypeOf(formatter.compare).toBeCallableWith("a", "b", {})
        expectTypeOf(formatter.compare).toBeCallableWith("a", "b")
      })

      it("a formatter with specific context can be passed to a function expecting a base formatter", () => {
        type BaseFormatter = Formatter<string, string, object>

        const consume = (f: BaseFormatter) => {}

        const formatter = createFormatter({
          format: (value: string, ctx: Partial<{ locale: string }>) => value,
        })

        expectTypeOf(consume).toBeCallableWith(formatter)
      })

      it("a base formatter can be passed to a function expecting a formatter with specific context", () => {
        type SpecificFormatter = Formatter<string, string, { locale: string }>

        const consume = (f: SpecificFormatter) => {}

        const formatter = createFormatter({
          format: (value: string) => value,
        })

        expectTypeOf(consume).toBeCallableWith(formatter)
      })
    })
  })
  /* eslint-enable @typescript-eslint/no-unused-vars */
})
