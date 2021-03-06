import { TestScheduler, Observable } from 'rxjs'
import moment from 'moment'
import { newSession, TIME_FRAME } from 'Config'
import { dripObservable, getPairForCryptowatch, dataRequest } from '.'
import marketsData from './marketsData.json'
import marketsOHLCData from './marketsOHLCData.json'
import 'Util/db/testSetup'

describe('Core/market/historic', () => {
  const mockData = [
    [1516752000, 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40, 58.72687],
    [1516766400, 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30, 41.91949],
    [1516780800, 0.0014798, 0.0015099, 0.0014691, 0.0015012, 10, 25.553959],
  ]
  it('should tell whether its the correct pair', () => {
    const found = getPairForCryptowatch('BTC-OMG', 'omgbtc')
    const notFound = getPairForCryptowatch('USDT-OMG', 'omgusd')

    expect(found).toBeTruthy()
    expect(notFound).toBeFalsy()
  })
  it('should fetch ohlc data for a given pair or throw an error', async () => {
    expect.assertions(2)
    const marketsDataPromise = new Promise(resolve => resolve({ data: marketsData }))
    const marketsOHLCDataPromise = () => new Promise(resolve => resolve({ data: marketsOHLCData }))
    const found = dataRequest('BTC-OMG', marketsDataPromise, marketsOHLCDataPromise)
    const notFound = dataRequest('SDFS-OMG', marketsDataPromise, marketsOHLCDataPromise)

    await expect(found).resolves.toEqual({ data: marketsOHLCData })
    await expect(notFound).rejects.toEqual(Error('pair not found'))
  })
  it('should finish the first candle before running the next one', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const candlesMarble = 'x'
    const expectedMarble = '----a--bc'

    const candleQueryFuncMock = input => Observable.of(input).delay(input[6], testScheduler)
    const candlesInput = { x: { data: { result: { [TIME_FRAME]: mockData } } } }
    const expectedInput = {
      a: [null, moment(1516752000 * 1000).toDate(), 0.0014355, 0.0015099, 0.0014241, 0.0014759, 40],
      b: [null, moment(1516766400 * 1000).toDate(), 0.0014763, 0.0014902, 0.0014424, 0.0014874, 30],
      c: [null, moment(1516780800 * 1000).toDate(), 0.0014798, 0.0015099, 0.0014691, 0.0015012, 10],
    }

    const candles$ = testScheduler.createHotObservable(candlesMarble, candlesInput)

    const actual$ = dripObservable(candles$, Observable.from, candleQueryFuncMock)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
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
