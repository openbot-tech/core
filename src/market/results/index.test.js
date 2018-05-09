import { TestScheduler } from 'rxjs'
import getResults, { tradeResult, totalResult } from '.'

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

    expect(tradeResult(profitableTrade)).toBe(70.26357406431207)
    expect(tradeResult(notProfitableTrade)).toBe(-14.003193710846325)
    expect(tradeResult(onlyBuyTrade)).toBe(-100)
    expect(tradeResult(onlySellTrade)).toBe(-100)
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
    const lhsMarble = 'x|'
    const expected = '-(a|)'

    const lhsInput = {
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

    const expectedMap = { a: 24.245357180910617 }

    const lhs$ = testScheduler.createHotObservable(lhsMarble, lhsInput)

    const actual$ = getResults(lhs$)

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
