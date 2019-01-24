import { Observable } from 'rxjs'
import io from 'socket.io'

export const mockSocketEmitter = { emit: () => {} }

export const mockSocketEmitterObservable = Observable.of(mockSocketEmitter)

export const connectedSocketObservable = (socketServer = io.listen, fromEvent = Observable.fromEvent) => {
  const server = socketServer(1337)
  return Observable.merge(
    mockSocketEmitterObservable,
    fromEvent(server, 'connection'),
  )
}
