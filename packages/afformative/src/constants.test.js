import { SUGGESTIONS } from "./constants"

describe("suggestions object", () => {
  it("is exported properly", () => {
    expect(SUGGESTIONS).toBeInstanceOf(Object)
  })

  it("has its values equal to its keys", () => {
    Object.entries(SUGGESTIONS).forEach(([key, value]) => expect(key).toEqual(value))
  })
})
