import { TestScheduler } from 'rxjs'
import execute, {
  getCoinToExecuteBalance,
  coinToExecute,
  coinBalance,
  getOrderBookType,
  getHighestOrder,
  getHighestOrderForType,
  calculateQuantity,
  getOrderData,
  executeOrder,
  orderStatus,
  executeOrderAndCancelIfNoFillObservable,
} from '.'

import balancesData from './balancesData.json'
import orderbookData from './orderbookData.json'
import openOrdersData from './openOrdersData.json'
import buyOrderData from './buyOrderData.json'
import sellOrderData from './sellOrderData.json'
import cancelOrderData from './cancelOrderData.json'
import openOrdersWithBuyUUIDData from './openOrdersWithBuyUUIDData.json'

const getOrderExecutionMockFunctions = (testScheduler, openOrderData = openOrdersData) => {
  const balancesMarble = 'x'
  const orderbookMarble = 'y'
  const openOrdersMarble = 'z'
  const buyOrderMarble = 'j'
  const sellOrderMarble = 'm'
  const cancelOrderMarble = 'i'

  const balancesInput = { x: balancesData }
  const orderbookInput = { y: orderbookData }
  const openOrdersInput = { z: openOrderData }
  const buyOrderInput = { j: buyOrderData }
  const sellOrderInput = { m: sellOrderData }
  const cancelOrderInput = { i: cancelOrderData }

  const balances$ = testScheduler.createColdObservable(balancesMarble, balancesInput, testScheduler)
  const orderbook$ = testScheduler.createColdObservable(orderbookMarble, orderbookInput, testScheduler)
  const openOrders$ = testScheduler.createColdObservable(openOrdersMarble, openOrdersInput, testScheduler)
  const buyOrder$ = testScheduler.createColdObservable(buyOrderMarble, buyOrderInput, testScheduler)
  const sellOrder$ = testScheduler.createColdObservable(sellOrderMarble, sellOrderInput, testScheduler)
  const cancelOrderInput$ = testScheduler.createColdObservable(cancelOrderMarble, cancelOrderInput, testScheduler)

  const balancesMockFunc = () => balances$
  const orderbookMockFunc = () => orderbook$
  const openOrdersMockFunc = () => openOrders$
  const buyOrderMockFunc = () => buyOrder$
  const sellOrderMockFunc = () => sellOrder$
  const cancelOrderMockFunc = () => cancelOrderInput$

  return {
    balancesMockFunc,
    orderbookMockFunc,
    openOrdersMockFunc,
    buyOrderMockFunc,
    sellOrderMockFunc,
    cancelOrderMockFunc,
  }
}

