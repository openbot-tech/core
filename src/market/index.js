import { BACKTEST } from '../config'
import liveObservable from './live'
import historicObservable from './historic'

const getMarketData = (eventLoop) => {
  const type = 'market'
  const marketObservable = BACKTEST ? historicObservable : liveObservable

  marketObservable.subscribe(res =>
    eventLoop.next({ type, action: res }))
}

export default getMarketData
