/**
 * Module dependencies.
 */

const log = require('debug')('democracyos:api:signup')
var express = require('express')
var config = require('lib/config')
var api = require('lib/db-api')
var jwt = require('lib/jwt')
var l10n = require('lib/l10n')

var setDefaultForum = require('lib/middlewares/forum-middlewares').setDefaultForum
var initPrivileges = require('lib/middlewares/user').initPrivileges
var canCreate = require('lib/middlewares/user').canCreate
var canManage = require('lib/middlewares/user').canManage
var signup = require('./lib/signup')

/**
 * Exports Application
 */

var app = module.exports = express()

/**
 * Define routes for SignUp module
 */

app.post('/signup', function (req, res) {
  var meta = {
    ip: req.ip,
    ips: req.ips,
    host: req.get('host'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    ua: req.get('user-agent')
  }

  var profile = req.body
  profile.locale = config.enforceLocale ? config.locale : l10n.requestLocale(req)

  if(profile.email != profile.re_email){
    return res.status(200).json({ error: 'La direccion de emails no coinciden. Verifique que escribio bien su direccion de correo electronico' })
  }

  api.padron.isInPadron(profile.dni).then(padron => {
    if (padron){
      if (padron.user)
        return res.status(200).json({ error: 'Ya hay un usuario registrado con este DNI.' })

      signup.doSignUp(profile, meta, function (err, data) {
        if (err)
          return res.status(400).json({ error: err.message })

        // en desarrollo ya lo registramos en el padron
        // sino, hay que esperar la validación
        // if (config.env === 'development')
        //   api.padron.updateUserId(profile.dni, data.user._id).then(() =>
        //     res.status(200).send()
        //   )
        // else
        //   return res.status(200).send()
        api.padron.updateUserId(profile.dni, data.user._id).then(() =>
          res.status(200).send()
        )
      })
    } else
      return res.status(200).json({ error: 'Tu DNI no se encuentra en el padrón. Revisá si tu DNI es el correcto o completá <a href="https://docs.google.com/forms/d/e/1FAIpQLSeOWu8y444kkPsuFhA9YO4HTBpyllaRuK2dRdFeVfw3d76pKw/viewform" target="_blank">este formulario</a> con tus datos' })
  })
})

/**
* Populate permissions after setup
*/

function addPrivileges (req, res, next) {
  return jwt.signin(api.user.expose.confidential(req.user), req, res)
}

app.post('/signup/validate', function (req, res, next) {
  signup.emailValidate(req.body, function (err, user) {
    if (err) return res.status(200).json({ error: err.message })
    api.padron.updateUserId(user.dni, user._id).then(() => {
      req.user = user
      return next()
    })
  })
}, initPrivileges, canCreate, setDefaultForum, canManage, addPrivileges)
// app.post('/signup/validate', function (req, res, next) {
//   signup.emailValidate(req.body, function (err, user) {
//     if (err) return res.status(200).json({ error: err.message })
//     req.user = user
//     return next()
//   })
// }, initPrivileges, canCreate, setDefaultForum, canManage, addPrivileges)

app.post('/signup/resend-validation-email', function (req, res) {
  var meta = {
    ip: req.ip,
    ips: req.ips,
    host: req.get('host'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    ua: req.get('user-agent')
  }

  signup.resendValidationEmail(req.body, meta, function (err) {
    if (err) return res.status(200).json({ error: err.message })
    return res.status(200).send()
  })
})
