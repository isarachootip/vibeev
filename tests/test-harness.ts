import assert from "node:assert/strict";

export interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

export class TestSuite {
  private readonly cases: TestCase[] = [];

  constructor(public readonly suiteName: string) {}

  test(name: string, fn: () => void | Promise<void>): void {
    this.cases.push({ name, fn });
  }

  async run(): Promise<{ passed: number; failed: number }> {
    let passed = 0;
    let failed = 0;
    console.log(`\n▶ Suite: ${this.suiteName}`);

    for (const testCase of this.cases) {
      try {
        await testCase.fn();
        passed++;
        console.log(`  ✓ ${testCase.name}`);
      } catch (err: unknown) {
        failed++;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ ${testCase.name}\n    ${message}`);
      }
    }

    return { passed, failed };
  }
}

export { assert };
