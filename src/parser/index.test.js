import {
  toMarketDataObject,
  toArrayOfArraysData,
} from '.'

describe('Parser', () => {
  it('should convert array market data to an object containing arrays', () => {
    const marketDataArr = [
      [
        1514315520,
        15868.76,
        15868.77,
        15850.01,
        15854.51,
        22.70132,
        359945.25,
      ],
      [
        1514315700,
        15854.5,
        15854.5,
        15795,
        15795.02,
        27.408403,
        433701.6,
      ],
      [
        1514315880,
        15795.03,
        15795.03,
        15795.02,
        15795.03,
        10.470616,
        165383.56,
      ],
    ]
    const expectedmarketDataObject = {
      date: [1514315520, 1514315700, 1514315880],
      open: [15868.76, 15854.5, 15795.03],
      close: [15854.51, 15795.02, 15795.03],
      high: [15868.77, 15854.5, 15795.03],
      low: [15850.01, 15795, 15795.02],
      volume: [22.70132, 27.408403, 10.470616],
    }
    expect(toMarketDataObject(marketDataArr)).toEqual(expectedmarketDataObject)
  })
  it('should convert array database data to an array of arrays', () => {
    const dbDataArr = [{
      close: '0.0925',
      close_time: '2018-01-24T19:09:03.063',
      high: '0.0925',
      low: '0.0925',
      open: '0.0925',
      volume: '1',
    },
    {
      close: '0.0926',
      close_time: '2018-01-24T19:10:03.063',
      high: '0.0926',
      low: '0.0926',
      open: '0.0926',
      volume: '2',
    }]
    const expectedDataObject = [
      [1516817343, 0.0925, 0.0925, 0.0925, 0.0925, 1],
      [1516817403, 0.0926, 0.0926, 0.0926, 0.0926, 2],
    ]
    expect(toArrayOfArraysData(dbDataArr)).toEqual(expectedDataObject)
  })
})
