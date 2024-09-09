const mongoose = require('mongoose')
const Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

const PadronSchema = new Schema({
  dni: { type: String, required: true, maxlength: 20, unique: true },
  user: { type: ObjectId, ref: 'User' },
  voted: { type: Boolean }
}, { id: false })
// esto último hace que no esté el campo _id e id duplicado

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

PadronSchema.set('toObject', { getters: true })
PadronSchema.set('toJSON', { getters: true })
/**
 * Expose Model
 */

module.exports = function initialize (conn) {
  // agregamos el tecer argumento sino crea la tabla "padrons" (o sea, con mala terminación)
  return conn.model('Padron', PadronSchema, 'padron')
}
