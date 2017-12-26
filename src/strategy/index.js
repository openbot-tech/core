import { toMarketDataObject } from './utils'
// TODO takes data from market and returns an order event
const runStrategy = (marketData, eventLoop) => {
  const type = 'signal'
  const marketDataObj = toMarketDataObject(marketData)
  console.log(marketDataObj)
}

export default runStrategy
