import moment from 'moment'
import bittrex from 'node-bittrex-api'
import { Observable } from 'rxjs'
import { TIME_FRAME, PAIR, SESSION_ID } from '../../config'
import { candleQuery } from '../../db'

const subscribeObservable = Observable.fromEventPattern(h => bittrex.websockets.subscribe([PAIR], h))
const clientCallBackObservable = Observable.fromEventPattern(h => bittrex.websockets.client(h))

export const socketObservable = (
  clientCallback = clientCallBackObservable,
  subscribe = subscribeObservable,
) =>
  clientCallback
    .do(() => console.log('socket connected!')) // eslint-disable-line no-console
    .flatMap(() => subscribe)
    .filter(subscribtionData => subscribtionData && subscribtionData.M === 'updateExchangeState')
    .flatMap(exchangeState => Observable.from(exchangeState.A))
    .filter(marketData => marketData.Fills.length > 0)
    .map(marketData => marketData && marketData.Fills)
    .retry()

export const createCandle = (fillsData) => {
  const highPrice = fillsData.reduce((prev, curr) => (prev.Rate > curr.Rate ? prev : curr)).Rate
  const lowPrice = fillsData.reduce((prev, curr) => (prev.Rate < curr.Rate ? prev : curr)).Rate
  const volume = fillsData.reduce((prev, curr) => prev + curr.Quantity, 0)
  const openPrice = fillsData[0].Rate
  const closeObj = fillsData.pop()
  const closePrice = closeObj.Rate
  const closeTime = moment(closeObj.TimeStamp).toDate()
  return [closeTime, openPrice, highPrice, lowPrice, closePrice, volume]
}

export const candleQueryObservable = data => Observable.fromPromise(candleQuery(data))

export const candleObservable = (
  promise,
  timeFrame = TIME_FRAME,
  candleQueryFunc = candleQueryObservable,
  testScheduler = null,
) =>
  promise
    // buffer for timeFrame in milliseconds and then emit candle data
    .bufferTime(timeFrame * 1000, testScheduler)
    // if we have no data we continue
    .filter(fillsArrayOfArrays => fillsArrayOfArrays && fillsArrayOfArrays.length > 0)
    // flatten array
    .map(fillsArrayOfArrays => fillsArrayOfArrays.reduce((acc, arr) => [...acc, ...arr]))
    // create candle
    .map(fillsData => createCandle(fillsData))
    // insert into database and select
    .flatMap(candle => candleQueryFunc([SESSION_ID, ...candle]))
    // we retry forever
    .retry()

export default candleObservable(socketObservable())
