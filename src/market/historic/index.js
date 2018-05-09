import { Observable } from 'rxjs'
import axios from 'axios'
import moment from 'moment'
import { candleQueryObservable } from '../live'
import { SESSION_ID, TIME_FRAME, BACKTEST_DAYS } from '../../config'

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

const request = axios.get(
  'https://api.cryptowat.ch/markets/bitfinex/omgbtc/ohlc',
  { params: { after } },
)

const createDripDataObservable = (OHLCData, candleQueryFunc) => (
  Observable.from(OHLCData)
    .concatMap((t) => {
      const candle = [...t].slice(0, 6)
      candle[0] = moment(candle[0] * 1000).toDate()
      return candleQueryFunc([SESSION_ID, ...candle])
    })
)

export const dripObservable = (
  promise,
  ObservableFunc = Observable.fromPromise,
  candleQueryFunc = candleQueryObservable,
) =>
  ObservableFunc(promise)
    .flatMap(data => createDripDataObservable(data.data.result[TIME_FRAME], candleQueryFunc))
    .catch(err => console.log(err)) // eslint-disable-line no-console

export default dripObservable(request)
