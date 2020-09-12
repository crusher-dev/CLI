import { expect, test } from "@oclif/test";

describe("check required flags", () => {
  test
    .stderr()
    .command(["run"])
    .exit(2)
    .it("check token is required", (ctx) => {
      expect(ctx.stderr).to.contain("");
    });

  test
    .stdout()
    .command(["run", "--crusher_token=123"])
    .it("Should have test ID or test group id", (ctx) => {
      expect(ctx.stdout).to.contain(
        "Either test ID or Test Group IDs are needed to run the test."
      );
    });
});
