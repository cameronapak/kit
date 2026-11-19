import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../db/schema";

export { Leads, PageView, Posts, Projects } from "../../db/schema";
export { and, count, desc, eq } from "drizzle-orm";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | undefined;

export function getDb() {
  if (database) return database;

  const local = import.meta.env.DEV && import.meta.env.MODE !== "remote";
  const url = local ? "file:.astro/kit.sqlite" : process.env.ASTRO_DB_REMOTE_URL || import.meta.env.ASTRO_DB_REMOTE_URL;
  if (!url) throw new Error("ASTRO_DB_REMOTE_URL must be set when connecting to Turso.");

  const authToken = import.meta.env.DEV
    ? process.env.ASTRO_DB_APP_TOKEN || import.meta.env.ASTRO_DB_APP_TOKEN
    : process.env.ASTRO_DB_APP_TOKEN;

  database = drizzle(createClient({ url, authToken: local ? undefined : authToken }), { schema });
  return database;
}
