import { TestScheduler, Observable } from 'rxjs'
import moment from 'moment'
import { dripObservable } from '.'
import { newSession, TIME_FRAME } from '../../config'
import '../../db/testSetup'

describe('Historic market data', () => {
  const mockData = [
    [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40, 58.72687],
    [1516766400, 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30, 41.91949],
    [1516780800, 0.0014798, 0.0015099, 0.0014691, 0.0015012, 10, 25.553959],
  ]

  it('should finish the first candle before running the next one', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'x'
    const expected = '----a--bc)'

    const candleQueryFuncMock = input => Observable.of(input).delay(input[6], testScheduler)
    const lhsInput = { x: { data: { result: { [TIME_FRAME]: mockData } } } }
    const expectedMap = {
      a: [null, moment(1516752000 * 1000).toDate(), 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
      b: [null, moment(1516766400 * 1000).toDate(), 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30],
      c: [null, moment(1516780800 * 1000).toDate(), 0.0014798, 0.0015099, 0.0014691, 0.0015012, 10],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = dripObservable(lhs$, Observable.from, candleQueryFuncMock)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should insert historic data into db and then fetch it sync', async () => {
    expect.assertions(1)

    const promiseMock = Observable.of({ data: { result: { [TIME_FRAME]: [mockData[0]] } } }).toPromise()

    const expectedDbData = [
      [
        [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
      ],
    ]

    await newSession()
    const resultDbPromise = dripObservable(promiseMock).toArray().toPromise()
    await expect(resultDbPromise).resolves.toEqual(expectedDbData)
  })
  it('should drip historic data so it acts like real time', async () => {
    expect.assertions(1)

    const promiseMock = Observable.of({ data: { result: { [TIME_FRAME]: mockData } } }).toPromise()

    const expectedDbData = [
      [
        [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
      ],
      [
        [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
        [1516766400, 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30],
      ],
      [
        [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
        [1516766400, 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30],
        [1516780800, 0.0014798, 0.0015099, 0.0014691, 0.0015012, 10],
      ],
    ]

    await newSession()
    const resultDbPromise = dripObservable(promiseMock).toArray().toPromise()
    await expect(resultDbPromise).resolves.toEqual(expectedDbData)
  })
})
