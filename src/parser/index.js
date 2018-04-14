import moment from 'moment'

export const toMarketDataObject = marketData => (
  marketData.reduce((acc, marketArr) => {
    acc.date.push(marketArr[0])
    acc.open.push(marketArr[1])
    acc.close.push(marketArr[4])
    acc.high.push(marketArr[2])
    acc.low.push(marketArr[3])
    acc.volume.push(marketArr[5])
    return acc
  }, {
    date: [],
    open: [],
    close: [],
    high: [],
    low: [],
    volume: [],
  })
)

export const toArrayOfArraysData = marketData => (
  marketData.map(marketRow => [
    moment(marketRow.close_time).unix(),
    parseFloat(marketRow.open),
    parseFloat(marketRow.high),
    parseFloat(marketRow.low),
    parseFloat(marketRow.close),
    parseFloat(marketRow.volume),
  ])
)

