const { STATUS_CODES } = require('http')

class ApiError extends Error {
  constructor (status, code, message = null) {
    super(message || STATUS_CODES[status])
    this.status = status
    this.code = code
  }
}

const createError = (
  defaultStatus = 500,
  defaultCode = 'SERVER_ERROR',
  defaultMsg
) => (
  code = defaultCode,
  msg = defaultMsg
) => new ApiError(defaultStatus, code, msg)

exports.ApiError = ApiError
exports.createError = createError

exports.serverError = createError(500, 'SERVER_ERROR')
exports.unauthorized = createError(401, 'UNAUTHORIZED')
exports.forbidden = createError(403, 'FORBIDDEN')
exports.badRequest = createError(400, 'BAD_REQUEST')
exports.notFound = createError(404, 'NOT_FOUND')
