import { EventEmitter } from 'events'
import { Observable } from 'rxjs'

const type = 'order'

const portfolioEvent = new EventEmitter()

const portfolioManager = (signalData, eventLoop) => portfolioEvent.emit('portfolioData', { signalData, eventLoop })

const portfolioEventObservable = Observable.fromEventPattern(h => portfolioEvent.on('portfolioData', h))

portfolioEventObservable
  .do(data => console.log(data))
  .distinctUntilChanged(null, ({ signalData }) => signalData.type)
  .subscribe(({ eventLoop, signalData }) => eventLoop.next({ type, payload: signalData }))

export default portfolioManager
