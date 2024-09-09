const Zona = require('lib/models').Zona

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - mongoose query options
 * @return {Mongoose Query}
 */
function find (query) {
  return Zona.find(Object.assign({
    deletedAt: null
  }, query))
}

exports.find = find
