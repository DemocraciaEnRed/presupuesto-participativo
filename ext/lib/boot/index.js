const express = require('express')

const app = module.exports = express()

require('ext/lib/notifier')
require('ext/lib/privileges')

app.use('/ext/api', require('ext/lib/api'))
app.use('/api/v2', require('ext/lib/api-v2'))
app.use(require('ext/lib/site/boot'))
