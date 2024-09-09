const { Router } = require('express')
const { ObjectID } = require('mongodb')
const { Topic } = require('lib/models')
const dbApi = require('lib/api-v2/db-api')
const scopes = require('lib/api-v2/db-api/topics/scopes')
const privileges = require('lib/privileges/forum')

const app = Router()

const forumsNames = [
]

app.get('/feed',
function getFeed (req, res, next) {
  const s = +req.query.s || 0
  dbApi.forums.find({ name: { $in: forumsNames } }).then((forumsM) => {
    Topic.aggregate([
      { $match: {
        forum: { $in: forumsM.map((f) => f._id) },
        deletedAt: null
      } },
      { $sort: { 'createdAt': -1 } },
      { $sort: { 'participantsCount': -1 } },
      { $group: { _id: '$forum', topics: { $push: '$$ROOT' } } },
      { $project: { best_topics: { $slice: [ '$topics', s, 2 ] } } },
      { $unwind: '$best_topics' }
    ], function (err, topicsM) {
      if (err) {
        res.json({ result: null, error: err })
      } else {
        const topicsIds = topicsM.map((topic) => ObjectID(topic.best_topics._id))
        Topic.find({ _id: { $in: topicsIds } })
          .populate(scopes.ordinary.populate)
          .select(scopes.ordinary.select).exec()
          .then((topics) => topics.map((topic) => {
            return scopes.ordinary.expose(topic, forumsM.find((f) => f._id.toString() === topic.forum.toString()), req.user)
          }))
          .then((topics) => Promise.all(topics))
          .then((topics) => {
            const forums = forumsM.map((f) => {
              let forum = f.toJSON()
              forum.privileges = privileges.all(f, req.user)
              return forum
            })
            res.json({ result: { topics, forums } })
          })
          .catch((err) => {
            res.json({ result: null, error: err })
          })
      }
    })
  }).catch((err) => {
    res.json({ result: null, error: err })
  })
})

module.exports = app
