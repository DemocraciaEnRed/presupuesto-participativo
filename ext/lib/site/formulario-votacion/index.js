const express = require('express')

const app = module.exports = express()

app.get('/votacion', require('lib/site/layout'))
app.get('/votacion/*', require('lib/site/layout'))
