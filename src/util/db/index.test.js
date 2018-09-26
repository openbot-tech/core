import { dev, test } from 'Config/database.json'
import { getDBForEnv } from '.'

describe('Database', () => {
  it('Should get the right DB for env', async () => {
    expect(getDBForEnv('test')).toBe(test)
    expect(getDBForEnv('other stuff')).toBe(dev)
  })
})
