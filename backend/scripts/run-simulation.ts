#!/usr/bin/env npx tsx
/**
 * Run combinatorial filing simulation and write failures to simulation-results.jsonl
 *
 * Usage: npm run simulation
 */
import fs from "node:fs";
import path from "node:path";
import {
  generateItr3MatrixScenarios,
  generateScenarios,
  getScenarioCount,
} from "../lib/simulation/scenarios";
import { isPythonEngineAvailable, runBatch } from "../lib/simulation/runner";

async function main(): Promise<void> {
  if (!isPythonEngineAvailable()) {
    console.error("Python engine unavailable — skipping simulation.");
    process.exit(1);
  }

  const scenarios = [...generateScenarios(), ...generateItr3MatrixScenarios()];
  console.log(`Running ${scenarios.length} scenarios (max catalog: ${getScenarioCount()})…`);

  const summary = await runBatch(scenarios, { concurrency: 12 });

  const outPath = path.join(process.cwd(), "simulation-results.jsonl");
  if (summary.failures.length > 0) {
    const lines = summary.failures.map((f) => JSON.stringify(f)).join("\n");
    fs.writeFileSync(outPath, lines + "\n");
    console.error(`Wrote ${summary.failures.length} failures to ${outPath}`);
  } else if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }

  console.log(
    JSON.stringify(
      {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        durationMs: summary.durationMs,
      },
      null,
      2
    )
  );

  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
