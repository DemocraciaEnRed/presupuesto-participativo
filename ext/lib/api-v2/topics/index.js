const log = require('debug')('democracyos:ext:api-v2:topics')

const express = require('express')
const notifier = require('democracyos-notifier')
const pick = require('lodash.pick')
const middlewares = require('lib/api-v2/middlewares')
const { isCitizenOnProposal } = require('../../proposals')
const api = require('lib/db-api')
const apiv2 = require('lib/api-v2/db-api')
var config = require('lib/config')
var utils = require('lib/utils')
var expose = utils.expose

const app = module.exports = express.Router()

const EDITABLE_KEYS = [
  'forum',
  'zona',
  'mediaTitle',
  'tag',
  'attrs.nombre',
  'attrs.domicilio',
  'attrs.documento',
  'attrs.telefono',
  'attrs.email',
  'attrs.barrio',
  'attrs.ubicacion',
  'attrs.problema',
  'attrs.solucion',
  'attrs.beneficios',
  'attrs.subscribers',
  'attrs.genero',
  'attrs.zona',
  'eje'
]

class CantUploadProposal extends Error {
  constructor() {
    super('User can not upload proposal.')
    this.status = 403
    this.code = 'UPLOAD_TOPIC_FORBIDDEN'
  }
}

const defaultValues = () => ({
  'attrs.subscribers': '',
  'attrs.anio': '2022', //TODO Variable de entorno que se pueda setear el año
  'attrs.state': 'pendiente',
  'action.method': 'cause',
})

// Only allow to edit specific keys when is a proposal
// and the users doesn't have forum privileges.
const purgeBody = (req, res, next) => {
  //console.log('Entre a purgeBody')
  // beware with subscribers fields
  if (isCitizenOnProposal(req.user, req.forum)) {
    //console.log('Entre por true')
    if (req.forum.config.propuestasAbiertas){
      // IF THE FORM IS OPEN, RUN THIS
      req.body = Object.assign(
         defaultValues(),
         pick(req.body, EDITABLE_KEYS)
      )
    }else{
      // IF THE FORM UPLOAD IS CLOSED, A CITIZEN CANNOT CONTINUE
      return next(new CantUploadProposal())
    }
  } else {
    //console.log('Entre por false')
    //console.log('=========================')
    //console.log(req.body)
    //console.log('=========================')
    req.body = Object.assign(
      defaultValues(),
      req.body
    )
  }
  return next()
}

const sendToAdmin = (req, res, next) => {
  // console.log(req.body)
  log('Mandando mail %s a admin %s', 'new-proposal', process.env.NOTIFICATIONS_MAILER_EMAIL)
  notifier.now('new-proposal', {
    topic: {
      mediaTitle: req.body.mediaTitle,
      tags: req.body.tags,
      nombre: req.body['attrs.nombre'],
      domicilio: req.body['attrs.domicilio'],
      documento: req.body['attrs.documento'],
      telefono: req.body['attrs.telefono'],
      email: req.body['attrs.email'],
      barrio: req.body['attrs.barrio'],
      ubicacion: req.body['attrs.ubicacion'],
      problema: req.body['attrs.problema'],
      solucion: req.body['attrs.solucion'],
      beneficios: req.body['attrs.beneficios'],
    }
  }).then(() => {
    next()
  }).catch(next)
}

// Los estados en los cuales se enviaria una notificacion al autor serian en los siguientes.
// Pendiente -> Factible
// Pendiente -> En proceso
// Pendiente -> No Factible
// Pendiente -> Integrado
// Factible -> Integrada
// Factible -> En preparacion
// En preparacion -> En proceso de compra
// En proceso de compra -> En Ejecucion
// En ejecucion -> Finalizado
// -------------------------------
// Los estados son:
// factible,pendiente,no-factible,integrado,no-ganador,preparacion,compra,ejecucion,finalizado
const automata = {
  pendiente: ['factible', 'no-factible', 'integrado', 'preparacion'],
  factible: ['integrado', 'preparacion'],
  preparacion: ['compra'],
  compra: ['ejecucion'],
  ejecucion: ['finalizado']
}


const sendToAuthor = (req, res, next) => {
  //console.log('sendToAuthor', req.topic.attrs.state, '-', req.body['attrs.state'])
  if (automata[req.topic.attrs.state]) {
    if (automata[req.topic.attrs.state].includes(req.body['attrs.state'])) {
      switch (req.body['attrs.state']) {
        case 'pendiente':
        case 'factible':
        case 'no-factible':
        case 'integrado':
          log('Mandando mail %s a %s', 'update-proposal', req.body['attrs.email'])
          notifier.now('update-proposal', {
            topic: {
              id: req.topic['_id'],
              mediaTitle: req.body.mediaTitle,
              authorName: req.body['attrs.nombre'],
              authorEmail: req.body['attrs.email']
            }
          }).then(() => {
            next()
          }).catch(next)
          break;
        default:
          log('Mandando mail %s a %s', 'update-project', req.body['attrs.email'])
          notifier.now('update-project', {
            topic: {
              id: req.topic['_id'],
              mediaTitle: req.body.mediaTitle,
              authorName: req.body['attrs.nombre'],
              authorEmail: req.body['attrs.email']
            }
          }).then(() => {
            next()
          }).catch(next)
          break;
      }
    } else {
      next()
    }
  } else {
    next()
  }
}


