import { TestScheduler } from 'rxjs'
import moment from 'moment'
import { newSession, SESSION_ID } from 'Config'
import executeOrder from 'Core/broker'
import { candleQueryObservable } from 'Core/market/live'
import getResults, { tradeResult, totalResult } from '.'
import 'Util/db/testSetup'

describe('Results', () => {
  it('should calculate trade profit', () => {
    const profitableTrade = [
      { type: 'buy', close: '0.0005691' },
      { type: 'sell', close: '0.00096897' },
    ]

    const notProfitableTrade = [
      { type: 'buy', close: '0.0016282' },
      { type: 'sell', close: '0.0014002' },
    ]

    const onlyBuyTrade = [
      { type: 'buy', close: '0.0016282' },
    ]

    const onlySellTrade = [
      { type: 'buy', close: '0.0016282' },
    ]

    expect(tradeResult(profitableTrade)).toBe(69.76357406431207)
    expect(tradeResult(notProfitableTrade)).toBe(-14.503193710846325)
    expect(tradeResult(onlyBuyTrade)).toBe(-100.5)
    expect(tradeResult(onlySellTrade)).toBe(-100.5)
  })
  it('should calculate trade profit', () => {
    const profitableTrades = [100, -10]

    const notProfitableTrades = [-90, 10]

    const equalTrades = [100, -100]

    const fourTrades = [20, -20, 30, 40]

    expect(totalResult(profitableTrades)).toBe(80)
    expect(totalResult(notProfitableTrades)).toBe(-89)
    expect(totalResult(equalTrades)).toBe(-100)
    expect(totalResult(fourTrades)).toBe(74.72)
  })
  it('should return total profit from trades', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const resultMarble = 'x|'
    const expectedMarble = '-(a|)'

    const resultInput = {
      x: [
        { type: 'buy', close: '0.0013624' },
        { type: 'sell', close: '0.0013949' },
        { type: 'buy', close: '0.001511' },
        { type: 'sell', close: '0.001845' },
        { type: 'buy', close: '0.0018499' },
        { type: 'sell', close: '0.0018449' },
        { type: 'buy', close: '0.0017807' },
        { type: 'sell', close: '0.0017745' },
      ],
    }

    const expectedInput = { a: 21.900277372661662 }

    const result$ = testScheduler.createHotObservable(resultMarble, resultInput)

    const actual$ = getResults(result$)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
  })
  it('should return total profit from trades with non buy / sell pairs', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const resultMarble = 'x|'
    const expectedMarble = '-(a|)'

    const resultInput = {
      x: [
        { type: 'sell', close: '0.0012624' },
        { type: 'buy', close: '0.0013624' },
        { type: 'sell', close: '0.0013949' },
        { type: 'buy', close: '0.001511' },
        { type: 'sell', close: '0.001845' },
        { type: 'buy', close: '0.0018499' },
        { type: 'sell', close: '0.0018449' },
        { type: 'buy', close: '0.0017807' },
        { type: 'sell', close: '0.0017745' },
        { type: 'sell', close: '0.0018845' },
      ],
    }

    const expectedInput = { a: 21.900277372661662 }

    const result$ = testScheduler.createHotObservable(resultMarble, resultInput)

    const actual$ = getResults(result$)

    testScheduler.expectObservable(actual$).toBe(expectedMarble, expectedInput)
    testScheduler.flush()
  })
  it('should post candle and signals to db and return results', async () => {
    expect.assertions(4)
    const testDbCandle1 = [
      moment('2018-01-24T19:09:03.000').toDate(), // closeTime
      0.0925, // openPrice
      0.0925, // highPrice
      0.0925, // lowPrice
      1, // closePrice
      1, // volume
    ]
    const testDbCandle2 = [
      moment('2018-01-24T19:10:03.000').toDate(), // closeTime
      0.0926, // openPrice
      0.0926, // highPrice
      0.0926, // lowPrice
      2, // closePrice
      2, // volume
    ]

    const dbCandle = [
      [1516817343, 0.0925, 0.0925, 0.0925, 1, 1],
      [1516817403, 0.0926, 0.0926, 0.0926, 2, 2],
    ]

    await newSession()
    await candleQueryObservable([SESSION_ID, ...testDbCandle1]).toPromise()
    const candleQueryPromise2 = candleQueryObservable([SESSION_ID, ...testDbCandle2]).toPromise()
    await expect(candleQueryPromise2)
      .resolves.toEqual(dbCandle)
    await expect(executeOrder({ type: 'buy', date: 1516817343 }))
      .resolves.toEqual([{ session_id: SESSION_ID, type: 'buy' }])
    await expect(executeOrder({ type: 'sell', date: 1516817403 }))
      .resolves.toEqual([{ session_id: SESSION_ID, type: 'sell' }])
    const resultsQueryPromise = getResults().toPromise()
    await expect(resultsQueryPromise)
      .resolves.toEqual(99.5)
  })
})
