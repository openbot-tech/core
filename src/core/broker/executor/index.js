import bittrex from 'node-bittrex-api'
import { Observable } from 'rxjs'
import { PAIR, RETRY_ORDER_TIME } from 'Config'

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

export const getFee = (amount, fee = 0.25) => amount * (1 - (fee / 100))

export const calculateQuantity = (signalData, balance, order) => {
  if (balance && order && order.Rate && signalData.type === 'buy') {
    const amount = balance / order.Rate
    return { quantity: getFee(amount), rate: order.Rate }
  }
  if (balance && order && order.Rate && signalData.type === 'sell') {
    return { quantity: balance, rate: order.Rate }
  }
  return { rate: 0, quantity: 0 }
}

const getBalancesObservable = Observable.bindNodeCallback(bittrex.getbalances)
const getOrderBookObservable = Observable.bindNodeCallback(bittrex.getorderbook)
const getOpenOrdersObservable = Observable.bindNodeCallback(bittrex.getopenorders)
const cancelOrderObservable = Observable.bindNodeCallback(bittrex.cancel)
const buyLimitObservable = Observable.bindNodeCallback(bittrex.buylimit)
const sellLimitObservable = Observable.bindNodeCallback(bittrex.selllimit)


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
        .map(bestOrder => calculateQuantity(signalData, balance, bestOrder))
    ))
)

export const executeOrder = (
  signalData,
  orderData,
  pair = PAIR,
  retryOrderTime = RETRY_ORDER_TIME,
  buyLimit = buyLimitObservable,
  sellLimit = sellLimitObservable,
  testScheduler,
) =>
  (signalData.type === 'buy'
    ? buyLimit({ market: pair, ...orderData })
    : sellLimit({ market: pair, ...orderData }))
    // TODO retry when pattern
    .delay(retryOrderTime, testScheduler)
    .map(order => order && order.result && order.result.uuid)
    .catch(() => Observable.of(false))

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
  buyLimit = buyLimitObservable,
  sellLimit = sellLimitObservable,
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
    .catch(data => console.log('err', data)) // eslint-disable-line no-console
)

export default execute
