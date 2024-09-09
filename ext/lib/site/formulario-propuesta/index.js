const express = require('express')

const app = module.exports = express()

app.get('/formulario-idea', require('lib/site/layout'))
app.get('/formulario-idea/*', require('lib/site/layout'))
