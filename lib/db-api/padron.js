const debug = require('debug')
const log = debug('democracyos:db-api:padron')

const utils = require('lib/utils')
const pluck = utils.pluck

const Padron = require('lib/models').Padron
const { ObjectID } = require('mongodb')

exports.isInPadron = (dni) => {
  log('Looking padron for %s', dni)

  // devulve null si no está y el padron entero si sí está
  return Padron.findOne({dni}).then(padron => {
    if (padron)
      log('Padron found %j', padron)
    else
      log('Padron not found')
    return padron
  })
}
exports.isDNIPadron = (dni) => {
  log('Looking padron for DNI %j', dni)

  const query = {
    dni: dni
  }
  // devulve null si no está y el padron entero si sí está
  return Padron.findOne(query).populate('user').populate('zona').then(padron => {
    if (padron)
      log('Padron found %j', padron)
    else
      log('Padron not found')
    return padron
  })
}

exports.updateUserId = (dni, userId) => {
  log('Updating padron dni %s with user %s', dni, userId)

  // devulve null si no está y el padron entero si sí está
  return Padron.findOne({dni: dni}).then(padron => {
    if (!padron)
      throw new Error(`Padron dni ${dni} not found`)
    if (padron.user)
      throw new Error(`Padron dni ${dni} already has a user ${padron.user}`)
    padron.user = new ObjectID(userId)
    padron.save()
    log('Updated padron dni %s with user %s', dni, userId)
    return padron
  })
}

exports.create = function create(data, fn) {
  log('Creating new padron')

  let payload = {
    dni: data.dni,
  }
  var padron = new Padron(payload)
  padron.save(function (err) {
    if (err) {
      log('Found error: %s', err)
      return fn(err)
    }

    log('Saved padron with dni %s', data.dni)
    fn(null, data)
  })
}

exports.setVoted = function setVoted(dni, fn) {
  log('Saving voted:true to dni %s', dni)

  return Padron.findOne({ dni: dni }).then((padron) => {
    if (!padron) {
      throw new Error(`Padron dni ${dni} not found`)
    }
    padron.voted = true
    padron.save()
    log('Updated padron dni %s', dni)
    return padron
  })
}

exports.getAll = () => {
  log('Getting all the padron')
  return Padron.find({}).populate(['user'])
}
