const express = require('express')
const middlewares = require('../middlewares')
const api = require('../../db-api')

const utils = require('lib/utils')
const expose = utils.expose

const app = module.exports = express.Router()

app.post('/about',
middlewares.users.restrict,
middlewares.forums.findFromBody,
middlewares.forums.privileges.canEdit,
function postAbout (req, res, next) {
  api.about.create({
    user: req.user,
    forum: req.forum,
    faq: {
      question: req.body.question,
      answer: req.body.answer
    }
  }).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch(next)
})

app.put('/about/:id',
middlewares.users.restrict,
middlewares.forums.findFromBody,
middlewares.about.findById,
middlewares.forums.privileges.canEdit,
function postAbout (req, res, next) {
  api.about.edit({
    user: req.user,
    forum: req.forum,
    faq: req.faq
  }, req.body).then((about) => {
    res.status(200).json({
      status: 200,
      results: {
        about: about
      }
    })
  }).catch(next)
})

app.delete('/about/:id',
  middlewares.users.restrict,
  middlewares.forums.findFromBody,
  middlewares.about.findById,
  middlewares.forums.privileges.canEdit,
  function postAbout (req, res, next) {
    api.about.deleteOne({
      user: req.user,
      forum: req.forum,
      faq: req.faq
    }).then((about) => {
      res.status(200).json({
        status: 200,
        results: {
          about: about
        }
      })
    }).catch(next)
  })

app.put('/about-update-order',
  middlewares.users.restrict,
  middlewares.forums.findFromBody,
  middlewares.about.findAll,
  middlewares.forums.privileges.canEdit,
  (req, res, next) => {
    api.about.updateMany({
      user: req.user,
      forum: req.forum,
      faqs: req.faqs
    }, req.body.data).then((about) => {
      res.status(200).json({
        status: 200,
        results: {
          about: about
        }
      })
    }).catch(next)
  }
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