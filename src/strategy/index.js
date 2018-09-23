import { Observable } from 'rxjs'
import { EventEmitter } from 'events'
import { toMarketDataObject } from '../parser'
import { STRATEGY } from '../config/'
import strategies from './strategies/'

const type = 'signal'

const strategyEvent = new EventEmitter()

const strategyManager = (marketData, eventLoop) => strategyEvent.emit('marketData', { marketData, eventLoop })

const marketDataEventObservable = Observable.fromEventPattern(h => strategyEvent.on('marketData', h))

export let lastSignal // eslint-disable-line import/no-mutable-exports

export const executeStrategies = (
  marketDataEvent = marketDataEventObservable,
  strategyFunc = strategies[STRATEGY],
) =>
  marketDataEvent
    .concatMap(({ marketData, eventLoop }) =>
      Observable.of(toMarketDataObject(marketData))
        .flatMap(strategyData => strategyFunc(strategyData, lastSignal))
        .filter(signalData => !!signalData === true)
        .map(signalData => ({ eventLoop, signalData })))


export const executestrategiesAndEmitSignals = (
  marketDataEvent = marketDataEventObservable,
  strategyFunc = strategies[STRATEGY],
) =>
  executeStrategies(marketDataEvent, strategyFunc)
    .map(({ eventLoop, signalData }) => {
      if (signalData.type === 'buy') lastSignal = signalData
      else lastSignal = undefined
      return eventLoop.next({ type, payload: signalData })
    })


executestrategiesAndEmitSignals()
  .subscribe()


export default strategyManager