const sendToUsers = (req, res, next) => {
  //console.log('Entre a sendToUser')
  //console.log(req.topic)
  //console.log(req.topic.attrs)
  // console.log(`automata[req.topic.attrs.state].includes(req.body['attrs.state']) => ${automata[req.topic.attrs.state].includes(req.body['attrs.state'])}`)
  if (automata[req.topic.attrs.state]) {
    if (automata[req.topic.attrs.state].includes(req.body['attrs.state'])) {
      switch (req.body['attrs.state']) {
        case 'pendiente':
        case 'factible':
        case 'no-factible':
        case 'integrado':
          if (req.topic.attrs.subscribers && req.topic.attrs.subscribers.length > 0) {
            let arrSubscribers = req.topic.attrs.subscribers.split(',')
            let arrPromises = arrSubscribers.map(user => {
              return notifier.now('subscriber-update-proposal', {
                topic: {
                  id: req.topic['_id'],
                  mediaTitle: req.body.mediaTitle,
                  subscriber: user
                }
              })
            })
            Promise.all(arrPromises).then(() => {
              next()
            }).catch(next)
          } else {
            next()
          }
          break;
        default:
          if (req.topic.attrs.subscribers && req.topic.attrs.subscribers.length > 0) {
            let arrSubscribers = req.topic.attrs.subscribers.split(',')
            let arrPromises = arrSubscribers.map(user => {
              return notifier.now('subscriber-update-project', {
                topic: {
                  id: req.topic['_id'],
                  mediaTitle: req.body.mediaTitle,
                  subscriber: user
                }
              })
            })
            Promise.all(arrPromises).then(() => {
              next()
            }).catch(next)
          } else {
            next()
          }
          break;
      }
    } else {
      next()
    }
  } else {
    next()
  }
}

const subscribeUser = (req, res, next) => {
  let stringSubscribers = req.topic.attrs.subscribers
  let suscribed = false
  if (stringSubscribers) {
    let auxArraySubscribers = stringSubscribers.split(',')
    if (auxArraySubscribers.includes(req.user.id)) {
      auxArraySubscribers = auxArraySubscribers.filter(s => {
        return s != req.user.id
      })
      stringSubscribers = auxArraySubscribers.join(',')
    } else {
      auxArraySubscribers.push(req.user.id)
      stringSubscribers = auxArraySubscribers.join(',')
      suscribed = true
    }
  } else {
    stringSubscribers = req.user.id
    suscribed = true
  }
  let keysToUpdate = {
    attrs: req.topic.attrs
  }
  keysToUpdate.attrs.subscribers = stringSubscribers
  apiv2.topics.edit({
    id: req.params.id,
    user: req.user,
    forum: req.forum
  }, keysToUpdate).then((topic) => {
    res.status(200).json({
      status: 200,
      message: suscribed ? 'Suscribed' : 'Unsuscribed'
    })
  }).catch(next)
}


// continue to original DemocracyOS's Route
const goToNextRoute = (req, res, next) => next('route')

app.post('/topics',
  middlewares.users.restrict,
  middlewares.forums.findFromBody,
  (req, res, next) => {
    if (req.forum.visibility == 'collaborative') next()
    else return middlewares.forums.privileges.canCreateTopics(req, res, next)
  },
  purgeBody,
  // desactivado para segunda fase del PP
  //sendToAdmin,
  goToNextRoute)

app.put('/topics/:id',
  middlewares.users.restrict, // restringe
  middlewares.topics.findById, // cuentra por id => req.topic
  middlewares.forums.findFromTopic, // encuentra el foro =>  req.forums
  middlewares.forums.privileges.canCreateTopics, // restringe por privilegio
  middlewares.topics.privileges.canEdit, // restringe por privilegio
  purgeBody, // hace purge body, sea lo que sea
  function(req, res, next){
    let alarmasCambioEstado = automata[req.topic.attrs.state]
    let nuevoEstado = req.body['attrs.state']
    log('Estado previo:', req.topic.attrs.state)
    log('Notificar si cambia a:', alarmasCambioEstado)
    log('Estado nuevo:', nuevoEstado)
    if (alarmasCambioEstado && alarmasCambioEstado.indexOf(nuevoEstado) > -1) log('¡Se enviarán notificaciones!')
    next()
  },
  sendToAuthor, // Envia al autor
  sendToUsers, // envia a los otros plebeyos
  goToNextRoute)

app.post('/topics/:id/subscribe',
  // middlewares.users.restrict,
  middlewares.topics.findById,
  middlewares.forums.findFromTopic,
  subscribeUser)

app.get('/all-tags',
  (req, res, next) => {
    try {
      api.tag.all(function (err, tags) {
        if (err) return _handleError(err, req, res)
        res.status(200).json(tags.map(expose('id name')))
      })
    } catch (err) {
      next(err)
    }
  })
