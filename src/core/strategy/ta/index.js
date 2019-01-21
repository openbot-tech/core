import tulind from 'tulind'

export const removeNumberOfElements = (arr, slice = 0) => (slice !== 0 ? arr.slice(0, slice) : arr)

export const getMarketArguments = (inputNames, marketData, slice) => {
  const OHLCInputs = inputNames
    .reduce((acc, input) => (input in marketData) && [...acc, removeNumberOfElements(marketData[input], slice)], [])
  if (OHLCInputs && OHLCInputs.length > 0) return OHLCInputs
  return [removeNumberOfElements(marketData.close)]
}

export const execute = (indicator, optionArgs, marketData, slice, cb) => {
  if (!(indicator in tulind.indicators)) return new Error('Indicator doesn\'t exist')
  const indicatorArguments = tulind.indicators[indicator]
  if (optionArgs.length !== indicatorArguments.options) return new Error('Amount of option argument doesn\'t match')
  const marketArguments = getMarketArguments(indicatorArguments.input_names, marketData, slice)
  return tulind.indicators[indicator].indicator(marketArguments, optionArgs, cb)
}

export default { ...tulind, execute }
