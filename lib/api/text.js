const debug = require('debug')
const log = debug('democracyos:ext:api:text')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var maintenance = utils.maintenance

const dbApi = require('lib/db-api')

const app = module.exports = express.Router()

app.get('/text/:textName', function (req, res) {
  log('Getting text by name %s', req.params.textName)

  dbApi.text.getByName(req.params.textName, function (err, obj) {
    if(err) {
      log('Error found: %s', err)
      next(err)
    }

    if (obj){
      log('Serving text %s', obj.text)
      res.status(200).json(obj.toJSON())
    }else{
      log('No text found')
      res.status(200).json({})
    }
  })
})

/*app.put('/text/:id',
  //restrict,
  //maintenance,
  function (req, res) {
    if (!req.body.name) return res.status(400).send({ error: 'No name' })
    if (typeof req.body.name !== 'string') return res.status(400).send({ error: 'Bad name' })

    const id = req.params.id
    log('Trying to update text with id %s', id)

    dbApi.text.get(id, function (err, text) {
      if(err) {
        log('Error found (1): %s', err)
        next(err)
      }

      var data = {
        name: req.body.name,
        text: req.body.text
      }
      dbApi.text.update(text, data, function (err, obj) {
        if(err) {
          log('Error found (2): %s', err)
          next(err)
        }

        log('Updated text with id %s', obj.id)
        res.status(200).json(obj.toJSON())
      })

    })
  }
)*/

app.get('/text', function (req, res) {
  log('Getting all texts')

  dbApi.text.all(function (err, objs) {
    if(err) {
      log('Error found: %s', err)
      next(err)
    }

    if (objs && objs.length){
      log('Serving texts')
      res.status(200).json(objs)
    }else{
      log('No texts found')
      res.status(200).json({})
    }
  })
})

app.post('/text',
  //restrict,
  //maintenance,
  function (req, res) {
    log('Updating texts')

    const idRegex = /[a-f0-9]{24}/
    const ids = Object.keys(req.body)
    ids.forEach((id) => {
      if (!idRegex.test(id)){
        log('Invalid id: %s', id)
        next({error: 1})
      }
    })

    dbApi.text.getIds(ids, function(err, objs){
      if(err) {
        log('Error found: %s', err)
        next(err)
      }
      objs.forEach((obj) => {
        obj.set('text', req.body[obj._id])
        obj.save()
      })
    })

    log('Updated')
    res.status(200).json({})
  }
)
