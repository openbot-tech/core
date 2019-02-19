import { Subject } from 'rxjs'
import { newSession } from 'Config'
import getMarketData from 'Core/market'
import runStrategy from 'Core/strategy'
import portfolioManager from 'Core/portfolio'
import executeOrder from 'Core/broker'
import axios from 'axios'

const runBot = async (name) => {
  const data = await axios.get('http://www.example.org')
  console.log('proxied request', data)
  return
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
