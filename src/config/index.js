import { sessionQuery } from '../db'

export const TIME_FRAME = 180
export const BACKTEST_DAYS = 14
export const BACKTEST = true
export const PAPER_TRADE = true
export const PAIR = 'USDT-OMG'
export let SESSION_ID = null // eslint-disable-line import/no-mutable-exports

export const newSession = async (name) => {
  SESSION_ID = await sessionQuery([name, PAIR, TIME_FRAME, BACKTEST, PAPER_TRADE])
}
