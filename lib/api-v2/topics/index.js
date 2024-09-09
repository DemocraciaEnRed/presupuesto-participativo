const express = require('express')
const validate = require('../validate')
var log = require('debug')('democracyos:topic-v2')
const middlewares = require('../middlewares')
const api = require('../db-api')
const apiV1 = require('lib/db-api')
const notifier = require('democracyos-notifier')
const config = require('lib/config')
const urlBuilder = require('lib/url-builder')
const utils = require('lib/utils')

const app = module.exports = express.Router()

app.get('/topics',
validate({
  query: Object.assign({}, validate.schemas.pagination, {
    limit: { // disable pagination until is implemented on front-end
      type: 'integer',
      default: 500,
      minimum: 1,
      maximum: 500,
      description: 'amount of results per page'
    },
    page: {
      type: 'integer',
      default: 1,
      minimum: 1,
      description: 'number of page'
    },
    forum: {
      type: 'string',
      required: true,
      format: 'mongo-object-id',
      description: 'id of the Forum to fetch topics from'
    },
    sort: {
      type: 'string',
      enum: ['createdAt', '-createdAt', 'action.count', '-action.count'],
      default: '-createdAt'
    },
    tag: {
      type: 'string'
    },
    draft: {
      type: 'string',
      enum: ['true']
    },
    search: {
      type: 'string'
    },
    zona: {
      type: 'string',
      format: 'zona'
    },
    tema: {
      type: 'string',
      format: 'tema'
    }
  })
}),
middlewares.forums.findFromQuery,
middlewares.forums.privileges.canView,
function (req, res, next) {
  if (req.query.draft) {
    middlewares.forums.privileges.canChangeTopics(req, res, next)
  } else {
    next()
  }
},
function getTopics (req, res, next) {
  Promise.all([
    api.topics.list({
      user: req.user,
      forum: req.forum,
      limit: req.query.limit,
      page: req.query.page,
      tag: req.query.tag,
      sort: req.query.sort,
      draft: !!req.query.draft,
      search: decodeURI(req.query.search),
      zona: req.query.zona,
      tema: decodeURI(req.query.tema)
    }).then(topics => apiV1.user.populateOwners(topics)),
    req.query.limit,
    api.topics.listCount({
      forum: req.forum,
      search: decodeURI(req.query.search),
      zona: req.query.zona,
      tema: decodeURI(req.query.tema)
    })
  ]).then((results) => {
    res.status(200).json({
      status: 200,
      pagination: {
        count: results[2],
        page: req.query.page,
        pageCount: Math.ceil(results[1] / req.query.limit) || 1,
        limit: req.query.limit
      },
      results: {
        topics: results[0]
      }
    })
  }).catch(next)
})

app.post('/topics/tags',
  middlewares.users.restrict,
  middlewares.forums.findFromQuery,
  middlewares.forums.privileges.canChangeTopics,
  (req, res, next) => {
    api.topics.updateTags({
      forum: req.forum,
      oldTags: req.body.oldTags,
      newTags: req.body.newTags
    })
      .then((result) => res.status(200).end())
      .catch(next)
  })

app.get('/topics/tags',
  middlewares.forums.findFromQuery,
  middlewares.forums.privileges.canView,
  (req, res, next) => {
    api.topics.getTags({
      forum: req.forum,
      sort: req.query.sort,
      limit: req.query.limit,
      page: req.query.page
    })
      .then((result) => res.status(200).json(result))
      .catch(next)
  })

app.get('/topics/find-all-proyectos', (req, res, next) => {
  apiV1.topic.search({'attrs.state': 'proyecto'}, (err, topics) => res.status(200).json(topics))
})

app.get('/topics/:id',
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canView,
function getTopic (req, res, next) {
  api.topics.get({
    id: req.params.id,
    user: req.user,
    forum: req.forum
  }).then(topic =>
    apiV1.user.populateUser(topic.owner, true).then(() => topic)
  ).then(topic =>
    api.topics.populateIntegradas(topic).then(() => topic)
  ).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch(next)
})

app.post('/topics',
middlewares.users.restrict,
middlewares.forums.findFromBody,
middlewares.forums.privileges.canCreateTopics,
middlewares.zonas.findFromBody,
middlewares.tags.findFromBody,
middlewares.topics.parseUpdateableKeys,
middlewares.topics.autoPublish,
function postTopics (req, res, next) {
  if (req.forum.config.propuestasAbiertas || req.user.staff || req.forum.hasRole(req.user, 'admin', 'collaborator', 'author')){

    if (req.keysToUpdate['action.method'] === 'poll') req.keysToUpdate['action.options'] = req.body['action.options']

    // if (req.keysToUpdate['attrs.state'] !== 'sistematizada')
    //   delete req.keysToUpdate['attrs.zona']
    api.topics.create({
      user: req.user,
      forum: req.forum,
      zona: req.zona,
      tag: req.tag,
    }, req.keysToUpdate).then((topic) => {
      res.status(200).json({
        status: 200,
        results: {
          topic: topic
        }
      })
    }).catch(next)

  }else
    res.status(200).json({error: 'Formulario cerrado'})
})

