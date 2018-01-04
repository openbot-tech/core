import {
  toMarketDataObject,
  lineIsSlopingUpwards,
} from '.'

describe('Stragedy Utils', () => {
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

  it('should check if the last x elements of a line is sloping upwards minus the last one', () => {
    const arrIsSlopingUpwards = [
      13.907000000000007,
      13.908000000000007,
      13.923100000000009,
      13.933200000000008,
      13.940650000000009,
      13.94025000000001,
    ]

    const arrIsntSlopingUpwards = [
      13.907000000000007,
      13.908000000000007,
      13.923100000000009,
      13.933200000000008,
      13.910650000000009,
      13.92025000000001,
    ]

    const last3ElementsSlopingUpwards = [
      15.908000000000007,
      14.923100000000009,
      13.933200000000008,
      13.940650000000009,
      17.94025000000001,
    ]

    expect(lineIsSlopingUpwards(arrIsSlopingUpwards)).toBeTruthy()
    expect(lineIsSlopingUpwards(arrIsntSlopingUpwards)).toBeFalsy()
    expect(lineIsSlopingUpwards(last3ElementsSlopingUpwards, 3)).toBeTruthy()
  })
})
