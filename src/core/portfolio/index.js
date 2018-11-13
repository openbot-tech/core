import { eventQueue } from 'Util/event'
import { Observable } from 'rxjs'

const type = 'order'

const portfolioManager = (signalData, eventLoop) => eventQueue.emit('portfolioData', { signalData, eventLoop })

const portfolioEventObservable = Observable.fromEvent(eventQueue, 'portfolioData')


portfolioEventObservable
  .distinctUntilChanged(null, ({ signalData }) => signalData.type)
  .subscribe(({ eventLoop, signalData }) => eventLoop.next({ type, payload: signalData }))

export default portfolioManager