app.put('/topics/:id',
middlewares.users.restrict,
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canCreateTopics,
middlewares.topics.privileges.canEdit,
middlewares.zonas.findFromBody,
middlewares.tags.findFromBody,
middlewares.topics.parseUpdateableKeys,
middlewares.topics.autoPublish,
function putTopics (req, res, next) {
  api.topics.edit({
    id: req.params.id,
    user: req.user,
    forum: req.forum,
    zona: req.zona,
    tag: req.tag
  }, req.keysToUpdate).then(topic =>
    apiV1.user.populateUser(topic.owner, true).then(() => topic)
  ).then((topic) => {
    const comentarioAdmin = req.body['attrs.admin-comment']

    // si tiene comentario de admin y cambió con respecto al anterior
    if (comentarioAdmin && comentarioAdmin != req.body['admin-comment-original']){
      const topicUrl = utils.buildUrl(config, {
        pathname: urlBuilder.for('site.topic', {
          forum: 'propuestas',
          id: topic.id
        })
      })
      return notifier.now('admin-comment', {
        to: topic.owner.id,
        topicTitle: topic.mediaTitle,
        adminComment: comentarioAdmin,
        topicUrl: topicUrl
      }).catch((err) => { log(err); }).then(() => topic)
    }else
      return topic
  }).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch(next)
})

app.post('/topics/:id/publish',
middlewares.users.restrict,
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canPublishTopics,
middlewares.topics.privileges.canEdit,
function publishTopic (req, res, next) {
  api.topics.publish({
    id: req.params.id,
    user: req.user,
    forum: req.forum
  }).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch(next)
})

app.post('/topics/:id/unpublish',
middlewares.users.restrict,
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canPublishTopics,
middlewares.topics.privileges.canEdit,
function unpublishTopic (req, res, next) {
  api.topics.unpublish({
    id: req.params.id,
    user: req.user,
    forum: req.forum
  }).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch(next)
})

app.delete('/topics/:id',
middlewares.users.restrict,
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canCreateTopics,
middlewares.topics.privileges.canDelete,
function deleteTopics (req, res, next) {
  api.topics.destroy({ id: req.params.id })
    .then(() => res.status(200).json({ status: 200 }))
    .catch(next)
})

app.post('/topics/:id/vote',
middlewares.users.restrict,
validate({
  payload: {
    value: {
      type: 'string',
      required: true
    }
  }
}),
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.topics.privileges.canVote,
function postTopicVote (req, res, next) {
  api.topics.vote({
    id: req.params.id,
    user: req.user,
    forum: req.forum,
    value: req.body.value
  }).then(topic =>
    apiV1.user.populateUser(topic.owner, true).then(() => topic)
  ).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  }).catch((err) => {
    // reglas para que devolver errores propios, por ejemplo NOT_VOTED o ALREADY_VOTED
    if (err.code && err.code.toUpperCase() == err.code && err.code.length < 80) {
      return next({ status: 400, code: err.code })
    }

    next(err)
  })
})

app.post('/topics/:id/proyectista',
middlewares.users.restrict,
validate({
  payload: {
    value: {
      type: 'string',
      required: true
    }
  }
}),
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.topics.privileges.canVote,
function postTopicVote (req, res, next) {
  api.topics.setProyectista(
    req.user,
    req.topic,
    // por ahora no dejames des-hacerce proyectista
    //req.body.value == 'true'
    true
  ).then(topic =>
    apiV1.user.getFullUserById(topic.owner, false).then((user) => {
      topic.owner = user
      return topic
    })
  ).then((topic) => {
    res.status(200).json({
      status: 200,
      results: {
        topic: topic
      }
    })
  })
})

app.post('/topics/uniq-attrs',
middlewares.users.restrict,
function postTopicVote (req, res, next) {
  let attrs = req.body.attrs || []
  log('Requested uniq topic attrs: %o', attrs)

  Promise.all(attrs.map(api.topics.getUniqAttr))
    .then((attrVals) => {
      log('Returnin uniq topic attrs vals: %o', attrVals)
      res.status(200).json({
        status: 200,
        results: {
          attrVals
        }
      })
    }).catch(next)
})

app.post('/topics/:id/album',
middlewares.users.restrict,
validate({
  payload: {
    album: {
      type: 'array',
      required: true
    }
  }
}),
middlewares.topics.findById,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canCreateTopics,
middlewares.topics.privileges.canDelete,
function addPicturesToAlbum (req, res, next) {
  api.topics.addUrlPhotosToAlbum(req.topic, req.body.album)
    .then((topic) => {
      res.status(200).json({
        album: topic.extra.album
      })
    })
    .catch(next)
})

app.delete('/topics/:id/album',
  middlewares.users.restrict,
  validate({
    payload: {
      indexToDelete: {
        type: 'number',
        required: true
      }
    }
  }),
  middlewares.topics.findById,
  middlewares.forums.findFromTopic,
  middlewares.forums.privileges.canCreateTopics,
  middlewares.topics.privileges.canDelete,
  function deletePictureFromAlbum (req, res, next) {
    if (req.topic.extra.album.length <= req.body.indexToDelete) {
      return next({ status: 400, code: 'INVALID_INDEX' })
    }
    if (!req.topic.extra) {
      return next({ status: 400, code: 'NO_ALBUM' })
    }
    if (!req.topic.extra.album || !req.topic.extra.album.length) {
      return next({ status: 400, code: 'NO_ALBUM_NOR_PICTURES_IN_ALBUM' })
    }
    api.topics.removeIndexFromAlbum(req.topic, req.body.indexToDelete)
      .then((topic) => {
        res.status(200).json({
          album: topic.extra.album
        })
      })
      .catch(next)
  }
)
