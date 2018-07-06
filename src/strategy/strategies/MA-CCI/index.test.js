import MACCI from '.'
import { toMarketDataObject } from '../../../parser/'
import buyTestData from './buyTestData.json'
import sellTestData from './sellTestData.json'

describe('Strategy/MA-CCI', () => {
  it('It should emit buy signal', async () => {
    // https://api.cryptowat.ch/markets/bittrex/ethbtc/ohlc?periods=14400&before=1528300800&after=1527724800
    expect.assertions(1)
    const buySignal = [
      { date: 1528300800,
        lastCCI5: -128.90699251229532,
        lastClose: 0.079984,
        lastLow: 0.07925984,
        lastSMA20: 0.07948780150000002,
        lastSMA40: 0.078240221,
        type: 'buy',
      },
    ]
    const marketDataObj = toMarketDataObject(buyTestData)
    const resultMACCI = MACCI(marketDataObj).toArray().toPromise()
    await expect(resultMACCI).resolves.toEqual(buySignal)
  })
  it('It should emit sell signal', async () => {
    // https://api.cryptowat.ch/markets/bittrex/ethbtc/ohlc?periods=14400&before=1528833600&after=1528531200
    expect.assertions(1)
    const sellSignal = [
      { date: 1528833600,
        lastATR14: 0.0012987736096348715,
        stopLoss: 0.07554199958554769,
        type: 'sell',
      },
    ]
    const marketDataObj = toMarketDataObject(sellTestData)
    const resultMACCI = MACCI(marketDataObj).toArray().toPromise()
    await expect(resultMACCI).resolves.toEqual(sellSignal)
  })
})
