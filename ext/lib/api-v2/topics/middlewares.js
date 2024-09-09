const { getIdString } = require('lib/utils')
const api = require('lib/api-v2/db-api')
const validate = require('lib/api-v2/validate')

const PROPOSALS_FORUM_NAME = 'propuestas'

class ForumNotFound extends Error {
  constructor () {
    super(`Forum not found.`)
    this.status = 404
    this.code = 'FORUM_NOT_FOUND'
  }
}

class TopicNotFound extends Error {
  constructor () {
    super(`Topic not found.`)
    this.status = 404
    this.code = 'TOPIC_NOT_FOUND'
  }
}

exports.findProposalsForum = (req, res, next) => {
  api.forums.find({ name: PROPOSALS_FORUM_NAME })
    .findOne()
    .exec()
    .then((forum) => {
      if (!forum) return next(new ForumNotFound())

      req.proposalsForum = forum

      next()
    })
    .catch(next)
}

exports.checkTopicIsFromForum = (req, res, next) => {
  const { topic, forum } = req

  if (getIdString(topic.forum) === getIdString(forum._id)) return next()

  return next(new TopicNotFound())
}

exports.validateProposalBody = validate({
  body: {
    title: {
      type: 'string',
      maximum: 512,
      required: true
    },
    body: {
      type: 'string',
      required: true
    },
    tag: {
      type: 'string'
    }
  }
})

exports.canEditProposal = (req, res, next) => {

}
