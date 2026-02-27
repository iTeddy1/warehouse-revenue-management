import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import { config } from 'dotenv'

config()
const exec = promisify(execCb)

async function main() {
  const url = process.env.DATABASE_URL
  const file = process.argv[2]
  if (!url) throw new Error('DATABASE_URL missing')
  if (!file) throw new Error('Provide path to .sql file: npm run restore -- path/to/file.sql')

  const cmd = `psql "${url}" -f "${file}"`
  console.log('Running:', cmd)
  await exec(cmd)
  console.log('Restore completed')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
