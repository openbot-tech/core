import { lineIsSlopingUpwards, getIndicatorsObservable, getEndIdx } from '../../utils'

const indicatorSettings = marketData => [
  {
    name: 'CCI',
    startIdx: 0,
    endIdx: getEndIdx(marketData.close),
    optInTimePeriod: 5,
    high: marketData.high.slice(0, -1),
    low: marketData.low.slice(0, -1),
    close: marketData.close.slice(0, -1),
  },
  {
    name: 'SMA',
    startIdx: 0,
    endIdx: getEndIdx(marketData.close),
    optInTimePeriod: 20,
    inReal: marketData.close.slice(0, -1),
  },
  {
    name: 'SMA',
    startIdx: 0,
    endIdx: getEndIdx(marketData.close),
    optInTimePeriod: 40,
    inReal: marketData.close.slice(0, -1),
  },
  {
    name: 'ATR',
    startIdx: 0,
    endIdx: getEndIdx(marketData.close),
    optInTimePeriod: 14,
    high: marketData.high.slice(0, -1),
    low: marketData.low.slice(0, -1),
    close: marketData.close.slice(0, -1),
  },
]

/*
 * Conditions for buy
 *
 * 1. Both 20 and 40 SMA is sloping upwards
 * 2. 20 SMA is above 40 SMA
 * 3. CCI < -100
 * 4. The low of the candlestick touches or goes below 20 SMA
 * 5. The close of the candlestick is above 40 SMA
 * 6. Buy when price is one pip higher prior candlestick high
 */

const buy = (indicatorsData, marketData) => {
  const { CCI5, SMA20, SMA40 } = indicatorsData
  const { low, close, high, date } = marketData

  const lastCCI5 = [...CCI5.result.outReal].pop()
  const lastSMA20 = [...SMA20.result.outReal].pop()
  const lastSMA40 = [...SMA40.result.outReal].pop()
  const secondLastLow = [...low.slice(0, -1)].pop()
  const secondLastClose = [...close.slice(0, -1)].pop()
  const secondLastHigh = [...high.slice(0, -1)].pop()
  const lastHigh = [...high].pop()

  const SMA20And40IsSlopingUpwards = lineIsSlopingUpwards(SMA20.result.outReal)
    && lineIsSlopingUpwards(SMA40.result.outReal)
  const SMA20IsAboveSMA40 = lastSMA20 > lastSMA40
  const CCI5IsLessThanMinus100 = lastCCI5 < -100
  const lowOfCandleStickIsEqualOrLowerThanSMA20 = lastSMA20 >= secondLastLow
  const closeOfCandleStickIsAboveSMA40 = secondLastClose > lastSMA40
  const buyWhenPriceIsOnePipHigher = lastHigh > secondLastHigh

  if (SMA20And40IsSlopingUpwards &&
      SMA20IsAboveSMA40 &&
      CCI5IsLessThanMinus100 &&
      lowOfCandleStickIsEqualOrLowerThanSMA20 &&
      closeOfCandleStickIsAboveSMA40 &&
      buyWhenPriceIsOnePipHigher) {
    return { type: 'buy', date: [...date].pop() }
  }
  return false
}

const sell = (indicatorsData, marketData, multiplier = 1.5) => {
  const { ATR14 } = indicatorsData
  const { close, date } = marketData

  const lastATR14 = [...ATR14.result.outReal].pop()
  const secondLastClose = [...close.slice(0, -1)].pop()
  const lastClose = [...close].pop()

  const ATR14withMultiplier = lastATR14 * multiplier
  const stopLoss = secondLastClose - ATR14withMultiplier
  if (lastClose < stopLoss) {
    return { type: 'sell', date: [...date].pop() }
  }
  return false
}

const MACCI = (marketData, getIndicators = getIndicatorsObservable) => (
  getIndicators(marketData, indicatorSettings)
    .flatMap(indicators => [buy(indicators, marketData), sell(indicators, marketData)])
    .filter(signal => !!signal === true)
)

export default MACCI
