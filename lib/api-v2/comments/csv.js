const express = require('express')
const json2csv = require('json-2-csv').json2csv
const moment = require('moment')
const config = require('lib/config')
const urlBuilder = require('lib/url-builder')
const middlewares = require('../middlewares')
const api = require('../db-api')
const iconv = require('iconv-lite');

const app = module.exports = express()

const titles = [
  'ID de idea',
  'Título',
  'URL',
  'Comentario ID',
  'Comentario Fecha',
  'Comentario Hora',
  //'Comment Date-time',
  'Comentario Autor/a',
  'Comentario Autor/a Mail',
  'Comentario Texto',
  //'Reply ID',
  'Respuesta Fecha',
  'Respuesta Hora',
  //'Reply Date-time',
  'Respuesta Autor/a',
  'Respuesta Autor/a Mail',
  'Respuesta Texto'
]

const emptyReply = {
  createdAt: '',
  id: '',
  text: '',
  author: {
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
  }
}

function fullUrl (topicId, forumName) {
  return config.protocol + '://' + config.host + urlBuilder
    .for('site.topic', {
      id: topicId,
      forum: forumName
    })
}

function escapeTxt (text) {
  if (!text) return ''
  return text.replace(/"/g, '\'').replace(/\r/g, '').replace(/\n/g, '')
}

app.get('/comments.csv',
middlewares.users.restrict,
middlewares.forums.findByName,
middlewares.topics.findAllFromForum,
middlewares.forums.privileges.canChangeTopics,
function getCsv (req, res, next) {
  api.comments.populateTopics(req.topics)
    .then((topicsComments) => {
      const commentsData = [ titles ]

      topicsComments.forEach((topic) => {
        topic.comments.forEach((comment) => {
          (comment.replies.length === 0 ? [emptyReply] : comment.replies)
            .forEach((reply) => {
              commentsData.push([
                topic.id,
                `"${escapeTxt(topic.mediaTitle)}"`,
                fullUrl(topic.id, req.forum.name),
                comment.id,
                `"${escapeTxt(moment(comment.createdAt, '', req.locale).format('LL'))}"`,
                `"${escapeTxt(moment(comment.createdAt, '', req.locale).format('LT'))}"`,
                //comment.createdAt,
                `"${escapeTxt(comment.author.firstName + ' ' + comment.author.lastName)}"`,
                `"${escapeTxt(comment.author.email)}"`,
                `"${escapeTxt(comment.text)}"`,
                //reply.id,
                `"${(reply.createdAt && escapeTxt(moment(reply.createdAt, '', req.locale).format('LL')))}"`,
                `"${(reply.createdAt && escapeTxt(moment(reply.createdAt, '', req.locale).format('LT')))}"`,
                //reply.createdAt,
                `"${escapeTxt(reply.author.firstName + ' ' + reply.author.lastName)}"`,
                `"${escapeTxt(reply.author.email)}"`,
                `"${escapeTxt(reply.text)}"`
              ])
            })
        })
      })

      json2csv(commentsData, function (err, csv) {
        if (err) throw new Error('comments.csv: array to csv error')
        res.status(200)
        res.set({
          'Content-Type': 'text/csv; charset=iso-8859-1',
          'Content-Disposition': 'attachment; filename=comentarios-zonas.csv'
        })

        let tempBuffer = new Buffer(csv, 'UTF-8');
        let output = iconv.decode(tempBuffer, 'UTF-8');
        csv = iconv.encode(output, 'ISO-8859-1');
        res.charset = 'iso-8859-1';

        res.write(csv)
        res.end()
      }, { prependHeader: false })
    }).catch(next)
})
