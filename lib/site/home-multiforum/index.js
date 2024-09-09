/**
 * Module dependencies.
 */

var express = require('express')
var app = module.exports = express()
var visibility = require('lib/visibility')
var getHomeTexts = require('lib/middlewares/text-middlewares').getHomeTexts

app.get('/', visibility, getHomeTexts, require('lib/site/layout'))
