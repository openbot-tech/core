import { eventQueue } from 'Util/event'
import { Observable } from 'rxjs'

const type = 'order'

const portfolioManager = (signalData, eventLoop) => eventQueue.emit('portfolioData', { signalData, eventLoop })

const portfolioEventObservable = Observable.fromEvent(eventQueue, 'portfolioData')

export const emitOrderSignals = (
  eventObservable = portfolioEventObservable,
) =>
  eventObservable
    .distinctUntilChanged(null, ({ signalData }) => signalData.type)
    .map(({ eventLoop, signalData }) => eventLoop.next({ type, payload: signalData }))

portfolioEventObservable
  .subscribe()

export default portfolioManager
