const log = require('debug')('democracyos:db-api-v2:topic')
const ObjectID = require('mongoose').Types.ObjectId
const Topic = require('lib/models').Topic
const Vote = require('lib/models').Vote
const Comments = require('../comments')
const scopes = require('./scopes')
const votedBy = require('./utils').votedBy
const calcResult = require('./utils').calcResult
const apiV1 = require('lib/db-api')
const config = require('lib/config')

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - mongoose query options
 * @return {Mongoose Query}
 */
function find (query) {
  return Topic.find(Object.assign({
    deletedAt: null
  }, query))
}

exports.find = find

//https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// remplazar todas las ocurrencias de vocal-vocalTilde por instrucción de regex
// [ vocal vocalTilde ] así ignora tildes "hacia ambos lados"
function createMediaTitleRegex(searchStr){
  let regStr = escapeRegExp(searchStr)
  // el primer elemento es para matchear dentro del string de búsqueda
  // el segundo es para remplazar ese match (una vocal con o sin tilde)
  // por un regex que haga opcional entre las dos vocales para la query final
  let vocalesData = [
    [/[aá]/g, '[aá]'],
    [/[eé]/g, '[eé]'],
    [/[ií]/g, '[ií]'],
    [/[oó]/g, '[oó]'],
    [/[uú]/g, '[uú]']
  ]
  vocalesData.forEach(subarray => {
    let [vocalMatch, vocalReplace] = subarray
    regStr = regStr.replace(vocalMatch, vocalReplace)
  })
  return `.*${regStr}.*`
}

// esta misma función está en ext/lib/api/topics/utils.js!
// si modificás esta, habría que modificar la otra (considerar)
const getPossibleOwners = (opts) => {
  const {
    zonas,
    zona,
  } = opts

  const query = {}

  // La zona ahora se encuentra en el topic
  // if (zonas && zonas.length > 0) query.zona = { $in: zonas.map(id => ObjectID(id)) }
  // else if (zona) query.zona = zona

  if (Object.keys(query).length > 0)
    return apiV1.user.findIds(query)
  else
    return Promise.resolve(null)
}

/**
 * Get the public listing of topics from a forum
 * @method list
 * @param  {object} opts
 * @param  {document} opts.forum - Topic Forum
 * @param  {boolean} opts.draft - if draft topics should be added
 * @param  {number} opts.limit - Amount of results per page
 * @param  {number} opts.page - Page number
 * @param  {document} opts.user - User data is beign fetched for
 * @param  {('score'|'-score'|'createdAt'|'-createdAt')} opts.sort
 * @return {promise}
 */
exports.list = function list (opts) {
  opts = opts || {}

  return getPossibleOwners(opts).then(owners => {
    // si devuelve null es porque no se filtró por owner
    if (owners === null || owners.length > 0){
      opts.owners = owners
      const forum = opts.forum
      const user = opts.user

      const query = { forum: forum._id }

      if (opts.tema) query.tag = { $in: [opts.tema] }
      
      if (opts.zona) query.zona = { $in: [opts.zona] }

      if (!opts.draft) query.publishedAt = { $ne: null }

      if (opts.search) query.mediaTitle  = { $regex : createMediaTitleRegex(opts.search), $options : 'i' }

      if (owners && owners.length > 0) query.owner = { $in: owners }

      return find()
        .where(query)
        .populate(scopes.ordinary.populate)
        .select(scopes.ordinary.select)
        .limit(opts.limit)
        .skip((opts.page - 1) * opts.limit)
        .sort(opts.sort)
        .exec()
        .then((topics) => Promise.all(topics.map((topic) => {
          return scopes.ordinary.expose(topic, forum, user)
        })))
        .then(topics => Promise.all(topics.map(topic => {
          return Comments.commentersCount({ topicId: topic.id }).then(commentersCount => {
            topic.commentersCount = commentersCount
            return topic
          })
        })))
    } else
      return []
  })
}

/**
 * Get the count of total topics
 * @method listCount
 * @param  {objectId} forumId
 * @return {promise}
 */
