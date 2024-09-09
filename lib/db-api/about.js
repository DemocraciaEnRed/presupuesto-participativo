const debug = require('debug')
const log = debug('democracyos:ext:db-api:text')

const utils = require('lib/utils')
const { object } = require('prop-types')
const about = require('lib/models').aboutUs
const pluck = utils.pluck

function find (query) {
  return about.find(Object.assign({
    deletedAt: null
  }, query))
}

function setAttributes (attrs, model) {
  Object.keys(attrs).forEach((key) => {
    model.set(key, attrs[key])
  })

  return model
}

function autoIncrement () {
  return about.find().sort('-order').limit(1).then((about) => about.length > 0 ? about[0].order + 1 : 0 )
}

exports.find = function find (query) {
  return about.find(Object.assign(query))
}

exports.create = function create (opts, attrs) {
  log('creating new faqs')

  const question = opts.faq.question
  const answer = opts.faq.answer
  return autoIncrement()
  .then((order) => about.create({ question, answer, order }))
}

exports.edit = function edit (opts, attrs) {
  const faq = opts.faq

  return find()
    .findOne()
    .where({ _id: faq.id })
    .exec()
    .then(setAttributes.bind(faq, attrs))
    .then((about) => about.save())
}

exports.deleteOne = function deleteOne (opts) {
  const faq = opts.faq

  return find()
    .findOne()
    .where({ _id: faq._id })
    .deleteOne()
}

exports.updateMany = function updateMany (opts, attrs) {
  const faqs = opts.faqs
  return Promise.resolve(
    faqs.forEach((faq, idx) => {
      if (faq.id !== attrs[idx].id) {
        return find()
          .findOne()
          .where({ _id: attrs[idx].id })
          .exec()
          .then(setAttributes.bind(faq, attrs[idx]))
          .then((about) => about.save())
      }
    })
  )
}

exports.all = function all (fn) {
  log('Looking for all faqs.')

  about
    .find()
    .sort('order')
    .exec(function (err, objs) {
      if (err) {
        log('Found error %j', err)
        return fn(err)
      }

      fn(null, objs)
    })
  return this
}