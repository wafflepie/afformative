import { describe, expectTypeOf, it, test } from "vitest"
import { type Formatter, createFormatter } from "./createFormatter"

describe("createFormatter", () => {
  describe("inference", () => {
    it("infers TInput from the format function", () => {
      const formatter = createFormatter({
        format: (value: number) => String(value),
      })
      expectTypeOf(formatter.format).parameter(0).toEqualTypeOf<number>()
    })

    it("infers TOutput from the format function", () => {
      const formatter = createFormatter({
        format: (value: number) => String(value),
      })
      expectTypeOf(formatter.format).returns.toEqualTypeOf<string>()
    })

    it("infers TContext from the format function signature", () => {
      const formatter = createFormatter({
        format: (value: string, ctx?: { locale: string }) => value,
      })
      expectTypeOf(formatter.format).parameter(1).toEqualTypeOf<{ locale: string } | undefined>()
    })
  })

  describe("assignability", () => {
    test("a formatter is not assignable to one with a different TInput", () => {
      const formatter = createFormatter<string, string>({ format: value => value })
      expectTypeOf(formatter).not.toExtend<Formatter<number, string>>()
    })

    test("a formatter is not assignable to one with an incompatible TOutput", () => {
      const formatter = createFormatter<string, string>({ format: value => value })
      expectTypeOf(formatter).not.toExtend<Formatter<string, number>>()
    })

    test("a formatter with context cannot be passed to a function expecting a base formatter", () => {
      const consume = (param: Formatter<string, string>) => {}

      const formatter = createFormatter<string, string, { locale: string }>({
        format: value => value,
      })

      // @ts-expect-error -- test
      consume(formatter)
    })

    test("a base formatter can be passed to a function expecting a formatter with context", () => {
      const consume = (param: Formatter<string, string, { locale: string }>) => {}

      const formatter = createFormatter<string, string>({
        format: value => value,
      })

      expectTypeOf(consume).toBeCallableWith(formatter)
    })
  })
})
