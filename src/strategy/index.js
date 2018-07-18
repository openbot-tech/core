import { toMarketDataObject } from '../parser'
import { STRATEGY } from '../config/'
import strategies from './strategies/'

const runStrategy = (marketData, eventLoop) => {
  const type = 'signal'
  const strategy = strategies[STRATEGY]

  const marketDataObj = toMarketDataObject(marketData)

  strategy(marketDataObj).subscribe(payload => eventLoop.next({ type, payload }))
}

export default runStrategy
