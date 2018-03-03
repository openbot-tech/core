import 'babel-polyfill'
import { Subject } from 'rxjs'

import getMarketData from './market'
import runStrategy from './strategy'
import portfolioManager from './portfolio'
import executeOrder from './broker'

const eventLoop = new Subject()

// function that handles fetching marketdata and return event
getMarketData(eventLoop)

eventLoop.subscribe((e) => {
  if (e.type === 'market') runStrategy(e.payload, eventLoop)
  if (e.type === 'signal') portfolioManager(e.payload, eventLoop)
  if (e.type === 'order') executeOrder(e.payload)
})