describe('broker/executor', () => {
  const buySignalMockData = { date: 1528300800,
    lastCCI5: -128.90699251229532,
    lastClose: 0.079984,
    lastLow: 0.07925984,
    lastSMA20: 0.07948780150000002,
    lastSMA40: 0.078240221,
    type: 'buy',
  }
  const sellSignalMockData = { date: 1528833600,
    lastATR14: 0.0012987736096348715,
    stopLoss: 0.07554199958554769,
    type: 'sell',
  }
  it('should select coin to execute signal on', () => {
    expect(coinToExecute({ type: 'buy' }, ['BTC', 'OMG'])).toBe('BTC')
    expect(coinToExecute({ type: 'sell' }, ['BTC', 'OMG'])).toBe('OMG')
  })
  it('should select the balance for the coin to execute on', () => {
    expect(coinBalance('BTC', balancesData)).toBe(14.21549076)
    expect(coinBalance('DOGE', balancesData)).toBe(0.00000000)
    expect(coinBalance('NEJ', balancesData)).toBe(0)
  })
  it('should check balance for pair before order execution', () => {
    expect(getCoinToExecuteBalance(buySignalMockData, balancesData, 'BTC-OMG')).toBe(14.21549076)
    expect(getCoinToExecuteBalance(sellSignalMockData, balancesData, 'BTC-DOGE')).toBe(0.00000000)
    expect(getCoinToExecuteBalance(sellSignalMockData, balancesData, 'ETH-VEN')).toBeFalsy()
  })
  it('should return  orderbook type for bittrex', () => {
    expect(getOrderBookType({ type: 'buy' })).toBe('sell')
    expect(getOrderBookType({ type: 'sell' })).toBe('buy')
  })
  it('should return highest order from orderbook side', () => {
    const orderBookSell = [
      { Quantity: 2.89969117, Rate: 0.000839 },
      { Quantity: 2.89969117, Rate: 0.000977 },
    ]

    const orderBookBuy = [
      { Quantity: 2.89969117, Rate: 0.001039 },
      { Quantity: 2.89969117, Rate: 0.000839 },
      { Quantity: 2.89969117, Rate: 0.000977 },
    ]
    expect(getHighestOrder(orderBookSell, (a, b) => a < b)).toEqual({ Quantity: 2.89969117, Rate: 0.000839 })
    expect(getHighestOrder(orderBookBuy, (a, b) => a > b)).toEqual({ Quantity: 2.89969117, Rate: 0.001039 })
  })
  it('should return highest order from giving it signal', () => {
    const orderBookSell = [
      { Quantity: 2.89969117, Rate: 0.000839 },
      { Quantity: 2.89969117, Rate: 0.000977 },
    ]

    const orderBookBuy = [
      { Quantity: 2.89969117, Rate: 0.001039 },
      { Quantity: 2.89969117, Rate: 0.000839 },
      { Quantity: 2.89969117, Rate: 0.000977 },
    ]

    const orderBook = { sell: orderBookSell, buy: orderBookBuy }
    expect(getHighestOrderForType(orderBook, buySignalMockData)).toEqual({ Quantity: 2.89969117, Rate: 0.000839 })
    expect(getHighestOrderForType(orderBook, sellSignalMockData)).toEqual({ Quantity: 2.89969117, Rate: 0.001039 })
  })
  it('Should calculate the quantity for an order from balance and best order', () => {
    expect(calculateQuantity(14.21549076, { Quantity: 32.55412402, Rate: 0.0254 }))
      .toEqual({ rate: 0.0254, quantity: 559.6649905511811 })
    expect(calculateQuantity(10, { Quantity: 32.55412402, Rate: 1 })).toEqual({ rate: 1, quantity: 10 })
    expect(calculateQuantity(0, { Quantity: 32.55412402, Rate: 0.0254 })).toEqual({ rate: 0, quantity: 0 })
    expect(calculateQuantity(100, {})).toEqual({ rate: 0, quantity: 0 })
  })
  it('should get data for the order to execute', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = 'a'

    const expectedMap = {
      a: { quantity: 559.6649905511811, rate: 0.0254 },
    }

    const { balancesMockFunc, orderbookMockFunc } = getOrderExecutionMockFunctions(testScheduler)

    const actual$ = getOrderData(
      buySignalMockData,
      'BTC-ETH',
      balancesMockFunc,
      orderbookMockFunc,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should execute a buy order and wait to emit the response', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = '-a'

    const expectedMap = {
      a: buyOrderData.result.uuid,
    }

    const { buyOrderMockFunc, sellOrderMockFunc } = getOrderExecutionMockFunctions(testScheduler)

    const actual$ = executeOrder(
      buySignalMockData,
      { quantity: 559.6649905511811, rate: 0.0254 },
      'BTC-ETH',
      10,
      buyOrderMockFunc,
      sellOrderMockFunc,
      testScheduler,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should execute a sell order and wait to emit the response', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = '-a'

    const expectedMap = {
      a: sellOrderData.result.uuid,
    }

    const { buyOrderMockFunc, sellOrderMockFunc } = getOrderExecutionMockFunctions(testScheduler)

    const actual$ = executeOrder(
      sellSignalMockData,
      { quantity: 559.6649905511811, rate: 0.0254 },
      'BTC-ETH',
      10,
      buyOrderMockFunc,
      sellOrderMockFunc,
      testScheduler,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should check if order is executed and return undefined because uuid is not in openOrders', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = 'a'

    const expectedMap = {
      a: false,
    }

    const { openOrdersMockFunc } = getOrderExecutionMockFunctions(testScheduler, openOrdersData)

    const actual$ = orderStatus(
      buyOrderData.result.uuid,
      'BTC-ETH',
      openOrdersMockFunc,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should check if order is executed and return order because uuid is in openOrders', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = 'a'

    const expectedMap = {
      a: openOrdersWithBuyUUIDData.result[0].OrderUuid,
    }

    const { openOrdersMockFunc } = getOrderExecutionMockFunctions(testScheduler, openOrdersWithBuyUUIDData)

    const actual$ = orderStatus(
      buyOrderData.result.uuid,
      'BTC-ETH',
      openOrdersMockFunc,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should execute order and return false because uuid is not in orderbook', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = '-a'

    const expectedMap = {
      a: false,
    }

    const {
      balancesMockFunc,
      orderbookMockFunc,
      openOrdersMockFunc,
      buyOrderMockFunc,
      sellOrderMockFunc,
      cancelOrderMockFunc,
    } = getOrderExecutionMockFunctions(testScheduler)

    const actual$ = executeOrderAndCancelIfNoFillObservable(
      buySignalMockData,
      'BTC-ETH',
      balancesMockFunc,
      orderbookMockFunc,
      buyOrderMockFunc,
      sellOrderMockFunc,
      openOrdersMockFunc,
      cancelOrderMockFunc,
      10,
      testScheduler,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should execute order and return cancel order response because uuid is in orderbook', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))

    const expected = '-a'

    const expectedMap = {
      a: cancelOrderData,
    }

    const {
      balancesMockFunc,
      orderbookMockFunc,
      openOrdersMockFunc,
      buyOrderMockFunc,
      sellOrderMockFunc,
      cancelOrderMockFunc,
    } = getOrderExecutionMockFunctions(testScheduler, openOrdersWithBuyUUIDData)

    const actual$ = executeOrderAndCancelIfNoFillObservable(
      buySignalMockData,
      'BTC-ETH',
      balancesMockFunc,
      orderbookMockFunc,
      buyOrderMockFunc,
      sellOrderMockFunc,
      openOrdersMockFunc,
      cancelOrderMockFunc,
      10,
      testScheduler,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
  it('should execute order and retry if order isnt executed after x seconds', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const executeOrderAndCancelIfNoFillMarble = 'x'
    const executeOrderAndFalseMarble = 'y'

    const expected = '(ab)'


    const executeOrderAndCancelIfNoFillInput = {
      x: cancelOrderData,
    }

    const executeOrderAndFalseInput = {
      x: false,
    }

    const expectedMap = {
      a: cancelOrderData,
      b: undefined,
    }

    const executeOrderAndCancelIfNoFill$ =
      testScheduler.createColdObservable(
        executeOrderAndCancelIfNoFillMarble,
        executeOrderAndCancelIfNoFillInput,
        testScheduler,
      )

    const executeOrderAndFalse$ =
      testScheduler.createColdObservable(
        executeOrderAndFalseMarble,
        executeOrderAndFalseInput,
        testScheduler,
      )

    const executeOrderAndCancelIfNoFillMockFunc = signalData =>
      ((typeof signalData.idx !== 'number') ? executeOrderAndCancelIfNoFill$ : executeOrderAndFalse$)

    const actual$ = execute(
      buySignalMockData,
      'BTC-ETH',
      executeOrderAndCancelIfNoFillMockFunc,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
