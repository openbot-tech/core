import moment from 'moment'
import { signalQuery } from '../db'
import { SESSION_ID, PAPER_TRADE } from '../config'
import execute from './executor/'

// TODO takes data from market and returns an order event
const executeOrder = (marketData) => {
  const candleDate = moment(marketData.date * 1000).toDate()
  if (!PAPER_TRADE) execute(marketData).subscribe(data => console.log(data))
  return signalQuery([marketData.type, candleDate, SESSION_ID])
}

export default executeOrder
