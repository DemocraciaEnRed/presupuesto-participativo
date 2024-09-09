const debug = require('debug')
const express = require('express')
const validate = require('lib/api-v2/validate')
const errorsMiddleware = require('./errors/middleware')

const log = debug('democracyos:ext:api')

const app = module.exports = express()

app.all('*', function apiLog (req, res, next) {
  log(`${req.method.toUpperCase()} ${req.app.mountpath}${req.url}`)
  next()
})

app.use(require('./feed'))
app.use(require('./topics'))

app.use(function validationErrorHandler (err, req, res, next) {
  if (res.headersSent) return next(err)
  if (!(err instanceof validate.SchemaValidationError)) return next(err)

  res.status(400).json({
    status: 400,
    error: {
      code: 'INVALID_REQUEST_PARAMS',
      message: err.message || 'Invalid request parameters.',
      info: err.errors
    }
  })
})

app.use(errorsMiddleware)

app.use(function apiError (err, req, res, next) {
  if (res.headersSent) return next(err)

  const status = err.status || 500
  const code = err.code || 'SERVER_ERROR'
  const message = err.message || 'Server Error.'

  const method = (req.method || 'GET').toUpperCase()

  if (status === 500) {
    log(`ERROR ${method} ${req.url}`, err)
  }

  res.status(status).json({
    status: status,
    error: {
      code: code,
      message: message
    }
  })
})
