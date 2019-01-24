import { createTAResult } from 'Core/strategy/util'
import {
  cciIsLessThanMinusHundred,
  rsiIsOverSold,
  rsiIsOverBought,
  stochIsOverBought,
  stochIsOverSold,
  obvIsOverSold,
  smaIsOverSold,
  smaIsOverBought,
  mfiIsOverSold,
  mfiIsOverBought,
  bbandsIsOverSold,
  bbandsIsOverBought,
} from '.'

describe('Core/strategy/triggers', () => {
  it('should be true if CCI is less than minus 100', async () => {
    const CCIMockData = createTAResult('CCI100', [[20, 28, 31]])
    const CCIMockDataMinusHundred = createTAResult('CCI100', [[20, 28, -100]])
    const CCIMockDataLessThanMinusHundred = createTAResult('CCI100', [[20, 28, -120]])
    expect(cciIsLessThanMinusHundred(CCIMockData.CCI100)).toBeFalsy()
    expect(cciIsLessThanMinusHundred(CCIMockDataMinusHundred.CCI100)).toBeFalsy()
    expect(cciIsLessThanMinusHundred(CCIMockDataLessThanMinusHundred.CCI100)).toBeTruthy()
  })
  it('should be true if RSI is oversold', async () => {
    const RSIMockData = createTAResult('RSI14', [[20, 28, 31]])
    const RSIMockDataMinusHundred = createTAResult('RSI14', [[20, 28, 30]])
    const RSIMockDataLessThanMinusHundred = createTAResult('RSI14', [[20, 28, 29]])
    expect(rsiIsOverSold(RSIMockData.RSI14)).toBeFalsy()
    expect(rsiIsOverSold(RSIMockDataMinusHundred.RSI14)).toBeFalsy()
    expect(rsiIsOverSold(RSIMockDataLessThanMinusHundred.RSI14)).toBeTruthy()
  })
  it('should be true if RSI is overbought', async () => {
    const RSIMockData = createTAResult('RSI14', [[20, 28, 31]])
    const RSIMockData2 = createTAResult('RSI14', [[20, 28, 70]])
    const RSIMockData3 = createTAResult('RSI14', [[20, 28, 71]])
    expect(rsiIsOverBought(RSIMockData.RSI14)).toBeFalsy()
    expect(rsiIsOverBought(RSIMockData2.RSI14)).toBeFalsy()
    expect(rsiIsOverBought(RSIMockData3.RSI14)).toBeTruthy()
  })
  it('should be true if STOCH is oversold', async () => {
    const STOCHMockData = createTAResult('STOCH5', [[20, 28, 31], [20, 28, 32]])
    const STOCHMockData2 = createTAResult('STOCH5', [[20, 19, 18], [20, 28, 19]])
    const STOCHMockData3 = createTAResult('STOCH5', [[20, 19, 20], [20, 28, 19]])
    const STOCHMockData4 = createTAResult('STOCH5', [[20, 19, 19], [20, 28, 18]])
    expect(stochIsOverSold(STOCHMockData.STOCH5)).toBeFalsy()
    expect(stochIsOverSold(STOCHMockData2.STOCH5)).toBeFalsy()
    expect(stochIsOverSold(STOCHMockData3.STOCH5)).toBeFalsy()
    expect(stochIsOverSold(STOCHMockData4.STOCH5)).toBeTruthy()
  })
  it('should be true if STOCH is overbought', async () => {
    const STOCHMockData = createTAResult('STOCH5', [[20, 28, 32], [20, 28, 31]])
    const STOCHMockData2 = createTAResult('STOCH5', [[20, 19, 82], [20, 28, 81]])
    const STOCHMockData3 = createTAResult('STOCH5', [[20, 19, 80], [20, 28, 81]])
    const STOCHMockData4 = createTAResult('STOCH5', [[20, 19, 81], [20, 28, 82]])
    expect(stochIsOverBought(STOCHMockData.STOCH5)).toBeFalsy()
    expect(stochIsOverBought(STOCHMockData2.STOCH5)).toBeFalsy()
    expect(stochIsOverBought(STOCHMockData3.STOCH5)).toBeFalsy()
    expect(stochIsOverBought(STOCHMockData4.STOCH5)).toBeTruthy()
  })
  it('should be true if OBV is oversold', async () => {
    const STOCHMockData = createTAResult('OBV', [[-3010, -3020, -3060, -3000]])
    const STOCHMockDataPriceDifference = createTAResult('OBV', [[-3010, -3020, -3090, -3000]])
    const STOCHMockDataLastValueNotHighest = createTAResult('OBV', [[-3010, -3020, -3090, -3020]])
    expect(obvIsOverSold(STOCHMockData.OBV, 4, 2)).toBeTruthy()
    expect(obvIsOverSold(STOCHMockDataPriceDifference.OBV, 4, 2)).toBeFalsy()
    expect(obvIsOverSold(STOCHMockDataLastValueNotHighest.OBV, 4, 2)).toBeFalsy()
  })
  it('should be true if SMA is overbought', async () => {
    const SMAMockDataOverSold = createTAResult('SMA', [[2, 3, 4, 4]])
    const SMAMockDataNotOverSold = createTAResult('SMA', [[2, 3, 4, 4]])
    expect(smaIsOverBought(SMAMockDataOverSold.SMA, 3)).toBeTruthy()
    expect(smaIsOverBought(SMAMockDataNotOverSold.SMA, 4)).toBeFalsy()
    expect(smaIsOverBought(SMAMockDataNotOverSold.SMA, 5)).toBeFalsy()
  })
  it('should be true if SMA is oversold', async () => {
    const SMAMockDataOverSold = createTAResult('SMA', [[4, 3, 2, 2]])
    const SMAMockDataNotOverSold = createTAResult('SMA', [[4, 3, 2, 3]])
    expect(smaIsOverSold(SMAMockDataOverSold.SMA, 3)).toBeTruthy()
    expect(smaIsOverSold(SMAMockDataNotOverSold.SMA, 3)).toBeFalsy()
    expect(smaIsOverSold(SMAMockDataNotOverSold.SMA, 2)).toBeFalsy()
  })
  it('should be true if RSI is oversold', async () => {
    const MFIMockData = createTAResult('MFI8', [[20, 28, 21]])
    const MFIMockDataNotOverSold = createTAResult('MFI8', [[20, 28, 20]])
    const MFIMockDataOverSold = createTAResult('MFI8', [[20, 28, 19]])
    expect(mfiIsOverSold(MFIMockData.MFI8)).toBeFalsy()
    expect(mfiIsOverSold(MFIMockDataNotOverSold.MFI8)).toBeFalsy()
    expect(mfiIsOverSold(MFIMockDataOverSold.MFI8)).toBeTruthy()
  })
  it('should be true if RSI is overbought', async () => {
    const MFIMockData = createTAResult('MFI8', [[20, 28, 60]])
    const MFIMockDataNotOverBought = createTAResult('MFI8', [[20, 28, 80]])
    const MfiMockDataOverBought = createTAResult('MFI8', [[20, 28, 81]])
    expect(mfiIsOverBought(MFIMockData.MFI8)).toBeFalsy()
    expect(mfiIsOverBought(MFIMockDataNotOverBought.MFI8)).toBeFalsy()
    expect(mfiIsOverBought(MfiMockDataOverBought.MFI8)).toBeTruthy()
  })
  it('should be true if BBANDS is oversold', async () => {
    const BBANDSMockData = createTAResult('BBANDS202', [[20, 28, 60]])
    const BBAMNDSMockDataNotOverBought = createTAResult('BBANDS202', [[20, 28, 80]])
    const BBANDSMockDataOverBought = createTAResult('BBANDS202', [[20, 28, 81]])
    expect(bbandsIsOverSold(BBANDSMockData.BBANDS202, 70)).toBeFalsy()
    expect(bbandsIsOverSold(BBAMNDSMockDataNotOverBought.BBANDS202, 80)).toBeFalsy()
    expect(bbandsIsOverSold(BBANDSMockDataOverBought.BBANDS202, 80)).toBeTruthy()
  })
  it('should be true if BBANDS is overbought', async () => {
    const BBANDSMockData = createTAResult('BBANDS202', [[20, 28, 60], [20, 28, 60], [20, 28, 60]])
    const BBAMNDSMockDataNotOverBought = createTAResult('BBANDS202', [[20, 28, 80], [20, 28, 80], [20, 28, 80]])
    const BBANDSMockDataOverBought = createTAResult('BBANDS202', [[20, 28, 81], [20, 28, 80], [20, 28, 80]])
    expect(bbandsIsOverBought(BBANDSMockData.BBANDS202, 50)).toBeFalsy()
    expect(bbandsIsOverBought(BBAMNDSMockDataNotOverBought.BBANDS202, 80)).toBeFalsy()
    expect(bbandsIsOverBought(BBANDSMockDataOverBought.BBANDS202, 88)).toBeTruthy()
  })
})
