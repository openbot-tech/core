let req = []
const strategies = {}

try {
  req = require.context('.', true, /\.\/[^/]+\/index\.js$/)
  req.keys().forEach((key) => {
    const strategyName = key.replace(/^.+\/([^/]+)\/index\.js/, '$1')
    strategies[strategyName] = req(`${key}`).default
  })
} catch (e) {
  req = {}
}

export default strategies
