import {
  mfiIsOverSold,
  rsiIsOverSold,
  bbandsIsOverSold,
  bbandsIsOverBought,
} from 'Core/strategy/triggers'
import { runIndicatorsAndStrategyFunc, getPercentageDifference } from 'Core/strategy/util'


export const indicatorSettings = marketData => [
  ['ema', [5], marketData],
  ['ema', [13], marketData],
  ['ema', [150], marketData],
  ['rsi', [7], marketData],
  ['stoch', [5, 5, 3], marketData],
  ['mfi', [8], marketData],
  ['bbands', [20, 2], marketData],
]

export const buy = (indicatorsData, marketData) => {
  const { rsi7, bbands202, mfi8 } = indicatorsData
  const { close, date } = marketData

  const lastClose = [...close].pop()

  if (bbandsIsOverSold(bbands202, lastClose) && rsiIsOverSold(rsi7) && mfiIsOverSold(mfi8)) {
    return { type: 'buy', date: [...date].pop(), close: lastClose }
  }
  return false
}

export const sell = (indicatorsData, marketData, lastSignal) => {
  const { close: closeSellSignal } = lastSignal
  const { bbands202 } = indicatorsData
  const { close, date } = marketData

  const lastClose = [...close].pop()
  const percentageDifference = closeSellSignal && getPercentageDifference(closeSellSignal, lastClose)

  if (bbandsIsOverBought(bbands202, lastClose) || percentageDifference < -1.5) {
    return { type: 'sell', date: [...date].pop(), close: lastClose }
  }
  return false
}

const BBANDSRSI = (
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

export default BBANDSRSI
