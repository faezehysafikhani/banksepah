/**
 * Drop-in replacement for `import { env } from "cloudflare:workers"` so the app can
 * run on Vercel (or any Node host) instead of Cloudflare Workers. `env.DB` mimics the
 * subset of the D1Database API (`prepare/bind/first/all/run/batch`) that this project
 * uses, backed by a libSQL database (Turso in production, a local file in dev).
 */
import { createClient, type Client, type InArgs } from "@libsql/client";
import { mkdirSync } from "node:fs";

type D1Meta = { changes: number; last_row_id: number };
type D1Result<T> = { results: T[]; success: true; meta: D1Meta };

class LibsqlStatement {
  constructor(
    private readonly client: Client,
    public readonly sql: string,
    public readonly args: InArgs = [],
  ) {}

  bind(...args: InArgs): LibsqlStatement {
    return new LibsqlStatement(this.client, this.sql, args);
  }

  async first<T = unknown>(): Promise<T | null> {
    const result = await this.client.execute({ sql: this.sql, args: this.args });
    return (result.rows[0] as unknown as T) ?? null;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const result = await this.client.execute({ sql: this.sql, args: this.args });
    return {
      results: result.rows as unknown as T[],
      success: true,
      meta: { changes: result.rowsAffected, last_row_id: Number(result.lastInsertRowid ?? 0) },
    };
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    return this.all<T>();
  }
}

class LibsqlD1Database {
  constructor(private readonly client: Client) {}

  prepare(sql: string): LibsqlStatement {
    return new LibsqlStatement(this.client, sql);
  }

  async batch<T = unknown>(statements: LibsqlStatement[]): Promise<D1Result<T>[]> {
    const results = await this.client.batch(
      statements.map((statement) => ({ sql: statement.sql, args: statement.args })),
      "write",
    );
    return results.map((result) => ({
      results: result.rows as unknown as T[],
      success: true,
      meta: { changes: result.rowsAffected, last_row_id: Number(result.lastInsertRowid ?? 0) },
    }));
  }
}

let db: LibsqlD1Database | undefined;

function createDb(): LibsqlD1Database {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    if (process.env.VERCEL) {
      throw new Error(
        "TURSO_DATABASE_URL is not set. Add TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) " +
          "to your Vercel project's Environment Variables, then redeploy.",
      );
    }
    // Local dev fallback: a file-based libSQL database, no cloud account needed.
    mkdirSync(".data", { recursive: true });
    return new LibsqlD1Database(createClient({ url: "file:.data/local.db" }));
  }

  return new LibsqlD1Database(createClient({ url, authToken }));
}

export const env = {
  get DB(): LibsqlD1Database {
    db ??= createDb();
    return db;
  },
};
