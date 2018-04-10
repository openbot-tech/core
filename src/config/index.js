import { sessionQuery } from '../db'

export const TIME_FRAME = 60
export const BACKTEST_DAYS = 365
export const BACKTEST = false
export const PAPER_TRADE = true
export const PAIR = 'USDT-BTC'
export let SESSION_ID = null // eslint-disable-line import/no-mutable-exports

export const newSession = async (name) => {
  SESSION_ID = await sessionQuery([name, PAIR, TIME_FRAME, BACKTEST, PAPER_TRADE])
}
