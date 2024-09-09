const api = require('lib/api-v2/db-api')
const apiV1 = require('lib/db-api')
const topicScopes = require('lib/api-v2/db-api/topics/scopes')
const { notFound } = require('../errors')
const ObjectID = require('mongoose').Types.ObjectId

exports.parseZonas = (req, res, next) => {
  req.query.zonas = req.query.zonas.split(',').filter((t) => !!t)
  next()
}
exports.parseTags = (req, res, next) => {
  req.query.tags = req.query.tags.split(',').filter((t) => !!t)
  next()
}

exports.parseStates = (req, res, next) => {
  req.query.state = req.query.state.split(',').filter((t) => !!t)
  next()
}

exports.parseTipoIdea = (req, res, next) => {
  req.query.tipoIdea = req.query.tipoIdea.split(',').filter((t) => !!t)
  next()
}

exports.parseYears = (req, res, next) => {
  req.query.years = req.query.years.split(',').filter((t) => !!t)
  next()
}

exports.parseKWords = (req, res, next) => {
  req.query.queryString = req.query.kwords
  req.query.kwords = req.query.kwords.split(' ').filter((t) => !!t)
  next()
}

exports.findForum = (req, res, next) => {
  api.forums.find({ name: req.query.forumName })
    .findOne()
    .exec()
    .then((forum) => {
      if (!forum) throw notFound('FORUM_NOT_FOUND')

      req.forum = forum

      next()
    })
    .catch(next)
}

const queryTopics = (opts) => {
  const {
    state,
    forum,
    tags,
    related,
    owners,
    zonas,
    zona,
    years,
    kwords
  } = opts
  const query = {
    forum: forum._id,
    publishedAt: { $ne: null },
  }
  if (owners && owners.length > 0) query.owner = { $in: owners }
  if (tags && tags.length > 0) query.tag = { $in: tags }
  if (zonas && zonas.length > 0) query.zona = { $in: zonas.map(id => ObjectID(id)) }
  else if (zona) query.zona = zona
  if (state && state.length > 0) query['attrs.state'] = { $in: state }
  if (related && related.length > 0) query['attrs.admin-comment-referencia'] = { $regex: `.*${related}.*` }

  if (years && years.length > 0) query.$or = years.map(year => ({createdAt: {$gte: new Date(year,0,1),$lte: new Date(year,11,31)}}))
  if (kwords && kwords.length > 0) query.mediaTitle = { $in: kwords.map(kword => new RegExp(`.*${kword}.*`, 'i'))}
  // console.log(kwords)
  // if (years && years.length > 0) query.$where = function (){
  //   const year = this.createdAt.getFullYear().toString()
  //   return years.includes(year);
  // }
  return api.topics.find().where(query)
}

// esta misma función está en lib/api-v2/db-api/topics/index.js!
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


const sortMap = {
  barrio: 'attrs.barrio',
  newest: '-createdAt',
  popular: '-proyectistas'
}

exports.findTopics = (opts) => {
  const {
    forum,
    limit = 30,
    page = 1,
    sort,
    user,
    state
  } = opts
  return getPossibleOwners(opts).then(owners => {
    // si devuelve null es porque no se filtró por owner
    // (porque no se pasaron dichos parámetros en opts)
    if (owners === null || owners.length > 0){
      opts.owners = owners
      return queryTopics(opts)
          .populate(topicScopes.ordinary.populate)
          .sort(sortMap[sort])
          .select(topicScopes.ordinary.select)
          .limit(limit)
          .skip((page - 1) * limit)
          .exec()
    } else
      return []
  }).then((topics) => Promise.all(topics.map((topic) => {
    return topicScopes.ordinary.expose(topic, forum, user)
  })))
}
exports.findAllTopics = (opts) => {
  const {
    forum,
    sort,
    user
  } = opts
  return getPossibleOwners(opts).then(owners => {
    // si devuelve null es porque no se filtró por owner
    // (porque no se pasaron dichos parámetros en opts)
    if (owners === null || owners.length > 0){
      opts.owners = owners
      return queryTopics(opts)
          .populate(topicScopes.ordinary.populate)
          .sort(sortMap[sort])
          .select(topicScopes.ordinary.select)
          .exec()
    } else {
      return []
    }
  }).then((topics) => Promise.all(topics.map((topic) => {
    return topicScopes.ordinary.expose(topic, forum, user)
  })))
}

exports.findTopicsCount = (opts) => getPossibleOwners(opts).then(owners => {
  // si devuelve null es porque no se filtró por owner
  // (porque no se pasaron dichos parámetros en opts)
  if (owners === null || owners.length > 0){
    opts.owners = owners
    return queryTopics(opts).count().exec()
  } else
    return 0
})


exports.findByKwordsAndSort = (results, searchTerm) => {
  const exactMatchResults = [];
  const partialMatchResults = [];

  results.forEach(result => {
    if (result.mediaTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
      exactMatchResults.push(result);
    } else {
      partialMatchResults.push(result);
    }
  });

  const sortedResults = exactMatchResults.concat(partialMatchResults);
  return sortedResults;
}