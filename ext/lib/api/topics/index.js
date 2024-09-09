const { Router } = require('express')
const validate = require('lib/api-v2/validate')
const middlewares = require('lib/api-v2/middlewares')
const utils = require('./utils')
const apiNoExt = require('lib/db-api')
const log = require('debug')('democracyos:ext:api:topics')


const app = Router()

const allowedForums = ['propuestas', 'proyectos']

const formats = {
  formats: {
    tags: /^([a-zA-Z0-9-_]+,?)+$/,
    barrio: /^[a-z0-9-]+$/,
    anio: /[0-9]+/
  }
}

app.get('/topics',
  validate({
    query: Object.assign({}, validate.schemas.pagination, {
      forumName: {
        type: 'string',
        enum: allowedForums,
        required: true
      },
      zonas: {
        type: 'string',
        format: 'zonas',
        default: ''
      },
      tags: {
        type: 'string',
        format: 'tags',
        default: ''
      },
      state: {
        type: 'string',
        format: 'states',
        default: 'pendiente,factible,no-factible,integrado'
      },
      sort: {
        type: 'string',
        enum: ['', 'newest', 'popular', 'barrio'],
        default: ''
      },
      related: {
        type: 'string',
        default: '',
        format: 'barrio'
      },
      tipoIdea: {
        type: 'string',
        default: 'nothing'
      },
      years: {
        type: 'string',
        default: ''
      },      
      kwords: {
        type: 'string',
        default: ''
      }      
    })
  }, { formats }),
  utils.findForum,
  utils.parseStates,
  utils.parseTipoIdea,
  utils.parseYears,
  utils.parseKWords,
  utils.parseZonas,
  utils.parseTags,
  middlewares.forums.privileges.canView,
  (req, res, next) => {
    const opts = Object.assign({}, req.query)
    opts.forum = req.forum
    opts.user = req.user
    opts.state = opts.tipoIdea
    Promise.all([
      utils.findTopics(opts).then(topics => apiNoExt.user.populateOwners(topics)),
      utils.findTopicsCount(opts)
    ]).then(([topics, count]) => {
      // pidieron mostrar siempre primero las ideas-proyecto
      // const ideasProyectos = topics.filter(t => t.attrs.state == 'idea-proyecto')
      // const ideasResto = topics.filter(t => t.attrs.state != 'idea-proyecto')
      let finalTopics
      if (opts.sort === '') {
        finalTopics = topics.sort(() => 0.5 - Math.random())
      } else {
        finalTopics = topics
      }
      finalTopics = utils.findByKwordsAndSort(finalTopics,req.query.queryString)
      res.status(200).json({
        status: 200,
        pagination: {
          count,
          page: opts.page,
          pageCount: Math.ceil(count / opts.limit) || 1,
          limit: opts.limit
        },
        results: {
          topics: finalTopics
        }
      })
    }).catch(next)
  })

app.get('/topics/all',
  validate({
    query: Object.assign({}, validate.schemas.pagination, {
      forumName: {
        type: 'string',
        enum: allowedForums,
        required: true
      },
      zonas: {
        type: 'string',
        format: 'zonas',
        default: ''
      },
      tags: {
        type: 'string',
        format: 'tags',
        default: ''
      },
      state: {
        type: 'string',
        format: 'states',
        default: 'pendiente,factible,no-factible,integrado'
      },
      sort: {
        type: 'string',
        enum: ['', 'newest', 'popular', 'barrio'],
        default: ''
      },
      related: {
        type: 'string',
        default: '',
        format: 'barrio'
      },
      tipoIdea: {
        type: 'string',
        default: 'pendiente,proyecto'
      }
    })
  }, { formats }),
  utils.findForum,
  utils.parseStates,
  utils.parseTipoIdea,
  utils.parseZonas,
  utils.parseTags,
  middlewares.forums.privileges.canView,
  (req, res, next) => {
    const opts = Object.assign({}, req.query)
    opts.forum = req.forum
    opts.user = req.user
    opts.state = opts.tipoIdea
    utils.findAllTopics(opts).then(topics => apiNoExt.user.populateOwners(topics))
    .then((topics) => {
      // pidieron mostrar siempre primero las ideas-proyecto
      // const ideasProyectos = topics.filter(t => t.attrs.state == 'idea-proyecto')
      // const ideasResto = topics.filter(t => t.attrs.state != 'idea-proyecto')
      let finalTopics
      if (opts.sort === '') {
        finalTopics = topics.sort(() => 0.5 - Math.random())
      } else {
        finalTopics = topics
      }      
      res.status(200).json({
        status: 200,
        pagination: {
          count: finalTopics.length
        },
        results: {
          topics: finalTopics
        }
      })
    }).catch(next)
  })

module.exports = app