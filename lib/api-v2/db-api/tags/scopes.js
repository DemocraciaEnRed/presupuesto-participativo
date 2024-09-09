const expose = require('lib/utils').expose

exports.ordinary = {}

exports.ordinary.keys = {
  expose: [
    'id',
    'hash',
    'name',
  ]

}

exports.ordinary.select = exports.ordinary.keys.expose.concat(
  exports.ordinary.keys.select
).join(' ')

exports.ordinary.expose = expose(exports.ordinary.keys.expose)
