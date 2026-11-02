import { validationsSuite } from "./validations.test";
import { physicsSuite } from "./charging-physics.test";
import { lifecycleSuite } from "./session-lifecycle.test";
import { serviceSuite } from "./charger-service.test";

async function main(): Promise<void> {
  const suites = [validationsSuite, physicsSuite, lifecycleSuite, serviceSuite];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    const { passed, failed } = await suite.run();
    totalPassed += passed;
    totalFailed += failed;
  }

  console.log(`\n========================================`);
  console.log(`Total Passed: ${totalPassed} | Total Failed: ${totalFailed}`);
  console.log(`========================================`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
