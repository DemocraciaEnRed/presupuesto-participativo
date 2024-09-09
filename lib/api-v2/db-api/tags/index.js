const Tag = require('lib/models').Tag

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - mongoose query options
 * @return {Mongoose Query}
 */
function find (query) {
  return Tag.find(Object.assign({
    deletedAt: null
  }, query))
}

exports.find = find
