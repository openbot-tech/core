import { Observable } from 'rxjs'
import talib from '../ta'

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

export const lineIsSlopingUpwards = (line, lastXElements = 15) => {
  const arr = line.slice(0, -1).slice((lastXElements - 1) * -1)
  return arr.every((num, idx) => (idx ? num >= arr[idx - 1] : true))
}

export const indicatorObservable = indicatorData =>
  Observable.fromPromise(talib.execute(indicatorData))

export const getIndicatorsObservable = (
  marketData,
  indicatorSettings,
  indicatorFunction = indicatorObservable,
) =>
  Observable.forkJoin(indicatorSettings(marketData).map(indicatorData =>
    indicatorFunction(indicatorData)
      .map(promiseData => ({ name: `${indicatorData.name}${indicatorData.optInTimePeriod}`, ...promiseData }))))
    .map(forkJoinData =>
      forkJoinData.reduce((obj, item) => ({ ...obj, [item.name]: { ...item } }), {}))
