import { Observable } from 'rxjs'
import io from 'socket.io'

export const mockSocketEmitterObservable = Observable.of({ emit: () => {} })

export const connectedSocketObservable = () => {
  const server = io.listen(1337)
  return Observable.merge(
    mockSocketEmitterObservable,
    Observable.fromEvent(server, 'connection'),
  )
}
