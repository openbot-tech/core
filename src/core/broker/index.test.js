import moment from 'moment'
import { newSession, SESSION_ID } from 'Config'
import { resultsQuery } from 'Util/db'
import { candleQueryObservable } from 'Core/market/live'
import executeOrder from '.'
import 'Util/db/testSetup'

describe('Broker', () => {
  it('should post candle and signals to db and return results', async () => {
    expect.assertions(4)
    const testDbCandle1 = [
      moment('2018-01-24T19:09:03.000').toDate(), // closeTime
      0.0925, // openPrice
      0.0925, // highPrice
      0.0925, // lowPrice
      0.0925, // closePrice
      1, // volume
    ]
    const testDbCandle2 = [
      moment('2018-01-24T19:10:03.000').toDate(), // closeTime
      0.0926, // openPrice
      0.0926, // highPrice
      0.0926, // lowPrice
      0.0926, // closePrice
      2, // volume
    ]

    const dbCandle = [
      [1516817343, 0.0925, 0.0925, 0.0925, 0.0925, 1],
      [1516817403, 0.0926, 0.0926, 0.0926, 0.0926, 2],
    ]

    const dbResults = [
      { close: '0.0925', type: 'buy' },
      { close: '0.0926', type: 'sell' },
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
    await expect(resultsQuery([SESSION_ID]))
      .resolves.toEqual(dbResults)
  })
})
