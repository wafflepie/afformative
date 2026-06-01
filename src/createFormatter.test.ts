import { describe, expect, it, vi } from "vitest"
import { createFormatter } from "./createFormatter"

describe("createFormatter", () => {
  describe("format", () => {
    it("returns the formatted value", () => {
      const formatter = createFormatter<number, string>({ format: value => String(value * 2) })
      expect(formatter.format(5)).toBe("10")
    })

    it("passes context to the format function", () => {
      const formatFn = vi.fn()
      const formatter = createFormatter<number, string, { multiplier: number }>({
        format: formatFn,
      })
      formatter.format(3, { multiplier: 4 })
      expect(formatFn).toHaveBeenCalledWith(3, { multiplier: 4 })
    })

    it("supports non-string output types", () => {
      const formatter = createFormatter<string, { label: string }>({
        format: value => ({ label: value }),
        stringify: value => value,
      })
      expect(formatter.format("foo")).toEqual({ label: "foo" })
    })
  })

  describe("stringify", () => {
    describe("when a custom stringify is provided", () => {
      it("uses the provided stringify function", () => {
        const formatter = createFormatter<number, number>({
          format: value => value,
          stringify: value => `#${value}`,
        })
        expect(formatter.stringify(42)).toBe("#42")
      })

      it("passes context to the stringify function", () => {
        const stringifyFn = vi.fn()
        const formatter = createFormatter<number, number, { prefix: string }>({
          format: value => value,
          stringify: stringifyFn,
        })
        formatter.stringify(7, { prefix: "$" })
        expect(stringifyFn).toHaveBeenCalledWith(7, { prefix: "$" })
      })
    })

    describe("when no stringify is provided", () => {
      it("returns the formatted value as a string", () => {
        const formatter = createFormatter<number, string>({ format: value => String(value * 3) })
        expect(formatter.stringify(4)).toBe("12")
      })

      it("uses the formatted value, not the raw input", () => {
        const formatter = createFormatter<string, string>({
          format: value => value.toUpperCase(),
        })
        expect(formatter.stringify("hello")).toBe("HELLO")
      })

      it("passes context through to the format function", () => {
        const formatter = createFormatter<number, string, { offset: number }>({
          format: (value, ctx) => String(value + (ctx?.offset ?? 0)),
        })
        expect(formatter.stringify(10, { offset: 5 })).toBe("15")
      })
    })
  })

  describe("meta", () => {
    it("is undefined when not provided", () => {
      const formatter = createFormatter<string, string>({ format: value => value })
      expect(formatter.meta).toBeUndefined()
    })

    it("is the provided meta object", () => {
      const meta = {}
      const formatter = createFormatter<string, string>({ format: value => value, meta })
      expect(formatter.meta).toBe(meta)
    })
  })

  describe("compare", () => {
    describe("when a custom compare is provided", () => {
      it("uses the provided compare function", () => {
        const formatter = createFormatter<string, string>({
          format: value => value,
          compare: (a, b) => a.length - b.length,
        })
        expect(formatter.compare("b", "aa")).toBeLessThan(0)
        expect(formatter.compare("bb", "a")).toBeGreaterThan(0)
        expect(formatter.compare("bbb", "aaa")).toBe(0)
      })

      it("passes context to the compare function", () => {
        const compareFn = vi.fn()
        const formatter = createFormatter<string, string, { someKey: boolean }>({
          format: value => value,
          compare: compareFn,
        })
        formatter.compare("a", "b", { someKey: true })
        expect(compareFn).toHaveBeenCalledWith("a", "b", { someKey: true })
      })
    })

    describe("when no compare is provided", () => {
      it("falls back to localeCompare on stringified values", () => {
        const formatter = createFormatter<string, string>({ format: value => value })
        expect(formatter.compare("apple", "banana")).toBeLessThan(0)
        expect(formatter.compare("banana", "apple")).toBeGreaterThan(0)
        expect(formatter.compare("apple", "apple")).toBe(0)
      })

      it("uses custom stringify when falling back", () => {
        const formatter = createFormatter<number, number>({
          format: value => value,
          stringify: value => String(value * 6),
        })
        expect(formatter.compare(1, 2)).toBeGreaterThan(0)
        expect(formatter.compare(2, 1)).toBeLessThan(0)
      })

      it("passes context through to stringify when falling back", () => {
        const formatter = createFormatter<number, number, { multiplier: number }>({
          format: value => value,
          stringify: (value, ctx) => `${value * (ctx?.multiplier ?? 1)}`,
        })
        expect(formatter.compare(1, 2, { multiplier: 6 })).toBeGreaterThan(0)
        expect(formatter.compare(2, 1, { multiplier: 6 })).toBeLessThan(0)
      })
    })
  })
})
