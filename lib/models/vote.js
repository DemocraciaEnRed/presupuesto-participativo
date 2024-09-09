var mongoose = require('mongoose')
var Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const VoteSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  userPrivileges: { type: Boolean, default: false },
  dni: { type: String, required: true },
  zona: { type: ObjectId, ref: 'Zona', required: true },
  voto1: { type: ObjectId, ref: 'Topic', required: true },
  voto2: { type: ObjectId, ref: 'Topic', required: false },
  createdAt: { type: Date, default: Date.now }
})

/**
 * Define Schema Indexes for MongoDB
 */

VoteSchema.index({ createdAt: -1 })

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

VoteSchema.set('toObject', { getters: true })
VoteSchema.set('toJSON', { getters: true })

module.exports = function initialize (conn) {
  return conn.model('Vote', VoteSchema, 'votes')
}
