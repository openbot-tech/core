import { BACKTEST } from 'Config'
import liveObservable from 'Core/market/live'
import historicObservable from 'Core/market/historic'
import getResults from 'Core/market/results'

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
