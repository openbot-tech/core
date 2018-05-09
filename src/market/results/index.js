import { Observable } from 'rxjs'
import chalk from 'chalk'
import { SESSION_ID } from '../../config'
import { resultsQuery } from '../../db'

export const resultsQueryObservable = sessionId => Observable.fromPromise(resultsQuery([sessionId]))

const logResult = result => (result < 0 ? chalk.red(result) : chalk.green(result))

// because 1*(1+1)*(1-0.1) = 1.8
export const totalResult = (results) => {
  const result = results.reduce((acc, percentageResult) => acc * (1 + (percentageResult / 100)), 1)
  const resultInPercentage = (result * 100) - 100
  console.log('total result: ', logResult(resultInPercentage)) // eslint-disable-line no-console
  return resultInPercentage
}

export const tradeResult = (resultPair) => {
  const currentNumber = resultPair.length > 0 && resultPair[0].type === 'buy' && resultPair[0].close
  const newNumber = resultPair.length > 1 && resultPair[1].type === 'sell' && resultPair[1].close
  const result = ((newNumber - currentNumber) / currentNumber) * 100.0
  console.log('trade result: ', logResult(result)) // eslint-disable-line no-console
  return result
}

const getResults = (resultsObservable = resultsQueryObservable(SESSION_ID)) => (
  resultsObservable
    .flatMap(resultsData => Observable.from(resultsData))
    .pairwise()
    .filter(resultPair => resultPair.length > 0 && resultPair[0].type !== 'sell')
    .reduce((resultAcc, resultPair) => [...resultAcc, tradeResult(resultPair)], [])
    .map(totalResults => totalResult(totalResults))
)

export default getResults
