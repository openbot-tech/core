import liveObservable from './live'
import historicObservable from './historic'

const getMarketData = (eventLoop) => {
  const type = 'market'
  const backtest = true
  const marketObservable = backtest ? historicObservable : liveObservable

  marketObservable.subscribe(res =>
    eventLoop.next({ type, data: res }))
}

export default getMarketData
