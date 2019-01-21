import {
  isConsolidationPeriod,
  isHighestInPeriod,
} from 'Core/strategy/util'

export const cciIsLessThanMinusHundred = taData => [...taData[0]].pop() < -100

export const rsiIsOverSold = taData => [...taData[0]].pop() < 30

export const rsiIsOverBought = taData => [...taData[0]].pop() > 70

/**
 * stoch is under 20
 * K line is bigger than D line
 */
export const stochIsOverSold = (taData) => {
  const kLine = [...taData[0]].pop()
  const dLine = [...taData[1]].pop()

  const kLineIsLessThan20 = kLine < 20
  const dLineIsLessThan20 = dLine < 20
  const kLineIsBiggerThanDLine = kLine > dLine

  return kLineIsLessThan20 && dLineIsLessThan20 && kLineIsBiggerThanDLine
}

/**
 * stoch is over 80
 * K line is lower than D line
 */
export const stochIsOverBought = (taData) => {
  const kLine = [...taData[0]].pop()
  const dLine = [...taData[1]].pop()

  const kLineIsBiggerThan80 = kLine > 80
  const dLineIsBiggerThan80 = dLine > 80
  const kLineIsLessThanDLine = kLine < dLine

  return kLineIsBiggerThan80 && dLineIsBiggerThan80 && kLineIsLessThanDLine
}

const CONSOLIDATION_ZONE_LENGTH = 100
const CHANGE_BETWEEN_VALUES_IN_CONDOLIDATION = 3

export const obvIsOverSold = (
  taData,
  consolidationZoneLength = CONSOLIDATION_ZONE_LENGTH,
  consolidationPercentageChange = CHANGE_BETWEEN_VALUES_IN_CONDOLIDATION,
) => {
  const data = taData[0]
  return isConsolidationPeriod(data, consolidationZoneLength, consolidationPercentageChange) &&
    isHighestInPeriod(data, consolidationZoneLength)
}

export const smaIsOverSold = (taData, close) => [...taData[0]].pop() < close

export const smaIsOverBought = (taData, close) => [...taData[0]].pop() > close

export const mfiIsOverSold = taData => [...taData[0]].pop() < 20

export const mfiIsOverBought = taData => [...taData[0]].pop() > 80

export const bbandsIsOverSold = (taData, close) => [...taData[0]].pop() > close

export const bbandsIsOverBought = (taData, close) => [...taData[2]].pop() < close
