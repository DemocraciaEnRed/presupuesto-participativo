const debug = require('debug')
const log = debug('democracyos:db-api:eje')

const utils = require('lib/utils')
const pluck = utils.pluck

const Eje = require('lib/models').Eje

exports.all = function all (fn) {
  log('Looking for all ejes.')

  Eje
    .find()
    .select('-__v')
    .sort('nombre')
    .exec(function (err, objs) {
      if (err) {
        log('Found error %j', err)
        return fn(err)
      }

      log('Delivering all ejes %o', pluck(objs, 'nombre'))
      fn(null, objs)
    })
  return this
}

exports.get = function get (id) {
  log('Looking for Eje with id %s', id)

  return Eje
    .findById(id)
    .catch(err => log('Found error %j', err))
    .then(obj => {
      log('Delivering Eje %j', obj)
      return obj
    })
}
