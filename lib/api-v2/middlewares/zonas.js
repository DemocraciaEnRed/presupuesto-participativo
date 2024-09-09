const api = require('../db-api')

function findWithId (id, req, res, next) {
  api.zonas.find({ _id: id })
    .findOne()
    .exec()
    .then((zona) => {
      if (!zona) return next(new Error404(id))

      req.zona = zona

      next()
    })
    .catch(next)
}

exports.findById = function findById (req, res, next) {
  return findWithId(req.params.id, req, res, next)
}

exports.findFromBody = function findFromBody (req, res, next) {
  return findWithId(req.body.zona, req, res, next)
}

exports.findFromQuery = function findFromBody (req, res, next) {
  return findWithId(req.query.zona, req, res, next)
}

exports.findFromTopic = function findFromTopic (req, res, next) {
  return findWithId(req.topic.zona, req, res, next)
}

class Error404 extends Error {
  constructor (id) {
    super(`Zona ${id} not found.`)

    this.status = 404
    this.code = 'ZONA_NOT_FOUND'
  }
}
