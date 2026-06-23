import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://localhost:5432/chat_widget";

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
export { schema };

export async function ensureTable() {
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      site_key TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'My Project',
      api_base TEXT NOT NULL,
      agent_name TEXT NOT NULL DEFAULT 'Chat Assistant',
      greeting TEXT NOT NULL DEFAULT 'Hi there! How can I help you?',
      primary_color TEXT NOT NULL DEFAULT '#2563EB',
      accent_color TEXT NOT NULL DEFAULT '#F59E0B',
      position TEXT NOT NULL DEFAULT 'right',
      avatar_url TEXT NOT NULL DEFAULT '',
      chat_ui_url TEXT NOT NULL DEFAULT '',
      powered_by TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  try {
    await client.unsafe(
      "CREATE UNIQUE INDEX IF NOT EXISTS site_key_idx ON projects (site_key)"
    );
  } catch {
    // index may already exist
  }
  console.log("Database table ready.");
}
