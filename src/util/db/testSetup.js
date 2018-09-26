import query, { pool } from '.'

beforeEach(async () => {
  await query('ROLLBACK;')
  await query('BEGIN;')
})

afterEach(async () => {
  await query('ROLLBACK;')
})

afterAll(async () => {
  await pool.end()
})
