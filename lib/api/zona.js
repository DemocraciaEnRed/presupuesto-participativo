const debug = require('debug')
const log = debug('democracyos:api:zona')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var maintenance = utils.maintenance

const dbApi = require('lib/db-api')

const app = module.exports = express.Router()

app.get('/zona', function (req, res) {
  log('Getting all zonas')

  dbApi.zona.all(function (err, objs) {
    if(err) {
      log('Error found: %s', err)
      next(err)
    }

    if (objs && objs.length){
      log('Serving zonas')
      res.status(200).json(objs)
    }else{
      log('No zonas found')
      res.status(200).json({})
    }
  })
})