exports.listCount = function listCount (opts) {
  return getPossibleOwners(opts).then(owners => {
    // si devuelve null es porque no se filtró por owner
    if (owners === null || owners.length > 0){
      const query = { forum: opts.forum }

      if (opts.tema) query.tags = { $in: [opts.tema] }

      if (opts.search) query.mediaTitle  = { $regex : createMediaTitleRegex(opts.search), $options : 'i' }

      if (owners && owners.length > 0) query.owner = { $in: owners }

      return find()
        .where(query)
        .count()
        .exec()
    } else
      return 0
  })
}

/**
 * Get topic
 *
 * @param {String} opts.id Topic `id`
 * @param {User} opts.user current user
 * @param {Forum} opts.forum Topic Forum
 * @return {promise}
 * @api public
 */

exports.get = function get (opts, attrs) {
  const id = opts.id
  const user = opts.user
  const forum = opts.forum

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Create topic
 *
 * @param {User} opts.user editor of the topic
 * @param {Forum} opts.forum Forum
 * @param {Zona} opts.zona Zona of the topic
 * @param {Object} attrs attributes of the Topic
 * @return {promise}
 * @api public
 */

exports.create = function create (opts, attrs) {
  const user = opts.user
  const forum = opts.forum
  const zona = opts.zona
  const tag = opts.tag

  attrs.forum = forum._id
  attrs.owner = user._id
  attrs.zona = zona._id
  attrs.tag = tag._id

  switch (attrs['action.method']) {
    case 'vote':
      attrs['action.results'] = [{ value: 'positive', percentage: 0 }, { value: 'neutral', percentage: 0 }, { value: 'negative', percentage: 0 }]
      break
    case 'poll':
      if (!attrs['action.options']) {
        return Promise.reject("Can't create a poll without options")
      }
      attrs['action.results'] = attrs['action.options'].map((o) => ({ value: o, percentage: 0 }))
      delete attrs['action.options']
      break
    case 'cause':
      attrs['action.results'] = [{ value: 'support', percentage: 0 }]
      break
    default:
      attrs['action.results'] = []
  }

  if (attrs['eje'] && typeof attrs['eje'] === 'string' || attrs['eje'] instanceof String)
    attrs['eje'] = new ObjectID(attrs['eje'])

  const topic = new Topic()

  updateClauses(attrs, topic)
  setAttributes(attrs, topic)

  return topic.save()
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Edit topic
 *
 * @param {String} opts.id Topic `id`
 * @param {User} opts.user editor of the topic
 * @param {Forum} opts.forum Forum
 * @param {Object} attrs attributes to be updated
 * @return {promise}
 * @api public
 */

exports.edit = function edit (opts, attrs) {
  const id = opts.id
  const user = opts.user
  const forum = opts.forum

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then(updateClauses.bind(null, attrs))
    .then(setAttributes.bind(null, attrs))
    .then((topic) => topic.save())
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Publish topic
 *
 * @param {String} opts.id Topic `id`
 * @param {User} opts.user editor of the topic
 * @param {Forum} opts.forum Forum
 * @return {promise}
 * @api public
 */

exports.publish = function publish (opts) {
  const id = opts.id
  const user = opts.user
  const forum = opts.forum

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then((topic) => {
      topic.publishedAt = new Date()
      return topic.save()
    })
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Unpublish topic
 *
 * @param {String} opts.id Topic `id`
 * @param {User} opts.user editor of the topic
 * @param {Forum} opts.forum Forum
 * @return {promise}
 * @api public
 */

exports.unpublish = function unpublish (opts) {
  const id = opts.id
  const user = opts.user
  const forum = opts.forum

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then((topic) => {
      topic.publishedAt = null
      return topic.save()
    })
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Delete topic
 *
 * @param {String} opts.id Topic `id`
 * @return {promise}
 * @api public
 */

exports.destroy = function destroy (opts) {
  const id = opts.id

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then(setAttributes.bind(null, { deletedAt: new Date() }))
    .then((topic) => topic.save())
}

/**
 * Vote topic
 *
 * @param {String} opts.id Topic `id`
 * @param {User} opts.user author of the vote
 * @param {Forum} opts.forum author of the vote
 * @param {String} opts.value `positive` or `negative` or `neutral`
 * @return {promise}
 * @api public
 */

exports.vote = function vote (opts) {
  const id = opts.id
  const user = opts.user
  const forum = opts.forum
  const value = opts.value
  const votacionAbierta = forum.config.votacion

  return find()
    .findOne()
    .where({ _id: id })
    .select(scopes.ordinary.select)
    .populate(scopes.ordinary.populate)
    .exec()
    .then(doVote.bind(null, user, value, votacionAbierta))
    .then((topic) => scopes.ordinary.expose(topic, forum, user))
}

/**
 * Get tags from topics
 *
 * @method getTags
 * @param  {object} opts
 * @param  {document} opts.forum - Topic Forum
 * @param  {number} opts.limit - Amount of results per page
 * @param  {number} opts.page - Page number
 * @param  {('count'|'-count'|'tag'|'-tag')} opts.sort
 * @return {promise}
 * @api public
 */

exports.getTags = function getTags (opts) {
  const forum = new ObjectID(opts.forum._id)
  let sort = { 'count': -1 }
  if (opts.sort) {
    switch (opts.sort) {
      case 'count':
        sort = { 'count': 1 }
        break
      case '-count':
        sort = { 'count': -1 }
        break
      case 'tag':
        sort = { '_id': 1 }
        break
      case '-tag':
        sort = { '_id': -1 }
        break
    }
  }

  let limit = 100
  if (opts.limit && opts.limit < 1000) limit = opts.limit

  let page = 1
  if (opts.page) page = opts.page

  const skip = (page - 1) * limit

  return new Promise((resolve, reject) => {
    Topic.aggregate([
      { $match: { forum, deletedAt: null } },
      { $unwind: '$tags' },
      {
        $group: {
          '_id': '$tags',
          'count': { '$sum': 1 }
        }
      },
      { $sort: sort },
      {
        $group: {
          _id: null,
          count: { '$sum': 1 },
          results: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          tags: {
            $slice: ['$results', skip, limit]
          },
          count: '$count'
        }
      }
    ], function (err, results) {
      if (err) return reject(err)
      if (results.length === 0) {
        return resolve({
          tags: [],
          pagination: {
            total: 0,
            page,
            limit
          }
        })
      }
      const [{ tags, count }] = results
      resolve({
        tags: tags.map(({ _id, count }) => ({ text: _id, count })),
        pagination: {
          total: count,
          page: page,
          limit
        }
      })
    })
  })
}

/**
 * Update tags from topics
 *
 * @method updateTags
 * @param  {object} opts
 * @param  {document} opts.forum - Topic Forum
 * @param  {string} opts.oldTags - Tags to find
 * @param  {string} opts.newTags - Tags to replace
 * @return {promise}
 * @api public
 */

exports.updateTags = function updateTags (opts) {
  const forum = new ObjectID(opts.forum._id)
  let { oldTags, newTags } = opts

  oldTags = oldTags.split(',').filter((t) => t)
  newTags = newTags.split(',').filter((t) => t)

  if (oldTags.length === 0) return Promise.resolve()

  return Promise.resolve()
    .then(() => Topic.collection.find({ forum }).toArray())
    .then(mapPromises(function (topic) {
      if (topic.tags && topic.tags.some((tag) => oldTags.some((oldTag) => oldTag === tag))) {
        let newTopicTags = topic.tags.filter((tag) => !oldTags.includes(tag))

        if (newTags.length > 0) {
          newTopicTags = newTopicTags.concat(newTags)
        }
        newTopicTags = newTopicTags.filter((t, i, a) => a.includes(t))

        return Topic.collection
          .findOneAndUpdate({ _id: topic._id }, { $set: { tags: newTopicTags } })
      } else {
        return Promise.resolve()
      }
    }))
}

/**
 * Vote Topic with provided user
 * and voting value
 *
 * @param {User|ObjectId|String} user
 * @param {String} value
 * @param {Function} cb
 * @api public
 */

function doVote (user, value, topic, votacionAbierta) {
  if (topic.status === 'closed') {
    const err = new Error('Voting on this topic os closed.')
    err.code = 'VOTING_CLOSED'
    return Promise.reject(err)
  }

  return votedBy(user, topic)
    .then((voted) => {
      const isNoApoyo = value == 'no-apoyo-idea'

      if (isNoApoyo){
       if (!voted) {
         const err = new Error("You haven't voted this topic.")
         err.code = 'NOT_VOTED'
         throw err
       }

       return Vote.deleteOne({ topic: topic._id, author: user._id })
      }else{
       if (voted) {
         const err = new Error('You already voted this topic.')
         err.code = 'ALREADY_VOTED'
         throw err
       }
     }

     // para la votación final
     if (value == 'voto'){

       // chequear que la votación esté abierta
       if (!votacionAbierta) {
         const err = new Error('Votación cerrada')
         err.code = 'CLOSED_VOTACION'
         throw err
       }

       // chequear que el usuarix tenga dni
       if (!user.dni) {
         const err = new Error('Sin DNI')
         err.code = 'DNI_REQUIRED'
         throw err
       }

       // si el vote es de votación solo permitir hasta 3 por usuarix en todo el sistema
       return Vote.find({ value, author: user }).then(voto => {
         console.log(voto.length)
         if (voto.length >= 3) {
           const err = new Error('You already voted a topic.')
           err.code = 'ALREADY_VOTED_THREE_TIMES'
           throw err
         }
       })
     }
    }).then(() => {
      const vote = new Vote({
        author: user.id,
        value: value,
        topic: topic.id
      })

      return vote.save()
    })
    // Deshabilitamos esta métrica para la votación final
    /*.then(() => calcResult(topic))
    .then((results) => {
      topic.action.results = results.results
      topic.action.count = results.count

      return topic.save()
    })*/
    .then(() => topic)
}

/**
 * map array to promises helper
 */

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

/**
 * Sorting function for topic clauses
 */

function byPosition (a, b) {
  return a.position - b.position
}

/**
 * Set attributes on a model, don't allow set of entire object.
 */

function setAttributes (attrs, model) {
  Object.keys(attrs).forEach((key) => {
    model.set(key, attrs[key])
  })

  return model
}

/**
 * Update the clauses of a Topic from an attrs object
 */

function updateClauses (attrs, topic) {
  const clauses = attrs.clauses
  delete attrs.clauses

  if (!clauses || !clauses.length) return topic

  const submitted = clauses.map((c) => c.id)
  const persisted = topic.clauses.map((c) => c.id)
  const toDelete = persisted.filter((i) => !~submitted.indexOf(i))

  // Delete non submitted clauses
  toDelete.forEach((id) => { topic.clauses.pull({ _id: id }) })

  // Add new clauses or update existing
  clauses.forEach(function (clause) {
    if (clause.id) {
      var c = topic.clauses.id(clause.id)
      if (c) c.set(clause)
    } else {
      topic.clauses.addToSet(clause)
    }
  })

  topic.clauses = topic.clauses.sort(byPosition)

  return topic
}

exports.getUniqAttr = function getUniqAttr (attr) {
  return Topic.collection.distinct(`attrs.${attr}`)
}

exports.setProyectista = (user, topic, hacerProyectista) => {
  let promise
  log('%s como proyectista a usuario %s para idea %s', hacerProyectista?'Agregando':'Sacando', user._id, topic._id)
  if (hacerProyectista)
    promise = Topic.updateOne({_id: new ObjectID(topic._id)}, {$addToSet:{proyectistas: user}})
  else
    promise = Topic.updateOne({_id: new ObjectID(topic._id)}, {$pull:{proyectistas: user._id}})
  return promise
    .then(() => {
      log('Operación de proyectista exitosa')
      return Topic.findOne(topic._id)
    })
    .catch((err) => {
      log('Error en operación de proyectista ')
      throw err
    })
}


exports.populateIntegradas = function populateIntegradas(topic){
  topic.integradas = []
  return Promise.all([
    find({ 'attrs.admin-comment-referencia': topic.id.toString()})
  ]).then((results) => {
    const [topics] = results
    topics.forEach(integrada => topic.integradas.push({id: integrada.id, mediaTitle: integrada.mediaTitle}))
  })
}

exports.addUrlPhotosToAlbum = function addUrlPhotosToAlbum (topic, urlPhotos) {
  if (!topic.extra) topic.extra = {}
  if (!topic.extra.album) topic.extra.album = []
  console.log('addUrlPhotosToAlbum', urlPhotos)
  console.log(topic)
  topic.extra.album = topic.extra.album.concat(urlPhotos)
  // mark topic.extra as modified
  topic.markModified('extra')
  return topic.save()
}

exports.removeIndexFromAlbum = function removeIndexFromAlbum (topic, indexToDelete) {
  topic.extra.album.splice(indexToDelete, 1)
  // mark topic.extra as modified
  topic.markModified('extra')
  return topic.save()
}