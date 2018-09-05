import { toMarketDataObject } from '../parser'
import { STRATEGY } from '../config/'
import strategies from './strategies/'

// because we need last signal with close for stoploss
let lastSignal
const runStrategy = (marketData, eventLoop) => {
  const type = 'signal'
  const strategy = strategies[STRATEGY]

  const marketDataObj = toMarketDataObject(marketData)

  strategy(marketDataObj, lastSignal).subscribe((payload) => {
    lastSignal = payload
    return eventLoop.next({ type, payload })
  })
}

export default runStrategy
