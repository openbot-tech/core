import { Observable } from 'rxjs'
import axios from 'axios'
import moment from 'moment'
import { TIME_FRAME } from '../../config'

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
const after = now.subtract(5, 'd').unix()

const request = axios.get(
  'https://api.cryptowat.ch/markets/bitfinex/btcusd/ohlc',
  { params: { after } },
)

const createDripDataObservable = OHLCData => (
  Observable.range(1, OHLCData.length)
    .map(t => OHLCData.slice(0, t))
)

export const dripObservable = (promise, ObservableFunc = Observable.fromPromise) =>
  ObservableFunc(promise)
    .flatMap(data => createDripDataObservable(data.data.result[TIME_FRAME]))
    .catch(err => console.log(err))

export default dripObservable(request)
