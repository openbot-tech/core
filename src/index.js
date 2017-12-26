import 'babel-polyfill'
import { Subject } from 'rxjs'

import getMarketData from './market'
import runStrategy from './strategy'
import portfolioManager from './portfolio'

const eventLoop = new Subject()

// function that handles fetching marketdata and return event
getMarketData(eventLoop)

eventLoop.subscribe((e) => {
  if (e.type === 'market') runStrategy(e.action, eventLoop)
  if (e.type === 'signal') portfolioManager(e.action, eventLoop)
  if (e.type === 'order') console.log('order') // TODO order event from portfolio
})
