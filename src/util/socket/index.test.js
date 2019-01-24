import { TestScheduler } from 'rxjs'
import { connectedSocketObservable, mockSocketEmitter } from '.'

describe('Util/socket', () => {
  it('should emit socket connection or mock if not connected', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const socketMarble = '--x'
    const expectedMarble = 'a-b'

    const socketInput = {
      x: { ...mockSocketEmitter, prod: true },
    }

    const expectedInput = {
      a: mockSocketEmitter,
      b: socketInput.x,
    }

    const socket$ = testScheduler.createColdObservable(socketMarble, socketInput)

    const socketMockFunc = () => socket$
    const fromEventMock = observable => observable

    const actual$ = connectedSocketObservable(socketMockFunc, fromEventMock)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
  })
})
