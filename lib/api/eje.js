const debug = require('debug')
const log = debug('democracyos:api:eje')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var maintenance = utils.maintenance

const dbApi = require('lib/db-api')

const app = module.exports = express.Router()

app.get('/eje', function (req, res) {
  log('Getting all ejes')

  dbApi.eje.all(function (err, objs) {
    if(err) {
      log('Error found: %s', err)
      next(err)
    }

    if (objs && objs.length){
      log('Serving ejes')
      res.status(200).json(objs)
    }else{
      log('No ejes found')
      res.status(200).json({})
    }
  })
})
