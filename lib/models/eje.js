const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EjeSchema = new Schema({
  nombre: { type: String, required: true, minlength: 1, maxlength: 200 }
}, { id: false })
// esto último hace que no esté el campo _id e id duplicado

EjeSchema.statics.findByName = function (name, cb) {
  return this.findOne({ name: name }).exec(cb)
}

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

EjeSchema.set('toObject', { getters: true })
EjeSchema.set('toJSON', { getters: true })
/**
 * Expose Model
 */

module.exports = function initialize (conn) {
  return conn.model('Eje', EjeSchema)
}
