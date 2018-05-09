import { BACKTEST } from '../config'
import liveObservable from './live'
import historicObservable from './historic'
import getResults from './results'

const getMarketData = (eventLoop) => {
  const type = 'market'
  const marketObservable = BACKTEST ? historicObservable : liveObservable

  marketObservable.subscribe(
    payload => eventLoop.next({ type, payload }),
    err => console.log(err), // eslint-disable-line no-console
    () => getResults().subscribe(() => console.log('completed')) // eslint-disable-line no-console
    ,
  )
}

export default getMarketData
