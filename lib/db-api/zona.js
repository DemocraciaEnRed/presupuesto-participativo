const debug = require('debug')
const log = debug('democracyos:db-api:zona')

const utils = require('lib/utils')
const pluck = utils.pluck

const Zona = require('lib/models').Zona

exports.all = function all (fn) {
  log('Looking for all zonas.')

  Zona
    .find()
    .sort('nombre')
    .exec(function (err, objs) {
      if (err) {
        log('Found error %j', err)
        return fn(err)
      }

      log('Delivering all zonas %o', pluck(objs, 'nombre'))
      fn(null, objs)
    })
  return this
}

exports.get = function get (id, opts) {
  opts = opts || {}
  const {noLog} = opts
  if (!noLog)
    log('Looking for Zona with id %s', id)

  return Zona
    .findById(id)
    .catch(err => log('Found error %j', err))
    .then(obj => {
      if (!noLog)
        log('Delivering Zona %j', obj)
      return obj
    })
}


exports.expose = {}

/**
 * Expose zona attributes to be used on a private manner.
 *
 * @param {Zona} zona.
 * @return {Hash} zona attributes
 * @api public
 */

exports.expose.confidential = function exposeConfidential (zona) {
  return expose(exports.expose.confidential.keys)(zona)
}

exports.expose.confidential.keys = [
  'id',
  'nombre',
]

/**
 * Expose zona attributes to be used publicly.
 * e.g.: Search calls, zonas listings.
 *
 * @param {Zona} zona.
 * @return {Hash} zona attributes
 * @api public
 */

exports.expose.ordinary = function exposeOrdinary (zona) {
  return expose(exports.expose.ordinary.keys)(zona)
}

exports.expose.confidential.keys = [
  'id',
  'nombre',
]

exports.getAll = () => {
  log('Getting claustros')
  return Zona.find({})
}
