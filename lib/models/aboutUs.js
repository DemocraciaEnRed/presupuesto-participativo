const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const aboutUsSchema = new Schema({
  order: { type: Number },
  question: { type: String },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now }
})

/* aboutUsSchema.statics.findByName = function (name, cb) {
  return this.findOne({ name: name }).exec(cb)
} */

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

aboutUsSchema.set('toObject', { getters: true })
aboutUsSchema.set('toJSON', { getters: true })
/**
 * Expose Model
 */

module.exports = function initialize (conn) {
  return conn.model('aboutUs', aboutUsSchema)
}