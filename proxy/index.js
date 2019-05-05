const http = require('http')
const https = require('https')
const httpProxy = require('http-proxy')
const pem = require('pem')

pem.createCertificate({ days: 1, selfSigned: true }, (certErr, keys) => {
  if (certErr) {
    throw certErr
  }
  const httpsOptions = {
    key: keys.serviceKey,
    cert: keys.certificate,
  }

  const proxy = httpProxy.createServer({
    ssl: httpsOptions,
    ws: true,
    secure: false,
  })

  const secureServer = https.createServer(httpsOptions, (req, res) => {
    console.log('here here http secure', req.url)
    proxy.web(req, res, { target: 'http://mock:1880' })
  })

  const server = http.createServer((req, res) => {
    console.log('here here http non secure', req.url)

    proxy.web(req, res, { target: 'http://mock:1880' })
  })

  server.on('upgrade', (req, socket, head) => {
    console.log('here here socket', req, socket, head)
    proxy.ws(req, socket, { target: 'ws://mock:1880/signalr' })
  })

  proxy.listen(8010)
  secureServer.listen(8001)
  server.listen(8000)
})
