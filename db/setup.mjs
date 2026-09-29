import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local and run this again.");
  process.exit(1);
}

const sql = neon(connectionString);

function splitStatements(text) {
  return text
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function tableExists(name) {
  const rows = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
  `;
  return rows.length > 0;
}

async function applyFile(fileName) {
  const text = await readFile(new URL(fileName, import.meta.url), "utf8");
  const statements = splitStatements(text);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`  applied ${fileName} (${statements.length} statement${statements.length === 1 ? "" : "s"})`);
}

if (await tableExists("restaurants")) {
  console.log("restaurants table already exists. Nothing was written.");
} else {
  console.log("Creating tables...");
  await applyFile("schema.sql");
  console.log("Inserting seed rows...");
  await applyFile("seed.sql");
  console.log("Setup complete.");
}

console.log("\nrestaurants:");
const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
console.table(restaurants);

console.log("reviews:");
const reviews = await sql`
  SELECT id, restaurant_id, rating, comment, created_at
  FROM reviews ORDER BY created_at
`;
console.table(reviews);
