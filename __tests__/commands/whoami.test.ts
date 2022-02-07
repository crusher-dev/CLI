import EntryPoint from "../../src/commands/index";
import fs from "fs";

describe('Test Command', () => {
  let result

  beforeEach(() => {
    result = []
    jest
      .spyOn(console, 'log')
    .mockImplementation(val =>
      result.push(val),
    )
  })

  afterEach(() => jest.restoreAllMocks())

  it('should print Test', async () => {
    try {
      await ((new EntryPoint())).run([process.argv[0], process.argv[1], 'whoami']);
    } catch (ex) {
      result.push(ex.message);
    }
    expect(result.join(" ")).toContain("No user logged in.");
  })
})