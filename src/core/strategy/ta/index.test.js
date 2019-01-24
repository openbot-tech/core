import { toMarketDataObject } from 'Util/parser'
import { removeNumberOfElements, execute, getMarketArguments } from '.'
import buyTestData from './buyTestData.json'

describe('Core/strategy/ta', () => {
  it('should remove number of slice elements', () => {
    expect(removeNumberOfElements([1, 2, 3])).toEqual([1, 2, 3])
    expect(removeNumberOfElements([1, 2, 3], -1)).toEqual([1, 2])
    expect(removeNumberOfElements([1, 2, 3], -2)).toEqual([1])
    expect(removeNumberOfElements([1, 2, 3], 0)).toEqual([1, 2, 3])
  })
  it('should return the right marketdata arguments for TA', () => {
    const marketDataObj = toMarketDataObject(buyTestData)
    const OHLCResult = [marketDataObj.high, marketDataObj.low, marketDataObj.close]
    const realResult = [marketDataObj.close]
    const volumeResult = [marketDataObj.close, marketDataObj.volume]
    const openResult = [marketDataObj.open, marketDataObj.close]
    expect(getMarketArguments(['high', 'low', 'close'], marketDataObj)).toEqual(OHLCResult)
    expect(getMarketArguments(['close', 'volume'], marketDataObj)).toEqual(volumeResult)
    expect(getMarketArguments(['real'], marketDataObj)).toEqual(realResult)
    expect(getMarketArguments(['open', 'close'], marketDataObj)).toEqual(openResult)
  })
  it('should throw an error if number of arguments doesnt match or indicator doesnt exist', () => {
    const marketDataObj = toMarketDataObject(buyTestData)
    expect(execute('stoch', [5, 3], marketDataObj, 0, () => {}))
      .toEqual(new Error('Amount of option argument doesn\'t match'))
    expect(execute('fuck', [5, 3], marketDataObj, 0, () => {}))
      .toEqual(new Error('Indicator doesn\'t exist'))
  })
})
