import WhoAmI from "../src/commands/whoami";

describe('Test Command', () => {
  let result

  beforeEach(() => {
    result = []
    jest
      .spyOn(process.stdout, 'write')
    .mockImplementation(val =>
      result.push(val),
    )
  })

  afterEach(() => jest.restoreAllMocks())

  it('should print Test', async () => {
    try {
      await WhoAmI.run([])
    } catch (ex) {
      result.push(ex.message);
    }
    expect(result.join(" ")).toContain("No user logged in.");
  })
})