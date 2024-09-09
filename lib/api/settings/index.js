/**
 * Module dependencies.
 */

var express = require('express')
var log = require('debug')('democracyos:settings')
var t = require('t-component')
var restrict = require('lib/utils').restrict
var User = require('lib/models').User
var api = require('lib/db-api')

/**
 * Exports Application
 */

var app = module.exports = express()

app.post('/settings/profile', restrict, function (req, res, next) {
  var user = req.user
  const proposedDni = req.body.dni
  log('Checking user %s profile DNI', user.id)

  if (user.dni && proposedDni != undefined && user.dni != proposedDni){
    log("Can't change user's DNI (%s != %s)", user.dni, proposedDni)
    return res.status(200).json({ error: 'No se puede cambiar el DNI una vez asignado.' })
  }

  if (!proposedDni){
    log("No DNI found, continue")
    return next()
  }

  // si se envió un DNI y el usuario no tenía uno anteriormente:
  log("Verifying DNI")
  api.padron.isInPadron(proposedDni).then(padron => {
    if (padron) {
      if (padron.user)
        return res.status(200).json({ error: 'Ya hay un usuario registrado con este DNI.' })

      api.padron.updateUserId(proposedDni, user.id).then(() => next())

    } else
      return res.status(200).json({ error: 'Tu DNI no se encuentra en el padrón. Revisá si tu DNI es el correcto o completá <a href="https://docs.google.com/forms/d/e/1FAIpQLSeOWu8y444kkPsuFhA9YO4HTBpyllaRuK2dRdFeVfw3d76pKw/viewform" target="_blank">este formulario</a> con tus datos' })
  })
}, (req, res) => {
  var user = req.user
  const proposedDni = req.body.dni
  log('Updating user %s profile', user.id)

  user.firstName = req.body.firstName
  user.lastName = req.body.lastName
  user.profilePictureUrl = req.body.profilePictureUrl
  user.locale = req.body.locale
  if (proposedDni)
    user.dni = proposedDni

  // Temporarily disable email submission, until we fix the whole flow
  // Also check  ./settings/settings-profile/view.js
  // Fixes https://github.com/DemocracyOS/app/issues/223
  // user.email = req.body.email

  if (user.isModified('email')) {
    log('User must validate new email')
    user.emailValidated = false
  }

  user.save(function (err) {
    if (err) return res.send(500)
    res.send(200)
  })
})

var auth = User.authenticate()
app.post('/settings/password', restrict, function (req, res) {
  var current = req.body.current_password
  var password = req.body.password

  auth(req.user.get('email'), current, function (err, user, info) {
    if (err) return res.status(200).json({ error: t('settings.password-invalid') })
    log('Updating user %s password', user.id)
    user.authenticate(current, function (err, authenticated) {
      if (err) return res.status(500).json({ error: err.message })
      // I have to send a 200 here because FormView can't show the actual error if other response code is sent.
      // This have to be modified with #531 referring to error handling in the backend.
      if (!authenticated) return res.status(200).json({ error: t('settings.password-invalid') })

      user.setPassword(password, function (err) {
        if (err) return res.status(500).json({ error: err.message })

        user.save(function (err) {
          if (err) return res.status(500).json({ error: err.message })
          res.send(200)
        })
      })
    })
  })
})

app.post('/settings/notifications', restrict, function (req, res) {
  log('Updating notifications settings with these new ones %j', req.body)
  var notifications = {}
  notifications.replies = !!req.body.replies
  notifications['new-topic'] = !!req.body['new-topic']
  var user = req.user
  user.notifications = notifications
  user.save(function (err) {
    if (err) return res.send(500)
    res.send(200)
  })
})

app.post('/settings/badges', restrict, function (req, res) {
  if (!req.user.staff) return res.send(401)
  var id = req.body.id

  log('Updating user %s badge', id)

  User
    .findById(id)
    .exec(function (err, user) {
      if (err) {
        log('Found error %j', err)
        return res.send(500)
      }

      log('Delivering User %j', user)
      user.badge = req.body.badge
      user.save(function (err) {
        if (err) return res.send(500)
        res.send(200)
      })
    })
})
