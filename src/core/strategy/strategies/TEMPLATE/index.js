import {
  smaIsOverBought,
  smaIsOverSold,
} from 'Core/strategy/triggers'
import { runIndicatorsAndStrategyFunc, getPercentageDifference } from 'Core/strategy/util'

/** is a function which takes the marketData as arguments and returns
 * an array of indicators from https://tulipindicators.org/list
 * you add an indicator by taking the identifier as the first element
 * the options for the indicator as second and the marketData object as the third element
 * the indicators data is first argument for the buy and sell function with an object
 * containing indicator identifier and then options joined together like so ema5, stoch553 as keys
*/
export const indicatorSettings = marketData => [
  ['ema', [5], marketData],
  ['stoch', [5, 5, 3], marketData],
]


/** the buy function takes indicators data described above and marketdata as second
 * it can either return false in case of no buy signal or an object containing
 * type which should be 'buy', date which should be the close date for the candle as unix timestamp
 * and close which should be close price for the current candle
 */
export const buy = (indicatorsData, marketData) => {
  const { ema5 } = indicatorsData
  const { close, date } = marketData

  const lastClose = [...close].pop()

  if (smaIsOverSold(ema5)) {
    return { type: 'buy', date: [...date].pop(), close: lastClose }
  }
  return false
}

/** the sell function takes the same arguments as buy for the first two arguments
 * for the third it takes lastSignal which is the last buy signal and is used for calculating stoploss
 * it also returns false for no signal and an object with the same keys for a buy signal except that
 * type should be 'sell'
 */
export const sell = (indicatorsData, marketData, lastSignal) => {
  const { close: closeSellSignal } = lastSignal
  const { ema5 } = indicatorsData
  const { close, date } = marketData

  const lastClose = [...close].pop()
  const percentageDifference = closeSellSignal && getPercentageDifference(closeSellSignal, lastClose)

  if (smaIsOverBought(ema5) || percentageDifference < -1.5) {
    return { type: 'sell', date: [...date].pop(), close: lastClose }
  }
  return false
}

/** a strategy should return a function that takes marketData for first argument, lastSignal for second
 * and socket object for third. The last 3 arguments is indicator settings, buy and sell function as defined above
 * This function is then called when we get a new marketData event in the bot
 */
const TEMPLATE = (
  marketData,
  lastSignal,
  socket,
  settings = indicatorSettings,
  buyFunc = buy,
  sellFunc = sell,
) =>
  runIndicatorsAndStrategyFunc(
    marketData,
    lastSignal,
    socket,
    settings,
    buyFunc,
    sellFunc,
  )

export default TEMPLATE
