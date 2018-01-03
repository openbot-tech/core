import { toMarketDataObject } from '../../utils'
import testBuyData from './test_data_buy.json'
import MACCI from '.'
// buy signal in this timeframe: 1514158920
describe('Historic market data', () => {
  it('should return buy actions when using testBuyData', async () => {
    expect.assertions(1)
    const marketDataObj = toMarketDataObject(testBuyData)
    const signal = await MACCI(marketDataObj).toPromise()
    expect(signal).toEqual({ type: 'buy' })
  })
})
