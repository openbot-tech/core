export const toMarketDataObject = marketData => (
  marketData.reduce((acc, marketArr) => {
    acc.open.push(marketArr[1])
    acc.close.push(marketArr[4])
    acc.high.push(marketArr[2])
    acc.low.push(marketArr[3])
    acc.volume.push(marketArr[5])
    return acc
  }, {
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  })
)

export default ''
