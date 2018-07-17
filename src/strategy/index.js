import { toMarketDataObject } from '../parser'
import { STRATEGY } from '../config/'
import strategies from './strategies/'

// TODO takes data from market and returns an order event
const runStrategy = async (marketData, eventLoop) => {
  const type = 'signal'
  const strategy = strategies[STRATEGY]

  const marketDataObj = toMarketDataObject(marketData)

  strategy(marketDataObj).subscribe(payload => eventLoop.next({ type, payload }))
}

export default runStrategy
