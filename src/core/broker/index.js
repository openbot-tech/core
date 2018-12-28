import moment from 'moment'
import { signalQuery } from 'Util/db'
import { SESSION_ID, PAPER_TRADE, BACKTEST } from 'Config'
import execute from 'Core/broker/executor/'

const { NODE_ENV } = process.env

// TODO takes data from market and returns an order event
const executeOrder = (signalData) => {
  const candleDate = moment(signalData.date * 1000).toDate()
  if (!PAPER_TRADE && !BACKTEST && NODE_ENV !== 'test') {
    execute(signalData)
      .subscribe(data => console.log(data)) // eslint-disable-line no-console
  }
  return signalQuery([signalData.type, candleDate, SESSION_ID])
}

export default executeOrder
