import { Observable } from 'rxjs'
import tulind from 'tulind'
import { execute } from 'Core/strategy/ta'

export const lineIsSlopingUpwards = (line, lastXElements = 5) => {
  const arr = line.slice(0, -1).slice((lastXElements - 1) * -1)
  return arr.every((num, idx) => (idx ? num >= arr[idx - 1] : true))
}

export const createIndicatorName = (indicator, inputs) => `${indicator}${inputs.join('')}`

export const getIndicatorsObservable = (
  marketData,
  indicatorSettings,
  indicatorFunction = Observable.bindNodeCallback(execute),
) =>
  Observable.forkJoin(...indicatorSettings(marketData)
    .map(([indicator, inputs, inputMarketData, slice = 0]) =>
      indicatorFunction(indicator, inputs, inputMarketData, slice)
        .map(promiseResult => ({ name: `${indicator}${inputs.join('')}`, result: promiseResult }))))
    .map(forkJoinData =>
      forkJoinData.reduce((obj, item) => ({ ...obj, [item.name]: item.result }), {}))


export const getPercentageDifference = (oldNumber, newNumber) => {
  if (oldNumber !== 0 &&
      newNumber !== 0
  ) return ((Math.abs(newNumber) - Math.abs(oldNumber)) / Math.abs(oldNumber)) * 100
  return 0
}

export const createTAResult = (indicatorKey, resultObj) => ({
  [indicatorKey]: resultObj,
})

export const getLastElements = (numberOfElements, arr) => (
  numberOfElements === arr.length
    ? arr
    : arr.slice(numberOfElements * -1)
)

export const isConsolidationPeriod = (data, condolidationLength, condolidationPercentageChange) =>
  getLastElements(condolidationLength, data)
    .every((value, index, array) =>
      (index > 0 || index > array.length - 1
        ? getPercentageDifference(array[index - 1], value) < condolidationPercentageChange
        : true
      ))

export const isHighestInPeriod = (data, periodLength) =>
  getLastElements(periodLength, data)
    .every((value, index, array) =>
      (index !== array.length - 1
        ? [...array].pop() > value
        : true
      ))

export const createSocketObject = (marketData, indicatorsFunc, indicatorData, signal) => {
  const indicators = indicatorsFunc()
  const signalObj = signal ? { signal: signal.type } : {}
  return {
    indicatorData: indicators.map((indicator) => {
      const { start, ...indicatorInfo } = tulind.indicators[indicator[0]]
      const indicatorName = createIndicatorName(indicator[0], indicator[1])
      return {
        ...indicatorInfo,
        indicatorName,
        indicatorOptions: indicator[1],
        start: start(indicator[1]),
        data: indicatorData[indicatorName],
      }
    }),
    ...signalObj,
    marketData,
  }
}

export const runIndicatorsAndStrategyFunc = (
  marketData,
  lastSignal = {},
  socket,
  indicatorSettings,
  buy,
  sell,
  getIndicators = getIndicatorsObservable,
) => (
  getIndicators(marketData, indicatorSettings)
    .mergeMap(indicatorsData =>
      Observable.of(indicatorsData)
        .flatMap(indicators => [buy(indicators, marketData), sell(indicators, marketData, lastSignal)])
        .bufferCount(2)
        .map(([buySignal, sellSignal]) => sellSignal || buySignal)
        .do(signal => socket.emit('data', createSocketObject(marketData, indicatorSettings, indicatorsData, signal))))
    .catch(data => console.log(data))) // eslint-disable-line
