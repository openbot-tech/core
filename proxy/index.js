const express = require('express')
const proxy = require('http-proxy-middleware')

const app = express()

app.use('/', proxy({ target: 'http://jsonplaceholder.typicode.com/posts', changeOrigin: true, logLevel: 'debug' }))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(8080)
