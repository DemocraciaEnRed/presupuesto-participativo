const debug = require('debug')
const log = debug('democracyos:api:padroncsv')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var staff = utils.staff
//var maintenance = utils.maintenance
const json2csv = require('json-2-csv').json2csv
const csv2json = require('json-2-csv').csv2json

const dbApi = require('lib/db-api')

const app = module.exports = express.Router()

function escapeTxt (text) {
  if (!text) return ''
  text += ''
  return text.replace(/"/g, '\'').replace(/\r/g, '').replace(/\n/g, '')
}

app.get('/vote/byTopic/csv',
  restrict,
  staff,
  function getZonas(req, res, next){
    log('Getting zonas')
    dbApi.zona.getAll().then((zonas) => {
      if(zonas){
        log('Serving zonas')
        // conver every item toJson
        // let aux = facultades.map(fac => fac.toJSON())
        // console.log(aux)
        req.zonas = zonas
        next()
      } 
    })
  },
  function getTopics(req, res, next){
    dbApi.topic.getAll().then((topics) => {
      if(topics){
        log('Serving topics')
        // conver every item toJson
        // let aux = facultades.map(fac => fac.toJSON())
        // console.log(aux)
        req.topics = topics
        next()
      } 
    })
  },
  function getVotes(req, res, next) {
    log('Getting padron')
    dbApi.vote.getAll().then((votes) => {
      if (votes) {
        log('Serving votes')
        req.votes = votes
        next()
      } else {
        return res.status(500).end()
      }
    }).catch(err => {
      log('Error getting padron', err)
      return res.status(500).end()
    })
  },
  function sendCsv (req, res, next) {
    let mapTopicAndVoteCount = {}
    req.votes.forEach(v => {
      if (v.voto1) {
        if (mapTopicAndVoteCount[v.voto1]) {
          mapTopicAndVoteCount[v.voto1]++
        } else {
          mapTopicAndVoteCount[v.voto1] = 1
        }
      }
      if (v.voto2) {
        if (mapTopicAndVoteCount[v.voto2]) {
          mapTopicAndVoteCount[v.voto2]++
        } else {
          mapTopicAndVoteCount[v.voto2] = 1
        }
      }
    })

    var infoTopic = req.topics.map((t) => {
      let auxZona = null
      if (t.zona) {
        auxZona = req.zonas.find((z) => z._id.toJSON() == t.zona)
      }
      return [
        t.id,
        `"${escapeTxt(t.mediaTitle)}"`,
        auxZona ? auxZona.nombre : '-',
        mapTopicAndVoteCount[t.id] ? mapTopicAndVoteCount[t.id] : 0,
      ]
    })
    var data = [['ID', 'Topic', 'Zona', 'Cant. Votos']]
    data = data.concat(infoTopic)
    json2csv(data, function (err, csv) {
      if (err) {
        log('get csv: array to csv error', err)
        return res.status(500).end()
      }
      res.status(200)
      res.set({
        'Content-Encoding': 'UTF-8',
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename=votos-por-topic-pp-${Math.floor((new Date()) / 1000)}.csv`
      })
      res.write(csv)
      res.end()
    }, { prependHeader: false, excelBOM: true })
  }
)