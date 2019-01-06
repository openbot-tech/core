import { Observable } from 'rxjs'
import { toMarketDataObject } from 'Util/parser'
import { connectedSocketObservable, mockSocketEmitterObservable } from 'Util/socket'
import { STRATEGY, BACKTEST } from 'Config'
import strategies from 'Core/strategy/strategies/'
import { eventQueue } from 'Util/event'

const { NODE_ENV } = process.env

const type = 'signal'

const strategyManager = (marketData, eventLoop) => eventQueue.emit('marketData', { marketData, eventLoop })

const marketDataEventObservable = Observable.fromEvent(eventQueue, 'marketData')

export let lastSignal // eslint-disable-line import/no-mutable-exports

export const getSocketForEnv = (isBacktest, socketObservableFunc, env = NODE_ENV) => (
  env !== 'test' && isBacktest ? socketObservableFunc : () => mockSocketEmitterObservable
)()

export const executeStrategies = (
  marketDataEvent = marketDataEventObservable,
  strategyFunc = strategies[STRATEGY],
  isBacktest = BACKTEST,
  socketObservableFunc = connectedSocketObservable,
  env = NODE_ENV,
) =>
  marketDataEvent
    .withLatestFrom(getSocketForEnv(isBacktest, socketObservableFunc, env))
    .concatMap(([{ marketData, eventLoop }, socket]) =>
      Observable.of(toMarketDataObject(marketData))
        .flatMap(strategyData =>
          strategyFunc(strategyData, lastSignal, socket))
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
