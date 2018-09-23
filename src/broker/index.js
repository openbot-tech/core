import moment from 'moment'
import { signalQuery } from '../db'
import { SESSION_ID, PAPER_TRADE, BACKTEST } from '../config'
import execute from './executor/'

// TODO takes data from market and returns an order event
const executeOrder = (signalData) => {
  const candleDate = moment(signalData.date * 1000).toDate()
  if (!PAPER_TRADE && !BACKTEST) execute(signalData).subscribe(data => console.log(data))
  return signalQuery([signalData.type, candleDate, SESSION_ID])
}

export default executeOrder
