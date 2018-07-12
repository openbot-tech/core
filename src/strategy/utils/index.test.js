import { TestScheduler, Observable } from 'rxjs'
import {
  lineIsSlopingUpwards,
  getIndicatorsObservable,
  getEndIdx,
} from '.'

describe('Stragedy Utils', () => {
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
  it('Should return endIdx for indicator', () => {
    const testArr1 = [1, 2, 3]
    const testArr2 = [1]
    const testArr3 = []
    const testArr4 = new Array(45)

    expect(getEndIdx(testArr1)).toBe(1)
    expect(getEndIdx(testArr2)).toBe(0)
    expect(getEndIdx(testArr3)).toBe(0)
    expect(getEndIdx(testArr4)).toBe(43)
  })
  it('should run indicators and return data', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const expected = '(a|)'

    const indicatorSettingsMock = () => [
      { name: 'SMA', optInTimePeriod: 14, data: [14] },
      { name: 'SMA', optInTimePeriod: 28, data: [28] },
    ]

    const marketDataMock = [
      { close: 1 },
    ]

    const indicatorFunctionMock = data => Observable.of(data)

    const expectedMap = {
      a: {
        SMA14: { name: 'SMA14', optInTimePeriod: 14, data: [14] },
        SMA28: { name: 'SMA28', optInTimePeriod: 28, data: [28] },
      },
    }

    const actual$ = getIndicatorsObservable(
      marketDataMock,
      indicatorSettingsMock,
      indicatorFunctionMock,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
  })
})
