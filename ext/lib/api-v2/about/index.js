const express = require('express')

const middlewares = require('lib/api-v2/middlewares')

const api = require('lib/db-api')

const utils = require('lib/utils')
const expose = utils.expose

const app = (module.exports = express.Router())

const goToNextRoute = (req, res, next) => next('route')

app.post('/about',
  middlewares.users.restrict,
  middlewares.forums.findFromBody,
  goToNextRoute)

app.put('/about/:id',
  middlewares.users.restrict, // restringe
  middlewares.about.findById,
  goToNextRoute)

app.delete('/about/:id',
  middlewares.users.restrict, // restringe
  middlewares.about.findById,
  goToNextRoute)

app.put('/about-update-order',
  middlewares.users.restrict, // restringe
  middlewares.forums.findFromBody,
  goToNextRoute
  )

app.get('/about-all', (req, res, next) => {
  try {
    api.about.all(function (err, faqs) {
      if (err) return _handleError(err, req, res);
      res.status(200).json(faqs.map(expose('id question answer createdAt order')))
    })
  } catch (err) {
    next(err)
  }
})