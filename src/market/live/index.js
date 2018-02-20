import moment from 'moment'
import bittrex from 'node-bittrex-api'
import { Observable } from 'rxjs'
import { TIME_FRAME } from '../../config'

const { BITTREX_API_KEY, BITTREX_API_SECRET } = process.env

bittrex.options({
  apikey: BITTREX_API_KEY,
  apisecret: BITTREX_API_SECRET,
})

const subscribeObservable = Observable.fromEventPattern(h => bittrex.websockets.subscribe(['USDT-BTC'], h))
const clientCallBackObservable = Observable.fromEventPattern(h => bittrex.websockets.client(h))

const socketObservable = clientCallBackObservable
  .do(() => console.log('socket connected!'))
  .flatMap(() => subscribeObservable)
  .filter(subscribtionData => subscribtionData && subscribtionData.M === 'updateExchangeState')
  .flatMap(exchangeState => Observable.from(exchangeState.A))
  .filter(marketData => marketData.Fills.length > 0)
  .map(marketData => marketData && marketData.Fills)

export const createCandle = (fillsData) => {
  const highPrice = fillsData.reduce((prev, curr) => (prev.Rate > curr.Rate ? prev : curr)).Rate
  const lowPrice = fillsData.reduce((prev, curr) => (prev.Rate < curr.Rate ? prev : curr)).Rate
  const volume = fillsData.reduce((prev, curr) => prev + curr.Quantity, 0)
  const openPrice = fillsData[0].Rate
  const closeObj = fillsData.pop()
  const closePrice = closeObj.Rate
  const closeTime = moment(closeObj.TimeStamp).unix()
  return [closeTime, openPrice, highPrice, lowPrice, closePrice, volume]
}

export const candleObservable = (promise, timeFrame = TIME_FRAME, testScheduler = null) =>
  promise
    // buffer for timeFrame in milliseconds and then emit candle data
    .bufferTime(timeFrame * 1000, testScheduler)
    // flatten array
    .map(fillsArrayOfArrays => fillsArrayOfArrays.reduce((acc, arr) => [...acc, ...arr]))
    // create candle
    .map(fillsData => createCandle(fillsData))
    // accumulate candles
    .scan((acc, curr) => [...acc, curr], [])

export default candleObservable(socketObservable, 60)
