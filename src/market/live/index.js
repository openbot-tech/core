import moment from 'moment'
import bittrex from 'node-bittrex-api'
import { Observable } from 'rxjs'
import { TIME_FRAME } from '../../config'

const { BITTREX_API_KEY, BITTREX_API_SECRET } = process.env

bittrex.options({
  apikey: BITTREX_API_KEY,
  apisecret: BITTREX_API_SECRET,
})

const subscribeObservable = Observable.fromEventPattern(h => bittrex.websockets.subscribe(['BTC-ETH'], h))
const clientCallBackObservable = Observable.fromEventPattern(h => bittrex.websockets.client(h))

const socketObservable = clientCallBackObservable
  .flatMap(() => subscribeObservable)
  .filter(subscribtionData => subscribtionData && subscribtionData.M === 'updateExchangeState')
  .flatMap(exchangeState => Observable.from(exchangeState.A))
  .filter(marketData => marketData.Fills.length > 0)
  .map(marketData => marketData && marketData.Fills)


export const dateDifferenceInSeconds = (exchangeArr) => {
  const startDate = moment(exchangeArr[0].TimeStamp)
  const endDate = moment([...exchangeArr].pop().TimeStamp)
  const duration = moment.duration(endDate.diff(startDate))
  return duration.asSeconds()
}

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

// TODO repeat also repeats the outer Observable socketObservable
export const candleObservable = (promise, timeFrame = TIME_FRAME) =>
  promise
    .scan((acc, curr) => [...acc, ...curr])
    .skipWhile(exchangeData => dateDifferenceInSeconds(exchangeData) < timeFrame)
    // take first after skipping
    .first()
    // first will complete the stream, so we repeat it
    .repeat()
    // we create candle data from the timeFrame array
    .map(fillsData => createCandle(fillsData))

export default candleObservable(socketObservable, 60)
