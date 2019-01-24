import { TestScheduler, Observable } from 'rxjs'
import tulind from 'tulind'
import { toMarketDataObject } from 'Util/parser'
import marketData from './marketData'
import {
  lineIsSlopingUpwards,
  getIndicatorsObservable,
  getPercentageDifference,
  createTAResult,
  getLastElements,
  isConsolidationPeriod,
  isHighestInPeriod,
  createSocketObject,
  createIndicatorName,
  runIndicatorsAndStrategyFunc,
} from '.'

describe('Core/strategy/util', () => {
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
  it('should run indicators and return data with mock observable', () => {
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const expected = '(a|)'

    const indicatorSettingsMock = marketDataParam => [
      ['stoch', [5, 3, 3], marketDataParam],
      ['rsi', [7], marketDataParam],
    ]

    const marketDataMock = [1, 2, 3, 4]

    // just check that first param is what we expect (indicator name)
    const indicatorFunctionMock = (...indicatorData) => Observable.of(indicatorData[2])

    const expectedMap = {
      a: {
        rsi7: [1, 2, 3, 4],
        stoch533: [1, 2, 3, 4],
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
  it('should run indicators and return data', async () => {
    expect.assertions(4)
    const marketDataObj = toMarketDataObject(marketData)
    const indicatorSettingsLong = marketDataParam => [
      ['cci', [7], marketDataParam],
    ]
    const indicatorSettingsShort = marketDataParam => [
      ['cci', [7], marketDataParam, -1],
    ]
    const indicatorsDataLong = await getIndicatorsObservable(marketDataObj, indicatorSettingsLong).toPromise()
    const indicatorsDataShort = await getIndicatorsObservable(marketDataObj, indicatorSettingsShort).toPromise()

    expect(indicatorsDataLong.cci7[0].length).toBe(29)
    expect(indicatorsDataShort.cci7[0].length).toBe(28)

    expect(indicatorsDataLong.cci7[0][27] === indicatorsDataShort.cci7[0][27]).toBeTruthy()
    expect(indicatorsDataLong.cci7[0].length > indicatorsDataShort.cci7[0].length).toBeTruthy()
  })
  it('Should return percentage difference', () => {
    expect(getPercentageDifference(1, 100)).toBe(9900)
    expect(getPercentageDifference(99, 97)).toBe(-2.0202020202020203)
    expect(getPercentageDifference(0, 97)).toBe(0)
    expect(getPercentageDifference(10, 0)).toBe(0)
    expect(getPercentageDifference(0, 0)).toBe(0)
  })
  it('Should create a mock TA result for test', () => {
    expect(createTAResult('CCI5', { outReal: [-80, -90, -101] }))
      .toEqual({ CCI5: { outReal: [-80, -90, -101] } })
    expect(createTAResult(
      'BBANDS20',
      {
        outRealUpperBand: [0.079999, 0.079999, 0.079999],
        outRealMiddleBand: [0.079986, 0.079986, 0.079984],
        outRealLowerBand: [0.079981, 0.079983, 0.079982],
      },
    )).toEqual({
      BBANDS20: {
        outRealUpperBand: [0.079999, 0.079999, 0.079999],
        outRealMiddleBand: [0.079986, 0.079986, 0.079984],
        outRealLowerBand: [0.079981, 0.079983, 0.079982],
      },
    })
  })
  it('Should return last n elements from array', () => {
    expect(getLastElements(0, [1, 2])).toEqual([1, 2])
    expect(getLastElements(1, [1, 2])).toEqual([2])
    expect(getLastElements(2, [1, 2])).toEqual([1, 2])
    expect(getLastElements(1, [1, 2])).toEqual([2])
    expect(getLastElements(2, [1, 2, 3, 4])).toEqual([3, 4])
    expect(getLastElements(4, [1, 2, 3, 4, 5, 6, 7, 8])).toEqual([5, 6, 7, 8])
    expect(getLastElements(2, [1, 2, 3, 4, 5, 6, 7, 8])).toEqual([7, 8])
    expect(getLastElements(3, [1, 2, 3, 4, 5, 6, 7, 8])).toEqual([6, 7, 8])
  })
  it('Should return true or false if a consolidation period is found', () => {
    expect(isConsolidationPeriod([-3010], 1, 2)).toBeTruthy()
    expect(isConsolidationPeriod([-3010, -3000], 1, 2)).toBeTruthy()
    expect(isConsolidationPeriod([-3010, -3020, -3060, -3000], 4, 2)).toBeTruthy()
    expect(isConsolidationPeriod([-3010, -3020, -3090, -3000], 4, 2)).toBeFalsy()
    expect(isConsolidationPeriod([-3000, -3090, -3000, -3000], 2, 2)).toBeTruthy()
  })
  it('Should return true or false if last value is highest in period', () => {
    expect(isHighestInPeriod([3010], 1)).toBeTruthy()
    expect(isHighestInPeriod([3010, 3000], 1, 2)).toBeTruthy()
    expect(isHighestInPeriod([3010, 3020, 3060, 3090], 4)).toBeTruthy()
    expect(isHighestInPeriod([3010, 3020, 3090, 3000], 4)).toBeFalsy()
    expect(isHighestInPeriod([3000, 3090, 3000, 3000], 2)).toBeFalsy()
    expect(isHighestInPeriod([3000, 3090, 3000, 3080], 2)).toBeTruthy()
  })
  it('Should create variable name for indicator', () => {
    expect(createIndicatorName('stoch', [5, 3, 3])).toBe('stoch533')
    expect(createIndicatorName('cci', [14])).toBe('cci14')
  })

  it('Should return object for socket client', () => {
    const marketMockData = { low: [1] }
    const indicatorsMock = () => [['rsi', [7]], ['stoch', [5, 3, 3]], ['cci', [14]]]
    const indicatorsDataMock = { rsi7: [[1]], stoch533: [[1], [2]], cci14: [[2]] }
    const signal = { type: 'buy' }
    const expectedData = {
      marketData: marketMockData,
      indicatorData: [{
        name: 'rsi',
        indicatorName: 'rsi7',
        indicatorOptions: [7],
        full_name: 'Relative Strength Index',
        type: 'indicator',
        inputs: 1,
        options: 1,
        outputs: 1,
        input_names: ['real'],
        option_names: ['period'],
        output_names: ['rsi'],
        indicator: tulind.indicators.rsi.indicator,
        start: 7,
        data: [[1]],
      },
      {
        name: 'stoch',
        indicatorName: 'stoch533',
        indicatorOptions: [5, 3, 3],
        full_name: 'Stochastic Oscillator',
        type: 'indicator',
        inputs: 3,
        options: 3,
        outputs: 2,
        input_names: ['high', 'low', 'close'],
        option_names: ['%k period', '%k slowing period', '%d period'],
        output_names: ['stoch_k', 'stoch_d'],
        indicator: tulind.indicators.stoch.indicator,
        start: 8,
        data: [[1], [2]],
      },
      {
        name: 'cci',
        indicatorName: 'cci14',
        indicatorOptions: [14],
        full_name: 'Commodity Channel Index',
        type: 'indicator',
        inputs: 3,
        options: 1,
        outputs: 1,
        input_names: ['high', 'low', 'close'],
        option_names: ['period'],
        output_names: ['cci'],
        indicator: tulind.indicators.cci.indicator,
        start: 26,
        data: [[2]],
      },
      ],
    }
    const expectedDataWithSignal = {
      marketData: marketMockData,
      signal: 'buy',
      indicatorData: [{
        name: 'rsi',
        indicatorName: 'rsi7',
        indicatorOptions: [7],
        full_name: 'Relative Strength Index',
        type: 'indicator',
        inputs: 1,
        options: 1,
        outputs: 1,
        input_names: ['real'],
        option_names: ['period'],
        output_names: ['rsi'],
        indicator: tulind.indicators.rsi.indicator,
        start: 7,
        data: [[1]],
      },
      {
        name: 'stoch',
        indicatorName: 'stoch533',
        indicatorOptions: [5, 3, 3],
        full_name: 'Stochastic Oscillator',
        type: 'indicator',
        inputs: 3,
        options: 3,
        outputs: 2,
        input_names: ['high', 'low', 'close'],
        option_names: ['%k period', '%k slowing period', '%d period'],
        output_names: ['stoch_k', 'stoch_d'],
        indicator: tulind.indicators.stoch.indicator,
        start: 8,
        data: [[1], [2]],
      },
      {
        name: 'cci',
        indicatorName: 'cci14',
        indicatorOptions: [14],
        full_name: 'Commodity Channel Index',
        type: 'indicator',
        inputs: 3,
        options: 1,
        outputs: 1,
        input_names: ['high', 'low', 'close'],
        option_names: ['period'],
        output_names: ['cci'],
        indicator: tulind.indicators.cci.indicator,
        start: 26,
        data: [[2]],
      },
      ],
    }
    expect(createSocketObject(marketMockData, indicatorsMock, indicatorsDataMock))
      .toEqual(expectedData)
    expect(createSocketObject(marketMockData, indicatorsMock, indicatorsDataMock, signal))
      .toEqual(expectedDataWithSignal)
  })
  it('should run indicators and run return data on strategy functions and return result', () => {
    const socketMock = { emit: jest.fn() }
    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b))
    // setup
    const indicatorsMarble = 'x--y--z'
    const expected = 'a--b--c'

    const indicatorSettingsMock = marketDataParam => [
      ['stoch', [5, 3, 3], marketDataParam],
      ['rsi', [7], marketDataParam],
    ]

    const marketDataMock = [1, 2, 3, 4]

    const indicatorsInput = {
      x: {
        rsi7: [1, 2, 3, 4],
        stoch533: [1, 2, 3, 4],
      },
      y: {
        rsi7: [1, 2, 3],
        stoch533: [1, 2, 3],
      },
      z: {
        rsi7: [1, 2, 3, 4, 5],
        stoch533: [1, 2, 3, 4, 5],
      },
    }

    const expectedMap = {
      a: { type: 'buy' },
      b: { type: 'sell' },
      c: { type: 'sell' },
    }

    const indicator$ = testScheduler.createColdObservable(indicatorsMarble, indicatorsInput)

    const indicatorMockFunc = () => indicator$

    const buyMockFunc = indicators => (indicators.rsi7.length === 4 || indicators.rsi7.length === 5
      ? { type: 'buy' }
      : false)

    const sellMockFunc = indicators => (indicators.rsi7.length === 3 || indicators.rsi7.length === 5
      ? { type: 'sell' }
      : false)

    const actual$ = runIndicatorsAndStrategyFunc(
      marketDataMock,
      undefined,
      socketMock,
      indicatorSettingsMock,
      buyMockFunc,
      sellMockFunc,
      indicatorMockFunc,
    )

    testScheduler.expectObservable(actual$).toBe(expected, expectedMap)
    testScheduler.flush()
    expect(socketMock.emit).toHaveBeenCalled()
  })
})
