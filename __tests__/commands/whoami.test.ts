import EntryPoint from "../../src/commands/index";

describe('Whoami command', () => {
  let stdout, stderr, mockExit

  beforeEach(() => {
    stdout = []
    stderr = []
    jest
      .spyOn(console, 'log')
      .mockImplementation((...val) => {
        stdout.push("\n");
        stdout.push(...val);
      })

    jest
      .spyOn(console, 'error')
      .mockImplementation((...val) => {
        stderr.push("\n");
        stderr.push(...val);
      })

    mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => { throw new Error('process.exit: ' + number); });
  })

  afterEach(() => jest.restoreAllMocks())

  it('should throw error if not logged in', async () => {
    try {
      await ((new EntryPoint())).run([process.argv[0], process.argv[1], 'whoami']);
    } catch (ex) {
      stdout.push(ex.message);
    }
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(stdout.join(" ")).toContain("No user logged in.");
  })
})