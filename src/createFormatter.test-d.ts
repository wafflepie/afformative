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

  describe("stringify", () => {
    test("stringify is optional when TOutput extends string", () => {
      expectTypeOf(createFormatter<string, string>).toBeCallableWith({
        format: (value: string) => value,
      })
    })

    test("stringify is optional when TOutput extends number", () => {
      expectTypeOf(createFormatter<number, number>).toBeCallableWith({
        format: (value: number) => value,
      })
    })

    test("stringify is required when TOutput is not a string or number", () => {
      // @ts-expect-error -- stringify is required for non-string/number output
      createFormatter<number, Date>({
        format: (value: number) => new Date(value),
      })
    })

    test("stringify is accepted when TOutput is not a string or number", () => {
      expectTypeOf(createFormatter<number, Date>).toBeCallableWith({
        format: (value: number) => new Date(value),
        stringify: (value: number) => new Date(value).toISOString(),
      })
    })

    test("stringify is optional when TOutput is a string union", () => {
      expectTypeOf(createFormatter<boolean, "yes" | "no">).toBeCallableWith({
        format: (value: boolean) => (value ? "yes" : "no") as "yes" | "no",
      })
    })

    test("stringify is required when TOutput is an object type", () => {
      // @ts-expect-error -- stringify is required for object output
      createFormatter<string, { label: string }>({
        format: (value: string) => ({ label: value }),
      })
    })

    test("stringify is required when TOutput is a union of string and a non-primitive", () => {
      // @ts-expect-error -- stringify is required when union doesn't fully extend string | number
      createFormatter<string, string | { label: string }>({
        format: (value: string) => value,
      })
    })

    test("stringify is required when TOutput is a union of number and a non-primitive", () => {
      // @ts-expect-error -- stringify is required when union doesn't fully extend string | number
      createFormatter<number, number | Date>({
        format: (value: number) => value,
      })
    })

    test("stringify is required when TOutput is a union of string, number, and a non-primitive", () => {
      // @ts-expect-error -- stringify is required when union doesn't fully extend string | number
      createFormatter<string, string | number | { label: string }>({
        format: (value: string) => value,
      })
    })

    test("stringify is optional when TOutput is a union of string and number", () => {
      expectTypeOf(createFormatter<string, string | number>).toBeCallableWith({
        format: (value: string) => value,
      })
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
