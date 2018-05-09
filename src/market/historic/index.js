import { Observable } from 'rxjs'
import ProgressBar from 'progress'
import chalk from 'chalk'
import axios from 'axios'
import moment from 'moment'
import { candleQueryObservable } from '../live'
import { SESSION_ID, TIME_FRAME, BACKTEST_DAYS, PAIR } from '../../config'

/*
Time periods in seconds
  [ '60',
    '180',
    '300',
    '900',
    '1800',
    '3600',
    '7200',
    '14400',
    '21600',
    '43200',
    '86400',
    '259200',
    '604800'
  ]
Data structure
  [ CloseTime,
    OpenPrice,
    HighPrice,
    LowPrice,
    ClosePrice,
    Volume
  ]
*/

const now = moment()
const after = now.subtract(BACKTEST_DAYS, 'd').unix()

export const introText = (OHLC) => {
  console.log('Pair: ', chalk.bold(PAIR)) // eslint-disable-line no-console
  console.log('Time Frame: ', chalk.bold(TIME_FRAME), ' minutes') // eslint-disable-line no-console
  console.log('First candle: ', chalk.bold(moment(OHLC[0][0] * 1000).toDate())) // eslint-disable-line no-console
  console.log('Last candle: ', chalk.bold(moment([...OHLC].pop()[0] * 1000).toDate())) // eslint-disable-line no-console
  console.log('Number Of Candles: ', chalk.bold(OHLC.length)) // eslint-disable-line no-console
}

const marketsRequest = axios.get('https://api.cryptowat.ch/markets/bittrex')

export const getPairForCryptowatch = (pair, cwPair) =>
  pair.split('-').every(ticker => cwPair.includes(ticker.toLowerCase()))

const dataRequest = async (pair = PAIR) => {
  const markets = await marketsRequest
  const cryptowatchPair = markets.data.result.find(pairObj => getPairForCryptowatch(pair, pairObj.pair))
  if (!cryptowatchPair) throw Error('pair not found')
  return axios.get(
    `${cryptowatchPair.route}/ohlc`,
    {
      params: { after, periods: TIME_FRAME },
    },
  )
}

const createDripDataObservable = (OHLCData, candleQueryFunc) => {
  const bar = new ProgressBar(':bar', { total: OHLCData.length, width: 40 })
  return Observable.from(OHLCData)
    .concatMap((t) => {
      bar.tick()
      const candle = [...t].slice(0, 6)
      candle[0] = moment(candle[0] * 1000).toDate()
      return candleQueryFunc([SESSION_ID, ...candle])
    })
}


export const dripObservable = (
  promise,
  ObservableFunc = Observable.fromPromise,
  candleQueryFunc = candleQueryObservable,
) =>
  ObservableFunc(promise)
    .do(data => introText(data.data.result[TIME_FRAME]))
    .flatMap(data => createDripDataObservable(data.data.result[TIME_FRAME], candleQueryFunc))
    .catch(err => console.log(err)) // eslint-disable-line no-console

export default dripObservable(dataRequest())
