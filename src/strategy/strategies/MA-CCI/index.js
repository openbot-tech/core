import { lineIsSlopingUpwards, getIndicatorsObservable } from '../../utils'

const indicatorSettings = marketData => [
  {
    name: 'CCI',
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    optInTimePeriod: 5,
    high: marketData.high,
    low: marketData.low,
    close: marketData.close,
  },
  {
    name: 'SMA',
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    optInTimePeriod: 20,
    inReal: marketData.close,
  },
  {
    name: 'SMA',
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    optInTimePeriod: 40,
    inReal: marketData.close,
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
 */

const buy = (indicatorsData, marketData) => {
  const { CCI5, SMA20, SMA40 } = indicatorsData
  const { low, close } = marketData

  const lastCCI5 = [...CCI5.result.outReal].pop()
  const lastSMA20 = [...SMA20.result.outReal].pop()
  const lastSMA40 = [...SMA40.result.outReal].pop()
  const lastLow = [...low].pop()
  const lastClose = [...close].pop()

  const SMA20And40IsSlopingUpwards = lineIsSlopingUpwards(SMA20.result.outReal)
    && lineIsSlopingUpwards(SMA40.result.outReal)
  const SMA20IsAboveSMA40 = lastSMA20 > lastSMA40
  const CCI5IsLessThanMinus100 = lastCCI5 < -100
  const lowOfCandleStickIsEqualOrLowerThanSMA20 = lastLow <= lastSMA20
  const closeOfCandleStickIsAboveSMA40 = lastClose > lastSMA40

  if (SMA20And40IsSlopingUpwards &&
      SMA20IsAboveSMA40 &&
      CCI5IsLessThanMinus100 &&
      lowOfCandleStickIsEqualOrLowerThanSMA20 &&
      closeOfCandleStickIsAboveSMA40) {
    return { type: 'buy' }
  }
  return null
}

const MACCI = marketData => (
  getIndicatorsObservable(marketData, indicatorSettings)
    .map(indicators => buy(indicators, marketData))
)

export default MACCI
