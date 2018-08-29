import bittrex from 'node-bittrex-api'
import { sessionQuery } from '../db'

const { BITTREX_API_KEY, BITTREX_API_SECRET } = process.env

bittrex.options({
  verbose: true,
  inverse_callback_arguments: true,
  apikey: BITTREX_API_KEY,
  apisecret: BITTREX_API_SECRET,
})

export const TIME_FRAME = 14400
export const BACKTEST_DAYS = 200
export const BACKTEST = false
export const PAPER_TRADE = true
export const PAIR = 'BTC-OMG'
export const STRATEGY = 'MA-CCI'
export const RETRY_ORDER_TIME = 30000
export let SESSION_ID = null // eslint-disable-line import/no-mutable-exports

export const newSession = async (name) => {
  SESSION_ID = await sessionQuery([name, PAIR, TIME_FRAME, BACKTEST, PAPER_TRADE])
}
