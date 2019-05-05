import { Subject } from 'rxjs'
import { newSession } from 'Config'
import getMarketData from 'Core/market'
import runStrategy from 'Core/strategy'
import portfolioManager from 'Core/portfolio'
import executeOrder from 'Core/broker'
import axios from 'axios'

const WebSocket = require('ws');
 
const ws = new WebSocket('ws://echo.websocket.org/', {
  origin: 'http://websocket.org'
});
 
ws.on('open', function open() {
  console.log('connected');
  ws.send(Date.now());
});
 
ws.on('close', function close() {
  console.log('disconnected');
});
 
ws.on('message', function incoming(data) {
  console.log(data)
  console.log(`Roundtrip time: ${Date.now() - data} ms`);
 
  setTimeout(function timeout() {
    ws.send(Date.now());
  }, 500);
});

const runBot = async (name) => {
  await axios.get('http://example.org')
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
