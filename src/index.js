import 'babel-polyfill'
import { Observable } from 'rxjs'

const interval = Observable.interval(10000)

interval.subscribe(() => console.log('tick'))
