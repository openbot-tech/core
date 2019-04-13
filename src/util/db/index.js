import { Pool } from 'pg'
import { toArrayOfArraysDataFromDB } from 'Util/parser'

const connection = {
  connectionString: process.env.DATABASE_URL,
}

export const pool = new Pool(connection)

const query = async (text, params) => {
  const queryData = await pool.query(text, params)
  return queryData.rows
}

export const restartSessionsQuery = async (params, restartAfterSeconds) => {
  await query('set timezone TO \'UTC\'')
  const sessionRow = await query(
    `SELECT sessions.id FROM sessions 
    LEFT JOIN candles 
    ON sessions.id = candles.session_id 
    WHERE candles.close_time >= NOW() - INTERVAL '${restartAfterSeconds} seconds'
    AND sessions.name = $1
    AND sessions.pair = $2
    AND sessions.time_frame = $3
    AND sessions.backtest = $4
    AND sessions.paper_trade = $5
    AND sessions.strategy = $6
    LIMIT 1`,
    params,
  )

  return sessionRow.length > 0 && sessionRow[0] && sessionRow[0].id
}

export const sessionQuery = async (params, restartAfterSeconds) => {
  const restartSessionRow = await restartSessionsQuery(params, restartAfterSeconds)
  if (restartSessionRow) return restartSessionRow

  const sessionRow = await query(
    `INSERT INTO sessions 
    (name, pair, time_frame, backtest, paper_trade, strategy) 
    values ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    params,
  )
  return sessionRow.length > 0 && sessionRow[0] && sessionRow[0].id
}


export const candleQuery = async (params) => {
  await query(
    `INSERT INTO candles 
    (session_id, close_time, open, high, low, close, volume) 
    values ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    params,
  )
  const dbCandleData = await query(
    `SELECT * FROM (
      SELECT close_time, open, high, low, close, volume 
      FROM candles 
      WHERE session_id = $1 
      ORDER BY close_time DESC
      LIMIT 300
    )  AS candles  
    ORDER BY close_time ASC
     `,
    [params[0]],
  )
  return toArrayOfArraysDataFromDB(dbCandleData)
}

export const signalQuery = async params => (
  query(`INSERT INTO signals (type, candle_id, session_id) 
    VALUES (
      $1, 
      (SELECT id FROM candles 
        WHERE close_time = $2 
        AND session_id = $3
      ),
      $3)
    RETURNING type, session_id`, params)
)

export const resultsQuery = async params => (
  query(`
    select 
      type, close
    from 
      ( 
        select 
          signals.id,
          candles.id as candle_id,
          type,
          signals.session_id,
          candles.close as close,
          ( 
            select id from signals
            order by id desc
            limit 1
          ) as last_id,
          lag(type) over (order by signals.id) AS prev_type
        from signals
        left join CANDLES
        on signals.candle_id = candles.id
        where signals.session_id = $1
      ) sub
    where type = 'buy' 
    and id != last_id
    or prev_type ='buy'
    order by candle_id
  `, params)
)

export default query
