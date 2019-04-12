import moment from 'moment'
import { candleQuery } from 'Util/db'
import { newSession, SESSION_ID } from '.'
import 'Util/db/testSetup'

describe('Config', () => {
  it('should return a new session if no candles', async () => {
    expect.assertions(2)
    await newSession('testSession')
    const firstSessionId = SESSION_ID
    expect(typeof firstSessionId).toEqual('number')
    await newSession('testSession')
    expect(SESSION_ID).toBeGreaterThan(firstSessionId)
  })
  it('should return the same session id if candle less than on minute old with same settings', async () => {
    const params = ['testsession', 'BTC-ETH', 60, false, false, 'DOUBLE_EMA', 60]
    expect.assertions(2)
    await newSession(...params)
    const firstSessionId = SESSION_ID
    expect(typeof firstSessionId).toEqual('number')
    await candleQuery([SESSION_ID, moment().toDate(), 1, 1, 1, 1, 1])
    await newSession(...params)
    expect(SESSION_ID).toEqual(firstSessionId)
  })
  it('should not return the same session id if candle less than on minute old with different settings', async () => {
    const params = ['testsession', 'BTC-ETH', 60, false, false, 'DOUBLE_EMA', 60]
    expect.assertions(2)
    await newSession(...params)
    const firstSessionId = SESSION_ID
    expect(typeof firstSessionId).toEqual('number')
    await candleQuery([SESSION_ID, moment().toDate(), 1, 1, 1, 1, 1])
    await newSession('newName')
    expect(SESSION_ID).toBeGreaterThan(firstSessionId)
  })
  it('should not return the same session id if candle more than on minute old with same settings', async () => {
    const params = ['testsession', 'BTC-ETH', 60, false, false, 'DOUBLE_EMA', 60]
    expect.assertions(2)
    await newSession(...params)
    const firstSessionId = SESSION_ID
    expect(typeof firstSessionId).toEqual('number')
    await candleQuery([SESSION_ID, moment().subtract(65, 'seconds').toDate(), 1, 1, 1, 1, 1])
    await newSession(...params)
    expect(SESSION_ID).toBeGreaterThan(firstSessionId)
  })
})
