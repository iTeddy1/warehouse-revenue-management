import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, createReadStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { AppError } from '@/common/exceptions/app-error.js';

const exec = promisify(execCb);

/**
 * Safely parse a PostgreSQL DATABASE_URL into the pg_dump / psql CLI env vars
 * (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE) so the password is never
 * passed as a visible CLI argument.
 */
function parseDatabaseUrl(url: string): Record<string, string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new AppError('Invalid DATABASE_URL format', 500, 'DATABASE_URL_INVALID');
  }

  const schema = new URLSearchParams(parsed.search).get('schema');

  return {
    PGHOST: parsed.hostname,
    PGPORT: parsed.port || '5432',
    PGUSER: decodeURIComponent(parsed.username),
    PGPASSWORD: decodeURIComponent(parsed.password),
    PGDATABASE: parsed.pathname.replace(/^\//, ''),
    // Pass schema as search_path so pg_dump only dumps the target schema
    ...(schema ? { PGOPTIONS: `-c search_path=${schema}` } : {}),
  };
}

export class SystemService {
  /**
   * Run pg_dump and write a plain-SQL backup file.
   * Returns the absolute path to the written file.
   */
  async createBackup(): Promise<string> {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) throw new AppError('DATABASE_URL is not set', 500, 'NO_DB_URL');

    const dir = join(process.cwd(), 'backups');
    mkdirSync(dir, { recursive: true });

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = join(dir, `backup-${ts}.sql`);

    const pgEnv = parseDatabaseUrl(rawUrl);

    // -F p  → plain SQL; -f <file> → output path
    const cmd = `pg_dump -F p -f "${file}"`;

    await exec(cmd, { env: { ...process.env, ...pgEnv } });

    return file;
  }

  /**
   * Run psql to restore a plain-SQL file.
   * @param sqlFilePath Absolute path to a temporary .sql file
   */
  async restoreBackup(sqlFilePath: string): Promise<void> {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) throw new AppError('DATABASE_URL is not set', 500, 'NO_DB_URL');

    if (!existsSync(sqlFilePath)) {
      throw new AppError('Uploaded SQL file not found', 400, 'FILE_NOT_FOUND');
    }

    const pgEnv = parseDatabaseUrl(rawUrl);
    const cmd = `psql -f "${sqlFilePath}"`;

    await exec(cmd, { env: { ...process.env, ...pgEnv } });
  }

  /**
   * Create a readable stream for the given file path (used by the controller to
   * pipe the backup file directly to the HTTP response).
   */
  createFileStream(filePath: string) {
    return createReadStream(filePath);
  }

  /** Remove a temp file, ignoring errors (best-effort cleanup). */
  removeTempFile(filePath: string): void {
    try {
      unlinkSync(filePath);
    } catch {
      // intentionally silent
    }
  }
}
