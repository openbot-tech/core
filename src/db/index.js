import { Pool } from 'pg'
import { dev } from '../config/database.json'

const pool = new Pool(dev)

const query = (text, params) => (
  pool.query(text, params)
)

export const candleQuery = async (params) => {
  await query(
    `INSERT INTO candles 
    (pair, close_time, open, high, low, close, volume) 
    values ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    params,
  )
  return query(
    'SELECT * FROM candles WHERE pair = $1 ',
    [params[0]],
  )
}

export default query
