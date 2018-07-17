import { Subject } from 'rxjs'

import { newSession } from './config'
import getMarketData from './market'
import runStrategy from './strategy'
import portfolioManager from './portfolio'
import executeOrder from './broker'

const runBot = async (name) => {
  // we start a new session and await a sessionId
  await newSession(name)

  const eventLoop = new Subject()
  // function that handles fetching marketdata and return event
  getMarketData(eventLoop)

  eventLoop.subscribe((e) => {
    if (e.type === 'market') runStrategy(e.payload, eventLoop)
    if (e.type === 'signal') portfolioManager(e.payload, eventLoop)
    if (e.type === 'order') executeOrder(e.payload)
  })
}

runBot('navn')
