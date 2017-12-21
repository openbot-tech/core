import liveObservable from './live'
import historicObservable from './historic'

const getMarketData = (eventLoop) => {
  const type = 'market'
  const backtest = true
  const marketObservable = backtest ? historicObservable : liveObservable

  marketObservable.subscribe(data => console.log(data.data.result[180]))

  /*
  liveObservable.subscribe(res =>
    eventLoop.next({ type, data: res.data.result.EOSETH }))
  */
}

export default getMarketData
