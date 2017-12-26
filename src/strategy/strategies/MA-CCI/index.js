import talib from '../../ta'

const MACCI = (marketData) => {
  const CCI = talib.execute({
    name: 'CCI',
    startIdx: 0,
    endIdx: marketData.close.length - 1,
    optInTimePeriod: 14,
    high: marketData.high,
    low: marketData.low,
    close: marketData.close,
  })
  return CCI
}

export default MACCI
