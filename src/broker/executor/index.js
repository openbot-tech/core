import bittrex from 'node-bittrex-api'
import { Observable } from 'rxjs'
import { PAIR, RETRY_ORDER_TIME } from '../../config'

export const coinToExecute = (signalData, pairList) => (signalData.type === 'buy' ? pairList[0] : pairList[1])

export const coinBalance = (coinTicker, balancesData) => {
  const coinElement = balancesData && balancesData.result.find(coin =>
    coin.Currency === coinTicker)
  if (coinElement) return coinElement.Balance
  return 0
}

export const getCoinToExecuteBalance = (signalData, balancesData, pair = PAIR) => {
  const pairList = pair.split('-')
  const coinTickerToExecute = coinToExecute(signalData, pairList)
  const coinBalanceForTrade = coinBalance(coinTickerToExecute, balancesData)
  return coinBalanceForTrade
}

export const getOrderBookType = signalData => (signalData.type === 'buy' ? 'sell' : 'buy')

export const getHighestOrder = (orderBookSide, comparer) => orderBookSide.reduce((prevOrder, currentOrder) => (
  (comparer(prevOrder.Rate, currentOrder.Rate)) ? prevOrder : currentOrder))

export const getHighestOrderForType = (orderBook, signalData) => {
  if (signalData && signalData.type === 'sell') {
    // bidprice is highest available buy price in orderbook
    return getHighestOrder(orderBook.buy, (a, b) => a > b)
  }
  if (signalData && signalData.type === 'buy') {
    // askprice is lowest available sell price in orderbook
    return getHighestOrder(orderBook.sell, (a, b) => a < b)
  }
  return false
}

export const calculateQuantity = (balance, order) => {
  if (balance && order && order.Rate) {
    return { quantity: balance / order.Rate, rate: order.Rate }
  }
  return { rate: 0, quantity: 0 }
}

const getBalancesObservable = Observable.bindNodeCallback(bittrex.getbalances)
const getOrderBookObservable = Observable.bindNodeCallback(bittrex.getorderbook)
const getOpenOrdersObservable = Observable.bindNodeCallback(bittrex.getopenorders)
const cancelOrderObservable = Observable.bindNodeCallback(bittrex.cancel)


/**
 * get balances
 * if balance for coin to buy / sell is 0 then return
 * get orderbook to calcualte bid / ask price
 * calculate amount from bid / ask price
 * execute order
 * wait 30 seconds
 * if order isn't filled, close order and retry
 */
export const getOrderData = (
  signalData,
  pair = PAIR,
  getBalances = getBalancesObservable,
  getOrderBook = getOrderBookObservable,
) => (
  getBalances()
    .map(balancesData => getCoinToExecuteBalance(signalData, balancesData, pair))
    .filter(balance => balance >= 0)
    .mergeMap(balance => (
      getOrderBook({ market: pair, type: 'both' })
        .map(orderBook => getHighestOrderForType(orderBook.result, signalData))
        .map(bestOrder => calculateQuantity(balance, bestOrder))
    ))
)

export const executeOrder = (
  signalData,
  orderData,
  pair = PAIR,
  retryOrderTime = RETRY_ORDER_TIME,
  buyLimit,
  sellLimit,
  testScheduler,
) =>
  (signalData.type === 'buy'
    ? buyLimit({ market: pair, ...orderData })
    : sellLimit({ market: pair, ...orderData }))
    // TODO retry when pattern
    .delay(retryOrderTime, testScheduler)
    .map(order => order && order.result && order.result.uuid)

export const cancelOrder = (
  orderUUID,
  cancelOrderReq = cancelOrderObservable,
) =>
  cancelOrderReq({ uuid: orderUUID })
  // TODO retry when


export const orderStatus = (
  orderUUID,
  pair = PAIR,
  getOpenOrders = getOpenOrdersObservable,
) => (
  getOpenOrders({ market: pair })
    .map(openOrders => openOrders && openOrders.result)
    .map(openOrders => openOrders && openOrders.find(order => orderUUID === order.OrderUuid))
    .map(orderOrUndefined => (!!orderOrUndefined === false ? false : orderUUID))
)

export const executeOrderAndCancelIfNoFillObservable = (
  signalData,
  pair = PAIR,
  getBalances = getBalancesObservable,
  getOrderBook = getOrderBookObservable,
  buyLimit,
  sellLimit,
  getOpenOrders = getOpenOrdersObservable,
  cancelOrderReq = cancelOrderObservable,
  retryOrderTime = RETRY_ORDER_TIME,
  testScheduler,
) =>
  getOrderData(signalData, pair, getBalances, getOrderBook)
    .flatMap(orderData => executeOrder(signalData, orderData, pair, retryOrderTime, buyLimit, sellLimit, testScheduler))
    .flatMap(orderUUID => orderStatus(orderUUID, pair, getOpenOrders))
    .flatMap(orderUUIDOrFalse =>
      (orderUUIDOrFalse ? cancelOrder(orderUUIDOrFalse, cancelOrderReq) : Observable.of(false)))


const status = orderData => orderData

const execute = (
  signalData,
  pair = PAIR,
  executeOrderAndCancelIfNoFill = executeOrderAndCancelIfNoFillObservable,
) => (
  executeOrderAndCancelIfNoFill(signalData, pair)
    .expand((orderData, idx) => (
      status(orderData)
        ? executeOrderAndCancelIfNoFill({ idx, ...signalData }, pair)
        : Observable.empty()
    ))
)

/*
execute({ date: 1528300800,
  lastCCI5: -128.90699251229532,
  lastClose: 0.079984,
  lastLow: 0.07925984,
  lastSMA20: 0.07948780150000002,
  lastSMA40: 0.078240221,
  type: 'sell',
}, 'OMG-ETH')
*/

export default execute
