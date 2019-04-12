import bittrex from 'node-bittrex-api'
import { sessionQuery } from 'Util/db'

const { BITTREX_API_KEY, BITTREX_API_SECRET } = process.env

console.log({ BITTREX_API_KEY, BITTREX_API_SECRET }) // eslint-disable-line no-console

bittrex.options({
  verbose: true,
  inverse_callback_arguments: true,
  apikey: BITTREX_API_KEY,
  apisecret: BITTREX_API_SECRET,
})

export const TIME_FRAME = 1800
export const BACKTEST_DAYS = 80
export const BACKTEST = true
export const PAPER_TRADE = false
export const PAIR = 'BTC-ETH'
export const STRATEGY = 'BBANDS-RSI'
export const RETRY_ORDER_TIME = 5000
export const RESTART_SESSION_AFTER_SECONDS = TIME_FRAME
export let SESSION_ID = null // eslint-disable-line import/no-mutable-exports

export const newSession = async (
  name = 'name',
  pair = PAIR,
  timeFrame = TIME_FRAME,
  backtest = BACKTEST,
  paperTrade = PAPER_TRADE,
  strategy = STRATEGY,
  restartSessionAfterSeconds = RESTART_SESSION_AFTER_SECONDS,
) => {
  SESSION_ID = await sessionQuery(
    [name, pair, timeFrame, backtest, paperTrade, strategy],
    restartSessionAfterSeconds,
  )
}
