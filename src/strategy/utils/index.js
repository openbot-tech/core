import { Observable } from 'rxjs'
import talib from '../ta'

export const lineIsSlopingUpwards = (line, lastXElements = 5) => {
  const arr = line.slice(0, -1).slice((lastXElements - 1) * -1)
  return arr.every((num, idx) => (idx ? num >= arr[idx - 1] : true))
}

export const indicatorObservable = indicatorData =>
  Observable.fromPromise(talib.execute(indicatorData))

export const getEndIdx = arr => (arr.length > 2 ? arr.length - 2 : 0)

export const getIndicatorsObservable = (
  marketData,
  indicatorSettings,
  indicatorFunction = indicatorObservable,
) =>
  Observable.forkJoin(indicatorSettings(marketData).map(indicatorData =>
    indicatorFunction(indicatorData)
      .map(promiseData => ({ ...promiseData, name: `${indicatorData.name}${indicatorData.optInTimePeriod}` }))))
    .map(forkJoinData =>
      forkJoinData.reduce((obj, item) => ({ ...obj, [item.name]: { ...item } }), {}))
