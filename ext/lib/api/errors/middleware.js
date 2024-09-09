const debug = require('debug')
const { ApiError } = require('.')

const log = debug('democracyos:ext:api:errors')

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err)
  if (!err || !(err instanceof ApiError)) return next(err)

  const status = err.status || 500
  const code = err.code || 'SERVER_ERROR'
  const message = err.message || 'Server Error.'

  const method = (req.method || 'GET').toUpperCase()

  if (status === 500) {
    log(`ERROR ${method} ${req.url}`, err)
  }

  res.status(status).json({
    status,
    error: {
      code: code,
      message: message
    }
  })
}
