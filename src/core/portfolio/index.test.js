import { TestScheduler } from 'rxjs'
import { emitOrderSignals } from '.'

describe('Portfolio', () => {
  it('should emit order signals from portfolio event observable', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    const eventLoopMock = { next: jest.fn() }
    // setup
    const lhsMarble = 'x'
    const expected = 'a'

    const signalMock = { type: 'sell', date: 1546622484, close: 2 }

    const lhsInput = {
      x: { eventLoop: eventLoopMock, signalData: signalMock },
    }
    const expectedMap = {
      a: undefined,
    }

    const lhs$ = testScheduler.createColdObservable(lhsMarble, lhsInput)

    const actual$ = emitOrderSignals(lhs$)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()

    expect(eventLoopMock.next).toHaveBeenCalled()
    expect(eventLoopMock.next)
      .toHaveBeenCalledWith({ payload: signalMock, type: 'order' })
  })
  it('should emit order signals from portfolio event observable when type is different', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    const eventLoopMock = { next: jest.fn() }
    // setup
    const lhsMarble = '-x--y----z-----w'
    const expected = '-a-------b------'

    const firstSellSignalMock = { type: 'sell', date: 1546622484, close: 2 }
    const secondSellSignalMock = { type: 'sell', date: 1546622484, close: 3 }
    const firstBuySignalMock = { type: 'buy', date: 1546622484, close: 4 }
    const secondBuySignalMock = { type: 'buy', date: 1546622484, close: 4 }

    const lhsInput = {
      x: { eventLoop: eventLoopMock, signalData: firstSellSignalMock },
      y: { eventLoop: eventLoopMock, signalData: secondSellSignalMock },
      z: { eventLoop: eventLoopMock, signalData: firstBuySignalMock },
      w: { eventLoop: eventLoopMock, signalData: secondBuySignalMock },
    }
    const expectedMap = {
      a: undefined,
      b: undefined,
    }

    const lhs$ = testScheduler.createColdObservable(lhsMarble, lhsInput)

    const actual$ = emitOrderSignals(lhs$)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()

    expect(eventLoopMock.next).toHaveBeenCalledTimes(2)
    expect(eventLoopMock.next)
      .toHaveBeenNthCalledWith(1, { payload: firstSellSignalMock, type: 'order' })
    expect(eventLoopMock.next)
      .toHaveBeenNthCalledWith(2, { payload: firstBuySignalMock, type: 'order' })
  })
})