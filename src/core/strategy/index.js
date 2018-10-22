import { Observable } from 'rxjs'
import { EventEmitter } from 'events'
import { toMarketDataObject } from 'Util/parser'
import { connectedSocketObservable } from 'Util/socket'
import { STRATEGY, BACKTEST } from 'Config'
import strategies from 'Core/strategy/strategies/'

const type = 'signal'

const strategyEvent = new EventEmitter()

const strategyManager = (marketData, eventLoop) => strategyEvent.emit('marketData', { marketData, eventLoop })

const marketDataEventObservable = Observable.fromEventPattern(h => strategyEvent.on('marketData', h))

export let lastSignal // eslint-disable-line import/no-mutable-exports

export const executeStrategies = (
  marketDataEvent = marketDataEventObservable,
  strategyFunc = strategies[STRATEGY],
  socket,
) =>
  marketDataEvent
    .concatMap(({ marketData, eventLoop }) =>
      Observable.of(toMarketDataObject(marketData))
        .flatMap(strategyData => strategyFunc(strategyData, lastSignal, socket))
        .filter(signalData => !!signalData === true)
        .map(signalData => ({ eventLoop, signalData })))

export const getSocketObservable = (isBacktest, socketObservable) =>
  (isBacktest ? socketObservable : () => Observable.of({ emit: () => {} }))

export const executestrategiesAndEmitSignals = (
  marketDataEvent = marketDataEventObservable,
  strategyFunc = strategies[STRATEGY],
  isBacktest = BACKTEST,
  socketObservable = connectedSocketObservable,
) =>
  getSocketObservable(isBacktest, socketObservable)()
    .flatMap(socket => executeStrategies(marketDataEvent, strategyFunc, socket))
    .map(({ eventLoop, signalData }) => {
      if (signalData.type === 'buy') lastSignal = signalData
      else lastSignal = undefined
      return eventLoop.next({ type, payload: signalData })
    })


executestrategiesAndEmitSignals()
  .subscribe()


export default strategyManager
