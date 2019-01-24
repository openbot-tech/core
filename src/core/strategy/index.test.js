import { TestScheduler, Observable } from 'rxjs'
import { toMarketDataObject } from 'Util/parser'
import {
  executeStrategies,
  executestrategiesAndEmitSignals,
  lastSignal,
  getSocketForEnv,
} from '.'

describe('Core/Strategy', () => {
  it('Should get the socket connection for environment', async () => {
    const mockProdSocket = jest.fn()
    getSocketForEnv(true, mockProdSocket, 'production')
    expect(mockProdSocket).toHaveBeenCalled()
    const mockLiveSocket = jest.fn()
    getSocketForEnv(false, mockLiveSocket, 'production')
    expect(mockLiveSocket).not.toHaveBeenCalled()
    const mockTestSocket = jest.fn()
    getSocketForEnv(true, mockLiveSocket, 'test')
    expect(mockTestSocket).not.toHaveBeenCalled()
  })
  it('should finish the first strategy run before running the next', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const marketMarble = 'xy'
    const expectedMarble = '---ab'

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]
    const marketDataMockShorter =
      [[1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731]]

    const strategyMockFunc = marketData => Observable.of(marketData).delay(marketData.close.length * 10, testScheduler)

    const marketInput = {
      x: { marketData: marketDataMock, eventLoop: null },
      y: { marketData: marketDataMockShorter, eventLoop: null },
    }
    const expectedInput = {
      a: { eventLoop: null, signalData: toMarketDataObject(marketDataMock) },
      b: { eventLoop: null, signalData: toMarketDataObject(marketDataMockShorter) },
    }

    const market$ = testScheduler.createColdObservable(marketMarble, marketInput)

    const actual$ = executeStrategies(market$, strategyMockFunc, false)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
  })
  it('should finish the first strategy run before running the next if first doesnt emit', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const marketMarble = 'xy'
    const expectedMarble = '----b'

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]
    const marketDataMockShorter =
      [[1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731]]

    const strategyMockFunc = marketData =>
      Observable.of(marketData.close.length === 3 ? false : marketData)
        .delay(marketData.close.length * 10, testScheduler)

    const marketInput = {
      x: { marketData: marketDataMock, eventLoop: null },
      y: { marketData: marketDataMockShorter, eventLoop: null },
    }
    const expectedInput = {
      b: { eventLoop: null, signalData: toMarketDataObject(marketDataMockShorter) },
    }

    const market$ = testScheduler.createColdObservable(marketMarble, marketInput)

    const actual$ = executeStrategies(market$, strategyMockFunc, false)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
  })
  it('should take latest emit from socket observable and input to strategy', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const marketMarble = 'xy'
    const socketMarble = 'ij'
    const expectedMarble = '---ab'

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]
    const marketDataMockShorter =
      [[1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731]]

    const strategyMockFunc = (marketData, mockLastSignal, socket) => {
      socket.emit()
      return Observable.of(marketData).delay(marketData.close.length * 10, testScheduler)
    }

    const marketInput = {
      x: { marketData: marketDataMock, eventLoop: null },
      y: { marketData: marketDataMockShorter, eventLoop: null },
    }

    const firstSocket = { emit: jest.fn() }
    const secondSocket = { emit: jest.fn() }

    const socketInput = {
      i: firstSocket,
      j: secondSocket,
    }
    const expectedInput = {
      a: { eventLoop: null, signalData: toMarketDataObject(marketDataMock) },
      b: { eventLoop: null, signalData: toMarketDataObject(marketDataMockShorter) },
    }

    const market$ = testScheduler.createColdObservable(marketMarble, marketInput)
    const socket$ = testScheduler.createColdObservable(socketMarble, socketInput)

    const socketMockFunc = () => socket$

    const actual$ = executeStrategies(market$, strategyMockFunc, true, socketMockFunc, 'production')

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
    expect(firstSocket.emit).toHaveBeenCalled()
    expect(secondSocket.emit).toHaveBeenCalled()
  })

  it('should emit to eventloop', async () => {
    expect.assertions(3)

    const eventLoopMock = { next: jest.fn() }

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]

    const marketDataMockObservable = Observable.of({ eventLoop: eventLoopMock, marketData: marketDataMock })

    const strategyMockFunc = marketData => (
      marketData.close.length === 3 ? Observable.of({ type: 'sell' }) : Observable.of(false)
    )

    const resultPromise =
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc).toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual(undefined)
  })
  it('should emit to eventloop and set lastSignal when exeucting buy signal', async () => {
    expect.assertions(3)

    const eventLoopMock = { next: jest.fn() }

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]

    const marketDataMockObservable = Observable.of({ eventLoop: eventLoopMock, marketData: marketDataMock })

    const strategyMockFunc = marketData => (
      marketData.close.length === 3 ? Observable.of({ type: 'buy' }) : Observable.of(false)
    )

    const resultPromise =
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc)
        .toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual({ type: 'buy' })
  })
})
