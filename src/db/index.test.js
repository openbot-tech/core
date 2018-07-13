import { getDBForEnv } from '.'
import { dev, test } from '../config/database.json'

describe('Database', () => {
  it('Should get the right DB for env', async () => {
    expect(getDBForEnv('test')).toBe(test)
    expect(getDBForEnv('other stuff')).toBe(dev)
  })
})
