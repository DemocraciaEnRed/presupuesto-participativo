var log = require('debug')('democracyos:text:middleware')
var config = require('lib/config')
var api = require('lib/db-api')
var privileges = require('lib/privileges/forum')

var exports = module.exports = {}

function textsArr2Dict(texts){
  let dict = {}
  texts.forEach(text => dict[text.name] = text.text)
  return dict
}

exports.getHomeTexts = (req, res, next) => {
  let textNames = [
    'home-video1-webm',
    'home-video1-mp4',
    'home-video2-webm',
    'home-video2-mp4'
  ]
  api.text.getByNames(textNames, function (err, texts) {
    if (err) {
      log('Error fetching text by names: %s', err)
      return res.status(400).send()
    }

    if (!texts) return res.status(404).send()

    config.storeSet('adminTexts', textsArr2Dict(texts))
    next()
  })
}
