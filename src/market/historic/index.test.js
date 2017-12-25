import { TestScheduler, Observable } from 'rxjs'
import { dripObservable } from '.'

describe('Historic market data', () => {
  it('should drip historic data so it acts like real time', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'x'
    const expected = '(abc)'

    const expectedInput = { x: ['a', 'b', 'c'] }
    const expectedMap = {
      a: ['a'],
      b: ['a', 'b'],
      c: ['a', 'b', 'c'],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, expectedInput)

    const actual$ = dripObservable(lhs$, Observable.from)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
