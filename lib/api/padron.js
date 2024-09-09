const debug = require('debug')
const log = debug('democracyos:api:padron')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var staff = utils.staff
var maintenance = utils.maintenance
const middlewares = require('lib/api-v2/middlewares')

const dbApi = require('lib/db-api')
const { db } = require('democracyos-notifier')

const app = module.exports = express.Router()

app.get('/padron/search/full',
  restrict,
  staff,
  function (req, res) {
    const dni = req.query.dni
    const escuela = req.query.escuela

    log('Getting padron with dni %s', `${dni}`)

    dbApi.padron.isInPadron(dni).then(padron => {
      if (padron) {
        log('Serving padron')
        res.status(200).json(padron)
      } else {
        log('No padron found')
        res.status(200).json({})
      }
    })
  })

app.get('/padron/search/dni',
  restrict,
  middlewares.forums.findByName,
  middlewares.forums.privileges.canEdit,
  // function (req, res) {
  //   const dni = req.query.dni

  //   log('Getting padron with DNI %s', dni)

  //   dbApi.padron.isDNIPadron(dni).then(padron => {
  //     if (padron) {
  //       log('Serving padron')
  //       res.status(200).json(padron)
  //     } else {
  //       log('No padron found')
  //       res.status(200).json({})
  //     }
  //   })
  // })
  function (req, res, next) {
    const dni = req.query.dni

    log('Getting padron with DNI %s', dni)

    dbApi.padron.isDNIPadron(dni).then(padron => {
      if (padron) {
        log('Serving padron')
        req.padron = padron
        next()
      } else {
        log('No padron found')
        res.status(200).json({})
      }
    })
  },
  function (req, res, next) {
    let padron = req.padron.toJSON()
    console.log(padron)
    if (padron.user) {
      dbApi.topic.searchTopicsByOwner(padron.user._id, (err, topics) => {
        if (err) {
          return next(err)
        }
        padron.topics = topics
        log('Serving padron')
        res.status(200).json(padron)
      })
    } else {
      padron.topics = []
      log('Serving padron')
      res.status(200).json(padron)
    }
  }
)

app.post('/padron/new',
  restrict,
  staff,
  function (req, res, next) {

    // dbApi.escuela.get(req.body.escuela).then(escuela => {
    //   if (escuela) {
    //     log('Found escuela')
    //     const payload = {
    //       dni: req.body.dni,
    //       escuela: escuela
    //     }
    //     dbApi.padron.create(payload, (err, newPadron) => {
    //       if (err) return next(err)
    //       log('OK! New entry in padron')
    //       // var keys = [
    //       //   'id hash name color image createdAt'
    //       // ].join(' ')
    //       res.status(200).json(newPadron)
    //     })
    //   } else {
    //     log('No escuela')
    //     next(err)
    //   }
    // })
    dbApi.padron.create(req.body, function (err, newPadron) {
      if (err) return next(err)
      log('OK! New entry in padron')
      // var keys = [
      //   'id hash name color image createdAt'
      // ].join(' ')
      res.status(200).json(newPadron)
    })
  })

app.get('/padron/check-voted/:dni',
  restrict,
  function (req, res, next) {
    const dni = req.params.dni
    const user = req.user
    // if user is staff, it can check any dni
    // if user is not staff, it can only check his own dni
    if (user.staff || user.dni === dni) {
      dbApi.padron.isInPadron(dni)
        .then(padron => {
          if (padron) {
            // user is in padron
            log('Serving padron')
            if (padron.voted) {
              res.status(200).json({hasVoted: 'yes'})
            } else {
              res.status(200).json({hasVoted: 'no'})
            }
          } else {
            log('No padron found')
            res.status(200).json({hasVoted: 'no'})
          }
        })
    } else {
      // forbidden action
      res.status(403).json({ error: 'Forbidden' })
    }
  })

app.post('/padron/change-zone',
  restrict,
  staff,
  function (req, res, next) {
    // recieves in the req.body the "dni" and "zone" to change the user data in the
    const dni = req.body.dni
    const zona = req.body.zona
    dbApi.user.getUserByDni(dni).then((user) => {
      if (user) {
        log('Found user')
        user.zona = zona
        user.save(function (err, user) {
          if (err) return next(err)
          log('OK! User updated')
          res.status(200).json(user)
        })
      } else {
        log('No user found')
        res.status(200).json({})
      }
    })
    .catch((err) => next(err))
  }
)
