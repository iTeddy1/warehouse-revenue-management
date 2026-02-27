import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config()
const exec = promisify(execCb)

async function main() {
  const dir = join(process.cwd(), 'backups')
  mkdirSync(dir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const file = join(dir, `backup-${ts}.sql`)

  // Use pg_dump. Requires it on PATH.
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  const cmd = `pg_dump "${url}" -F p -f "${file}"`
  console.log('Running:', cmd)
  await exec(cmd)
  console.log('Backup saved to', file)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
