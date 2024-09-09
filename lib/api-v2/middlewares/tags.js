const api = require('../db-api')

function findWithId (id, req, res, next) {
  api.tags.find({ _id: id })
    .findOne()
    .exec()
    .then((tag) => {
      if (!tag) return next(new Error404(id))

      req.tag = tag

      next()
    })
    .catch(next)
}

exports.findById = function findById (req, res, next) {
  return findWithId(req.params.id, req, res, next)
}

exports.findFromBody = function findFromBody (req, res, next) {
  return findWithId(req.body.tag, req, res, next)
}

exports.findFromQuery = function findFromBody (req, res, next) {
  return findWithId(req.query.tag, req, res, next)
}

exports.findFromTopic = function findFromTopic (req, res, next) {
  return findWithId(req.topic.tag, req, res, next)
}

class Error404 extends Error {
  constructor (id) {
    super(`Tag ${id} not found.`)

    this.status = 404
    this.code = 'TAG_NOT_FOUND'
  }
}
