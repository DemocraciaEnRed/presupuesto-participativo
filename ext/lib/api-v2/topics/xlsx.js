const express = require('express')
const debug = require('debug')
const json2xls = require('ext/node_modules/json2xls')
const moment = require('moment')
// const middlewaresNew = require('lib/api-v2/middlewares')
const middlewares = require('lib/api-v2/middlewares')
var api = require('lib/db-api')

const log = debug('democracyos:api:topic:xslx')
const app = module.exports = express.Router()


const titles = [
  'Topic ID',
  'Topic Title',
  'Topic Category'
]

function escapeTxt (text) {
  if (!text) return ''
  text += ''
  return text.replace(/"/g, '\'').replace(/\r/g, '').replace(/\n/g, '')
}

app.use(json2xls.middleware)

app.get('/export/topics/xlsx',
  middlewares.users.restrict,
  middlewares.forums.findByName,
  middlewares.topics.findAllFromForum,
  middlewares.forums.privileges.canChangeTopics,

  /*function getAllTags(req, res, next) {
    api.tag.all(function (err, tags) {
      let tagsName = {}
      if (err) {
        log('error serving tags from DB:', err)
        return res.status(500).end()
      }
      tags.forEach(t => tagsName[t.id] = t.name)
      req.tagsName = tagsName
      next()
    })
  },*/
  function getAllUserMails(req, res, next) {
    api.user.all(function (err, users) {
      let usersMail = {}
      if (err) {
        log('error serving users from DB:', err)
        return res.status(500).end()
      }
      users.forEach(u => usersMail[u._id] = u.email)
      req.usersMail = usersMail
      next()
    })
  },
  (req, res, next) => Promise.all(
    // populamos owners (parecido a populateOwners)
    req.topics.map(topic =>
      api.user.getFullUserById(topic.owner, true).then(user => {
        topic.owner = user
        return topic
      })
    )
  ).then((topics) => Promise.all(
    // populamos votos
    topics.map(topic =>
      api.vote.getVotesByTopic(topic._id).then(votes => {
        topic.action.results = votes.map(v => req.usersMail[v.author])
        return topic
      })
    )
  )).then((topics) => {
    req.topics = topics
    next()
  }),
  (req, res, next) =>
    api.user.populateProyectistas(req.topics).then(() => next())
  ,
  (req, res, next) =>
    api.zona.all(function (err, zonas) {
      let zonasName = {}
      if (err) {
        log('error serving zonas from DB:', err)
        return res.status(500).end()
      }
      zonas.forEach(f => zonasName[f._id] = f.nombre)
      req.zonasName = zonasName
      next()
  }),
  (req, res, next) =>
    api.tag.all(function (err, tags) {
      let tagsName = {}
      if (err) {
        log('error serving zonas from DB:', err)
        return res.status(500).end()
      }
      tags.forEach(f => tagsName[f._id] = f.name)
      req.tagsName = tagsName
      next()
  }),  
  function getXlsx(req, res, next) {
    let infoTopics = []
    const attrsNames = req.forum.topicsAttrs
      .map((attr) => attr.name)

    req.topics.forEach((topic) => {
      if (topic.attrs === undefined) {
        topic.attrs = {}
      }
      let theTopic = {
        'Idea ID': topic.id,
        'Idea Fecha': `${escapeTxt(moment(topic.createdAt, '', req.locale).format('LL LT'))}`,
        'Idea Título': `${escapeTxt(topic.mediaTitle)}`,
        'Idea Tema': `${escapeTxt(topic.tag && req.tagsName[topic.tag])}`,
        'Idea Zona': `${escapeTxt(topic.zona && req.zonasName[topic.zona])}`,
        'Idea Barrio': `${escapeTxt(topic.attrs && topic.attrs.barrio)}`,
        'Idea Problema': `${escapeTxt(topic.attrs && topic.attrs.problema)}`,
        'Idea Solución': `${escapeTxt(topic.attrs && topic.attrs.solucion)}`,
        'Idea Beneficios': `${escapeTxt(topic.attrs && topic.attrs.beneficios)}`,
        'Idea Estado': `${escapeTxt(topic.attrs['state'])}`,
        'Autor/a nombre': `${escapeTxt(topic.owner.firstName)}`,
        'Autor/a apellido': `${escapeTxt(topic.owner.lastName)}`,
        'Autor/a email': `${escapeTxt(topic.owner.email)}`,
        'Seguidores cantidad': `${escapeTxt(topic.action.count)}`,
        'Seguidores emails': `${escapeTxt(topic.action.results.join(', '))}`,
        'Apoyos/me gusta recibidos': `${escapeTxt(topic.proyectistas && topic.proyectistas.length)}`,
        'email de usuarios interesados': `${escapeTxt(topic.proyectistas && topic.proyectistas.map(p=>p.email).join(','))}`
      }

      /*attrsNames.map((name) => {
        theTopic[name] = `${escapeTxt(topic.attrs[name])}` || ''
      });*/
      infoTopics.push(theTopic);
    });
    try {
      res.xls(`ideas-zonas.xlsx`, infoTopics);
    } catch (err) {
      log('get csv: array to csv error', err)
      return res.status(500).end()
    }
  })

app.get('/export/topics/export-resultados',
  middlewares.users.restrict,
  middlewares.forums.findByName,
  middlewares.forums.privileges.canChangeTopics,
  // cargar zonas a req
  (req, res, next) =>
    api.zona.all(function (err, zonas) {
      let zonasName = {}
      if (err) {
        log('error serving zonas from DB:', err)
        return res.status(500).end()
      }
      zonas.forEach(f => zonasName[f._id] = f.nombre)
      req.zonasName = zonasName
      next()
    })
  ,
  // cargar votos a req
  (req, res, next) =>
    api.vote.getVotesVotacion().then(votes => {
      req.votes = votes || []
      next()
    })
  ,
  function getXlsx(req, res, next) {
    let infoVotes = []

    req.votes.forEach((vote) => {
      const topicAttrs = vote.topic.attrs
      const theVote = {
        'Fecha': `${escapeTxt(moment(vote.createdAt, '', req.locale).format('LL LT'))}`,
        'Zona': `${escapeTxt(req.zonasName[vote.author.zona])}`,
        '#Proyecto': `${escapeTxt(topicAttrs.numero || '')}`,
        'Título Proyecto': `${escapeTxt(vote.topic.mediaTitle)}`,
      }
      infoVotes.push(theVote);
    });
    try {
      res.xls(`resultados-votacion.xlsx`, infoVotes);
    } catch (err) {
      log('get csv: array to csv error', err)
      return res.status(500).end()
    }
})


app.get('/export/topics/export-resultados-proyectos',
  middlewares.users.restrict,
  middlewares.forums.findByName,
  middlewares.topics.findAllFromForum,
  middlewares.forums.privileges.canChangeTopics,
  function getAllZonas(req, res, next) {
    api.zona.all(function (err, zonas) {
      let zonasName = {}
      if (err) {
        log('error serving zonas from DB:', err)
        return res.status(500).end()
      }
      zonas.forEach(e => zonasName[e._id] = e.nombre)
      req.zonasName = zonasName
      next()
    })
  },
  function getAllUserMails(req, res, next) {
    api.user.all(function (err, users) {
      let usersMail = {}
      if (err) {
        log('error serving users from DB:', err)
        return res.status(500).end()
      }
      users.forEach(u => usersMail[u._id] = u.email)
      req.usersMail = usersMail
      next()
    })
  },
  (req, res, next) => Promise.all(
    // populamos owners (parecido a populateOwners)
    req.topics.map(topic =>
      api.user.getFullUserById(topic.owner, true).then(user => {
        topic.owner = user
        return topic
      })
    )
  ).then((topics) => Promise.all(
    // populamos votos
    topics.map(topic =>
      api.vote.getVotesByTopic(topic._id).then(votes => {
        topic.action.results = votes.map(v => req.usersMail[v.author])
        return topic
      })
    )
  )).then((topics) => {
    req.topics = topics
    next()
  }),
  (req, res, next) =>
    api.user.populateProyectistas(req.topics).then(() => next())
  ,
  function getXlsx(req, res, next) {
    let infoTopics = []
    req.topics.forEach((topic) => {
      if (topic.attrs === undefined) {
        topic.attrs = {}
      }
      // const votes = req.votes.filter(v => (v.voto1 === topic.id || v.voto2 === topic.id))
      let theTopic = {
        '#Proyecto': `${escapeTxt(topic._id)}`,
        'Estado': `${escapeTxt(topic.attrs.state)}`,
        'Zona': `${escapeTxt(req.zonasName[topic.zona])}`,
        'Título Proyecto': `${escapeTxt(topic.mediaTitle)}`,
        'Cantidad Votos': `${topic.action.results.length}`,
        'Monto': `${topic.attrs['presupuesto-total'] ? topic.attrs['presupuesto-total'] : 0}`,
        'Texto': `${escapeTxt(topic.attrs['proyecto-contenido'])}`,
        'Creado el': `${escapeTxt(moment(topic.createdAt).format('YYYY-MM-DD'))}`
      }
      infoTopics.push(theTopic);
    });
    try {
      res.xls(`resultados-votacion-proyectos.xlsx`, infoTopics);
    } catch (err) {
      log('get csv: array to csv error', err)
      return res.status(500).end()
    }
})


app.get('/export/topics/export-resultados-votantes',
  middlewares.users.restrict,
  middlewares.forums.findByName,
  middlewares.topics.findAllFromForum,
  middlewares.forums.privileges.canChangeTopics,
  // cargar zonas a req
  (req, res, next) => {
    api.zona.all(function (err, zonas) {
      if (err) {
        log('error serving zonas from DB:', err)
        return res.status(500).end()
      }
      let zonasName = {}
      zonas.forEach(e => zonasName[e._id] = e.nombre)
      req.zonasName = zonasName
      next()
    })
  },
  // cargar votos
  function getAllVotos(req, res, next) {
    api.vote.all(function (err, votes) {
      if (err) {
        log('error serving votes from DB:', err)
        return res.status(500).end()
      }
      req.votes = votes
      next()
    })
  },
  function getAllVotantes(req, res, next) {
    api.user.all(function (err, users) {
      if (err) {
        log('error serving votantes from DB:', err)
        return res.status(500).end()
      }
      req.votantes = {}
      users.forEach((u) => {
        req.votantes[`${u._id}`] = {
          email: u.email,
          dni: u.dni,
          zona: u.zona ? u.zona : ""
        }
      })
      next()
    })
  },
  function parseTopics(req, res, next) {
    req.topicsName = {}
    req.topics.forEach((t) => {
      req.topicsName[`${t._id}`] = t.mediaTitle
    })
    next()
  },  
  function getXlsx(req, res, next) {
    let infoVotantes = []
    req.votes.forEach((ballot) => {
        const userId = ballot.user
        let theVotante = {
          'ID Votante': `${escapeTxt(userId)}`,
          'Email': `${escapeTxt(req.votantes[userId].email)}`,
          'DNI': `${escapeTxt(ballot.dni)}`,
          'Zona': `${escapeTxt(req.zonasName[ballot.zona])}`,
          'Voto 1': `${escapeTxt(ballot.voto1 ? req.topicsName[ballot.voto1] : "")}`,
          'Voto 2': `${escapeTxt(ballot.voto2 ? req.topicsName[ballot.voto2] : "")}`,
        }
        infoVotantes.push(theVotante);
      });
    try {
      res.xls(`resultados-votacion-votantes.xlsx`, infoVotantes);
    } catch (err) {
      log('get csv: array to csv error', err)
      return res.status(500).end()
    }
})
// function getXlsx(req, res, next) {
//   let infoVotantes = []
//   req.votantes.forEach((votante) => {
//     if (votante.attrs === undefined) {
//       votante.attrs = {}
//     }
    
//     req.votes
//       .filter((ballot) => ballot.user.toString() === votante.id)
//       .forEach((ballot) => {
//         let theVotante = {
//           'ID Votante': `${escapeTxt(votante.id)}`,
//           'Email': `${escapeTxt(votante.email)}`,
//           'DNI': `${escapeTxt(ballot.dni)}`,
//           'Zona': `${escapeTxt(req.zonasName[votante.zona])}`,
//           'Voto 1': `${escapeTxt(ballot.voto1 ? req.topics.find(el => el.id === ballot.voto1.toString()).mediaTitle : "")}`,
//           'Voto 2': `${escapeTxt(ballot.voto2 ? req.topics.find(el => el.id === ballot.voto2.toString()).mediaTitle : "")}`,
//         }
//         infoVotantes.push(theVotante);

//       })
//   });
//   try {
//     res.xls(`resultados-votacion-votantes.xlsx`, infoVotantes);
//   } catch (err) {
//     log('get csv: array to csv error', err)
//     return res.status(500).end()
//   }
// })
