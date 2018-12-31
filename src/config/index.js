import bittrex from 'node-bittrex-api'
import { sessionQuery } from 'Util/db'

const { BITTREX_API_KEY, BITTREX_API_SECRET } = process.env

console.log({ BITTREX_API_KEY, BITTREX_API_SECRET }) // eslint-disable no-console

bittrex.options({
  verbose: true,
  inverse_callback_arguments: true,
  apikey: BITTREX_API_KEY,
  apisecret: BITTREX_API_SECRET,
})

export const TIME_FRAME = 1800
export const BACKTEST_DAYS = 80
export const BACKTEST = false
export const PAPER_TRADE = false
export const PAIR = 'BTC-ETH'
export const STRATEGY = 'OBV-SMA'
export const RETRY_ORDER_TIME = 5000
export let SESSION_ID = null // eslint-disable-line import/no-mutable-exports

export const newSession = async (name) => {
  SESSION_ID = await sessionQuery([name, PAIR, TIME_FRAME, BACKTEST, PAPER_TRADE])
}
