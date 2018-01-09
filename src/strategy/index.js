import { toMarketDataObject } from './utils'
import MACCI from './strategies/MA-CCI'

// TODO takes data from market and returns an order event
const runStrategy = async (marketData, eventLoop) => {
  const type = 'signal'

  const marketDataObj = toMarketDataObject(marketData)

  MACCI(marketDataObj).subscribe(payload => eventLoop.next({ type, payload }))
}

export default runStrategy
