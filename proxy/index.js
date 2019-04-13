const https = require('https')
const httpProxy = require('http-proxy')
const pem = require('pem')

pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
  if (err) {
    throw err
  }
  const httpsOptions = {
    key: keys.serviceKey,
    cert: keys.certificate,
  }

  httpProxy.createServer({
    target: 'https://localhost:8001',
    ssl: httpsOptions,
    changeOrigin: true,
    secure: true,
  }).listen(8010)

  https.createServer(httpsOptions, (req, res) => {
    console.log('here here')
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('hello https\n')
    res.end()
  }).listen(8001)
})
