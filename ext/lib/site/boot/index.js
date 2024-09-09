const express = require('express')

const app = module.exports = express()

require('../layout')
app.use(require('../static-pages'))
app.use(require('../formulario-propuesta'))
app.use(require('../formulario-votacion'))
