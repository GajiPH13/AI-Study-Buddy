import { loadEnvConfig } from "@next/env";
import { ensureApplicationIndexes } from "../src/lib/indexes";
import { getMongoClient } from "../src/lib/db";

async function main() {
  loadEnvConfig(process.cwd());
  try {
    await ensureApplicationIndexes();
    console.log("Application indexes are ready.");
  } finally {
    await getMongoClient().close();
  }
}

main().catch((error: unknown) => {
  console.error("Application indexes could not be created.");
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
});
