import { SUGGESTIONS, FORMATTER_OVERRIDE } from "./constants"

describe("suggestions object", () => {
  it("is exported properly", () => {
    expect(SUGGESTIONS).toBeInstanceOf(Object)
  })

  it("has its values equal to its keys", () => {
    Object.entries(SUGGESTIONS).forEach(([key, value]) => expect(key).toEqual(value))
  })
})

describe("formatter override key", () => {
  it("is exported properly", () => {
    expect(typeof FORMATTER_OVERRIDE).toBe("string")
  })
})
