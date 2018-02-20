import { TestScheduler } from 'rxjs'
import { candleObservable, createCandle } from '.'

describe('Historic market data', () => {
  it('should create candle from array of ticker data', () => {
    const ticks = [
      { OrderType: 'BUY',
        Rate: 0.0923,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:07:03.063',
      },
      { OrderType: 'BUY',
        Rate: 0.0924,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:08:03.063',
      },
      { OrderType: 'BUY',
        Rate: 0.0925,
        Quantity: 1,
        TimeStamp: '2018-01-24T19:09:03.063',
      },
    ]
    expect(createCandle(ticks)).toEqual([
      1516817343, // closeTime
      0.0923, // openPrice
      0.0925, // highPrice
      0.0923, // lowPrice
      0.0925, // closePrice
      3, // volume
    ])
  })
  it('should create candle from ticker data after x seconds', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'x-y-(z|)'
    const expected = '----(a|)'

    const lhsInput = {
      x: [
        { OrderType: 'BUY',
          Rate: 0.0923,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:07:03.063',
        },
      ],
      y: [
        { OrderType: 'BUY',
          Rate: 0.0924,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:08:03.063',
        },
      ],
      z: [
        { OrderType: 'BUY',
          Rate: 0.0925,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:09:03.063',
        },
      ],
    }

    const expectedMap = {
      a: [[
        1516817343, // closeTime
        0.0923, // openPrice
        0.0925, // highPrice
        0.0923, // lowPrice
        0.0925, // closePrice
        3, // volume
      ]],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = candleObservable(lhs$, 0.04, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should concat arrays after buffer', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = 'x-y(z|)'
    const expected = '-ab(c|)'

    const lhsInput = {
      x: [
        { OrderType: 'BUY',
          Rate: 0.0923,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:07:03.063',
        },
      ],
      y: [
        { OrderType: 'BUY',
          Rate: 0.0924,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:08:03.063',
        },
      ],
      z: [
        { OrderType: 'BUY',
          Rate: 0.0925,
          Quantity: 1,
          TimeStamp: '2018-01-24T19:09:03.063',
        },
      ],
    }

    const expectedMap = {
      a: [[
        1516817223, // closeTime
        0.0923, // openPrice
        0.0923, // highPrice
        0.0923, // lowPrice
        0.0923, // closePrice
        1, // volume
      ]],
      b: [
        [
          1516817223, // closeTime
          0.0923, // openPrice
          0.0923, // highPrice
          0.0923, // lowPrice
          0.0923, // closePrice
          1, // volume
        ],
        [
          1516817283, // closeTime
          0.0924, // openPrice
          0.0924, // highPrice
          0.0924, // lowPrice
          0.0924, // closePrice
          1, // volume
        ],
      ],
      c: [
        [
          1516817223, // closeTime
          0.0923, // openPrice
          0.0923, // highPrice
          0.0923, // lowPrice
          0.0923, // closePrice
          1, // volume
        ],
        [
          1516817283, // closeTime
          0.0924, // openPrice
          0.0924, // highPrice
          0.0924, // lowPrice
          0.0924, // closePrice
          1, // volume
        ],
        [
          1516817343, // closeTime
          0.0925, // openPrice
          0.0925, // highPrice
          0.0925, // lowPrice
          0.0925, // closePrice
          1, // volume
        ],
      ],
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = candleObservable(lhs$, 0.01, testScheduler)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
