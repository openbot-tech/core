import talib from '.'

describe('Stragedy TA', () => {
  it('should promisify execute', () => {
    const promise = talib.execute({
      name: 'SMA',
      inReal: [0],
      startIdx: 0,
      endIdx: 0,
      optInTimePeriod: 0,
    })
    expect(Promise.resolve(promise)).toEqual(promise)
  })
})
