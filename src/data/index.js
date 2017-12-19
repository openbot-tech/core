import axios from 'axios'
import { Observable } from 'rxjs'
import subject from '../'

const type = 'data'
const dataUrl = 'https://api.kraken.com/0/public/OHLC?pair=EOSETH'

const request = axios.get(dataUrl)

const requestInterval = Observable.timer(0, 5000)
  .flatMap(() => Observable.fromPromise(request))

requestInterval.subscribe(res => subject.next({ type, data: res.data.result.EOSETH.reverse()[0] }))
