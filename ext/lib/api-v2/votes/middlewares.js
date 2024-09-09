const api = require('lib/api-v2/db-api')


function findWithId (req, res, next, attr, id) {
  api.topics.find({ _id: id })
    .findOne()
    .exec()
    .then((topic) => {
      if (!topic) {
        const err = new Error(`Topic ${id} not found.`)
        err.status = 404
        err.code = 'TOPIC_NOT_FOUND'
        return next(err)
      }
      req.topic = topic
      req[attr] = topic
      next()
    })
    .catch(next)
}

exports.findVoto1FromBody = function findById (req, res, next) {
  findWithId(req, res, next, 'voto1', req.body.voto1)
}

exports.findVoto2FromBody = function findById (req, res, next) {
  if (req.body.voto2){
    findWithId(req, res, next, 'voto2', req.body.voto2)
  } else {
    next()
  }
}
