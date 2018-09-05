import { TestScheduler } from 'rxjs'
import MACCI from '.'
import { toMarketDataObject } from '../../../parser/'
import buyTestData from './buyTestData.json'
import sellTestData from './sellTestData.json'
import buyIndicatorData from './buyIndicatorData.json'

describe('Strategy/MA-CCI', () => {
  it('It should emit buy signal', async () => {
    // https://api.cryptowat.ch/markets/bittrex/ethbtc/ohlc?periods=14400&before=1528300800&after=1527724800
    expect.assertions(1)
    const buySignal = [
      { close: 0.079984,
        date: 1528300800,
        type: 'buy',
      },
    ]
    const marketDataObj = toMarketDataObject(buyTestData)
    // toPromise returns after observable completes
    const resultMACCI = MACCI(marketDataObj).toArray().toPromise()
    await expect(resultMACCI).resolves.toEqual(buySignal)
  })
  it('It should emit sell signal', async () => {
    // https://api.cryptowat.ch/markets/bittrex/ethbtc/ohlc?periods=14400&before=1528833600&after=1528531200
    expect.assertions(1)
    const sellSignal = [
      { close: 0.075537,
        date: 1528833600,
        type: 'sell',
      },
    ]
    const marketDataObj = toMarketDataObject(sellTestData)
    const resultMACCI = MACCI(marketDataObj).toArray().toPromise()
    await expect(resultMACCI).resolves.toEqual(sellSignal)
  })
  it('It should emit empty array if no signals', async () => {
    // https://api.cryptowat.ch/markets/bittrex/ethbtc/ohlc?periods=14400&before=1528833600&after=1528531200
    expect.assertions(1)
    const tradeData = [
      [1527724800, 0.07509535, 0.07594, 0.07467092, 0.07585498, 625.9437, 47.049984],
      [1527739200, 0.07571121, 0.0768, 0.07520696, 0.07645023, 798.939, 60.800404],
    ]
    const marketDataObj = toMarketDataObject(tradeData)
    const resultMACCI = MACCI(marketDataObj).toArray().toPromise()
    await expect(resultMACCI).resolves.toEqual([])
  })
  it('It should emit complete event after signal', async () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const lhsMarble = '(x|)'
    const expected = '(a|)'

    const marketDataObj = toMarketDataObject(buyTestData)
    const lhsInput = { x: buyIndicatorData }
    const buySignal =
      { close: 0.079984,
        date: 1528300800,
        type: 'buy',
      }

    const expectedMap = {
      a: buySignal,
    }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)
    const getIndicatorMock = () => lhs$
    const actual$ = MACCI(marketDataObj, getIndicatorMock)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
