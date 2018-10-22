import { TestScheduler, Observable } from 'rxjs'
import { toMarketDataObject } from 'Util/parser'
import { executeStrategies, executestrategiesAndEmitSignals, lastSignal } from '.'

describe('Strategy', () => {
  it('should finish the first strategy run before running the next', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'xy'
    const expected = '---ab)'

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]
    const marketDataMockShorter =
      [[1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731]]

    const strategyMockFunc = marketData => Observable.of(marketData).delay(marketData.close.length * 10, testScheduler)

    const lhsInput = {
      x: { marketData: marketDataMock, eventLoop: null },
      y: { marketData: marketDataMockShorter, eventLoop: null },
    }
    const expectedMap = {
      a: { eventLoop: null, signalData: toMarketDataObject(marketDataMock) },
      b: { eventLoop: null, signalData: toMarketDataObject(marketDataMockShorter) },
    }

    const lhs$ = testScheduler.createColdObservable(lhsMarble, lhsInput)

    const actual$ = executeStrategies(lhs$, strategyMockFunc)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should finish the first strategy run before running the next if first doesnt emit', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'xy'
    const expected = '----b)'

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

    const lhsInput = {
      x: { marketData: marketDataMock, eventLoop: null },
      y: { marketData: marketDataMockShorter, eventLoop: null },
    }
    const expectedMap = {
      b: { eventLoop: null, signalData: toMarketDataObject(marketDataMockShorter) },
    }

    const lhs$ = testScheduler.createColdObservable(lhsMarble, lhsInput)

    const actual$ = executeStrategies(lhs$, strategyMockFunc)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
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
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc, false).toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual({ type: 'buy' })
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
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc, false).toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual(undefined)
  })
  it('should emit to eventloop and set lastSignal when exeucting buy signal after socket is connected', async () => {
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

    const socketMockObservable = () => Observable.of({ emit: () => {} })

    const resultPromise =
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc, true, socketMockObservable)
        .toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual({ type: 'buy' })
  })
  it('should emit to eventloop after socket is connected', async () => {
    expect.assertions(3)

    const eventLoopMock = { next: jest.fn() }

    const marketDataMock =
      [
        [1524254400, 0.00185, 0.0018697, 0.00184682, 0.00186, 20288.367, 37.701817],
        [1524268800, 0.00186, 0.00189255, 0.00182031, 0.00183297, 36249.113, 67.1042],
        [1524283200, 0.00182737, 0.00184424, 0.00175, 0.00178191, 74616.6, 133.78731],
      ]

    const marketDataMockObservable = Observable.of({ eventLoop: eventLoopMock, marketData: marketDataMock })

    const socketMockObservable = () => Observable.of({ emit: () => {} })

    const strategyMockFunc = marketData => (
      marketData.close.length === 3 ? Observable.of({ type: 'sell' }) : Observable.of(false)
    )


    const resultPromise =
      executestrategiesAndEmitSignals(marketDataMockObservable, strategyMockFunc, true, socketMockObservable)
        .toPromise()
    await expect(resultPromise).resolves.toEqual(undefined)
    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(lastSignal).toEqual(undefined)
  })
})
