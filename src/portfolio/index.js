import moment from 'moment'
// TODO handles order management and executes the broker event
const portfolioManager = (signalData, eventLoop) => {
  console.log('allocating....', signalData, signalData && moment.utc(signalData.date * 1000).format())
}

export default portfolioManager
