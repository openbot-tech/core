import talib from 'talib' // eslint-disable-line import/extensions
import { promisify } from 'util'

const execute = promisify(talib.execute)

export default { ...talib, execute }
