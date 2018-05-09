import moment from 'moment'
import { signalQuery } from '../db'
import { SESSION_ID } from '../config'
// TODO takes data from market and returns an order event
const executeOrder = (marketData) => {
  const candleDate = moment(marketData.date * 1000).toDate()
  signalQuery([marketData.type, candleDate, SESSION_ID])
}

export default executeOrder
