import { BACKTEST } from '../config'
import liveObservable from './live'
import historicObservable from './historic'

const getMarketData = (eventLoop) => {
  const type = 'market'
  const marketObservable = BACKTEST ? historicObservable : liveObservable

  marketObservable.subscribe(payload => eventLoop.next({ type, payload }))
}

export default getMarketData
