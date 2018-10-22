import { Observable } from 'rxjs'
import io from 'socket.io'

export const connectedSocketObservable = () => {
  const server = io.listen(1337)
  return Observable.fromEventPattern(h => server.on('connection', h))
}
